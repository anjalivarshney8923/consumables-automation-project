package com.iocl.procurement.dto;

public class DailyPOThresholdReportItem {

    private Long cartridgeId;
    private String partNumber;
    private String cartridgeName;
    private String printerName;
    private String supplierNames;
    private int totalContractQuantity;
    private int quantityAlreadyExecuted;
    private int quantityTakenThroughWO;
    private int netAvailableQuantity;
    private int poThreshold;
    private int shortfall;

    public DailyPOThresholdReportItem() {
    }

    public DailyPOThresholdReportItem(
            Long cartridgeId,
            String partNumber,
            String cartridgeName,
            String printerName,
            String supplierNames,
            int totalContractQuantity,
            int quantityAlreadyExecuted,
            int quantityTakenThroughWO,
            int netAvailableQuantity,
            int poThreshold
    ) {
        this.cartridgeId = cartridgeId;
        this.partNumber = partNumber;
        this.cartridgeName = cartridgeName;
        this.printerName = printerName;
        this.supplierNames = supplierNames;
        this.totalContractQuantity = totalContractQuantity;
        this.quantityAlreadyExecuted = quantityAlreadyExecuted;
        this.quantityTakenThroughWO = quantityTakenThroughWO;
        this.netAvailableQuantity = netAvailableQuantity;
        this.poThreshold = poThreshold;
        this.shortfall = Math.max(0, poThreshold - netAvailableQuantity);
    }

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

    public String getPrinterName() {
        return printerName;
    }

    public void setPrinterName(String printerName) {
        this.printerName = printerName;
    }

    public String getSupplierNames() {
        return supplierNames;
    }

    public void setSupplierNames(String supplierNames) {
        this.supplierNames = supplierNames;
    }

    public int getTotalContractQuantity() {
        return totalContractQuantity;
    }

    public void setTotalContractQuantity(int totalContractQuantity) {
        this.totalContractQuantity = totalContractQuantity;
    }

    public int getQuantityAlreadyExecuted() {
        return quantityAlreadyExecuted;
    }

    public void setQuantityAlreadyExecuted(int quantityAlreadyExecuted) {
        this.quantityAlreadyExecuted = quantityAlreadyExecuted;
    }

    public int getQuantityTakenThroughWO() {
        return quantityTakenThroughWO;
    }

    public void setQuantityTakenThroughWO(int quantityTakenThroughWO) {
        this.quantityTakenThroughWO = quantityTakenThroughWO;
    }

    public int getNetAvailableQuantity() {
        return netAvailableQuantity;
    }

    public void setNetAvailableQuantity(int netAvailableQuantity) {
        this.netAvailableQuantity = netAvailableQuantity;
        this.shortfall = Math.max(0, this.poThreshold - netAvailableQuantity);
    }

    public int getPoThreshold() {
        return poThreshold;
    }

    public void setPoThreshold(int poThreshold) {
        this.poThreshold = poThreshold;
        this.shortfall = Math.max(0, poThreshold - this.netAvailableQuantity);
    }

    public int getShortfall() {
        return shortfall;
    }

    public void setShortfall(int shortfall) {
        this.shortfall = shortfall;
    }
}
