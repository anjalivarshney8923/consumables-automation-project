package com.iocl.procurement.dto.response;

import com.iocl.procurement.entity.CallUpPurchaseOrder;
import com.iocl.procurement.entity.RateContract;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProcurementHistoryItemResponse {

    private Long id;
    private String recordType; // "RATE_CONTRACT" or "CALL_UP_PO"
    private String poNumber;
    private LocalDate date;
    private String supplierName;
    private String partNumber;
    private String cartridgeName;
    private String printerModel;
    private Integer contractQuantity;
    private Integer quantityAlreadyExecuted;
    private Integer quantityTakenThroughWO;
    private Integer netAvailableQuantity;
    private BigDecimal ratePerUnit;
    private BigDecimal taxPercentage;
    private String remarks;
    private Long rateContractId;
    private LocalDateTime createdAt;

    public ProcurementHistoryItemResponse() {
    }

    public ProcurementHistoryItemResponse(RateContract rc) {
        if (rc != null) {
            this.id = rc.getId();
            this.recordType = "RATE_CONTRACT";
            this.poNumber = "RC-" + rc.getId();
            this.date = rc.getContractDate();
            this.supplierName = rc.getSupplierName();
            if (rc.getCartridge() != null) {
                this.partNumber = rc.getCartridge().getPartNumber();
                this.cartridgeName = rc.getCartridge().getCartridgeName();
                this.printerModel = rc.getCartridge().getPrinterName();
            }
            this.contractQuantity = rc.getTotalContractQuantity();
            this.quantityAlreadyExecuted = rc.getQuantityAlreadyExecuted() != null ? rc.getQuantityAlreadyExecuted() : 0;
            this.quantityTakenThroughWO = rc.getQuantityTakenThroughWO() != null ? rc.getQuantityTakenThroughWO() : 0;
            this.netAvailableQuantity = rc.getNetAvailableQuantity();
            this.ratePerUnit = rc.getRatePerUnit();
            this.taxPercentage = rc.getTaxPercentage();
            this.remarks = "Master Rate Contract";
            this.rateContractId = rc.getId();
            this.createdAt = rc.getCreatedAt();
        }
    }

    public ProcurementHistoryItemResponse(CallUpPurchaseOrder po) {
        if (po != null) {
            this.id = po.getId();
            this.recordType = "CALL_UP_PO";
            this.poNumber = po.getPoNumber();
            this.date = po.getPoDate();
            this.supplierName = po.getSupplierName();
            if (po.getRateContract() != null) {
                this.rateContractId = po.getRateContract().getId();
                this.contractQuantity = po.getRateContract().getTotalContractQuantity();
                this.quantityAlreadyExecuted = po.getRateContract().getQuantityAlreadyExecuted() != null ? po.getRateContract().getQuantityAlreadyExecuted() : 0;
                this.netAvailableQuantity = po.getRateContract().getNetAvailableQuantity();
                this.ratePerUnit = po.getRateContract().getRatePerUnit();
                this.taxPercentage = po.getRateContract().getTaxPercentage();
                if (po.getRateContract().getCartridge() != null) {
                    this.partNumber = po.getRateContract().getCartridge().getPartNumber();
                    this.cartridgeName = po.getRateContract().getCartridge().getCartridgeName();
                    this.printerModel = po.getRateContract().getCartridge().getPrinterName();
                }
            }
            this.quantityTakenThroughWO = po.getQuantity() != null ? po.getQuantity() : 0;
            this.remarks = po.getRemarks();
            this.createdAt = po.getCreatedAt();
        }
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRecordType() {
        return recordType;
    }

    public void setRecordType(String recordType) {
        this.recordType = recordType;
    }

    public String getPoNumber() {
        return poNumber;
    }

    public void setPoNumber(String poNumber) {
        this.poNumber = poNumber;
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

    public String getPrinterModel() {
        return printerModel;
    }

    public void setPrinterModel(String printerModel) {
        this.printerModel = printerModel;
    }

    public Integer getContractQuantity() {
        return contractQuantity;
    }

    public void setContractQuantity(Integer contractQuantity) {
        this.contractQuantity = contractQuantity;
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

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Long getRateContractId() {
        return rateContractId;
    }

    public void setRateContractId(Long rateContractId) {
        this.rateContractId = rateContractId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
