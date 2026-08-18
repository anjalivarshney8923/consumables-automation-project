package com.iocl.procurement.service.impl;

import com.iocl.procurement.dto.request.AssetRequest;
import com.iocl.procurement.dto.response.AssetResponse;
import com.iocl.procurement.entity.Asset;
import com.iocl.procurement.entity.AssetStatus;
import com.iocl.procurement.entity.Cartridge;
import com.iocl.procurement.entity.CartridgeColor;
import com.iocl.procurement.entity.PrinterType;
import com.iocl.procurement.exception.AppException;
import com.iocl.procurement.exception.ResourceNotFoundException;
import com.iocl.procurement.repository.AssetRepository;
import com.iocl.procurement.repository.CartridgeRepository;
import com.iocl.procurement.service.AssetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class AssetServiceImpl implements AssetService {

    private static final Logger logger = LoggerFactory.getLogger(AssetServiceImpl.class);

    private final AssetRepository assetRepository;
    private final CartridgeRepository cartridgeRepository;

    public AssetServiceImpl(AssetRepository assetRepository, CartridgeRepository cartridgeRepository) {
        this.assetRepository = assetRepository;
        this.cartridgeRepository = cartridgeRepository;
    }

    @Override
    @Transactional
    public AssetResponse createAsset(AssetRequest request) {
        if (request == null) {
            throw new AppException("Asset registration request cannot be null.", HttpStatus.BAD_REQUEST);
        }

        String modelName = request.getModelName() != null ? request.getModelName().trim() : "";
        if (modelName.isEmpty()) {
            throw new AppException("Model name is required.", HttpStatus.BAD_REQUEST);
        }

        String serialNumber = request.getSerialNumber() != null ? request.getSerialNumber().trim().toUpperCase() : "";
        if (serialNumber.isEmpty()) {
            throw new AppException("Serial number is required.", HttpStatus.BAD_REQUEST);
        }

        // Duplicate serial number validation (HTTP 409 Conflict)
        if (assetRepository.existsBySerialNumberIgnoreCase(serialNumber)) {
            logger.warn("Duplicate asset serial number registration attempt: [{}]", serialNumber);
            throw new AppException(
                    "An asset with serial number " + serialNumber + " already exists.",
                    HttpStatus.CONFLICT
            );
        }

        String department = request.getDepartment() != null ? request.getDepartment().trim() : "";
        if (department.isEmpty()) {
            throw new AppException("Department / location is required.", HttpStatus.BAD_REQUEST);
        }

        // Compatible cartridge validation against master records
        String cartridgeInput = request.getCompatibleCartridge() != null ? request.getCompatibleCartridge().trim() : "";
        if (cartridgeInput.isEmpty()) {
            throw new AppException("Compatible cartridge is required.", HttpStatus.BAD_REQUEST);
        }

        Cartridge cartridge = resolveCartridge(cartridgeInput);

        // Printer type validation
        PrinterType printerType = PrinterType.fromString(request.getPrinterType());
        if (printerType == null) {
            throw new AppException(
                    "Invalid printer type: '" + request.getPrinterType() + "'. Allowed values: BLACK_AND_WHITE, COLOR.",
                    HttpStatus.BAD_REQUEST
            );
        }

        // Cartridge colour validation based on PrinterType
        String colourInput = request.getColour() != null ? request.getColour() : request.getColor();
        CartridgeColor colour = null;

        if (printerType == PrinterType.BLACK_AND_WHITE) {
            if (colourInput != null && !colourInput.trim().isEmpty()) {
                throw new AppException(
                        "Colour is not applicable for Black & White printers.",
                        HttpStatus.BAD_REQUEST
                );
            }
            colour = null;
        } else if (printerType == PrinterType.COLOR) {
            if (colourInput == null || colourInput.trim().isEmpty()) {
                throw new AppException(
                        "Colour is required for Color printers. Allowed values: BLACK, CYAN, MAGENTA, YELLOW.",
                        HttpStatus.BAD_REQUEST
                );
            }
            colour = CartridgeColor.fromString(colourInput);
            if (colour == null) {
                throw new AppException(
                        "Invalid colour: '" + colourInput + "'. Allowed values: BLACK, CYAN, MAGENTA, YELLOW.",
                        HttpStatus.BAD_REQUEST
                );
            }
        }

        // Asset status validation (defaults to ACTIVE if null or empty)
        AssetStatus status = AssetStatus.fromString(request.getStatus());
        if (status == null) {
            throw new AppException(
                    "Invalid asset status: '" + request.getStatus() + "'. Allowed values: ACTIVE, INACTIVE, UNDER_MAINTENANCE.",
                    HttpStatus.BAD_REQUEST
            );
        }

        Asset asset = new Asset(
                modelName,
                serialNumber,
                department,
                cartridge,
                printerType,
                colour,
                status
        );

        Asset savedAsset = assetRepository.save(asset);
        logger.info("Successfully registered new asset ID: [{}] with serial number: [{}], printerType: [{}], colour: [{}] for department: [{}]",
                savedAsset.getId(), savedAsset.getSerialNumber(), savedAsset.getPrinterType(), savedAsset.getColour(), savedAsset.getDepartment());

        return new AssetResponse(savedAsset);
    }

    @Override
    @Transactional
    public AssetResponse updateAsset(Long id, AssetRequest request) {
        if (id == null) {
            throw new AppException("Asset ID cannot be null.", HttpStatus.BAD_REQUEST);
        }
        if (request == null) {
            throw new AppException("Asset update request cannot be null.", HttpStatus.BAD_REQUEST);
        }

        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + id));

        String modelName = request.getModelName() != null ? request.getModelName().trim() : "";
        if (modelName.isEmpty()) {
            throw new AppException("Model name is required.", HttpStatus.BAD_REQUEST);
        }

        String serialNumber = request.getSerialNumber() != null ? request.getSerialNumber().trim().toUpperCase() : "";
        if (serialNumber.isEmpty()) {
            throw new AppException("Serial number is required.", HttpStatus.BAD_REQUEST);
        }

        // Duplicate serial number check (excluding current asset ID)
        if (assetRepository.existsBySerialNumberIgnoreCaseAndIdNot(serialNumber, id)) {
            logger.warn("Duplicate serial number conflict on update: [{}] for asset ID: [{}]", serialNumber, id);
            throw new AppException(
                    "An asset with serial number " + serialNumber + " already exists.",
                    HttpStatus.CONFLICT
            );
        }

        String department = request.getDepartment() != null ? request.getDepartment().trim() : "";
        if (department.isEmpty()) {
            throw new AppException("Department / location is required.", HttpStatus.BAD_REQUEST);
        }

        String cartridgeInput = request.getCompatibleCartridge() != null ? request.getCompatibleCartridge().trim() : "";
        if (cartridgeInput.isEmpty()) {
            throw new AppException("Compatible cartridge is required.", HttpStatus.BAD_REQUEST);
        }

        Cartridge cartridge = resolveCartridge(cartridgeInput);

        PrinterType printerType = PrinterType.fromString(request.getPrinterType());
        if (printerType == null) {
            throw new AppException(
                    "Invalid printer type: '" + request.getPrinterType() + "'. Allowed values: BLACK_AND_WHITE, COLOR.",
                    HttpStatus.BAD_REQUEST
            );
        }

        // Cartridge colour validation based on PrinterType
        String colourInput = request.getColour() != null ? request.getColour() : request.getColor();
        CartridgeColor colour = null;

        if (printerType == PrinterType.BLACK_AND_WHITE) {
            if (colourInput != null && !colourInput.trim().isEmpty()) {
                throw new AppException(
                        "Colour is not applicable for Black & White printers.",
                        HttpStatus.BAD_REQUEST
                );
            }
            colour = null;
        } else if (printerType == PrinterType.COLOR) {
            if (colourInput == null || colourInput.trim().isEmpty()) {
                throw new AppException(
                        "Colour is required for Color printers. Allowed values: BLACK, CYAN, MAGENTA, YELLOW.",
                        HttpStatus.BAD_REQUEST
                );
            }
            colour = CartridgeColor.fromString(colourInput);
            if (colour == null) {
                throw new AppException(
                        "Invalid colour: '" + colourInput + "'. Allowed values: BLACK, CYAN, MAGENTA, YELLOW.",
                        HttpStatus.BAD_REQUEST
                );
            }
        }

        AssetStatus status = AssetStatus.fromString(request.getStatus());
        if (status == null) {
            throw new AppException(
                    "Invalid asset status: '" + request.getStatus() + "'. Allowed values: ACTIVE, INACTIVE, UNDER_MAINTENANCE.",
                    HttpStatus.BAD_REQUEST
            );
        }

        // Apply modifications (preserve ID and createdAt)
        asset.setModelName(modelName);
        asset.setSerialNumber(serialNumber);
        asset.setDepartment(department);
        asset.setCartridge(cartridge);
        asset.setPrinterType(printerType);
        asset.setColour(colour);
        asset.setStatus(status);
        asset.setUpdatedAt(java.time.LocalDateTime.now());

        Asset updatedAsset = assetRepository.save(asset);
        logger.info("Successfully updated asset ID: [{}] with serial: [{}], colour: [{}], department: [{}], status: [{}]",
                updatedAsset.getId(), updatedAsset.getSerialNumber(), updatedAsset.getColour(), updatedAsset.getDepartment(), updatedAsset.getStatus());

        return new AssetResponse(updatedAsset);
    }

    @Override
    public List<AssetResponse> getAllAssets(String search, String status) {
        AssetStatus statusEnum = null;
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            statusEnum = AssetStatus.fromString(status);
        }

        String searchParam = search != null ? search.trim() : null;
        List<Asset> assets = assetRepository.searchAssets(searchParam, statusEnum);

        return assets.stream()
                .map(AssetResponse::new)
                .toList();
    }

    @Override
    public AssetResponse getAssetById(Long id) {
        if (id == null) {
            throw new AppException("Asset ID cannot be null.", HttpStatus.BAD_REQUEST);
        }

        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + id));

        return new AssetResponse(asset);
    }

    /**
     * Resolves a Cartridge entity from master data using either ID, Part Number, or Cartridge Name.
     */
    private Cartridge resolveCartridge(String cartridgeInput) {
        // 1. Try to parse as numeric ID
        try {
            long id = Long.parseLong(cartridgeInput);
            Optional<Cartridge> byId = cartridgeRepository.findById(id);
            if (byId.isPresent()) {
                return byId.get();
            }
        } catch (NumberFormatException ignored) {
        }

        // 2. Try by Part Number
        Optional<Cartridge> byPart = cartridgeRepository.findByPartNumberIgnoreCase(cartridgeInput);
        if (byPart.isPresent()) {
            return byPart.get();
        }

        // 3. Try by Cartridge Name
        Optional<Cartridge> byName = cartridgeRepository.findByCartridgeNameIgnoreCase(cartridgeInput);
        if (byName.isPresent()) {
            return byName.get();
        }

        // 4. Try matching partial / prefix
        List<Cartridge> activeCartridges = cartridgeRepository.findByActiveTrueOrderByCartridgeNameAsc();
        for (Cartridge c : activeCartridges) {
            if (c.getPartNumber().equalsIgnoreCase(cartridgeInput) ||
                c.getCartridgeName().equalsIgnoreCase(cartridgeInput) ||
                cartridgeInput.toLowerCase().contains(c.getPartNumber().toLowerCase())) {
                return c;
            }
        }

        throw new AppException(
                "Compatible cartridge '" + cartridgeInput + "' was not found in cartridge master records.",
                HttpStatus.BAD_REQUEST
        );
    }
}
