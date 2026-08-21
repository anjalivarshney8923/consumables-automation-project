package com.iocl.procurement.dto.report;

import java.time.LocalDate;

public class CallUpPOReportDTO {

    private Long id;
    private String poNumber;
    private LocalDate poDate;
    private String rateContractNumber;
    private String partNumber;
    private String cartridgeName;
    private String supplierName;
    private Integer orderQuantity;
    private Integer executedQuantity;
    private Integer remainingQuantity;
    private String status;

    public CallUpPOReportDTO() {
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

    public String getRateContractNumber() {
        return rateContractNumber;
    }

    public void setRateContractNumber(String rateContractNumber) {
        this.rateContractNumber = rateContractNumber;
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

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public Integer getOrderQuantity() {
        return orderQuantity;
    }

    public void setOrderQuantity(Integer orderQuantity) {
        this.orderQuantity = orderQuantity;
    }

    public Integer getExecutedQuantity() {
        return executedQuantity;
    }

    public void setExecutedQuantity(Integer executedQuantity) {
        this.executedQuantity = executedQuantity;
    }

    public Integer getRemainingQuantity() {
        return remainingQuantity;
    }

    public void setRemainingQuantity(Integer remainingQuantity) {
        this.remainingQuantity = remainingQuantity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
