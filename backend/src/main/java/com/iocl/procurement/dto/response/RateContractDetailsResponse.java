package com.iocl.procurement.dto.response;

import com.iocl.procurement.entity.CallUpPurchaseOrder;
import com.iocl.procurement.entity.RateContract;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class RateContractDetailsResponse {

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
    private Integer totalWOQuantity;
    private Integer remainingContractQuantity;
    private List<CallUpPOResponse> callUpPOs = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RateContractDetailsResponse() {
    }

    public RateContractDetailsResponse(RateContract rc, List<CallUpPurchaseOrder> poList) {
        this(rc, poList, null);
    }

    public RateContractDetailsResponse(RateContract rc, List<CallUpPurchaseOrder> poList, Integer executedQuantity) {
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
            this.quantityAlreadyExecuted = (executedQuantity != null) ? executedQuantity : (rc.getQuantityAlreadyExecuted() != null ? rc.getQuantityAlreadyExecuted() : 0);
            this.quantityTakenThroughWO = rc.getQuantityTakenThroughWO() != null ? rc.getQuantityTakenThroughWO() : 0;
            this.createdAt = rc.getCreatedAt();
            this.updatedAt = rc.getUpdatedAt();

            int sumWO = 0;
            if (poList != null) {
                for (CallUpPurchaseOrder po : poList) {
                    this.callUpPOs.add(new CallUpPOResponse(po));
                    if (po.getQuantity() != null) {
                        sumWO += po.getQuantity();
                    }
                }
            }
            this.totalWOQuantity = sumWO;
            int total = this.totalContractQuantity != null ? this.totalContractQuantity : 0;
            this.remainingContractQuantity = Math.max(0, total - this.totalWOQuantity);
            this.netAvailableQuantity = this.remainingContractQuantity;
        }
    }

    // Getters and Setters

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

    public Integer getTotalWOQuantity() {
        return totalWOQuantity;
    }

    public void setTotalWOQuantity(Integer totalWOQuantity) {
        this.totalWOQuantity = totalWOQuantity;
    }

    public Integer getRemainingContractQuantity() {
        return remainingContractQuantity;
    }

    public void setRemainingContractQuantity(Integer remainingContractQuantity) {
        this.remainingContractQuantity = remainingContractQuantity;
    }

    public List<CallUpPOResponse> getCallUpPOs() {
        return callUpPOs;
    }

    public void setCallUpPOs(List<CallUpPOResponse> callUpPOs) {
        this.callUpPOs = callUpPOs;
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
