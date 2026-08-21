package com.iocl.procurement.dto.report;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AssetUsageReportDTO {

    private Long id;
    private LocalDate usageDate;
    private String recordedByEngineerName;
    private String recordedByEmployeeNo;
    private String recordedByEmail;
    private String beneficiaryEmployeeName;
    private String beneficiaryEmployeeNo;
    private String beneficiaryEmail;
    private String beneficiaryDepartment;
    private String beneficiarySeatOrCabinNo;
    private String beneficiaryLocation;
    private String partNumber;
    private String cartridgeName;
    private String colour;
    private String printerId;
    private String printerName;
    private Integer quantityUsed;
    private String remarks;
    private String workOrderReference;
    private LocalDateTime createdAt;

    public AssetUsageReportDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getUsageDate() {
        return usageDate;
    }

    public void setUsageDate(LocalDate usageDate) {
        this.usageDate = usageDate;
    }

    public String getRecordedByEngineerName() {
        return recordedByEngineerName;
    }

    public void setRecordedByEngineerName(String recordedByEngineerName) {
        this.recordedByEngineerName = recordedByEngineerName;
    }

    public String getRecordedByEmployeeNo() {
        return recordedByEmployeeNo;
    }

    public void setRecordedByEmployeeNo(String recordedByEmployeeNo) {
        this.recordedByEmployeeNo = recordedByEmployeeNo;
    }

    public String getRecordedByEmail() {
        return recordedByEmail;
    }

    public void setRecordedByEmail(String recordedByEmail) {
        this.recordedByEmail = recordedByEmail;
    }

    public String getBeneficiaryEmployeeName() {
        return beneficiaryEmployeeName;
    }

    public void setBeneficiaryEmployeeName(String beneficiaryEmployeeName) {
        this.beneficiaryEmployeeName = beneficiaryEmployeeName;
    }

    public String getBeneficiaryEmployeeNo() {
        return beneficiaryEmployeeNo;
    }

    public void setBeneficiaryEmployeeNo(String beneficiaryEmployeeNo) {
        this.beneficiaryEmployeeNo = beneficiaryEmployeeNo;
    }

    public String getBeneficiaryEmail() {
        return beneficiaryEmail;
    }

    public void setBeneficiaryEmail(String beneficiaryEmail) {
        this.beneficiaryEmail = beneficiaryEmail;
    }

    public String getBeneficiaryDepartment() {
        return beneficiaryDepartment;
    }

    public void setBeneficiaryDepartment(String beneficiaryDepartment) {
        this.beneficiaryDepartment = beneficiaryDepartment;
    }

    public String getBeneficiarySeatOrCabinNo() {
        return beneficiarySeatOrCabinNo;
    }

    public void setBeneficiarySeatOrCabinNo(String beneficiarySeatOrCabinNo) {
        this.beneficiarySeatOrCabinNo = beneficiarySeatOrCabinNo;
    }

    public String getBeneficiaryLocation() {
        return beneficiaryLocation;
    }

    public void setBeneficiaryLocation(String beneficiaryLocation) {
        this.beneficiaryLocation = beneficiaryLocation;
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

    public String getColour() {
        return colour;
    }

    public void setColour(String colour) {
        this.colour = colour;
    }

    public String getPrinterId() {
        return printerId;
    }

    public void setPrinterId(String printerId) {
        this.printerId = printerId;
    }

    public String getPrinterName() {
        return printerName;
    }

    public void setPrinterName(String printerName) {
        this.printerName = printerName;
    }

    public Integer getQuantityUsed() {
        return quantityUsed;
    }

    public void setQuantityUsed(Integer quantityUsed) {
        this.quantityUsed = quantityUsed;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getWorkOrderReference() {
        return workOrderReference;
    }

    public void setWorkOrderReference(String workOrderReference) {
        this.workOrderReference = workOrderReference;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
