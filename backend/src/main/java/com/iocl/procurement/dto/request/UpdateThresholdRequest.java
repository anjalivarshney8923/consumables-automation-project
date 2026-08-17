package com.iocl.procurement.dto.request;

import jakarta.validation.constraints.Min;

public class UpdateThresholdRequest {

    @Min(value = 0, message = "PO Threshold cannot be negative")
    private Integer poThreshold;

    @Min(value = 0, message = "Tendering Threshold cannot be negative")
    private Integer tenderingThreshold;

    @Min(value = 0, message = "Store Quantity cannot be negative")
    private Integer storeQuantity;

    public UpdateThresholdRequest() {
    }

    public UpdateThresholdRequest(Integer poThreshold) {
        this.poThreshold = poThreshold;
    }

    public UpdateThresholdRequest(Integer poThreshold, Integer tenderingThreshold) {
        this.poThreshold = poThreshold;
        this.tenderingThreshold = tenderingThreshold;
    }

    public UpdateThresholdRequest(Integer poThreshold, Integer tenderingThreshold, Integer storeQuantity) {
        this.poThreshold = poThreshold;
        this.tenderingThreshold = tenderingThreshold;
        this.storeQuantity = storeQuantity;
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

    public Integer getStoreQuantity() {
        return storeQuantity;
    }

    public void setStoreQuantity(Integer storeQuantity) {
        this.storeQuantity = storeQuantity;
    }
}
