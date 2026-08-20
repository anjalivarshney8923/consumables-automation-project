package com.iocl.procurement.dto.response;

import java.time.LocalDateTime;

public class TenderingAlertResponse {

    private Long cartridgeId;
    private String partNumber;
    private String cartridgeName;
    private String printerModel;
    private Integer numberOfPrinters;
    private Integer totalRCQuantity;
    private Integer quantityTakenThroughWO;
    private Integer storeNetAvailableQuantity;
    private Integer rateContractNetAvailableQuantity;
    private Integer combinedNetAvailableQuantity;
    private Integer tenderingThreshold;
    private Integer difference;
    private String status; // "TENDERING_REQUIRED" or "ADEQUATE"
    private String priority; // "URGENT" or "NORMAL"
    private Boolean isUrgent;
    private LocalDateTime updatedAt;

    public TenderingAlertResponse() {
    }

    public TenderingAlertResponse(
            Long cartridgeId,
            String partNumber,
            String cartridgeName,
            String printerModel,
            Integer numberOfPrinters,
            Integer storeNetAvailableQuantity,
            Integer rateContractNetAvailableQuantity,
            Integer combinedNetAvailableQuantity,
            Integer tenderingThreshold,
            Integer difference,
            String status,
            String priority,
            Boolean isUrgent,
            LocalDateTime updatedAt
    ) {
        this(cartridgeId, partNumber, cartridgeName, printerModel, numberOfPrinters, null, null, storeNetAvailableQuantity, rateContractNetAvailableQuantity, combinedNetAvailableQuantity, tenderingThreshold, difference, status, priority, isUrgent, updatedAt);
    }

    public TenderingAlertResponse(
            Long cartridgeId,
            String partNumber,
            String cartridgeName,
            String printerModel,
            Integer numberOfPrinters,
            Integer totalRCQuantity,
            Integer quantityTakenThroughWO,
            Integer storeNetAvailableQuantity,
            Integer rateContractNetAvailableQuantity,
            Integer combinedNetAvailableQuantity,
            Integer tenderingThreshold,
            Integer difference,
            String status,
            String priority,
            Boolean isUrgent,
            LocalDateTime updatedAt
    ) {
        this.cartridgeId = cartridgeId;
        this.partNumber = partNumber;
        this.cartridgeName = cartridgeName;
        this.printerModel = printerModel;
        this.numberOfPrinters = numberOfPrinters;
        this.totalRCQuantity = totalRCQuantity;
        this.quantityTakenThroughWO = quantityTakenThroughWO;
        this.storeNetAvailableQuantity = storeNetAvailableQuantity;
        this.rateContractNetAvailableQuantity = rateContractNetAvailableQuantity;
        this.combinedNetAvailableQuantity = combinedNetAvailableQuantity;
        this.tenderingThreshold = tenderingThreshold;
        this.difference = difference;
        this.status = status;
        this.priority = priority;
        this.isUrgent = isUrgent;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters

    public Long getCartridgeId() {
        return cartridgeId;
    }

    public void setCartridgeId(Long cartridgeId) {
        this.cartridgeId = cartridgeId;
    }

    public String getPartNumber() {
        return partNumber;
    }

    public void setPartNumber(String partNumber) {
        this.partNumber = partNumber;
    }

    public String getCartridgeName() {
        return cartridgeName;
    }

    public void setCartridgeName(String cartridgeName) {
        this.cartridgeName = cartridgeName;
    }

    public String getPrinterModel() {
        return printerModel;
    }

    public void setPrinterModel(String printerModel) {
        this.printerModel = printerModel;
    }

    public Integer getNumberOfPrinters() {
        return numberOfPrinters;
    }

    public void setNumberOfPrinters(Integer numberOfPrinters) {
        this.numberOfPrinters = numberOfPrinters;
    }

    public Integer getTotalRCQuantity() {
        return totalRCQuantity;
    }

    public void setTotalRCQuantity(Integer totalRCQuantity) {
        this.totalRCQuantity = totalRCQuantity;
    }

    public Integer getQuantityTakenThroughWO() {
        return quantityTakenThroughWO;
    }

    public void setQuantityTakenThroughWO(Integer quantityTakenThroughWO) {
        this.quantityTakenThroughWO = quantityTakenThroughWO;
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

    public Integer getDifference() {
        return difference;
    }

    public void setDifference(Integer difference) {
        this.difference = difference;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Boolean getIsUrgent() {
        return isUrgent;
    }

    public void setIsUrgent(Boolean isUrgent) {
        this.isUrgent = isUrgent;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
