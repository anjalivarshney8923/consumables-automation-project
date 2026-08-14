package com.iocl.procurement.service.impl;

import com.iocl.procurement.dto.response.AlertCountResponse;
import com.iocl.procurement.dto.response.AlertResponse;
import com.iocl.procurement.entity.AlertStatus;
import com.iocl.procurement.entity.ProcurementAlert;
import com.iocl.procurement.exception.ResourceNotFoundException;
import com.iocl.procurement.repository.ProcurementAlertRepository;
import com.iocl.procurement.service.AlertService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AlertServiceImpl implements AlertService {

    private final ProcurementAlertRepository alertRepository;

    public AlertServiceImpl(ProcurementAlertRepository alertRepository) {
        this.alertRepository = alertRepository;
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
