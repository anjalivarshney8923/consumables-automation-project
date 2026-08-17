package com.iocl.procurement.dto.response;

import java.time.LocalDateTime;

public class CartridgeThresholdResponse {

    private Long id;
    private Long cartridgeId;
    private String printerName;
    private String cartridgeName;
    private String partNumber;
    private Integer numberOfPrinters;
    private Integer poThreshold;
    private Integer tenderingThreshold;
    private Integer rateContractQuantity;
    private Integer netAvailableQuantity;
    private Integer storeQuantity;
    private Integer combinedNetAvailableQuantity;
    private String status; // "Adequate" or "Low Availability"
    private LocalDateTime updatedAt;

    public CartridgeThresholdResponse() {
    }

    public CartridgeThresholdResponse(
            Long id,
            Long cartridgeId,
            String printerName,
            String cartridgeName,
            String partNumber,
            Integer numberOfPrinters,
            Integer poThreshold,
            Integer tenderingThreshold,
            Integer rateContractQuantity,
            Integer netAvailableQuantity,
            Integer storeQuantity,
            Integer combinedNetAvailableQuantity,
            String status,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.cartridgeId = cartridgeId;
        this.printerName = printerName;
        this.cartridgeName = cartridgeName;
        this.partNumber = partNumber;
        this.numberOfPrinters = numberOfPrinters;
        this.poThreshold = poThreshold;
        this.tenderingThreshold = tenderingThreshold;
        this.rateContractQuantity = rateContractQuantity;
        this.netAvailableQuantity = netAvailableQuantity;
        this.storeQuantity = storeQuantity;
        this.combinedNetAvailableQuantity = combinedNetAvailableQuantity;
        this.status = status;
        this.updatedAt = updatedAt;
    }

    public CartridgeThresholdResponse(
            Long id,
            Long cartridgeId,
            String printerName,
            String cartridgeName,
            String partNumber,
            Integer numberOfPrinters,
            Integer poThreshold,
            Integer rateContractQuantity,
            Integer netAvailableQuantity,
            String status,
            LocalDateTime updatedAt
    ) {
        this(id, cartridgeId, printerName, cartridgeName, partNumber, numberOfPrinters, poThreshold, (poThreshold != null ? Math.max(5, poThreshold * 2) : 10), rateContractQuantity, netAvailableQuantity, 0, netAvailableQuantity, status, updatedAt);
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

    public String getPrinterName() {
        return printerName;
    }

    public void setPrinterName(String printerName) {
        this.printerName = printerName;
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

    public Integer getNumberOfPrinters() {
        return numberOfPrinters;
    }

    public void setNumberOfPrinters(Integer numberOfPrinters) {
        this.numberOfPrinters = numberOfPrinters;
    }

    public Integer getPoThreshold() {
        return poThreshold;
    }

    public void setPoThreshold(Integer poThreshold) {
        this.poThreshold = poThreshold;
    }

    public Integer getTenderingThreshold() {
        return tenderingThreshold;
    }

    public void setTenderingThreshold(Integer tenderingThreshold) {
        this.tenderingThreshold = tenderingThreshold;
    }

    public Integer getRateContractQuantity() {
        return rateContractQuantity;
    }

    public void setRateContractQuantity(Integer rateContractQuantity) {
        this.rateContractQuantity = rateContractQuantity;
    }

    public Integer getNetAvailableQuantity() {
        return netAvailableQuantity;
    }

    public void setNetAvailableQuantity(Integer netAvailableQuantity) {
        this.netAvailableQuantity = netAvailableQuantity;
    }

    public Integer getStoreQuantity() {
        return storeQuantity;
    }

    public void setStoreQuantity(Integer storeQuantity) {
        this.storeQuantity = storeQuantity;
    }

    public Integer getCombinedNetAvailableQuantity() {
        return combinedNetAvailableQuantity;
    }

    public void setCombinedNetAvailableQuantity(Integer combinedNetAvailableQuantity) {
        this.combinedNetAvailableQuantity = combinedNetAvailableQuantity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
