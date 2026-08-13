package com.iocl.procurement.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class RateContractRequest {

    @NotNull(message = "Contract date is required")
    private LocalDate contractDate;

    @NotBlank(message = "Supplier name is required")
    private String supplierName;

    @NotNull(message = "Cartridge ID is required")
    private Long cartridgeId;

    @NotNull(message = "Rate per unit is required")
    @DecimalMin(value = "0.0", message = "Rate per unit must be greater than or equal to 0")
    private BigDecimal ratePerUnit;

    @NotNull(message = "Tax percentage is required")
    @DecimalMin(value = "0.0", message = "Tax percentage must be greater than or equal to 0")
    private BigDecimal taxPercentage;

    @NotNull(message = "Total contract quantity is required")
    @Positive(message = "Total contract quantity must be greater than 0")
    private Integer totalContractQuantity;

    public RateContractRequest() {
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

    public Long getCartridgeId() {
        return cartridgeId;
    }

    public void setCartridgeId(Long cartridgeId) {
        this.cartridgeId = cartridgeId;
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
}
