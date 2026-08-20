package com.iocl.procurement.service.impl;

import com.iocl.procurement.dto.request.RateContractRequest;
import com.iocl.procurement.dto.response.CallUpPOResponse;
import com.iocl.procurement.dto.response.CartridgeProcurementHistoryResponse;
import com.iocl.procurement.dto.response.ProcurementHistoryItemResponse;
import com.iocl.procurement.dto.response.RateContractDetailsResponse;
import com.iocl.procurement.dto.response.RateContractResponse;
import com.iocl.procurement.entity.CallUpPurchaseOrder;
import com.iocl.procurement.entity.Cartridge;
import com.iocl.procurement.entity.RateContract;
import com.iocl.procurement.exception.ResourceNotFoundException;
import com.iocl.procurement.repository.CallUpPurchaseOrderRepository;
import com.iocl.procurement.repository.CartridgeRepository;
import com.iocl.procurement.repository.RateContractRepository;
import com.iocl.procurement.service.AlertEvaluationService;
import com.iocl.procurement.service.RateContractService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class RateContractServiceImpl implements RateContractService {

    private final RateContractRepository rateContractRepository;
    private final CartridgeRepository cartridgeRepository;
    private final CallUpPurchaseOrderRepository callUpPORepository;
    private final AlertEvaluationService alertEvaluationService;

    public RateContractServiceImpl(
            RateContractRepository rateContractRepository,
            CartridgeRepository cartridgeRepository,
            CallUpPurchaseOrderRepository callUpPORepository,
            AlertEvaluationService alertEvaluationService
    ) {
        this.rateContractRepository = rateContractRepository;
        this.cartridgeRepository = cartridgeRepository;
        this.callUpPORepository = callUpPORepository;
        this.alertEvaluationService = alertEvaluationService;
    }

    @Override
    @Transactional
    public RateContractResponse createRateContract(RateContractRequest request) {
        Cartridge cartridge = cartridgeRepository.findById(request.getCartridgeId())
                .orElseThrow(() -> new ResourceNotFoundException("Cartridge not found with id: " + request.getCartridgeId()));

        RateContract rateContract = new RateContract();
        rateContract.setContractDate(request.getContractDate());
        rateContract.setSupplierName(request.getSupplierName().trim());
        rateContract.setCartridge(cartridge);
        rateContract.setRatePerUnit(request.getRatePerUnit());
        rateContract.setTaxPercentage(request.getTaxPercentage());
        rateContract.setTotalContractQuantity(request.getTotalContractQuantity());
        
        // Internal initial system quantities
        rateContract.setQuantityAlreadyExecuted(0);
        rateContract.setQuantityTakenThroughWO(0);
        rateContract.recalculateNetAvailableQuantity();

        RateContract saved = rateContractRepository.save(rateContract);

        // Evaluate procurement and tendering threshold alerts
        alertEvaluationService.evaluateAllAlerts(cartridge);

        return new RateContractResponse(saved);
    }

    @Override
    public List<RateContractResponse> getAllRateContracts() {
        return rateContractRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(RateContractResponse::new)
                .toList();
    }

    @Override
    public RateContractResponse getRateContractById(Long id) {
        RateContract rateContract = rateContractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rate Contract not found with id: " + id));
        return new RateContractResponse(rateContract);
    }

    @Override
    public RateContractDetailsResponse getRateContractDetails(Long id) {
        RateContract rateContract = rateContractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rate Contract not found with id: " + id));

        List<CallUpPurchaseOrder> poList = callUpPORepository.findByRateContractIdOrderByCreatedAtDesc(id);
        return new RateContractDetailsResponse(rateContract, poList);
    }

    @Override
    public List<CallUpPOResponse> getCallUpPOsByRateContractId(Long rateContractId) {
        if (!rateContractRepository.existsById(rateContractId)) {
            throw new ResourceNotFoundException("Rate Contract not found with id: " + rateContractId);
        }
        return callUpPORepository.findByRateContractIdOrderByCreatedAtDesc(rateContractId)
                .stream()
                .map(CallUpPOResponse::new)
                .toList();
    }

    @Override
    public CartridgeProcurementHistoryResponse getCartridgeProcurementHistory(Long cartridgeId) {
        Cartridge cartridge = cartridgeRepository.findById(cartridgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Cartridge not found with id: " + cartridgeId));

        return buildHistoryForCartridge(cartridge);
    }

    @Override
    public CartridgeProcurementHistoryResponse getCartridgeProcurementHistoryByPartNumber(String partNumber) {
        if (partNumber == null || partNumber.trim().isEmpty()) {
            throw new ResourceNotFoundException("Part number cannot be empty");
        }

        Cartridge cartridge = cartridgeRepository.findByPartNumberIgnoreCase(partNumber.trim())
                .orElseGet(() -> cartridgeRepository.findByCartridgeNameIgnoreCase(partNumber.trim())
                        .orElseThrow(() -> new ResourceNotFoundException("Cartridge not found with part number: " + partNumber)));

        return buildHistoryForCartridge(cartridge);
    }

    @Override
    public CartridgeProcurementHistoryResponse getRateContractProcurementHistory(Long rateContractId) {
        RateContract rc = rateContractRepository.findById(rateContractId)
                .orElseThrow(() -> new ResourceNotFoundException("Rate Contract not found with id: " + rateContractId));

        Cartridge cartridge = rc.getCartridge();
        List<CallUpPurchaseOrder> poList = callUpPORepository.findByRateContractIdOrderByCreatedAtDesc(rateContractId);

        // 1. Initial starting balance from Rate Contract
        int contractQty = rc.getTotalContractQuantity() != null ? rc.getTotalContractQuantity() : 0;
        int executedQty = rc.getQuantityAlreadyExecuted() != null ? rc.getQuantityAlreadyExecuted() : 0;
        int runningBalance = contractQty - executedQty;

        // Master Rate Contract baseline item (starting balance)
        ProcurementHistoryItemResponse rcItem = new ProcurementHistoryItemResponse(rc);
        rcItem.setContractQuantity(contractQty);
        rcItem.setQuantityAlreadyExecuted(executedQty);
        rcItem.setQuantityTakenThroughWO(0); // Rate contract initial master record
        rcItem.setNetAvailableQuantity(runningBalance); // Initial starting balance before POs

        // 2. Sort Call-Up POs chronologically (oldest first) to compute running balance
        List<CallUpPurchaseOrder> chronologicalPOs = new ArrayList<>(poList != null ? poList : List.of());
        chronologicalPOs.sort((a, b) -> {
            int dateCmp = (a.getPoDate() != null && b.getPoDate() != null) ? a.getPoDate().compareTo(b.getPoDate()) : 0;
            if (dateCmp != 0) return dateCmp;
            if (a.getCreatedAt() != null && b.getCreatedAt() != null) {
                return a.getCreatedAt().compareTo(b.getCreatedAt());
            }
            return (a.getId() != null && b.getId() != null) ? a.getId().compareTo(b.getId()) : 0;
        });

        List<ProcurementHistoryItemResponse> poItems = new ArrayList<>();
        int totalTakenWO = 0;
        for (CallUpPurchaseOrder po : chronologicalPOs) {
            int qtyTaken = po.getQuantity() != null ? po.getQuantity() : 0;
            totalTakenWO += qtyTaken;
            runningBalance -= qtyTaken;

            ProcurementHistoryItemResponse item = new ProcurementHistoryItemResponse(po);
            if (item.getSupplierName() == null || item.getSupplierName().trim().isEmpty()) {
                item.setSupplierName(rc.getSupplierName());
            }
            item.setContractQuantity(contractQty);
            item.setQuantityAlreadyExecuted(executedQty);
            item.setQuantityTakenThroughWO(qtyTaken);
            item.setNetAvailableQuantity(runningBalance); // Balance immediately AFTER this transaction!
            poItems.add(item);
        }

        // 3. Combine and sort all items NEWEST FIRST for display
        List<ProcurementHistoryItemResponse> allItems = new ArrayList<>(poItems);
        allItems.add(rcItem);

        allItems.sort((a, b) -> {
            int dateCmp = (b.getDate() != null && a.getDate() != null) ? b.getDate().compareTo(a.getDate()) : 0;
            if (dateCmp != 0) return dateCmp;
            if (b.getCreatedAt() != null && a.getCreatedAt() != null) {
                int createdCmp = b.getCreatedAt().compareTo(a.getCreatedAt());
                if (createdCmp != 0) return createdCmp;
            }
            if (b.getId() != null && a.getId() != null) {
                int idCmp = b.getId().compareTo(a.getId());
                if (idCmp != 0) return idCmp;
            }
            if ("CALL_UP_PO".equals(b.getRecordType()) && "RATE_CONTRACT".equals(a.getRecordType())) return 1;
            if ("RATE_CONTRACT".equals(b.getRecordType()) && "CALL_UP_PO".equals(a.getRecordType())) return -1;
            return 0;
        });

        LocalDate latestDate = allItems.stream()
                .map(ProcurementHistoryItemResponse::getDate)
                .filter(d -> d != null)
                .max(LocalDate::compareTo)
                .orElse(rc.getContractDate());

        return new CartridgeProcurementHistoryResponse(
                cartridge != null ? cartridge.getId() : null,
                rc.getId(),
                rc.getSupplierName(),
                cartridge != null ? cartridge.getPartNumber() : null,
                cartridge != null ? cartridge.getCartridgeName() : null,
                cartridge != null ? cartridge.getPrinterName() : null,
                rc.getNetAvailableQuantity(),
                contractQty,
                totalTakenWO,
                executedQty,
                1,
                poItems.size(),
                latestDate,
                allItems
        );
    }

    private CartridgeProcurementHistoryResponse buildHistoryForCartridge(Cartridge cartridge) {
        List<RateContract> rateContracts = rateContractRepository.findByCartridgeId(cartridge.getId());

        List<ProcurementHistoryItemResponse> historyItems = new ArrayList<>();
        int totalContractQty = 0;
        int totalTakenWO = 0;
        int totalExecuted = 0;
        int currentNetAvailable = 0;
        int totalPOs = 0;

        for (RateContract rc : rateContracts) {
            int cQty = rc.getTotalContractQuantity() != null ? rc.getTotalContractQuantity() : 0;
            int eQty = rc.getQuantityAlreadyExecuted() != null ? rc.getQuantityAlreadyExecuted() : 0;
            totalContractQty += cQty;
            totalExecuted += eQty;
            currentNetAvailable += rc.getNetAvailableQuantity() != null ? rc.getNetAvailableQuantity() : 0;

            int rcRunningBalance = cQty - eQty;

            // Add master Rate Contract item
            ProcurementHistoryItemResponse rcItem = new ProcurementHistoryItemResponse(rc);
            rcItem.setContractQuantity(cQty);
            rcItem.setQuantityAlreadyExecuted(eQty);
            rcItem.setQuantityTakenThroughWO(0);
            rcItem.setNetAvailableQuantity(rcRunningBalance);
            historyItems.add(rcItem);

            // Add all Call-Up PO items chronologically
            List<CallUpPurchaseOrder> poList = callUpPORepository.findByRateContractIdOrderByCreatedAtDesc(rc.getId());
            if (poList != null) {
                totalPOs += poList.size();
                List<CallUpPurchaseOrder> chronologicalPOs = new ArrayList<>(poList);
                chronologicalPOs.sort((a, b) -> {
                    int dateCmp = (a.getPoDate() != null && b.getPoDate() != null) ? a.getPoDate().compareTo(b.getPoDate()) : 0;
                    if (dateCmp != 0) return dateCmp;
                    if (a.getCreatedAt() != null && b.getCreatedAt() != null) {
                        return a.getCreatedAt().compareTo(b.getCreatedAt());
                    }
                    return (a.getId() != null && b.getId() != null) ? a.getId().compareTo(b.getId()) : 0;
                });

                for (CallUpPurchaseOrder po : chronologicalPOs) {
                    int taken = po.getQuantity() != null ? po.getQuantity() : 0;
                    totalTakenWO += taken;
                    rcRunningBalance -= taken;

                    ProcurementHistoryItemResponse item = new ProcurementHistoryItemResponse(po);
                    if (item.getSupplierName() == null || item.getSupplierName().trim().isEmpty()) {
                        item.setSupplierName(rc.getSupplierName());
                    }
                    item.setContractQuantity(cQty);
                    item.setQuantityAlreadyExecuted(eQty);
                    item.setQuantityTakenThroughWO(taken);
                    item.setNetAvailableQuantity(rcRunningBalance);
                    historyItems.add(item);
                }
            }
        }

        // Sort history: newest first (date desc, createdAt desc, id desc)
        historyItems.sort((a, b) -> {
            int dateCmp = (b.getDate() != null && a.getDate() != null) ? b.getDate().compareTo(a.getDate()) : 0;
            if (dateCmp != 0) return dateCmp;
            if (b.getCreatedAt() != null && a.getCreatedAt() != null) {
                int createdCmp = b.getCreatedAt().compareTo(a.getCreatedAt());
                if (createdCmp != 0) return createdCmp;
            }
            if (b.getId() != null && a.getId() != null) {
                int idCmp = b.getId().compareTo(a.getId());
                if (idCmp != 0) return idCmp;
            }
            if ("CALL_UP_PO".equals(b.getRecordType()) && "RATE_CONTRACT".equals(a.getRecordType())) return 1;
            if ("RATE_CONTRACT".equals(b.getRecordType()) && "CALL_UP_PO".equals(a.getRecordType())) return -1;
            return 0;
        });

        LocalDate latestDate = historyItems.stream()
                .map(ProcurementHistoryItemResponse::getDate)
                .filter(d -> d != null)
                .max(LocalDate::compareTo)
                .orElse(null);

        return new CartridgeProcurementHistoryResponse(
                cartridge.getId(),
                cartridge.getPartNumber(),
                cartridge.getCartridgeName(),
                cartridge.getPrinterName(),
                currentNetAvailable,
                totalContractQty,
                totalTakenWO,
                totalExecuted,
                rateContracts.size(),
                totalPOs,
                latestDate,
                historyItems
        );
    }
}
