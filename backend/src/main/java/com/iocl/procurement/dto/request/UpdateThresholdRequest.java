package com.iocl.procurement.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UpdateThresholdRequest {

    @NotNull(message = "PO Threshold is required")
    @Min(value = 0, message = "PO Threshold cannot be negative")
    private Integer poThreshold;

    public UpdateThresholdRequest() {
    }

    public UpdateThresholdRequest(Integer poThreshold) {
        this.poThreshold = poThreshold;
    }

    public Integer getPoThreshold() {
        return poThreshold;
    }

    public void setPoThreshold(Integer poThreshold) {
        this.poThreshold = poThreshold;
    }
}
