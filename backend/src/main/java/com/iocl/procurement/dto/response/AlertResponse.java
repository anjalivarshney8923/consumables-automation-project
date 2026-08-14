package com.iocl.procurement.dto.response;

import com.iocl.procurement.entity.AlertStatus;
import com.iocl.procurement.entity.AlertType;
import com.iocl.procurement.entity.ProcurementAlert;

import java.time.LocalDateTime;

public class AlertResponse {

    private Long id;
    private Long cartridgeId;
    private String cartridgeName;
    private String partNumber;
    private String printerName;
    private AlertType alertType;
    private String message;
    private Integer netAvailableQuantity;
    private Integer threshold;
    private AlertStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    public AlertResponse() {
    }

    public AlertResponse(ProcurementAlert alert) {
        this.id = alert.getId();
        if (alert.getCartridge() != null) {
            this.cartridgeId = alert.getCartridge().getId();
            this.cartridgeName = alert.getCartridge().getCartridgeName();
            this.partNumber = alert.getCartridge().getPartNumber();
            this.printerName = alert.getCartridge().getPrinterName();
        }
        this.alertType = alert.getAlertType();
        this.message = alert.getMessage();
        this.netAvailableQuantity = alert.getNetAvailableQuantity();
        this.threshold = alert.getThreshold();
        this.status = alert.getStatus();
        this.createdAt = alert.getCreatedAt();
        this.resolvedAt = alert.getResolvedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCartridgeId() {
        return cartridgeId;
    }

    public void setCartridgeId(Long cartridgeId) {
        this.cartridgeId = cartridgeId;
    }

    public String getCartridgeName() {
        return cartridgeName;
    }

    public void setCartridgeName(String cartridgeName) {
        this.cartridgeName = cartridgeName;
    }

    public String getPartNumber() {
        return partNumber;
    }

    public void setPartNumber(String partNumber) {
        this.partNumber = partNumber;
    }

    public String getPrinterName() {
        return printerName;
    }

    public void setPrinterName(String printerName) {
        this.printerName = printerName;
    }

    public AlertType getAlertType() {
        return alertType;
    }

    public void setAlertType(AlertType alertType) {
        this.alertType = alertType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getNetAvailableQuantity() {
        return netAvailableQuantity;
    }

    public void setNetAvailableQuantity(Integer netAvailableQuantity) {
        this.netAvailableQuantity = netAvailableQuantity;
    }

    public Integer getThreshold() {
        return threshold;
    }

    public void setThreshold(Integer threshold) {
        this.threshold = threshold;
    }

    public AlertStatus getStatus() {
        return status;
    }

    public void setStatus(AlertStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}
