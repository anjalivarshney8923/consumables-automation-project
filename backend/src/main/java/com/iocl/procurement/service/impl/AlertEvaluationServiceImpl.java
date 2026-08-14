package com.iocl.procurement.service.impl;

import com.iocl.procurement.entity.*;
import com.iocl.procurement.repository.CartridgeRepository;
import com.iocl.procurement.repository.CartridgeThresholdRepository;
import com.iocl.procurement.repository.ProcurementAlertRepository;
import com.iocl.procurement.repository.RateContractRepository;
import com.iocl.procurement.service.AlertEvaluationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AlertEvaluationServiceImpl implements AlertEvaluationService {

    private static final Logger logger = LoggerFactory.getLogger(AlertEvaluationServiceImpl.class);

    private final CartridgeThresholdRepository thresholdRepository;
    private final ProcurementAlertRepository alertRepository;
    private final RateContractRepository rateContractRepository;
    private final CartridgeRepository cartridgeRepository;

    public AlertEvaluationServiceImpl(
            CartridgeThresholdRepository thresholdRepository,
            ProcurementAlertRepository alertRepository,
            RateContractRepository rateContractRepository,
            CartridgeRepository cartridgeRepository
    ) {
        this.thresholdRepository = thresholdRepository;
        this.alertRepository = alertRepository;
        this.rateContractRepository = rateContractRepository;
        this.cartridgeRepository = cartridgeRepository;
    }

    @Override
    @Transactional
    public void evaluateProcurementThreshold(Cartridge cartridge) {
        if (cartridge == null || cartridge.getId() == null) {
            return;
        }

        CartridgeThreshold threshold = thresholdRepository.findByCartridgeId(cartridge.getId())
                .orElse(null);

        if (threshold == null) {
            logger.debug("No PO threshold configured for cartridge: {}", cartridge.getPartNumber());
            return;
        }

        List<RateContract> rateContracts = rateContractRepository.findByCartridgeId(cartridge.getId());
        int totalNetAvailable = rateContracts.stream()
                .mapToInt(rc -> rc.getNetAvailableQuantity() != null ? rc.getNetAvailableQuantity() : 0)
                .sum();

        int poThreshold = threshold.getPoThreshold();

        Optional<ProcurementAlert> activeAlertOpt = alertRepository
                .findFirstByCartridgeIdAndAlertTypeAndStatusOrderByCreatedAtDesc(
                        cartridge.getId(),
                        AlertType.PROCUREMENT_THRESHOLD,
                        AlertStatus.UNREAD
                );

        String alertMessage = String.format(
                "Procurement Alert: %s (%s) has %d units remaining in the Rate Contract. PO threshold is %d.",
                cartridge.getCartridgeName(),
                cartridge.getPartNumber(),
                totalNetAvailable,
                poThreshold
        );

        if (totalNetAvailable <= poThreshold) {
            if (activeAlertOpt.isPresent()) {
                // Idempotent update: update message, net available quantity, threshold
                ProcurementAlert existing = activeAlertOpt.get();
                existing.setNetAvailableQuantity(totalNetAvailable);
                existing.setThreshold(poThreshold);
                existing.setMessage(alertMessage);
                alertRepository.save(existing);
                logger.info("Updated existing unread procurement alert for cartridge [{}]: netAvailable={}, threshold={}",
                        cartridge.getPartNumber(), totalNetAvailable, poThreshold);
            } else {
                // Create new unread alert
                ProcurementAlert newAlert = new ProcurementAlert(
                        cartridge,
                        AlertType.PROCUREMENT_THRESHOLD,
                        alertMessage,
                        totalNetAvailable,
                        poThreshold
                );
                alertRepository.save(newAlert);
                logger.warn("Created new procurement alert for cartridge [{}]: netAvailable={}, threshold={}",
                        cartridge.getPartNumber(), totalNetAvailable, poThreshold);
            }
        } else {
            // Adequate quantity: if there was an active unread alert, resolve it
            if (activeAlertOpt.isPresent()) {
                ProcurementAlert existing = activeAlertOpt.get();
                existing.setStatus(AlertStatus.READ);
                existing.setResolvedAt(LocalDateTime.now());
                alertRepository.save(existing);
                logger.info("Resolved active procurement alert for cartridge [{}] as netAvailable ({}) > threshold ({})",
                        cartridge.getPartNumber(), totalNetAvailable, poThreshold);
            }
        }
    }

    @Override
    @Transactional
    public void evaluateAllProcurementThresholds() {
        List<Cartridge> activeCartridges = cartridgeRepository.findAllByActiveTrueOrderByPrinterNameAsc();
        for (Cartridge cartridge : activeCartridges) {
            evaluateProcurementThreshold(cartridge);
        }
    }
}
