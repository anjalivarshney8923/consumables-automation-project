package com.iocl.procurement.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class CallUpPORequest {

    @NotBlank(message = "Call-Up PO / WO number is required")
    private String poNumber;

    @NotNull(message = "PO date is required")
    private LocalDate poDate;

    @NotBlank(message = "Supplier name is required")
    private String supplierName;

    @NotNull(message = "Rate Contract ID is required")
    private Long rateContractId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than 0")
    private Integer quantity;

    private String remarks;

    public CallUpPORequest() {
    }

    public String getPoNumber() {
        return poNumber;
    }

    public void setPoNumber(String poNumber) {
        this.poNumber = poNumber;
    }

    public LocalDate getPoDate() {
        return poDate;
    }

    public void setPoDate(LocalDate poDate) {
        this.poDate = poDate;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public Long getRateContractId() {
        return rateContractId;
    }

    public void setRateContractId(Long rateContractId) {
        this.rateContractId = rateContractId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
