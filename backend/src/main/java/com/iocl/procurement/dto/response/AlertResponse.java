package com.iocl.procurement.dto.response;

import com.iocl.procurement.entity.AlertSeverity;
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
    private AlertSeverity severity;
    private String message;
    private Integer netAvailableQuantity;
    private Integer threshold;
    private Integer storeNetAvailableQuantity;
    private Integer rateContractNetAvailableQuantity;
    private Integer combinedNetAvailableQuantity;
    private Integer tenderingThreshold;
    private AlertStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private Boolean emailSent;
    private LocalDateTime emailSentAt;
    private String emailFailureReason;

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
        this.severity = alert.getSeverity() != null ? alert.getSeverity() : (alert.getAlertType() == AlertType.TENDERING_REQUIRED ? AlertSeverity.URGENT : AlertSeverity.NORMAL);
        this.message = alert.getMessage();
        this.netAvailableQuantity = alert.getNetAvailableQuantity();
        this.threshold = alert.getThreshold();
        this.storeNetAvailableQuantity = alert.getStoreNetAvailableQuantity();
        this.rateContractNetAvailableQuantity = alert.getRateContractNetAvailableQuantity();
        this.combinedNetAvailableQuantity = alert.getCombinedNetAvailableQuantity();
        this.tenderingThreshold = alert.getTenderingThreshold();
        this.status = alert.getStatus();
        this.createdAt = alert.getCreatedAt();
        this.resolvedAt = alert.getResolvedAt();
        this.emailSent = alert.getEmailSent();
        this.emailSentAt = alert.getEmailSentAt();
        this.emailFailureReason = alert.getEmailFailureReason();
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

    public Boolean getEmailSent() {
        return emailSent;
    }

    public void setEmailSent(Boolean emailSent) {
        this.emailSent = emailSent;
    }

    public LocalDateTime getEmailSentAt() {
        return emailSentAt;
    }

    public void setEmailSentAt(LocalDateTime emailSentAt) {
        this.emailSentAt = emailSentAt;
    }

    public String getEmailFailureReason() {
        return emailFailureReason;
    }

    public void setEmailFailureReason(String emailFailureReason) {
        this.emailFailureReason = emailFailureReason;
    }

    public AlertSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(AlertSeverity severity) {
        this.severity = severity;
    }

    public Integer getStoreNetAvailableQuantity() {
        return storeNetAvailableQuantity;
    }

    public void setStoreNetAvailableQuantity(Integer storeNetAvailableQuantity) {
        this.storeNetAvailableQuantity = storeNetAvailableQuantity;
    }

    public Integer getRateContractNetAvailableQuantity() {
        return rateContractNetAvailableQuantity;
    }

    public void setRateContractNetAvailableQuantity(Integer rateContractNetAvailableQuantity) {
        this.rateContractNetAvailableQuantity = rateContractNetAvailableQuantity;
    }

    public Integer getCombinedNetAvailableQuantity() {
        return combinedNetAvailableQuantity;
    }

    public void setCombinedNetAvailableQuantity(Integer combinedNetAvailableQuantity) {
        this.combinedNetAvailableQuantity = combinedNetAvailableQuantity;
    }

    public Integer getTenderingThreshold() {
        return tenderingThreshold;
    }

    public void setTenderingThreshold(Integer tenderingThreshold) {
        this.tenderingThreshold = tenderingThreshold;
    }
}
