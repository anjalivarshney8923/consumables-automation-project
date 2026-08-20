package com.iocl.procurement.service.impl;

import com.iocl.procurement.dto.request.AssetUsageRequestDTO;
import com.iocl.procurement.dto.response.AssetUsagePageResponse;
import com.iocl.procurement.dto.response.AssetUsageResponseDTO;
import com.iocl.procurement.dto.response.AssetUsageSummaryDTO;
import com.iocl.procurement.dto.response.UserDirectoryDTO;
import com.iocl.procurement.entity.*;
import com.iocl.procurement.exception.AppException;
import com.iocl.procurement.repository.AssetRepository;
import com.iocl.procurement.repository.AssetUsageRepository;
import com.iocl.procurement.repository.CartridgeRepository;
import com.iocl.procurement.repository.RateContractRepository;
import com.iocl.procurement.repository.UserRepository;
import com.iocl.procurement.service.AlertEvaluationService;
import com.iocl.procurement.service.AssetUsageService;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
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
    private final com.iocl.procurement.service.EmailNotificationService emailNotificationService;

    public AssetUsageServiceImpl(
            AssetUsageRepository assetUsageRepository,
            UserRepository userRepository,
            AssetRepository assetRepository,
            CartridgeRepository cartridgeRepository,
            RateContractRepository rateContractRepository,
            AlertEvaluationService alertEvaluationService,
            com.iocl.procurement.service.EmailNotificationService emailNotificationService
    ) {
        this.assetUsageRepository = assetUsageRepository;
        this.userRepository = userRepository;
        this.assetRepository = assetRepository;
        this.cartridgeRepository = cartridgeRepository;
        this.rateContractRepository = rateContractRepository;
        this.alertEvaluationService = alertEvaluationService;
        this.emailNotificationService = emailNotificationService;
    }

    @Override
    @Transactional
    public AssetUsageResponseDTO recordUsage(String authenticatedUsername, AssetUsageRequestDTO request) {
        // 1. Derive and validate authenticated Engineer identity authoritatively from JWT
        User authenticatedEngineer = resolveAuthenticatedUser(authenticatedUsername);

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

        // 8. Validate Beneficiary Information (Target Employee, Location & Email)
        String beneficiaryEmpNo = request.getResolvedBeneficiaryEmployeeNo();
        if (beneficiaryEmpNo == null || beneficiaryEmpNo.trim().isEmpty()) {
            throw new AppException("Beneficiary Employee No. is required.", HttpStatus.BAD_REQUEST);
        }

        String beneficiaryEmpName = request.getResolvedBeneficiaryEmployeeName();
        if (beneficiaryEmpName == null || beneficiaryEmpName.trim().isEmpty()) {
            throw new AppException("Beneficiary Employee Name is required.", HttpStatus.BAD_REQUEST);
        }

        String beneficiaryDept = request.getResolvedBeneficiaryDepartment();
        if (beneficiaryDept == null || beneficiaryDept.trim().isEmpty()) {
            throw new AppException("Beneficiary Department is required.", HttpStatus.BAD_REQUEST);
        }

        String beneficiarySeatOrCabin = request.getResolvedBeneficiarySeatOrCabinNo();
        if (beneficiarySeatOrCabin == null || beneficiarySeatOrCabin.trim().isEmpty()) {
            throw new AppException("Seat or cabin number is required.", HttpStatus.BAD_REQUEST);
        }

        String beneficiaryLoc = request.getResolvedBeneficiaryLocation();
        if (beneficiaryLoc == null || beneficiaryLoc.trim().isEmpty()) {
            throw new AppException("Location is required.", HttpStatus.BAD_REQUEST);
        }

        String beneficiaryEmail = request.getResolvedBeneficiaryEmail();
        if (beneficiaryEmail == null || beneficiaryEmail.trim().isEmpty()) {
            throw new AppException("Beneficiary email is required.", HttpStatus.BAD_REQUEST);
        }
        if (!beneficiaryEmail.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new AppException("Please enter a valid beneficiary email address.", HttpStatus.BAD_REQUEST);
        }

        // 9. Lock Cartridge and Validate Available Store Stock
        Cartridge lockedCartridge = cartridgeRepository.findWithLockById(cartridge.getId())
                .orElseThrow(() -> new AppException("Cartridge not found with id: " + cartridge.getId(), HttpStatus.BAD_REQUEST));

        int requestedQty = request.getQuantityUsed();
        int availableStoreQty = lockedCartridge.getStoreQuantity() != null ? lockedCartridge.getStoreQuantity() : 0;

        if (requestedQty > availableStoreQty) {
            throw new AppException(
                    "Insufficient store stock. Available quantity: " + availableStoreQty + ".",
                    HttpStatus.BAD_REQUEST
            );
        }

        // 10. Deduct Store Inventory atomically
        lockedCartridge.setStoreQuantity(availableStoreQty - requestedQty);
        Cartridge updatedCartridge = cartridgeRepository.save(lockedCartridge);

        // 11. Construct and persist AssetUsage Entity
        AssetUsage usage = new AssetUsage();

        // Authoritative Recorded-By Engineer from JWT
        usage.setUser(authenticatedEngineer);
        usage.setRecordedByEmployeeNo(authenticatedEngineer.getEmployeeId());
        usage.setRecordedByEmployeeName(authenticatedEngineer.getFullName());

        // Beneficiary Employee & Location Details
        usage.setBeneficiaryEmployeeNo(beneficiaryEmpNo.trim());
        usage.setBeneficiaryEmployeeName(beneficiaryEmpName.trim());
        usage.setBeneficiaryDepartment(beneficiaryDept.trim());
        usage.setBeneficiarySeatOrCabinNo(beneficiarySeatOrCabin.trim());
        usage.setBeneficiaryLocation(beneficiaryLoc.trim());
        usage.setBeneficiaryEmail(beneficiaryEmail.trim());

        // Asset and Cartridge details
        usage.setAsset(asset);
        usage.setPrinterModel(asset != null ? asset.getModelName() : request.getPrinterId().trim());
        usage.setCartridge(updatedCartridge);
        usage.setCartridgeName(updatedCartridge.getCartridgeName());
        usage.setPartNumber(updatedCartridge.getPartNumber());
        usage.setPrinterType(printerType);
        usage.setColour(validatedColour);
        usage.setQuantityUsed(requestedQty);
        usage.setUsageDate(request.getUsageDate());
        usage.setRemarks(request.getRemarks() != null ? request.getRemarks().trim() : null);
        usage.setWorkOrderReference(request.getWorkOrderReference() != null ? request.getWorkOrderReference().trim() : null);

        AssetUsage savedUsage = assetUsageRepository.save(usage);

        // 12. Evaluate Alert 1 (Procurement threshold) and Alert 2 (Tendering threshold)
        alertEvaluationService.evaluateAllAlerts(updatedCartridge);

        logger.info("Asset usage recorded successfully. ID: [{}], Recorder: [{} / {}], Beneficiary: [{} / {} / Cabin: {} / Email: {}], Cartridge: [{}], Qty: [{}]",
                savedUsage.getId(), authenticatedEngineer.getUsername(), authenticatedEngineer.getEmployeeId(),
                beneficiaryEmpName, beneficiaryEmpNo, beneficiarySeatOrCabin, savedUsage.getBeneficiaryEmail(),
                updatedCartridge.getPartNumber(), requestedQty);

        // 13. Send Notification Email to Beneficiary Employee
        boolean emailSent = false;
        try {
            emailSent = emailNotificationService.sendBeneficiaryUsageNotificationEmail(savedUsage);
        } catch (Exception e) {
            logger.error("Failed to send beneficiary asset usage email for usage ID: {}, recipient: {}",
                    savedUsage.getId(), savedUsage.getBeneficiaryEmail(), e);
        }

        AssetUsageResponseDTO response = new AssetUsageResponseDTO(savedUsage);
        response.setEmailNotificationSent(emailSent);
        if (emailSent) {
            response.setMessage("Asset usage recorded successfully. Notification sent to " + savedUsage.getBeneficiaryEmail() + ".");
        } else {
            response.setMessage("Asset usage recorded successfully, but the notification email could not be sent.");
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetUsageResponseDTO> getUserUsageHistory(String authenticatedUsername) {
        User user = resolveAuthenticatedUser(authenticatedUsername);
        return assetUsageRepository.findByUserIdOrderByCreatedAtDescIdDesc(user.getId())
                .stream()
                .map(AssetUsageResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AssetUsageResponseDTO getUserUsageById(String authenticatedUsername, Long id) {
        User user = resolveAuthenticatedUser(authenticatedUsername);
        AssetUsage usage = assetUsageRepository.findById(id)
                .orElseThrow(() -> new AppException("Usage record not found.", HttpStatus.NOT_FOUND));

        // Enforce user data isolation: engineer can only access their own recorded usage unless Admin
        boolean isAdmin = user.getRole() != null && user.getRole().name().equalsIgnoreCase("ADMIN");
        boolean isOwner = usage.getUser() != null && usage.getUser().getId().equals(user.getId());

        if (!isOwner && !isAdmin) {
            throw new AppException("Access denied. You are not authorized to view this asset usage transaction.", HttpStatus.FORBIDDEN);
        }

        return new AssetUsageResponseDTO(usage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetUsageResponseDTO> getAllUsageForAdmin() {
        return assetUsageRepository.findAllByOrderByCreatedAtDescIdDesc()
                .stream()
                .map(AssetUsageResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AssetUsagePageResponse searchUserUsageHistory(
            String authenticatedUsername,
            String search,
            LocalDate fromDate,
            LocalDate toDate,
            Long cartridgeId,
            String colour,
            String printerId,
            String beneficiaryEmployeeNo,
            String department,
            String status,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        User user = resolveAuthenticatedUser(authenticatedUsername);
        validateDateRange(fromDate, toDate);
        validatePagination(page, size);

        Sort sort = buildSort(sortBy, sortDir);
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<AssetUsage> spec = buildUsageSpecification(
                user.getId(), search, fromDate, toDate, cartridgeId, colour, printerId, beneficiaryEmployeeNo, department
        );

        Page<AssetUsage> usagePage = assetUsageRepository.findAll(spec, pageable);

        List<AssetUsageResponseDTO> content = usagePage.getContent().stream()
                .map(AssetUsageResponseDTO::new)
                .collect(Collectors.toList());

        return new AssetUsagePageResponse(
                content,
                usagePage.getNumber(),
                usagePage.getSize(),
                usagePage.getTotalElements(),
                usagePage.getTotalPages(),
                usagePage.isFirst(),
                usagePage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AssetUsagePageResponse searchAllUsageForAdmin(
            String search,
            LocalDate fromDate,
            LocalDate toDate,
            Long cartridgeId,
            String colour,
            String printerId,
            String beneficiaryEmployeeNo,
            String department,
            String status,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        validateDateRange(fromDate, toDate);
        validatePagination(page, size);

        Sort sort = buildSort(sortBy, sortDir);
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<AssetUsage> spec = buildUsageSpecification(
                null, search, fromDate, toDate, cartridgeId, colour, printerId, beneficiaryEmployeeNo, department
        );

        Page<AssetUsage> usagePage = assetUsageRepository.findAll(spec, pageable);

        List<AssetUsageResponseDTO> content = usagePage.getContent().stream()
                .map(AssetUsageResponseDTO::new)
                .collect(Collectors.toList());

        return new AssetUsagePageResponse(
                content,
                usagePage.getNumber(),
                usagePage.getSize(),
                usagePage.getTotalElements(),
                usagePage.getTotalPages(),
                usagePage.isFirst(),
                usagePage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AssetUsageSummaryDTO getUsageSummary(String authenticatedUsername) {
        User user = resolveAuthenticatedUser(authenticatedUsername);
        Long userId = user.getId();

        long totalRecords = assetUsageRepository.countByUserId(userId);
        Long totalQuantity = assetUsageRepository.getTotalQuantityUsedByUserId(userId);
        long totalQuantityUsed = totalQuantity != null ? totalQuantity : 0L;

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());
        long thisMonthCount = assetUsageRepository.countByUserIdAndUsageDateBetween(userId, startOfMonth, endOfMonth);

        LocalDate lastUsageDate = assetUsageRepository.findLatestUsageDateByUserId(userId);

        return new AssetUsageSummaryDTO(totalRecords, totalQuantityUsed, thisMonthCount, lastUsageDate);
    }

    @Override
    @Transactional(readOnly = true)
    public AssetUsageSummaryDTO getAdminUsageSummary() {
        long totalRecords = assetUsageRepository.count();
        Long totalQuantity = assetUsageRepository.getTotalQuantityUsedAll();
        long totalQuantityUsed = totalQuantity != null ? totalQuantity : 0L;

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        long thisMonthCount = 0;
        try {
            thisMonthCount = assetUsageRepository.count((root, query, cb) ->
                    cb.between(root.get("usageDate"), startOfMonth, endOfMonth)
            );
        } catch (Exception ignored) {
        }

        LocalDate lastUsageDate = assetUsageRepository.findLatestUsageDate();

        return new AssetUsageSummaryDTO(totalRecords, totalQuantityUsed, thisMonthCount, lastUsageDate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDirectoryDTO> searchBeneficiaries(String query) {
        if (query == null || query.trim().isEmpty()) {
            return userRepository.findAllByOrderByFullNameAsc()
                    .stream()
                    .map(UserDirectoryDTO::new)
                    .collect(Collectors.toList());
        }
        String trimmed = query.trim();
        return userRepository.searchEmployees(trimmed)
                .stream()
                .map(UserDirectoryDTO::new)
                .collect(Collectors.toList());
    }

    // Helper Methods

    private void validateDateRange(LocalDate fromDate, LocalDate toDate) {
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new AppException(
                    "From date (" + fromDate + ") cannot be after To date (" + toDate + ").",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    private void validatePagination(int page, int size) {
        if (page < 0) {
            throw new AppException("Page index cannot be negative.", HttpStatus.BAD_REQUEST);
        }
        if (size <= 0 || size > 100) {
            throw new AppException("Page size must be between 1 and 100.", HttpStatus.BAD_REQUEST);
        }
    }

    private Sort buildSort(String sortBy, String sortDir) {
        String field = "usageDate";
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            String candidate = sortBy.trim();
            if (candidate.equalsIgnoreCase("usageDate") || candidate.equalsIgnoreCase("createdAt")
                    || candidate.equalsIgnoreCase("quantityUsed") || candidate.equalsIgnoreCase("beneficiaryEmployeeName")
                    || candidate.equalsIgnoreCase("partNumber") || candidate.equalsIgnoreCase("id")) {
                field = candidate;
            } else {
                throw new AppException("Invalid sort field: '" + sortBy + "'. Allowed: usageDate, createdAt, quantityUsed, beneficiaryEmployeeName, partNumber, id", HttpStatus.BAD_REQUEST);
            }
        }

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, field).and(Sort.by(Sort.Direction.DESC, "id"));
    }

    private Specification<AssetUsage> buildUsageSpecification(
            Long userId,
            String search,
            LocalDate fromDate,
            LocalDate toDate,
            Long cartridgeId,
            String colour,
            String printerId,
            String beneficiaryEmployeeNo,
            String department
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. User Isolation
            if (userId != null) {
                predicates.add(criteriaBuilder.equal(root.get("user").get("id"), userId));
            }

            // 2. Keyword Search across all key text fields
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate searchPred = criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("beneficiaryEmployeeNo")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("beneficiaryEmployeeName")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("beneficiaryDepartment")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("beneficiarySeatOrCabinNo")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("beneficiaryLocation")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("beneficiaryEmail")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("partNumber")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("cartridgeName")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("printerModel")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("recordedByEmployeeName")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("recordedByEmployeeNo")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("workOrderReference")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("remarks")), pattern)
                );
                predicates.add(searchPred);
            }

            // 3. Date Range
            if (fromDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("usageDate"), fromDate));
            }
            if (toDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("usageDate"), toDate));
            }

            // 4. Cartridge ID
            if (cartridgeId != null) {
                predicates.add(criteriaBuilder.equal(root.get("cartridge").get("id"), cartridgeId));
            }

            // 5. Colour
            if (colour != null && !colour.trim().isEmpty() && !"All Colours".equalsIgnoreCase(colour.trim())) {
                CartridgeColor parsed = CartridgeColor.fromString(colour.trim());
                if (parsed == null) {
                    throw new AppException("Invalid colour: '" + colour + "'. Allowed values: BLACK, CYAN, MAGENTA, YELLOW", HttpStatus.BAD_REQUEST);
                }
                predicates.add(criteriaBuilder.equal(root.get("colour"), parsed));
            }

            // 6. Printer ID / Model
            if (printerId != null && !printerId.trim().isEmpty() && !"All Printers".equalsIgnoreCase(printerId.trim())) {
                try {
                    Long pId = Long.parseLong(printerId.trim());
                    predicates.add(criteriaBuilder.or(
                            criteriaBuilder.equal(root.get("asset").get("id"), pId),
                            criteriaBuilder.like(criteriaBuilder.lower(root.get("printerModel")), "%" + printerId.trim().toLowerCase() + "%")
                    ));
                } catch (NumberFormatException e) {
                    predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("printerModel")), "%" + printerId.trim().toLowerCase() + "%"));
                }
            }

            // 7. Beneficiary Employee No
            if (beneficiaryEmployeeNo != null && !beneficiaryEmployeeNo.trim().isEmpty() && !"All Employees".equalsIgnoreCase(beneficiaryEmployeeNo.trim())) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.upper(root.get("beneficiaryEmployeeNo")),
                        beneficiaryEmployeeNo.trim().toUpperCase()
                ));
            }

            // 8. Department
            if (department != null && !department.trim().isEmpty() && !"All Departments".equalsIgnoreCase(department.trim())) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.upper(root.get("beneficiaryDepartment")),
                        department.trim().toUpperCase()
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

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
