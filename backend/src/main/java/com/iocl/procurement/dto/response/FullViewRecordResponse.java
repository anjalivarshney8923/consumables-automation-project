package com.iocl.procurement.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FullViewRecordResponse {

    private Long id;
    private LocalDate date;
    private String supplierName;
    private String printerName;
    private String cartridgeName;
    private String cartridgePartNumber;
    private Integer contractQuantity;
    private Integer executedQuantity;
    private Integer callUpPoQuantity;
    private Integer netAvailableQuantity;
    private BigDecimal ratePerUnit;
    private BigDecimal tax;
    private String status;

    public FullViewRecordResponse() {
    }

    public FullViewRecordResponse(
            Long id,
            LocalDate date,
            String supplierName,
            String printerName,
            String cartridgeName,
            String cartridgePartNumber,
            Integer contractQuantity,
            Integer executedQuantity,
            Integer callUpPoQuantity,
            Integer netAvailableQuantity,
            BigDecimal ratePerUnit,
            BigDecimal tax,
            String status
    ) {
        this.id = id;
        this.date = date;
        this.supplierName = supplierName;
        this.printerName = printerName;
        this.cartridgeName = cartridgeName;
        this.cartridgePartNumber = cartridgePartNumber;
        this.contractQuantity = contractQuantity;
        this.executedQuantity = executedQuantity;
        this.callUpPoQuantity = callUpPoQuantity;
        this.netAvailableQuantity = netAvailableQuantity;
        this.ratePerUnit = ratePerUnit;
        this.tax = tax;
        this.status = status;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getPrinterName() {
        return printerName;
    }

    public void setPrinterName(String printerName) {
        this.printerName = printerName;
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

    public Integer getContractQuantity() {
        return contractQuantity;
    }

    public void setContractQuantity(Integer contractQuantity) {
        this.contractQuantity = contractQuantity;
    }

    public Integer getExecutedQuantity() {
        return executedQuantity;
    }

    public void setExecutedQuantity(Integer executedQuantity) {
        this.executedQuantity = executedQuantity;
    }

    public Integer getCallUpPoQuantity() {
        return callUpPoQuantity;
    }

    public void setCallUpPoQuantity(Integer callUpPoQuantity) {
        this.callUpPoQuantity = callUpPoQuantity;
    }

    public Integer getNetAvailableQuantity() {
        return netAvailableQuantity;
    }

    public void setNetAvailableQuantity(Integer netAvailableQuantity) {
        this.netAvailableQuantity = netAvailableQuantity;
    }

    public BigDecimal getRatePerUnit() {
        return ratePerUnit;
    }

    public void setRatePerUnit(BigDecimal ratePerUnit) {
        this.ratePerUnit = ratePerUnit;
    }

    public BigDecimal getTax() {
        return tax;
    }

    public void setTax(BigDecimal tax) {
        this.tax = tax;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
