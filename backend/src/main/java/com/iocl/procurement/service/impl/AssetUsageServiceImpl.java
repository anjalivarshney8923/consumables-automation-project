package com.iocl.procurement.service.impl;

import com.iocl.procurement.dto.request.AssetUsageRequestDTO;
import com.iocl.procurement.dto.response.AssetUsageResponseDTO;
import com.iocl.procurement.entity.*;
import com.iocl.procurement.exception.AppException;
import com.iocl.procurement.exception.ResourceNotFoundException;
import com.iocl.procurement.repository.AssetRepository;
import com.iocl.procurement.repository.AssetUsageRepository;
import com.iocl.procurement.repository.CartridgeRepository;
import com.iocl.procurement.repository.RateContractRepository;
import com.iocl.procurement.repository.UserRepository;
import com.iocl.procurement.service.AlertEvaluationService;
import com.iocl.procurement.service.AssetUsageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AssetUsageServiceImpl implements AssetUsageService {

    private static final Logger logger = LoggerFactory.getLogger(AssetUsageServiceImpl.class);

    private final AssetUsageRepository assetUsageRepository;
    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final CartridgeRepository cartridgeRepository;
    private final RateContractRepository rateContractRepository;
    private final AlertEvaluationService alertEvaluationService;

    public AssetUsageServiceImpl(
            AssetUsageRepository assetUsageRepository,
            UserRepository userRepository,
            AssetRepository assetRepository,
            CartridgeRepository cartridgeRepository,
            RateContractRepository rateContractRepository,
            AlertEvaluationService alertEvaluationService
    ) {
        this.assetUsageRepository = assetUsageRepository;
        this.userRepository = userRepository;
        this.assetRepository = assetRepository;
        this.cartridgeRepository = cartridgeRepository;
        this.rateContractRepository = rateContractRepository;
        this.alertEvaluationService = alertEvaluationService;
    }

    @Override
    @Transactional
    public AssetUsageResponseDTO recordUsage(String authenticatedUsername, AssetUsageRequestDTO request) {
        // 1. Derive and validate authenticated User identity
        User authenticatedUser = resolveAuthenticatedUser(authenticatedUsername);

        // 2. Validate Cartridge Master Record
        Cartridge cartridge = resolveCartridge(request.getCartridgeId());

        // 3. Validate Printer / Asset
        Asset asset = resolveAsset(request.getPrinterId());

        // 4. Determine Printer Type
        PrinterType printerType;
        if (asset != null && asset.getPrinterType() != null) {
            printerType = asset.getPrinterType();
        } else if (request.getPrinterType() != null && !request.getPrinterType().trim().isEmpty()) {
            printerType = PrinterType.fromString(request.getPrinterType());
            if (printerType == null) {
                printerType = PrinterType.BLACK_AND_WHITE;
            }
        } else {
            // Check if cartridge/printer name hints at color
            String printerHint = (request.getPrinterId() + " " + cartridge.getPrinterName()).toLowerCase();
            if (printerHint.contains("color") || printerHint.contains("colour")) {
                printerType = PrinterType.COLOR;
            } else {
                printerType = PrinterType.BLACK_AND_WHITE;
            }
        }

        // 5. Enforce Colour Business Rules
        CartridgeColor validatedColour = null;
        if (printerType == PrinterType.BLACK_AND_WHITE) {
            if (request.getColour() != null && !request.getColour().trim().isEmpty()) {
                throw new AppException(
                        "Colour is not applicable for Black & White printers.",
                        HttpStatus.BAD_REQUEST
                );
            }
            validatedColour = null;
        } else {
            // Printer is COLOR -> Colour is mandatory
            if (request.getColour() == null || request.getColour().trim().isEmpty()) {
                throw new AppException(
                        "Colour is required for Color printers. Allowed values: BLACK, CYAN, MAGENTA, YELLOW.",
                        HttpStatus.BAD_REQUEST
                );
            }
            validatedColour = CartridgeColor.fromString(request.getColour());
            if (validatedColour == null) {
                throw new AppException(
                        "Invalid colour: '" + request.getColour() + "'. Allowed values: BLACK, CYAN, MAGENTA, YELLOW.",
                        HttpStatus.BAD_REQUEST
                );
            }

            // Consistency check with Cartridge Part Number / Name if specified
            validateCartridgeColorConsistency(cartridge, validatedColour);
        }

        // 6. Validate Quantity
        if (request.getQuantityUsed() == null || request.getQuantityUsed() <= 0) {
            throw new AppException("Quantity used must be greater than 0.", HttpStatus.BAD_REQUEST);
        }
        if (request.getQuantityUsed() > 1000) {
            throw new AppException("Quantity used cannot exceed 1000 units.", HttpStatus.BAD_REQUEST);
        }

        // 7. Validate Usage Date
        if (request.getUsageDate() == null) {
            throw new AppException("Usage date is required.", HttpStatus.BAD_REQUEST);
        }
        if (request.getUsageDate().isAfter(LocalDate.now())) {
            throw new AppException("Usage date cannot be in the future.", HttpStatus.BAD_REQUEST);
        }

        // 8. Construct and persist AssetUsage Entity
        AssetUsage usage = new AssetUsage();
        usage.setUser(authenticatedUser);
        usage.setEmployeeId(authenticatedUser.getEmployeeId());
        usage.setEmployeeName(authenticatedUser.getFullName());
        usage.setDepartment(authenticatedUser.getDepartment() != null ? authenticatedUser.getDepartment() : request.getDepartment());
        usage.setSeatOrCabinNo(request.getSeatOrCabinNo().trim());
        usage.setLocation(request.getLocation().trim());
        usage.setAsset(asset);
        usage.setPrinterModel(asset != null ? asset.getModelName() : request.getPrinterId().trim());
        usage.setCartridge(cartridge);
        usage.setCartridgeName(cartridge.getCartridgeName());
        usage.setPartNumber(cartridge.getPartNumber());
        usage.setPrinterType(printerType);
        usage.setColour(validatedColour);
        usage.setQuantityUsed(request.getQuantityUsed());
        usage.setUsageDate(request.getUsageDate());
        usage.setRemarks(request.getRemarks() != null ? request.getRemarks().trim() : null);
        usage.setWorkOrderReference(request.getWorkOrderReference() != null ? request.getWorkOrderReference().trim() : null);

        AssetUsage savedUsage = assetUsageRepository.save(usage);

        // 9. Update Authoritative Rate Contract Consumption (Qty Already Executed)
        List<RateContract> rateContracts = rateContractRepository.findByCartridgeId(cartridge.getId());
        if (rateContracts != null && !rateContracts.isEmpty()) {
            // Find active Rate Contract with available balance, or fallback to the latest contract
            RateContract targetContract = rateContracts.stream()
                    .filter(rc -> rc.getNetAvailableQuantity() != null && rc.getNetAvailableQuantity() > 0)
                    .findFirst()
                    .orElse(rateContracts.get(0));

            int currentExecuted = targetContract.getQuantityAlreadyExecuted() != null ? targetContract.getQuantityAlreadyExecuted() : 0;
            targetContract.setQuantityAlreadyExecuted(currentExecuted + request.getQuantityUsed());
            targetContract.recalculateNetAvailableQuantity();
            rateContractRepository.save(targetContract);
        }

        // 10. Update Store Inventory if present
        if (cartridge.getStoreQuantity() != null && cartridge.getStoreQuantity() > 0) {
            int newStoreQty = Math.max(0, cartridge.getStoreQuantity() - request.getQuantityUsed());
            cartridge.setStoreQuantity(newStoreQty);
            cartridge = cartridgeRepository.save(cartridge);
        }

        // 11. Evaluate Alert 1 (Procurement threshold) and Alert 2 (Tendering threshold)
        alertEvaluationService.evaluateAllAlerts(cartridge);

        logger.info("Asset usage recorded successfully. ID: [{}], User: [{}], Cartridge: [{}], Qty: [{}]",
                savedUsage.getId(), authenticatedUser.getUsername(), cartridge.getPartNumber(), request.getQuantityUsed());

        return new AssetUsageResponseDTO(savedUsage);
    }

    @Override
    public List<AssetUsageResponseDTO> getUserUsageHistory(String authenticatedUsername) {
        User user = resolveAuthenticatedUser(authenticatedUsername);
        return assetUsageRepository.findByUserIdOrderByCreatedAtDescIdDesc(user.getId())
                .stream()
                .map(AssetUsageResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public AssetUsageResponseDTO getUserUsageById(String authenticatedUsername, Long id) {
        User user = resolveAuthenticatedUser(authenticatedUsername);
        AssetUsage usage = assetUsageRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new AppException("Usage record not found or access denied.", HttpStatus.FORBIDDEN));
        return new AssetUsageResponseDTO(usage);
    }

    @Override
    public List<AssetUsageResponseDTO> getAllUsageForAdmin() {
        return assetUsageRepository.findAllByOrderByCreatedAtDescIdDesc()
                .stream()
                .map(AssetUsageResponseDTO::new)
                .collect(Collectors.toList());
    }

    // Helper Methods

    private User resolveAuthenticatedUser(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new AppException("User authentication is required.", HttpStatus.UNAUTHORIZED);
        }
        return userRepository.findByUsernameIgnoreCase(identifier.trim())
                .or(() -> userRepository.findByEmailIgnoreCase(identifier.trim()))
                .or(() -> userRepository.findByEmployeeIdIgnoreCase(identifier.trim()))
                .orElseThrow(() -> new AppException("Authenticated user not found.", HttpStatus.UNAUTHORIZED));
    }

    private Cartridge resolveCartridge(String cartridgeIdentifier) {
        if (cartridgeIdentifier == null || cartridgeIdentifier.trim().isEmpty()) {
            throw new AppException("Cartridge selection is required.", HttpStatus.BAD_REQUEST);
        }

        String identifier = cartridgeIdentifier.trim();

        // 1. Try by ID if numeric
        try {
            Long id = Long.parseLong(identifier);
            Optional<Cartridge> opt = cartridgeRepository.findById(id);
            if (opt.isPresent()) return opt.get();
        } catch (NumberFormatException ignored) {
        }

        // 2. Try by Part Number or Name
        return cartridgeRepository.findByPartNumberIgnoreCaseOrCartridgeNameIgnoreCase(identifier, identifier)
                .or(() -> cartridgeRepository.findByPartNumberIgnoreCase(identifier))
                .or(() -> cartridgeRepository.findByCartridgeNameIgnoreCase(identifier))
                .orElseThrow(() -> new AppException("Cartridge not found for identifier: " + identifier, HttpStatus.BAD_REQUEST));
    }

    private Asset resolveAsset(String printerIdentifier) {
        if (printerIdentifier == null || printerIdentifier.trim().isEmpty()) {
            throw new AppException("Printer selection is required.", HttpStatus.BAD_REQUEST);
        }

        String identifier = printerIdentifier.trim();

        // 1. Try by ID if numeric
        try {
            Long id = Long.parseLong(identifier);
            Optional<Asset> opt = assetRepository.findById(id);
            if (opt.isPresent()) return opt.get();
        } catch (NumberFormatException ignored) {
        }

        // 2. Try by Serial Number
        Optional<Asset> assetBySerial = assetRepository.findBySerialNumberIgnoreCase(identifier);
        if (assetBySerial.isPresent()) return assetBySerial.get();

        // 3. Try finding in active assets by model name prefix/match
        List<Asset> activeAssets = assetRepository.findByStatusOrderByCreatedAtDesc(AssetStatus.ACTIVE);
        for (Asset a : activeAssets) {
            if (a.getModelName().equalsIgnoreCase(identifier) ||
                    identifier.toLowerCase().contains(a.getModelName().toLowerCase())) {
                return a;
            }
        }

        // If no strict DB row matched, returns null so model name is safely stored as snapshot
        return null;
    }

    private void validateCartridgeColorConsistency(Cartridge cartridge, CartridgeColor selectedColour) {
        String partNo = cartridge.getPartNumber().toUpperCase();
        String name = cartridge.getCartridgeName().toUpperCase();

        if ((partNo.endsWith("-BLK") || partNo.contains("BLACK") || name.contains("BLACK")) && selectedColour != CartridgeColor.BLACK) {
            throw new AppException(
                    "Cartridge [" + cartridge.getPartNumber() + "] is a Black cartridge and cannot be recorded with colour [" + selectedColour + "].",
                    HttpStatus.BAD_REQUEST
            );
        }
        if ((partNo.endsWith("-CYN") || partNo.contains("CYAN") || name.contains("CYAN")) && selectedColour != CartridgeColor.CYAN) {
            throw new AppException(
                    "Cartridge [" + cartridge.getPartNumber() + "] is a Cyan cartridge and cannot be recorded with colour [" + selectedColour + "].",
                    HttpStatus.BAD_REQUEST
            );
        }
        if ((partNo.endsWith("-MAG") || partNo.contains("MAGENTA") || name.contains("MAGENTA")) && selectedColour != CartridgeColor.MAGENTA) {
            throw new AppException(
                    "Cartridge [" + cartridge.getPartNumber() + "] is a Magenta cartridge and cannot be recorded with colour [" + selectedColour + "].",
                    HttpStatus.BAD_REQUEST
            );
        }
        if ((partNo.endsWith("-YEL") || partNo.contains("YELLOW") || name.contains("YELLOW")) && selectedColour != CartridgeColor.YELLOW) {
            throw new AppException(
                    "Cartridge [" + cartridge.getPartNumber() + "] is a Yellow cartridge and cannot be recorded with colour [" + selectedColour + "].",
                    HttpStatus.BAD_REQUEST
            );
        }
    }
}
