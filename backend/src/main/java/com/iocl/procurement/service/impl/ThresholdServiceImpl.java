package com.iocl.procurement.service.impl;

import com.iocl.procurement.dto.request.UpdateThresholdRequest;
import com.iocl.procurement.dto.response.CartridgeThresholdResponse;
import com.iocl.procurement.entity.Cartridge;
import com.iocl.procurement.entity.CartridgeThreshold;
import com.iocl.procurement.entity.RateContract;
import com.iocl.procurement.exception.ResourceNotFoundException;
import com.iocl.procurement.repository.CartridgeRepository;
import com.iocl.procurement.repository.CartridgeThresholdRepository;
import com.iocl.procurement.repository.RateContractRepository;
import com.iocl.procurement.service.AlertEvaluationService;
import com.iocl.procurement.service.ThresholdService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ThresholdServiceImpl implements ThresholdService {

    private final CartridgeThresholdRepository thresholdRepository;
    private final CartridgeRepository cartridgeRepository;
    private final RateContractRepository rateContractRepository;
    private final AlertEvaluationService alertEvaluationService;

    public ThresholdServiceImpl(
            CartridgeThresholdRepository thresholdRepository,
            CartridgeRepository cartridgeRepository,
            RateContractRepository rateContractRepository,
            AlertEvaluationService alertEvaluationService
    ) {
        this.thresholdRepository = thresholdRepository;
        this.cartridgeRepository = cartridgeRepository;
        this.rateContractRepository = rateContractRepository;
        this.alertEvaluationService = alertEvaluationService;
    }

    @Override
    public List<CartridgeThresholdResponse> getAllThresholds() {
        List<Cartridge> cartridges = cartridgeRepository.findAllByActiveTrueOrderByPrinterNameAsc();
        List<CartridgeThresholdResponse> responses = new ArrayList<>();

        for (Cartridge cartridge : cartridges) {
            CartridgeThreshold threshold = thresholdRepository.findByCartridgeId(cartridge.getId())
                    .orElseGet(() -> {
                        CartridgeThreshold defaultThreshold = new CartridgeThreshold(cartridge, 5);
                        return thresholdRepository.save(defaultThreshold);
                    });

            responses.add(buildResponse(cartridge, threshold));
        }

        return responses;
    }

    @Override
    public CartridgeThresholdResponse getThresholdByCartridgeId(Long cartridgeId) {
        Cartridge cartridge = cartridgeRepository.findById(cartridgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Cartridge not found with id: " + cartridgeId));

        CartridgeThreshold threshold = thresholdRepository.findByCartridgeId(cartridgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Threshold not found for cartridge id: " + cartridgeId));

        return buildResponse(cartridge, threshold);
    }

    @Override
    @Transactional
    public CartridgeThresholdResponse updateThreshold(Long cartridgeId, UpdateThresholdRequest request) {
        Cartridge cartridge = cartridgeRepository.findById(cartridgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Cartridge not found with id: " + cartridgeId));

        CartridgeThreshold threshold = thresholdRepository.findByCartridgeId(cartridgeId)
                .orElseGet(() -> new CartridgeThreshold(cartridge, request.getPoThreshold()));

        threshold.setPoThreshold(request.getPoThreshold());
        CartridgeThreshold saved = thresholdRepository.save(threshold);

        // Immediately evaluate alert condition for this cartridge with the updated threshold
        alertEvaluationService.evaluateProcurementThreshold(cartridge);

        return buildResponse(cartridge, saved);
    }

    private CartridgeThresholdResponse buildResponse(Cartridge cartridge, CartridgeThreshold threshold) {
        List<RateContract> rateContracts = rateContractRepository.findByCartridgeId(cartridge.getId());
        
        int totalRCQty = rateContracts.stream()
                .mapToInt(rc -> rc.getTotalContractQuantity() != null ? rc.getTotalContractQuantity() : 0)
                .sum();

        int netAvailable = rateContracts.stream()
                .mapToInt(rc -> rc.getNetAvailableQuantity() != null ? rc.getNetAvailableQuantity() : 0)
                .sum();

        int poThreshold = threshold.getPoThreshold() != null ? threshold.getPoThreshold() : 0;
        String status = (netAvailable <= poThreshold) ? "Low Availability" : "Adequate";

        return new CartridgeThresholdResponse(
                threshold.getId(),
                cartridge.getId(),
                cartridge.getPrinterName(),
                cartridge.getCartridgeName(),
                cartridge.getPartNumber(),
                cartridge.getNumberOfPrinters(),
                poThreshold,
                totalRCQty,
                netAvailable,
                status,
                threshold.getUpdatedAt() != null ? threshold.getUpdatedAt() : threshold.getCreatedAt()
        );
    }
}
