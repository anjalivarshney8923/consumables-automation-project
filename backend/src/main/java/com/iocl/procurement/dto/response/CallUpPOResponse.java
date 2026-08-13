package com.iocl.procurement.dto.response;

import com.iocl.procurement.entity.CallUpPurchaseOrder;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class CallUpPOResponse {

    private Long id;
    private String poNumber;
    private LocalDate poDate;
    private String supplierName;
    private Long rateContractId;
    private String cartridgeName;
    private String cartridgePartNumber;
    private Integer quantity;
    private String remarks;
    private Integer remainingAvailableQuantity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CallUpPOResponse() {
    }

    public CallUpPOResponse(CallUpPurchaseOrder po) {
        if (po != null) {
            this.id = po.getId();
            this.poNumber = po.getPoNumber();
            this.poDate = po.getPoDate();
            this.supplierName = po.getSupplierName();
            if (po.getRateContract() != null) {
                this.rateContractId = po.getRateContract().getId();
                this.remainingAvailableQuantity = po.getRateContract().getNetAvailableQuantity();
                if (po.getRateContract().getCartridge() != null) {
                    this.cartridgeName = po.getRateContract().getCartridge().getCartridgeName();
                    this.cartridgePartNumber = po.getRateContract().getCartridge().getPartNumber();
                }
            }
            this.quantity = po.getQuantity();
            this.remarks = po.getRemarks();
            this.createdAt = po.getCreatedAt();
            this.updatedAt = po.getUpdatedAt();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getCartridgeName() {
        return cartridgeName;
    }

    public void setCartridgeName(String cartridgeName) {
        this.cartridgeName = cartridgeName;
    }

    public String getCartridgePartNumber() {
        return cartridgePartNumber;
    }

    public void setCartridgePartNumber(String cartridgePartNumber) {
        this.cartridgePartNumber = cartridgePartNumber;
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

    public Integer getRemainingAvailableQuantity() {
        return remainingAvailableQuantity;
    }

    public void setRemainingAvailableQuantity(Integer remainingAvailableQuantity) {
        this.remainingAvailableQuantity = remainingAvailableQuantity;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
