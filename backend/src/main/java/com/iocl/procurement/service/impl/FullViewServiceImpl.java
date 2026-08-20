package com.iocl.procurement.service.impl;

import com.iocl.procurement.dto.response.FullViewPageResponse;
import com.iocl.procurement.dto.response.FullViewRecordResponse;
import com.iocl.procurement.entity.Cartridge;
import com.iocl.procurement.entity.RateContract;
import com.iocl.procurement.exception.ResourceNotFoundException;
import com.iocl.procurement.repository.AssetUsageRepository;
import com.iocl.procurement.repository.RateContractRepository;
import com.iocl.procurement.service.FullViewService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FullViewServiceImpl implements FullViewService {

    private final RateContractRepository rateContractRepository;
    private final AssetUsageRepository assetUsageRepository;

    public FullViewServiceImpl(
            RateContractRepository rateContractRepository,
            AssetUsageRepository assetUsageRepository
    ) {
        this.rateContractRepository = rateContractRepository;
        this.assetUsageRepository = assetUsageRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public FullViewPageResponse getFullViewRecords(
            String search,
            String supplier,
            String cartridge,
            String status,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    ) {
        Specification<RateContract> spec = buildSpecification(search, supplier, cartridge, fromDate, toDate);

        // Fetch paginated rate contracts from repository
        Page<RateContract> rateContractPage = rateContractRepository.findAll(spec, pageable);

        List<FullViewRecordResponse> mappedRecords = rateContractPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        // If status filter is requested, filter in memory
        if (status != null && !status.trim().isEmpty()) {
            String normStatus = status.trim().toUpperCase().replace(" ", "_");
            mappedRecords = mappedRecords.stream()
                    .filter(r -> r.getStatus().equalsIgnoreCase(normStatus)
                            || r.getStatus().replace("_", " ").equalsIgnoreCase(status.trim()))
                    .collect(Collectors.toList());

            return new FullViewPageResponse(
                    mappedRecords,
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    mappedRecords.size(),
                    (int) Math.ceil((double) mappedRecords.size() / pageable.getPageSize())
            );
        }

        return new FullViewPageResponse(
                mappedRecords,
                rateContractPage.getNumber(),
                rateContractPage.getSize(),
                rateContractPage.getTotalElements(),
                rateContractPage.getTotalPages()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public FullViewRecordResponse getFullViewRecordById(Long id) {
        RateContract rc = rateContractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procurement record not found with ID: " + id));
        return mapToResponse(rc);
    }

    private Specification<RateContract> buildSpecification(
            String search,
            String supplier,
            String cartridge,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<RateContract, Cartridge> cartridgeJoin = root.join("cartridge", JoinType.LEFT);

            // 1. Universal Search (Supplier, Printer, Cartridge, Part Number)
            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate matchSupplier = cb.like(cb.lower(root.get("supplierName")), searchPattern);
                Predicate matchPrinter = cb.like(cb.lower(cartridgeJoin.get("printerName")), searchPattern);
                Predicate matchCartridgeName = cb.like(cb.lower(cartridgeJoin.get("cartridgeName")), searchPattern);
                Predicate matchPartNo = cb.like(cb.lower(cartridgeJoin.get("partNumber")), searchPattern);

                predicates.add(cb.or(matchSupplier, matchPrinter, matchCartridgeName, matchPartNo));
            }

            // 2. Supplier Filter
            if (supplier != null && !supplier.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("supplierName")), supplier.trim().toLowerCase()));
            }

            // 3. Cartridge Filter (Matches cartridge name or part number)
            if (cartridge != null && !cartridge.trim().isEmpty()) {
                String cartLower = cartridge.trim().toLowerCase();
                Predicate matchCart = cb.equal(cb.lower(cartridgeJoin.get("cartridgeName")), cartLower);
                Predicate matchPart = cb.equal(cb.lower(cartridgeJoin.get("partNumber")), cartLower);
                predicates.add(cb.or(matchCart, matchPart));
            }

            // 4. Date Range Filter
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("contractDate"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("contractDate"), toDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private FullViewRecordResponse mapToResponse(RateContract rc) {
        FullViewRecordResponse res = new FullViewRecordResponse();
        res.setId(rc.getId());
        res.setDate(rc.getContractDate());
        res.setSupplierName(rc.getSupplierName());

        Long cartridgeId = null;
        if (rc.getCartridge() != null) {
            cartridgeId = rc.getCartridge().getId();
            res.setPrinterName(rc.getCartridge().getPrinterName());
            res.setCartridgeName(rc.getCartridge().getCartridgeName());
            res.setCartridgePartNumber(rc.getCartridge().getPartNumber());
        }

        int total = rc.getTotalContractQuantity() != null ? rc.getTotalContractQuantity() : 0;
        int takenWO = rc.getQuantityTakenThroughWO() != null ? rc.getQuantityTakenThroughWO() : 0;
        int executed = (cartridgeId != null) ? assetUsageRepository.getTotalQuantityUsedByCartridgeId(cartridgeId).intValue() : 0;
        int available = Math.max(0, total - takenWO);

        res.setContractQuantity(total);
        res.setExecutedQuantity(executed);
        res.setCallUpPoQuantity(takenWO);
        res.setNetAvailableQuantity(available);
        res.setRatePerUnit(rc.getRatePerUnit());
        res.setTax(rc.getTaxPercentage());
        res.setStatus(calculateStatus(total, takenWO, available));

        return res;
    }

    private String calculateStatus(int total, int takenWO, int available) {
        if (available <= 0) {
            return "COMPLETED";
        }
        int lowThreshold = Math.max(5, (int) Math.ceil(total * 0.15));
        if (available <= lowThreshold) {
            return "LOW_AVAILABILITY";
        }
        if (takenWO > 0) {
            return "PARTIALLY_USED";
        }
        return "ACTIVE";
    }
}
