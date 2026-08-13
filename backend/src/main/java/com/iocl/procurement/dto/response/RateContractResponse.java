package com.iocl.procurement.dto.response;

import com.iocl.procurement.entity.RateContract;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class RateContractResponse {

    private Long id;
    private LocalDate contractDate;
    private String supplierName;
    private CartridgeResponse cartridge;
    private BigDecimal ratePerUnit;
    private BigDecimal taxPercentage;
    private Integer totalContractQuantity;
    private Integer quantityAlreadyExecuted;
    private Integer quantityTakenThroughWO;
    private Integer netAvailableQuantity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RateContractResponse() {
    }

    public RateContractResponse(RateContract rc) {
        if (rc != null) {
            this.id = rc.getId();
            this.contractDate = rc.getContractDate();
            this.supplierName = rc.getSupplierName();
            if (rc.getCartridge() != null) {
                this.cartridge = new CartridgeResponse(rc.getCartridge());
            }
            this.ratePerUnit = rc.getRatePerUnit();
            this.taxPercentage = rc.getTaxPercentage();
            this.totalContractQuantity = rc.getTotalContractQuantity();
            this.quantityAlreadyExecuted = rc.getQuantityAlreadyExecuted();
            this.quantityTakenThroughWO = rc.getQuantityTakenThroughWO();
            this.netAvailableQuantity = rc.getNetAvailableQuantity();
            this.createdAt = rc.getCreatedAt();
            this.updatedAt = rc.getUpdatedAt();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getContractDate() {
        return contractDate;
    }

    public void setContractDate(LocalDate contractDate) {
        this.contractDate = contractDate;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public CartridgeResponse getCartridge() {
        return cartridge;
    }

    public void setCartridge(CartridgeResponse cartridge) {
        this.cartridge = cartridge;
    }

    public BigDecimal getRatePerUnit() {
        return ratePerUnit;
    }

    public void setRatePerUnit(BigDecimal ratePerUnit) {
        this.ratePerUnit = ratePerUnit;
    }

    public BigDecimal getTaxPercentage() {
        return taxPercentage;
    }

    public void setTaxPercentage(BigDecimal taxPercentage) {
        this.taxPercentage = taxPercentage;
    }

    public Integer getTotalContractQuantity() {
        return totalContractQuantity;
    }

    public void setTotalContractQuantity(Integer totalContractQuantity) {
        this.totalContractQuantity = totalContractQuantity;
    }

    public Integer getQuantityAlreadyExecuted() {
        return quantityAlreadyExecuted;
    }

    public void setQuantityAlreadyExecuted(Integer quantityAlreadyExecuted) {
        this.quantityAlreadyExecuted = quantityAlreadyExecuted;
    }

    public Integer getQuantityTakenThroughWO() {
        return quantityTakenThroughWO;
    }

    public void setQuantityTakenThroughWO(Integer quantityTakenThroughWO) {
        this.quantityTakenThroughWO = quantityTakenThroughWO;
    }

    public Integer getNetAvailableQuantity() {
        return netAvailableQuantity;
    }

    public void setNetAvailableQuantity(Integer netAvailableQuantity) {
        this.netAvailableQuantity = netAvailableQuantity;
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
