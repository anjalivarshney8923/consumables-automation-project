package com.iocl.procurement.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rate_contracts")
public class RateContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_date", nullable = false)
    private LocalDate contractDate;

    @Column(name = "supplier_name", nullable = false)
    private String supplierName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cartridge_id", nullable = false)
    private Cartridge cartridge;

    @Column(name = "rate_per_unit", nullable = false, precision = 12, scale = 2)
    private BigDecimal ratePerUnit;

    @Column(name = "tax_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxPercentage;

    @Column(name = "total_contract_quantity", nullable = false)
    private Integer totalContractQuantity;

    @Column(name = "quantity_already_executed", nullable = false)
    private Integer quantityAlreadyExecuted = 0;

    @Column(name = "quantity_taken_through_wo", nullable = false)
    private Integer quantityTakenThroughWO = 0;

    @Column(name = "net_available_quantity", nullable = false)
    private Integer netAvailableQuantity;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public RateContract() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.quantityAlreadyExecuted == null) {
            this.quantityAlreadyExecuted = 0;
        }
        if (this.quantityTakenThroughWO == null) {
            this.quantityTakenThroughWO = 0;
        }
        recalculateNetAvailableQuantity();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        recalculateNetAvailableQuantity();
    }

    public void recalculateNetAvailableQuantity() {
        int total = this.totalContractQuantity != null ? this.totalContractQuantity : 0;
        int takenWO = this.quantityTakenThroughWO != null ? this.quantityTakenThroughWO : 0;
        this.netAvailableQuantity = total - takenWO;
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

    public Cartridge getCartridge() {
        return cartridge;
    }

    public void setCartridge(Cartridge cartridge) {
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
