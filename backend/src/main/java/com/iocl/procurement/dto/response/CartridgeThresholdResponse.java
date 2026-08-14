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
    private Integer rateContractQuantity;
    private Integer netAvailableQuantity;
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
            Integer rateContractQuantity,
            Integer netAvailableQuantity,
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
        this.rateContractQuantity = rateContractQuantity;
        this.netAvailableQuantity = netAvailableQuantity;
        this.status = status;
        this.updatedAt = updatedAt;
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
