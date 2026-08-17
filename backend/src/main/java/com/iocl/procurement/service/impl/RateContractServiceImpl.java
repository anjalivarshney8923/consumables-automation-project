package com.iocl.procurement.service.impl;

import com.iocl.procurement.dto.request.RateContractRequest;
import com.iocl.procurement.dto.response.CallUpPOResponse;
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
}
