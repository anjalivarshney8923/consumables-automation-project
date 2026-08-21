package com.iocl.procurement.service.impl;

import com.iocl.procurement.dto.report.*;
import com.iocl.procurement.entity.*;
import com.iocl.procurement.repository.*;
import com.iocl.procurement.service.ReportService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final AssetUsageRepository assetUsageRepository;
    private final CartridgeRepository cartridgeRepository;
    private final RateContractRepository rateContractRepository;
    private final CallUpPurchaseOrderRepository callUpPORepository;
    private final EmployeeRepository employeeRepository;
    private final CartridgeThresholdRepository thresholdRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public ReportServiceImpl(
            AssetUsageRepository assetUsageRepository,
            CartridgeRepository cartridgeRepository,
            RateContractRepository rateContractRepository,
            CallUpPurchaseOrderRepository callUpPORepository,
            EmployeeRepository employeeRepository,
            CartridgeThresholdRepository thresholdRepository
    ) {
        this.assetUsageRepository = assetUsageRepository;
        this.cartridgeRepository = cartridgeRepository;
        this.rateContractRepository = rateContractRepository;
        this.callUpPORepository = callUpPORepository;
        this.employeeRepository = employeeRepository;
        this.thresholdRepository = thresholdRepository;
    }

    // =========================================================================
    // 1. ASSET USAGE REPORT
    // =========================================================================
    @Override
    public ReportPageResponse<AssetUsageReportDTO> getAssetUsageReport(ReportFilterDTO filter) {
        Specification<AssetUsage> spec = buildAssetUsageSpecification(filter);
        Pageable pageable = buildPageable(filter, "usageDate", Sort.Direction.DESC);

        Page<AssetUsage> page = assetUsageRepository.findAll(spec, pageable);
        List<AssetUsageReportDTO> dtos = page.getContent().stream()
                .map(this::mapToAssetUsageReportDTO)
                .collect(Collectors.toList());

        return new ReportPageResponse<>(ReportType.ASSET_USAGE, dtos, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Override
    public AssetUsageReportSummaryDTO getAssetUsageSummary(ReportFilterDTO filter) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        // 1. Total records & total quantity
        CriteriaQuery<Object[]> query = cb.createQuery(Object[].class);
        Root<AssetUsage> root = query.from(AssetUsage.class);
        Predicate predicate = buildAssetUsagePredicate(cb, root, filter);

        if (predicate != null) {
            query.where(predicate);
        }

        query.multiselect(
                cb.count(root),
                cb.coalesce(cb.sum(root.get("quantityUsed")), 0L),
                cb.countDistinct(root.get("user").get("id")),
                cb.countDistinct(root.get("beneficiaryEmployeeNo"))
        );

        Object[] result = entityManager.createQuery(query).getSingleResult();
        long totalRecords = result[0] != null ? ((Number) result[0]).longValue() : 0L;
        long totalQuantity = result[1] != null ? ((Number) result[1]).longValue() : 0L;
        long totalEngineers = result[2] != null ? ((Number) result[2]).longValue() : 0L;
        long totalBeneficiaries = result[3] != null ? ((Number) result[3]).longValue() : 0L;

        return new AssetUsageReportSummaryDTO(totalRecords, totalQuantity, totalEngineers, totalBeneficiaries);
    }

    private Specification<AssetUsage> buildAssetUsageSpecification(ReportFilterDTO filter) {
        return (root, query, cb) -> buildAssetUsagePredicate(cb, root, filter);
    }

    private Predicate buildAssetUsagePredicate(CriteriaBuilder cb, Root<AssetUsage> root, ReportFilterDTO filter) {
        List<Predicate> predicates = new ArrayList<>();
        Join<AssetUsage, User> userJoin = root.join("user", JoinType.LEFT);
        Join<AssetUsage, Cartridge> cartJoin = root.join("cartridge", JoinType.LEFT);
        Join<AssetUsage, Asset> assetJoin = root.join("asset", JoinType.LEFT);

        if (filter.getFromDate() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("usageDate"), filter.getFromDate()));
        }
        if (filter.getToDate() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("usageDate"), filter.getToDate()));
        }
        if (hasText(filter.getSearch())) {
            String pattern = "%" + filter.getSearch().trim().toLowerCase() + "%";
            predicates.add(cb.or(
                    cb.like(cb.lower(userJoin.get("fullName")), pattern),
                    cb.like(cb.lower(userJoin.get("employeeId")), pattern),
                    cb.like(cb.lower(root.get("beneficiaryEmployeeName")), pattern),
                    cb.like(cb.lower(root.get("beneficiaryEmployeeNo")), pattern),
                    cb.like(cb.lower(root.get("beneficiaryDepartment")), pattern),
                    cb.like(cb.lower(cartJoin.get("partNumber")), pattern),
                    cb.like(cb.lower(cartJoin.get("cartridgeName")), pattern),
                    cb.like(cb.lower(cartJoin.get("printerName")), pattern),
                    cb.like(cb.lower(root.get("partNumber")), pattern),
                    cb.like(cb.lower(root.get("cartridgeName")), pattern),
                    cb.like(cb.lower(root.get("printerModel")), pattern),
                    cb.like(cb.lower(assetJoin.get("modelName")), pattern),
                    cb.like(cb.lower(assetJoin.get("serialNumber")), pattern)
            ));
        }
        if (hasText(filter.getPartNumber())) {
            String pLower = filter.getPartNumber().trim().toLowerCase();
            predicates.add(cb.or(
                    cb.equal(cb.lower(cartJoin.get("partNumber")), pLower),
                    cb.equal(cb.lower(root.get("partNumber")), pLower)
            ));
        }
        if (hasText(filter.getEngineer())) {
            String engPattern = "%" + filter.getEngineer().trim().toLowerCase() + "%";
            predicates.add(cb.or(
                    cb.like(cb.lower(userJoin.get("fullName")), engPattern),
                    cb.like(cb.lower(userJoin.get("employeeId")), engPattern),
                    cb.like(cb.lower(userJoin.get("username")), engPattern)
            ));
        }
        if (hasText(filter.getBeneficiary())) {
            String benPattern = "%" + filter.getBeneficiary().trim().toLowerCase() + "%";
            predicates.add(cb.or(
                    cb.like(cb.lower(root.get("beneficiaryEmployeeName")), benPattern),
                    cb.like(cb.lower(root.get("beneficiaryEmployeeNo")), benPattern)
            ));
        }
        if (hasText(filter.getEmployeeNumber())) {
            predicates.add(cb.equal(cb.lower(root.get("beneficiaryEmployeeNo")), filter.getEmployeeNumber().trim().toLowerCase()));
        }
        if (hasText(filter.getDepartment()) && !filter.getDepartment().equalsIgnoreCase("ALL")) {
            predicates.add(cb.equal(cb.lower(root.get("beneficiaryDepartment")), filter.getDepartment().trim().toLowerCase()));
        }
        if (hasText(filter.getLocation()) && !filter.getLocation().equalsIgnoreCase("ALL")) {
            predicates.add(cb.equal(cb.lower(root.get("beneficiaryLocation")), filter.getLocation().trim().toLowerCase()));
        }
        if (hasText(filter.getColour()) && !filter.getColour().equalsIgnoreCase("ALL")) {
            predicates.add(cb.equal(cb.lower(root.get("colour")), filter.getColour().trim().toLowerCase()));
        }

        return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
    }

    private AssetUsageReportDTO mapToAssetUsageReportDTO(AssetUsage u) {
        AssetUsageReportDTO dto = new AssetUsageReportDTO();
        dto.setId(u.getId());
        dto.setUsageDate(u.getUsageDate());
        if (u.getUser() != null) {
            dto.setRecordedByEngineerName(u.getUser().getFullName());
            dto.setRecordedByEmployeeNo(u.getUser().getEmployeeId());
            dto.setRecordedByEmail(u.getUser().getEmail());
        }
        dto.setBeneficiaryEmployeeName(u.getBeneficiaryEmployeeName());
        dto.setBeneficiaryEmployeeNo(u.getBeneficiaryEmployeeNo());
        dto.setBeneficiaryEmail(u.getBeneficiaryEmail());
        dto.setBeneficiaryDepartment(u.getBeneficiaryDepartment());
        dto.setBeneficiarySeatOrCabinNo(u.getBeneficiarySeatOrCabinNo());
        dto.setBeneficiaryLocation(u.getBeneficiaryLocation());
        if (u.getCartridge() != null) {
            dto.setPartNumber(u.getCartridge().getPartNumber());
            dto.setCartridgeName(u.getCartridge().getCartridgeName());
            dto.setPrinterName(u.getCartridge().getPrinterName());
        } else {
            dto.setPartNumber(u.getPartNumber());
            dto.setCartridgeName(u.getCartridgeName());
        }
        if (u.getColour() != null) {
            dto.setColour(u.getColour().name());
        }
        if (u.getAsset() != null) {
            dto.setPrinterId(u.getAsset().getSerialNumber());
            dto.setPrinterName(u.getAsset().getModelName());
        } else if (u.getPrinterModel() != null) {
            dto.setPrinterName(u.getPrinterModel());
        }
        dto.setQuantityUsed(u.getQuantityUsed());
        dto.setRemarks(u.getRemarks());
        dto.setWorkOrderReference(u.getWorkOrderReference());
        dto.setCreatedAt(u.getCreatedAt());
        return dto;
    }

    // =========================================================================
    // 2. STORE INVENTORY REPORT
    // =========================================================================
    @Override
    public ReportPageResponse<StoreInventoryReportDTO> getStoreInventoryReport(ReportFilterDTO filter) {
        List<StoreInventoryReportDTO> allItems = buildAllStoreInventoryItems();

        // Apply filters in memory over the unified inventory calculation
        List<StoreInventoryReportDTO> filtered = allItems.stream()
                .filter(item -> filterStoreInventory(item, filter))
                .collect(Collectors.toList());

        // Apply sorting
        sortStoreInventory(filtered, filter.getSortBy(), filter.getSortDir());

        // Paginate
        int pageIndex = filter.getPage();
        int pageSize = filter.getSize();
        int totalElements = filtered.size();
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);
        int start = Math.min(pageIndex * pageSize, totalElements);
        int end = Math.min(start + pageSize, totalElements);

        List<StoreInventoryReportDTO> pagedContent = (start < end) ? filtered.subList(start, end) : Collections.emptyList();

        return new ReportPageResponse<>(ReportType.STORE_INVENTORY, pagedContent, pageIndex, pageSize, totalElements, totalPages);
    }

    @Override
    public StoreInventoryReportSummaryDTO getStoreInventorySummary(ReportFilterDTO filter) {
        List<StoreInventoryReportDTO> allItems = buildAllStoreInventoryItems();
        List<StoreInventoryReportDTO> filtered = allItems.stream()
                .filter(item -> filterStoreInventory(item, filter))
                .toList();

        long totalItems = filtered.size();
        long totalStoreQuantity = filtered.stream().mapToLong(i -> i.getStoreQuantity() != null ? i.getStoreQuantity() : 0).sum();
        long lowStockItems = filtered.stream().filter(i -> "LOW_STOCK".equalsIgnoreCase(i.getStatus()) || "TENDERING_REQUIRED".equalsIgnoreCase(i.getStatus())).count();
        long outOfStockItems = filtered.stream().filter(i -> "OUT_OF_STOCK".equalsIgnoreCase(i.getStatus()) || (i.getStoreQuantity() != null && i.getStoreQuantity() <= 0)).count();

        return new StoreInventoryReportSummaryDTO(totalItems, totalStoreQuantity, lowStockItems, outOfStockItems);
    }

    private List<StoreInventoryReportDTO> buildAllStoreInventoryItems() {
        List<Cartridge> cartridges = cartridgeRepository.findAllByActiveTrueOrderByPrinterNameAsc();
        List<StoreInventoryReportDTO> dtos = new ArrayList<>();

        for (Cartridge cart : cartridges) {
            StoreInventoryReportDTO dto = new StoreInventoryReportDTO();
            dto.setCartridgeId(cart.getId());
            dto.setPartNumber(cart.getPartNumber());
            dto.setCartridgeName(cart.getCartridgeName());
            dto.setPrinterName(cart.getPrinterName());
            dto.setColour("BLACK");
            dto.setLocation("Central Warehouse");

            int storeQty = cart.getStoreQuantity() != null ? cart.getStoreQuantity() : 0;
            dto.setStoreQuantity(storeQty);

            List<RateContract> rateContracts = rateContractRepository.findByCartridgeId(cart.getId());
            int totalRCQty = rateContracts.stream()
                    .mapToInt(rc -> rc.getTotalContractQuantity() != null ? rc.getTotalContractQuantity() : 0)
                    .sum();
            int totalTakenWO = rateContracts.stream()
                    .mapToInt(rc -> rc.getQuantityTakenThroughWO() != null ? rc.getQuantityTakenThroughWO() : 0)
                    .sum();
            int rcNetAvailable = rateContracts.stream()
                    .mapToInt(rc -> rc.getNetAvailableQuantity() != null ? rc.getNetAvailableQuantity() : 0)
                    .sum();
            int combinedNet = storeQty + rcNetAvailable;

            dto.setTotalRcQuantity(totalRCQty);
            dto.setQtyTakenVideWO(totalTakenWO);
            dto.setNetAvailableRc(rcNetAvailable);
            dto.setCombinedNetQty(combinedNet);

            CartridgeThreshold threshold = thresholdRepository.findByCartridgeId(cart.getId()).orElse(null);
            int thresholdLimit = (threshold != null && threshold.getTenderingThreshold() != null)
                    ? threshold.getTenderingThreshold()
                    : (threshold != null && threshold.getPoThreshold() != null ? threshold.getPoThreshold() : 10);
            dto.setThresholdLimit(thresholdLimit);

            if (combinedNet <= thresholdLimit) {
                dto.setStatus("TENDERING_REQUIRED");
            } else if (storeQty <= 0) {
                dto.setStatus("OUT_OF_STOCK");
            } else if (storeQty <= (threshold != null && threshold.getPoThreshold() != null ? threshold.getPoThreshold() : 10)) {
                dto.setStatus("LOW_STOCK");
            } else {
                dto.setStatus("AVAILABLE");
            }

            dtos.add(dto);
        }
        return dtos;
    }

    private boolean filterStoreInventory(StoreInventoryReportDTO item, ReportFilterDTO filter) {
        if (hasText(filter.getSearch())) {
            String p = filter.getSearch().trim().toLowerCase();
            boolean match = (item.getPartNumber() != null && item.getPartNumber().toLowerCase().contains(p))
                    || (item.getCartridgeName() != null && item.getCartridgeName().toLowerCase().contains(p))
                    || (item.getPrinterName() != null && item.getPrinterName().toLowerCase().contains(p));
            if (!match) return false;
        }
        if (hasText(filter.getPartNumber())) {
            if (item.getPartNumber() == null || !item.getPartNumber().equalsIgnoreCase(filter.getPartNumber().trim())) {
                return false;
            }
        }
        if (hasText(filter.getStatus()) && !filter.getStatus().equalsIgnoreCase("ALL")) {
            if (item.getStatus() == null || !item.getStatus().equalsIgnoreCase(filter.getStatus().trim())) {
                return false;
            }
        }
        return true;
    }

    private void sortStoreInventory(List<StoreInventoryReportDTO> items, String sortBy, String sortDir) {
        boolean asc = "asc".equalsIgnoreCase(sortDir);
        Comparator<StoreInventoryReportDTO> comp;

        if ("partNumber".equalsIgnoreCase(sortBy)) {
            comp = Comparator.comparing(StoreInventoryReportDTO::getPartNumber, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        } else if ("storeQuantity".equalsIgnoreCase(sortBy)) {
            comp = Comparator.comparing(StoreInventoryReportDTO::getStoreQuantity, Comparator.nullsLast(Integer::compareTo));
        } else if ("combinedNetQty".equalsIgnoreCase(sortBy)) {
            comp = Comparator.comparing(StoreInventoryReportDTO::getCombinedNetQty, Comparator.nullsLast(Integer::compareTo));
        } else if ("status".equalsIgnoreCase(sortBy)) {
            comp = Comparator.comparing(StoreInventoryReportDTO::getStatus, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        } else {
            comp = Comparator.comparing(StoreInventoryReportDTO::getCartridgeName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        }

        if (!asc) comp = comp.reversed();
        items.sort(comp);
    }

    // =========================================================================
    // 3. PROCUREMENT / RATE CONTRACT REPORT
    // =========================================================================
    @Override
    public ReportPageResponse<ProcurementReportDTO> getProcurementReport(ReportFilterDTO filter) {
        Specification<RateContract> spec = buildRateContractSpecification(filter);
        Pageable pageable = buildPageable(filter, "contractDate", Sort.Direction.DESC);

        Page<RateContract> page = rateContractRepository.findAll(spec, pageable);
        List<ProcurementReportDTO> dtos = page.getContent().stream()
                .map(this::mapToProcurementReportDTO)
                .collect(Collectors.toList());

        return new ReportPageResponse<>(ReportType.PROCUREMENT, dtos, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Override
    public ProcurementReportSummaryDTO getProcurementSummary(ReportFilterDTO filter) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Object[]> query = cb.createQuery(Object[].class);
        Root<RateContract> root = query.from(RateContract.class);
        Predicate predicate = buildRateContractPredicate(cb, root, filter);

        if (predicate != null) query.where(predicate);

        query.multiselect(
                cb.count(root),
                cb.coalesce(cb.sum(root.get("totalContractQuantity")), 0L),
                cb.coalesce(cb.sum(root.get("quantityTakenThroughWO")), 0L)
        );

        Object[] result = entityManager.createQuery(query).getSingleResult();
        long totalRCs = result[0] != null ? ((Number) result[0]).longValue() : 0L;
        long totalContractQty = result[1] != null ? ((Number) result[1]).longValue() : 0L;
        long totalTakenWO = result[2] != null ? ((Number) result[2]).longValue() : 0L;
        long totalNetAvailable = Math.max(0L, totalContractQty - totalTakenWO);

        return new ProcurementReportSummaryDTO(totalRCs, totalContractQty, totalTakenWO, totalNetAvailable);
    }

    private Specification<RateContract> buildRateContractSpecification(ReportFilterDTO filter) {
        return (root, query, cb) -> buildRateContractPredicate(cb, root, filter);
    }

    private Predicate buildRateContractPredicate(CriteriaBuilder cb, Root<RateContract> root, ReportFilterDTO filter) {
        List<Predicate> predicates = new ArrayList<>();
        Join<RateContract, Cartridge> cartJoin = root.join("cartridge", JoinType.LEFT);

        if (filter.getFromDate() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("contractDate"), filter.getFromDate()));
        }
        if (filter.getToDate() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("contractDate"), filter.getToDate()));
        }
        if (hasText(filter.getSearch())) {
            String p = "%" + filter.getSearch().trim().toLowerCase() + "%";
            predicates.add(cb.or(
                    cb.like(cb.lower(root.get("supplierName")), p),
                    cb.like(cb.lower(cartJoin.get("partNumber")), p),
                    cb.like(cb.lower(cartJoin.get("cartridgeName")), p),
                    cb.like(cb.lower(cartJoin.get("printerName")), p)
            ));
        }
        if (hasText(filter.getSupplier())) {
            predicates.add(cb.like(cb.lower(root.get("supplierName")), "%" + filter.getSupplier().trim().toLowerCase() + "%"));
        }
        if (hasText(filter.getPartNumber())) {
            predicates.add(cb.equal(cb.lower(cartJoin.get("partNumber")), filter.getPartNumber().trim().toLowerCase()));
        }

        return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
    }

    private ProcurementReportDTO mapToProcurementReportDTO(RateContract rc) {
        ProcurementReportDTO dto = new ProcurementReportDTO();
        dto.setId(rc.getId());
        dto.setContractNumber("RC-" + (rc.getContractDate() != null ? rc.getContractDate().getYear() : "2026") + "-" + String.format("%04d", rc.getId()));
        if (rc.getCartridge() != null) {
            dto.setPartNumber(rc.getCartridge().getPartNumber());
            dto.setDescription(rc.getCartridge().getCartridgeName());
            dto.setPrinterName(rc.getCartridge().getPrinterName());
        }
        dto.setSupplierName(rc.getSupplierName());
        int total = rc.getTotalContractQuantity() != null ? rc.getTotalContractQuantity() : 0;
        int takenWO = rc.getQuantityTakenThroughWO() != null ? rc.getQuantityTakenThroughWO() : 0;
        int available = Math.max(0, total - takenWO);

        dto.setContractQuantity(total);
        dto.setQtyTakenVideWO(takenWO);
        dto.setNetAvailableRc(available);
        dto.setRatePerUnit(rc.getRatePerUnit() != null ? rc.getRatePerUnit().doubleValue() : null);
        dto.setTaxPercentage(rc.getTaxPercentage() != null ? rc.getTaxPercentage().doubleValue() : null);
        dto.setStartDate(rc.getContractDate());
        dto.setEndDate(rc.getContractDate() != null ? rc.getContractDate().plusYears(1) : null);
        dto.setStatus(available <= 0 ? "COMPLETED" : (takenWO > 0 ? "PARTIALLY_USED" : "ACTIVE"));
        return dto;
    }

    // =========================================================================
    // 4. CALL-UP PO REPORT
    // =========================================================================
    @Override
    public ReportPageResponse<CallUpPOReportDTO> getCallUpPOReport(ReportFilterDTO filter) {
        Specification<CallUpPurchaseOrder> spec = buildCallUpPOSpecification(filter);
        Pageable pageable = buildPageable(filter, "poDate", Sort.Direction.DESC);

        Page<CallUpPurchaseOrder> page = callUpPORepository.findAll(spec, pageable);
        List<CallUpPOReportDTO> dtos = page.getContent().stream()
                .map(this::mapToCallUpPOReportDTO)
                .collect(Collectors.toList());

        return new ReportPageResponse<>(ReportType.CALL_UP_PO, dtos, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Override
    public CallUpPOReportSummaryDTO getCallUpPOSummary(ReportFilterDTO filter) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Object[]> query = cb.createQuery(Object[].class);
        Root<CallUpPurchaseOrder> root = query.from(CallUpPurchaseOrder.class);
        Predicate predicate = buildCallUpPOPredicate(cb, root, filter);

        if (predicate != null) query.where(predicate);

        query.multiselect(
                cb.count(root),
                cb.coalesce(cb.sum(root.get("quantity")), 0L)
        );

        Object[] result = entityManager.createQuery(query).getSingleResult();
        long totalPOs = result[0] != null ? ((Number) result[0]).longValue() : 0L;
        long totalOrderQty = result[1] != null ? ((Number) result[1]).longValue() : 0L;
        long totalExecutedQty = totalOrderQty; // In this domain model, raised Call-Up PO quantities represent delivered orders
        long totalRemaining = 0L;

        return new CallUpPOReportSummaryDTO(totalPOs, totalOrderQty, totalExecutedQty, totalRemaining);
    }

    private Specification<CallUpPurchaseOrder> buildCallUpPOSpecification(ReportFilterDTO filter) {
        return (root, query, cb) -> buildCallUpPOPredicate(cb, root, filter);
    }

    private Predicate buildCallUpPOPredicate(CriteriaBuilder cb, Root<CallUpPurchaseOrder> root, ReportFilterDTO filter) {
        List<Predicate> predicates = new ArrayList<>();
        Join<CallUpPurchaseOrder, RateContract> rcJoin = root.join("rateContract", JoinType.LEFT);
        Join<RateContract, Cartridge> cartJoin = rcJoin.join("cartridge", JoinType.LEFT);

        if (filter.getFromDate() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("poDate"), filter.getFromDate()));
        }
        if (filter.getToDate() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("poDate"), filter.getToDate()));
        }
        if (hasText(filter.getSearch())) {
            String p = "%" + filter.getSearch().trim().toLowerCase() + "%";
            predicates.add(cb.or(
                    cb.like(cb.lower(root.get("poNumber")), p),
                    cb.like(cb.lower(root.get("supplierName")), p),
                    cb.like(cb.lower(cartJoin.get("partNumber")), p),
                    cb.like(cb.lower(cartJoin.get("cartridgeName")), p)
            ));
        }
        if (hasText(filter.getPoNumber())) {
            predicates.add(cb.like(cb.lower(root.get("poNumber")), "%" + filter.getPoNumber().trim().toLowerCase() + "%"));
        }
        if (hasText(filter.getPartNumber())) {
            predicates.add(cb.equal(cb.lower(cartJoin.get("partNumber")), filter.getPartNumber().trim().toLowerCase()));
        }
        if (hasText(filter.getSupplier())) {
            predicates.add(cb.like(cb.lower(root.get("supplierName")), "%" + filter.getSupplier().trim().toLowerCase() + "%"));
        }

        return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
    }

    private CallUpPOReportDTO mapToCallUpPOReportDTO(CallUpPurchaseOrder po) {
        CallUpPOReportDTO dto = new CallUpPOReportDTO();
        dto.setId(po.getId());
        dto.setPoNumber(po.getPoNumber());
        dto.setPoDate(po.getPoDate());
        if (po.getRateContract() != null) {
            dto.setRateContractNumber("RC-" + (po.getRateContract().getContractDate() != null ? po.getRateContract().getContractDate().getYear() : "2026") + "-" + String.format("%04d", po.getRateContract().getId()));
            dto.setSupplierName(po.getSupplierName() != null ? po.getSupplierName() : po.getRateContract().getSupplierName());
            if (po.getRateContract().getCartridge() != null) {
                dto.setPartNumber(po.getRateContract().getCartridge().getPartNumber());
                dto.setCartridgeName(po.getRateContract().getCartridge().getCartridgeName());
            }
        } else {
            dto.setSupplierName(po.getSupplierName());
        }
        int orderQty = po.getQuantity() != null ? po.getQuantity() : 0;
        int executedQty = orderQty;
        dto.setOrderQuantity(orderQty);
        dto.setExecutedQuantity(executedQty);
        dto.setRemainingQuantity(0);
        dto.setStatus("COMPLETED");
        return dto;
    }

    // =========================================================================
    // 5. EMPLOYEE MASTER REPORT
    // =========================================================================
    @Override
    public ReportPageResponse<EmployeeReportDTO> getEmployeeReport(ReportFilterDTO filter) {
        Specification<Employee> spec = buildEmployeeSpecification(filter);
        Pageable pageable = buildPageable(filter, "employeeNumber", Sort.Direction.ASC);

        Page<Employee> page = employeeRepository.findAll(spec, pageable);
        List<EmployeeReportDTO> dtos = page.getContent().stream()
                .map(this::mapToEmployeeReportDTO)
                .collect(Collectors.toList());

        return new ReportPageResponse<>(ReportType.EMPLOYEE, dtos, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Override
    public EmployeeReportSummaryDTO getEmployeeSummary(ReportFilterDTO filter) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Object[]> query = cb.createQuery(Object[].class);
        Root<Employee> root = query.from(Employee.class);
        Predicate predicate = buildEmployeePredicate(cb, root, filter);

        if (predicate != null) query.where(predicate);

        query.multiselect(
                cb.count(root),
                cb.count(cb.nullif(cb.equal(root.get("status"), EmployeeStatus.ACTIVE), false)),
                cb.count(cb.nullif(cb.equal(root.get("status"), EmployeeStatus.INACTIVE), false)),
                cb.countDistinct(root.get("department")),
                cb.count(cb.nullif(cb.and(cb.isNotNull(root.get("printerName")), cb.notEqual(root.get("printerName"), "")), false))
        );

        Object[] result = entityManager.createQuery(query).getSingleResult();
        long total = result[0] != null ? ((Number) result[0]).longValue() : 0L;
        long active = result[1] != null ? ((Number) result[1]).longValue() : 0L;
        long inactive = result[2] != null ? ((Number) result[2]).longValue() : 0L;
        long depts = result[3] != null ? ((Number) result[3]).longValue() : 0L;
        long withPrinters = result[4] != null ? ((Number) result[4]).longValue() : 0L;

        return new EmployeeReportSummaryDTO(total, active, inactive, depts, withPrinters);
    }

    private Specification<Employee> buildEmployeeSpecification(ReportFilterDTO filter) {
        return (root, query, cb) -> buildEmployeePredicate(cb, root, filter);
    }

    private Predicate buildEmployeePredicate(CriteriaBuilder cb, Root<Employee> root, ReportFilterDTO filter) {
        List<Predicate> predicates = new ArrayList<>();

        if (hasText(filter.getSearch())) {
            String p = "%" + filter.getSearch().trim().toLowerCase() + "%";
            predicates.add(cb.or(
                    cb.like(cb.lower(root.get("fullName")), p),
                    cb.like(cb.lower(root.get("employeeNumber")), p),
                    cb.like(cb.lower(root.get("email")), p),
                    cb.like(cb.lower(root.get("department")), p),
                    cb.like(cb.lower(root.get("designation")), p),
                    cb.like(cb.lower(root.get("printerName")), p)
            ));
        }
        if (hasText(filter.getEmployeeNumber())) {
            predicates.add(cb.like(cb.lower(root.get("employeeNumber")), "%" + filter.getEmployeeNumber().trim().toLowerCase() + "%"));
        }
        if (hasText(filter.getName())) {
            predicates.add(cb.like(cb.lower(root.get("fullName")), "%" + filter.getName().trim().toLowerCase() + "%"));
        }
        if (hasText(filter.getDepartment()) && !filter.getDepartment().equalsIgnoreCase("ALL")) {
            predicates.add(cb.equal(cb.lower(root.get("department")), filter.getDepartment().trim().toLowerCase()));
        }
        if (hasText(filter.getStatus()) && !filter.getStatus().equalsIgnoreCase("ALL")) {
            try {
                EmployeeStatus statusEnum = EmployeeStatus.valueOf(filter.getStatus().trim().toUpperCase());
                predicates.add(cb.equal(root.get("status"), statusEnum));
            } catch (Exception ignored) {}
        }
        if (hasText(filter.getLocation()) && !filter.getLocation().equalsIgnoreCase("ALL")) {
            predicates.add(cb.equal(cb.lower(root.get("location")), filter.getLocation().trim().toLowerCase()));
        }

        return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
    }

    private EmployeeReportDTO mapToEmployeeReportDTO(Employee emp) {
        EmployeeReportDTO dto = new EmployeeReportDTO();
        dto.setId(emp.getId());
        dto.setEmployeeNumber(emp.getEmployeeNumber());
        dto.setEmployeeName(emp.getFullName());
        dto.setEmail(emp.getEmail());
        dto.setDepartment(emp.getDepartment());
        dto.setDesignation(emp.getDesignation());
        dto.setGd(emp.getGd());
        dto.setCabinNumber(emp.getCabinNumber());
        dto.setSeatNumber(emp.getSeatNumber());
        dto.setLocation(emp.getLocation());
        dto.setPrinterName(emp.getPrinterName());
        dto.setPrinterSerialNumber(emp.getPrinterSerialNumber());
        dto.setPrinterType(emp.getPrinterType());
        dto.setStatus(emp.getStatus() != null ? emp.getStatus().name() : "ACTIVE");
        dto.setRemarks(emp.getRemarks());
        dto.setCreatedAt(emp.getCreatedAt());
        return dto;
    }

    // =========================================================================
    // 6. STORE STOCK MOVEMENT / HISTORY REPORT
    // =========================================================================
    @Override
    public ReportPageResponse<StockMovementReportDTO> getStockMovementReport(ReportFilterDTO filter) {
        List<StockMovementReportDTO> movements = buildStockMovementLedger(filter);

        int pageIndex = filter.getPage();
        int pageSize = filter.getSize();
        int totalElements = movements.size();
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);
        int start = Math.min(pageIndex * pageSize, totalElements);
        int end = Math.min(start + pageSize, totalElements);

        List<StockMovementReportDTO> pagedContent = (start < end) ? movements.subList(start, end) : Collections.emptyList();

        return new ReportPageResponse<>(ReportType.STOCK_HISTORY, pagedContent, pageIndex, pageSize, totalElements, totalPages);
    }

    @Override
    public StockMovementReportSummaryDTO getStockMovementSummary(ReportFilterDTO filter) {
        List<StockMovementReportDTO> movements = buildStockMovementLedger(filter);

        long totalTransactions = movements.size();
        long totalStockIn = movements.stream().mapToLong(m -> m.getQuantityIn() != null ? m.getQuantityIn() : 0).sum();
        long totalStockOut = movements.stream().mapToLong(m -> m.getQuantityOut() != null ? m.getQuantityOut() : 0).sum();
        long netMovement = totalStockIn - totalStockOut;

        return new StockMovementReportSummaryDTO(totalTransactions, totalStockIn, totalStockOut, netMovement);
    }

    private List<StockMovementReportDTO> buildStockMovementLedger(ReportFilterDTO filter) {
        List<StockMovementReportDTO> entries = new ArrayList<>();

        // Inward transactions from POs
        List<CallUpPurchaseOrder> pos = callUpPORepository.findAll();
        for (CallUpPurchaseOrder po : pos) {
            StockMovementReportDTO entry = new StockMovementReportDTO();
            entry.setId("PO-" + po.getId());
            entry.setTransactionDate(po.getPoDate() != null ? po.getPoDate().atStartOfDay() : po.getCreatedAt());
            if (po.getRateContract() != null && po.getRateContract().getCartridge() != null) {
                entry.setPartNumber(po.getRateContract().getCartridge().getPartNumber());
                entry.setCartridgeName(po.getRateContract().getCartridge().getCartridgeName());
            }
            entry.setTransactionType("PURCHASE_RECEIPT");
            entry.setReference("PO #" + po.getPoNumber());
            entry.setQuantityIn(po.getQuantity());
            entry.setQuantityOut(0);
            entry.setSource(po.getSupplierName() != null ? po.getSupplierName() : "Procurement");
            entry.setRemarks("PO Execution / Inward Delivery");
            entries.add(entry);
        }

        // Outward transactions from Asset Usages
        List<AssetUsage> usages = assetUsageRepository.findAll();
        for (AssetUsage usage : usages) {
            StockMovementReportDTO entry = new StockMovementReportDTO();
            entry.setId("USE-" + usage.getId());
            entry.setTransactionDate(usage.getUsageDate() != null ? usage.getUsageDate().atStartOfDay() : usage.getCreatedAt());
            if (usage.getCartridge() != null) {
                entry.setPartNumber(usage.getCartridge().getPartNumber());
                entry.setCartridgeName(usage.getCartridge().getCartridgeName());
            }
            entry.setTransactionType("CONSUMABLE_USAGE");
            entry.setReference("Usage #" + usage.getId());
            entry.setQuantityIn(0);
            entry.setQuantityOut(usage.getQuantityUsed());
            entry.setSource((usage.getUser() != null ? usage.getUser().getFullName() : "Engineer") + " -> " + usage.getBeneficiaryEmployeeName());
            entry.setRemarks(usage.getRemarks());
            entries.add(entry);
        }

        // Filter and sort ledger
        return entries.stream()
                .filter(m -> {
                    if (filter.getFromDate() != null && m.getTransactionDate() != null && m.getTransactionDate().toLocalDate().isBefore(filter.getFromDate())) {
                        return false;
                    }
                    if (filter.getToDate() != null && m.getTransactionDate() != null && m.getTransactionDate().toLocalDate().isAfter(filter.getToDate())) {
                        return false;
                    }
                    if (hasText(filter.getSearch())) {
                        String p = filter.getSearch().trim().toLowerCase();
                        boolean match = (m.getPartNumber() != null && m.getPartNumber().toLowerCase().contains(p))
                                || (m.getCartridgeName() != null && m.getCartridgeName().toLowerCase().contains(p))
                                || (m.getReference() != null && m.getReference().toLowerCase().contains(p))
                                || (m.getSource() != null && m.getSource().toLowerCase().contains(p));
                        if (!match) return false;
                    }
                    if (hasText(filter.getPartNumber()) && (m.getPartNumber() == null || !m.getPartNumber().equalsIgnoreCase(filter.getPartNumber().trim()))) {
                        return false;
                    }
                    if (hasText(filter.getTransactionType()) && !filter.getTransactionType().equalsIgnoreCase("ALL") && (m.getTransactionType() == null || !m.getTransactionType().equalsIgnoreCase(filter.getTransactionType().trim()))) {
                        return false;
                    }
                    if (hasText(filter.getDirection()) && !filter.getDirection().equalsIgnoreCase("ALL")) {
                        if (filter.getDirection().equalsIgnoreCase("IN") && (m.getQuantityIn() == null || m.getQuantityIn() <= 0)) return false;
                        if (filter.getDirection().equalsIgnoreCase("OUT") && (m.getQuantityOut() == null || m.getQuantityOut() <= 0)) return false;
                    }
                    return true;
                })
                .sorted(Comparator.comparing(StockMovementReportDTO::getTransactionDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    // =========================================================================
    // 7. UNIFIED DISPATCHERS
    // =========================================================================
    @Override
    public ReportPageResponse<?> getReportData(ReportType reportType, ReportFilterDTO filter) {
        if (reportType == null) reportType = ReportType.ASSET_USAGE;
        return switch (reportType) {
            case ASSET_USAGE -> getAssetUsageReport(filter);
            case STORE_INVENTORY -> getStoreInventoryReport(filter);
            case PROCUREMENT -> getProcurementReport(filter);
            case CALL_UP_PO -> getCallUpPOReport(filter);
            case EMPLOYEE -> getEmployeeReport(filter);
            case STOCK_HISTORY -> getStockMovementReport(filter);
        };
    }

    @Override
    public Object getReportSummary(ReportType reportType, ReportFilterDTO filter) {
        if (reportType == null) reportType = ReportType.ASSET_USAGE;
        return switch (reportType) {
            case ASSET_USAGE -> getAssetUsageSummary(filter);
            case STORE_INVENTORY -> getStoreInventorySummary(filter);
            case PROCUREMENT -> getProcurementSummary(filter);
            case CALL_UP_PO -> getCallUpPOSummary(filter);
            case EMPLOYEE -> getEmployeeSummary(filter);
            case STOCK_HISTORY -> getStockMovementSummary(filter);
        };
    }

    private Pageable buildPageable(ReportFilterDTO filter, String defaultSortProperty, Sort.Direction defaultDirection) {
        String sortBy = hasText(filter.getSortBy()) ? filter.getSortBy() : defaultSortProperty;
        Sort.Direction direction = "asc".equalsIgnoreCase(filter.getSortDir()) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(filter.getPage(), filter.getSize(), Sort.by(direction, sortBy));
    }

    private boolean hasText(String str) {
        return str != null && !str.trim().isEmpty();
    }
}
