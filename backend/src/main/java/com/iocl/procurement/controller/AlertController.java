package com.iocl.procurement.controller;

import com.iocl.procurement.dto.response.AlertCountResponse;
import com.iocl.procurement.dto.response.AlertResponse;
import com.iocl.procurement.dto.response.TenderingAlertResponse;
import com.iocl.procurement.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public ResponseEntity<List<AlertResponse>> getAllAlerts() {
        List<AlertResponse> alerts = alertService.getAllAlerts();
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<AlertResponse>> getUnreadAlerts() {
        List<AlertResponse> alerts = alertService.getUnreadAlerts();
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/tendering")
    public ResponseEntity<List<TenderingAlertResponse>> getTenderingAlerts() {
        List<TenderingAlertResponse> alerts = alertService.getTenderingAlerts();
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/count")
    public ResponseEntity<AlertCountResponse> getAlertCounts() {
        AlertCountResponse counts = alertService.getAlertCounts();
        return ResponseEntity.ok(counts);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<AlertResponse> markAsRead(@PathVariable Long id) {
        AlertResponse response = alertService.markAsRead(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        alertService.markAllAsRead();
        return ResponseEntity.noContent().build();
    }
}
