package com.iocl.procurement.dto.report;

import java.time.LocalDate;

public class ProcurementReportDTO {

    private Long id;
    private String contractNumber;
    private String partNumber;
    private String description;
    private String printerName;
    private String supplierName;
    private Integer contractQuantity;
    private Integer qtyTakenVideWO;
    private Integer netAvailableRc;
    private Double ratePerUnit;
    private Double taxPercentage;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;

    public ProcurementReportDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContractNumber() {
        return contractNumber;
    }

    public void setContractNumber(String contractNumber) {
        this.contractNumber = contractNumber;
    }

    public String getPartNumber() {
        return partNumber;
    }

    public void setPartNumber(String partNumber) {
        this.partNumber = partNumber;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPrinterName() {
        return printerName;
    }

    public void setPrinterName(String printerName) {
        this.printerName = printerName;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public Integer getContractQuantity() {
        return contractQuantity;
    }

    public void setContractQuantity(Integer contractQuantity) {
        this.contractQuantity = contractQuantity;
    }

    public Integer getQtyTakenVideWO() {
        return qtyTakenVideWO;
    }

    public void setQtyTakenVideWO(Integer qtyTakenVideWO) {
        this.qtyTakenVideWO = qtyTakenVideWO;
    }

    public Integer getNetAvailableRc() {
        return netAvailableRc;
    }

    public void setNetAvailableRc(Integer netAvailableRc) {
        this.netAvailableRc = netAvailableRc;
    }

    public Double getRatePerUnit() {
        return ratePerUnit;
    }

    public void setRatePerUnit(Double ratePerUnit) {
        this.ratePerUnit = ratePerUnit;
    }

    public Double getTaxPercentage() {
        return taxPercentage;
    }

    public void setTaxPercentage(Double taxPercentage) {
        this.taxPercentage = taxPercentage;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
