package com.iocl.procurement.service.impl;

import com.iocl.procurement.dto.response.AlertCountResponse;
import com.iocl.procurement.dto.response.AlertResponse;
import com.iocl.procurement.dto.response.TenderingAlertResponse;
import com.iocl.procurement.entity.AlertStatus;
import com.iocl.procurement.entity.Cartridge;
import com.iocl.procurement.entity.CartridgeThreshold;
import com.iocl.procurement.entity.ProcurementAlert;
import com.iocl.procurement.entity.RateContract;
import com.iocl.procurement.exception.ResourceNotFoundException;
import com.iocl.procurement.repository.CartridgeRepository;
import com.iocl.procurement.repository.CartridgeThresholdRepository;
import com.iocl.procurement.repository.ProcurementAlertRepository;
import com.iocl.procurement.repository.RateContractRepository;
import com.iocl.procurement.service.AlertService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AlertServiceImpl implements AlertService {

    private final ProcurementAlertRepository alertRepository;
    private final CartridgeRepository cartridgeRepository;
    private final RateContractRepository rateContractRepository;
    private final CartridgeThresholdRepository thresholdRepository;

    public AlertServiceImpl(
            ProcurementAlertRepository alertRepository,
            CartridgeRepository cartridgeRepository,
            RateContractRepository rateContractRepository,
            CartridgeThresholdRepository thresholdRepository
    ) {
        this.alertRepository = alertRepository;
        this.cartridgeRepository = cartridgeRepository;
        this.rateContractRepository = rateContractRepository;
        this.thresholdRepository = thresholdRepository;
    }

    @Override
    public List<AlertResponse> getAllAlerts() {
        return alertRepository.findAllWithCartridgeOrderByCreatedAtDesc()
                .stream()
                .map(AlertResponse::new)
                .toList();
    }

    @Override
    public List<AlertResponse> getUnreadAlerts() {
        return alertRepository.findByStatusWithCartridgeOrderByCreatedAtDesc(AlertStatus.UNREAD)
                .stream()
                .map(AlertResponse::new)
                .toList();
    }

    @Override
    public List<TenderingAlertResponse> getTenderingAlerts() {
        List<Cartridge> activeCartridges = cartridgeRepository.findAllByActiveTrueOrderByPrinterNameAsc();
        List<TenderingAlertResponse> responses = new ArrayList<>();

        for (Cartridge cartridge : activeCartridges) {
            int storeQty = cartridge.getStoreQuantity() != null ? cartridge.getStoreQuantity() : 0;

            List<RateContract> rateContracts = rateContractRepository.findByCartridgeId(cartridge.getId());
            int rcNetAvailable = rateContracts.stream()
                    .mapToInt(rc -> rc.getNetAvailableQuantity() != null ? rc.getNetAvailableQuantity() : 0)
                    .sum();

            int combinedNetAvailable = storeQty + rcNetAvailable;

            CartridgeThreshold threshold = thresholdRepository.findByCartridgeId(cartridge.getId())
                    .orElse(null);

            int tenderingThreshold = (threshold != null && threshold.getTenderingThreshold() != null)
                    ? threshold.getTenderingThreshold()
                    : (threshold != null && threshold.getPoThreshold() != null ? Math.max(5, threshold.getPoThreshold() * 2) : 10);

            int difference = combinedNetAvailable - tenderingThreshold;
            boolean isUrgent = combinedNetAvailable < tenderingThreshold;
            String status = isUrgent ? "TENDERING_REQUIRED" : "ADEQUATE";
            String priority = isUrgent ? "URGENT" : "NORMAL";

            LocalDateTime updatedAt = threshold != null && threshold.getUpdatedAt() != null
                    ? threshold.getUpdatedAt()
                    : (cartridge.getUpdatedAt() != null ? cartridge.getUpdatedAt() : LocalDateTime.now());

            responses.add(new TenderingAlertResponse(
                    cartridge.getId(),
                    cartridge.getPartNumber(),
                    cartridge.getCartridgeName(),
                    cartridge.getPrinterName(),
                    cartridge.getNumberOfPrinters(),
                    storeQty,
                    rcNetAvailable,
                    combinedNetAvailable,
                    tenderingThreshold,
                    difference,
                    status,
                    priority,
                    isUrgent,
                    updatedAt
            ));
        }

        return responses;
    }

    @Override
    public AlertCountResponse getAlertCounts() {
        long unread = alertRepository.countByStatus(AlertStatus.UNREAD);
        long total = alertRepository.count();
        return new AlertCountResponse(unread, total);
    }

    @Override
    @Transactional
    public AlertResponse markAsRead(Long alertId) {
        ProcurementAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + alertId));

        alert.setStatus(AlertStatus.READ);
        if (alert.getResolvedAt() == null) {
            alert.setResolvedAt(LocalDateTime.now());
        }
        ProcurementAlert saved = alertRepository.save(alert);
        return new AlertResponse(saved);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        List<ProcurementAlert> unreadAlerts = alertRepository.findByStatusWithCartridgeOrderByCreatedAtDesc(AlertStatus.UNREAD);
        LocalDateTime now = LocalDateTime.now();
        for (ProcurementAlert alert : unreadAlerts) {
            alert.setStatus(AlertStatus.READ);
            if (alert.getResolvedAt() == null) {
                alert.setResolvedAt(now);
            }
        }
        alertRepository.saveAll(unreadAlerts);
    }
}
