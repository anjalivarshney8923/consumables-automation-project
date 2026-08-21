package com.iocl.procurement.dto.report;

public class StoreInventoryReportDTO {

    private Long cartridgeId;
    private String partNumber;
    private String cartridgeName;
    private String printerName;
    private String colour;
    private Integer storeQuantity;
    private Integer totalRcQuantity;
    private Integer qtyTakenVideWO;
    private Integer netAvailableRc;
    private Integer combinedNetQty;
    private Integer thresholdLimit;
    private String status;
    private String location;

    public StoreInventoryReportDTO() {
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

    public String getColour() {
        return colour;
    }

    public void setColour(String colour) {
        this.colour = colour;
    }

    public Integer getStoreQuantity() {
        return storeQuantity;
    }

    public void setStoreQuantity(Integer storeQuantity) {
        this.storeQuantity = storeQuantity;
    }

    public Integer getTotalRcQuantity() {
        return totalRcQuantity;
    }

    public void setTotalRcQuantity(Integer totalRcQuantity) {
        this.totalRcQuantity = totalRcQuantity;
    }

    public Integer getQtyTakenVideWO() {
        return qtyTakenVideWO;
    }

    public void setQtyTakenVideWO(Integer qtyTakenVideWO) {
        this.qtyTakenVideWO = qtyTakenVideWO;
    }

    public Integer getNetAvailableRc() {
        return netAvailableRc;
    }

    public void setNetAvailableRc(Integer netAvailableRc) {
        this.netAvailableRc = netAvailableRc;
    }

    public Integer getCombinedNetQty() {
        return combinedNetQty;
    }

    public void setCombinedNetQty(Integer combinedNetQty) {
        this.combinedNetQty = combinedNetQty;
    }

    public Integer getThresholdLimit() {
        return thresholdLimit;
    }

    public void setThresholdLimit(Integer thresholdLimit) {
        this.thresholdLimit = thresholdLimit;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
