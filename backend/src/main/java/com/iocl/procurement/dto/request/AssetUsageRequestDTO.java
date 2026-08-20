package com.iocl.procurement.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class AssetUsageRequestDTO {

    // Section 2: Beneficiary Employee Details
    private String beneficiaryEmployeeNo;
    private String beneficiaryEmployeeName;
    private String beneficiaryDepartment;
    private String beneficiarySeatOrCabinNo;
    private String beneficiaryLocation;
    private String beneficiaryEmail;

    // Legacy field aliases for backward compatibility
    private String seatOrCabinNo;
    private String location;
    private String department;
    private String employeeNo;
    private String employeeName;

    // Section 3: Asset & Cartridge Selection
    @NotBlank(message = "Printer is required.")
    @Size(max = 150, message = "Printer identifier cannot exceed 150 characters.")
    private String printerId;

    private String printerType;

    @NotBlank(message = "Cartridge is required.")
    @Size(max = 150, message = "Cartridge identifier cannot exceed 150 characters.")
    private String cartridgeId;

    private String colour;

    // Section 4: Usage Details
    @NotNull(message = "Quantity used is required.")
    @Min(value = 1, message = "Quantity used must be greater than 0.")
    @Max(value = 1000, message = "Quantity used cannot exceed 1000 units.")
    private Integer quantityUsed;

    @NotNull(message = "Usage date is required.")
    private LocalDate usageDate;

    @Size(max = 1000, message = "Remarks cannot exceed 1000 characters.")
    private String remarks;

    @Size(max = 100, message = "Work order reference cannot exceed 100 characters.")
    private String workOrderReference;

    // Optional fields from client - IGNORED by backend (derived strictly from authenticated JWT)
    private String recordedByEmployeeNo;
    private String recordedByEmployeeName;

    public AssetUsageRequestDTO() {
    }

    // Resolved getters for Beneficiary Information
    public String getResolvedBeneficiaryEmployeeNo() {
        if (beneficiaryEmployeeNo != null && !beneficiaryEmployeeNo.trim().isEmpty()) {
            return beneficiaryEmployeeNo.trim();
        }
        return employeeNo != null ? employeeNo.trim() : null;
    }

    public String getResolvedBeneficiaryEmployeeName() {
        if (beneficiaryEmployeeName != null && !beneficiaryEmployeeName.trim().isEmpty()) {
            return beneficiaryEmployeeName.trim();
        }
        return employeeName != null ? employeeName.trim() : null;
    }

    public String getResolvedBeneficiaryDepartment() {
        if (beneficiaryDepartment != null && !beneficiaryDepartment.trim().isEmpty()) {
            return beneficiaryDepartment.trim();
        }
        return department != null ? department.trim() : null;
    }

    public String getResolvedBeneficiarySeatOrCabinNo() {
        if (beneficiarySeatOrCabinNo != null && !beneficiarySeatOrCabinNo.trim().isEmpty()) {
            return beneficiarySeatOrCabinNo.trim();
        }
        return seatOrCabinNo != null ? seatOrCabinNo.trim() : null;
    }

    public String getResolvedBeneficiaryLocation() {
        if (beneficiaryLocation != null && !beneficiaryLocation.trim().isEmpty()) {
            return beneficiaryLocation.trim();
        }
        return location != null ? location.trim() : null;
    }

    public String getResolvedBeneficiaryEmail() {
        if (beneficiaryEmail != null && !beneficiaryEmail.trim().isEmpty()) {
            return beneficiaryEmail.trim();
        }
        return null;
    }

    // Getters and Setters

    public String getBeneficiaryEmployeeNo() {
        return beneficiaryEmployeeNo;
    }

    public void setBeneficiaryEmployeeNo(String beneficiaryEmployeeNo) {
        this.beneficiaryEmployeeNo = beneficiaryEmployeeNo;
    }

    public String getBeneficiaryEmployeeName() {
        return beneficiaryEmployeeName;
    }

    public void setBeneficiaryEmployeeName(String beneficiaryEmployeeName) {
        this.beneficiaryEmployeeName = beneficiaryEmployeeName;
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

    public String getBeneficiaryEmail() {
        return beneficiaryEmail;
    }

    public void setBeneficiaryEmail(String beneficiaryEmail) {
        this.beneficiaryEmail = beneficiaryEmail;
    }

    public String getSeatOrCabinNo() {
        return seatOrCabinNo;
    }

    public void setSeatOrCabinNo(String seatOrCabinNo) {
        this.seatOrCabinNo = seatOrCabinNo;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getEmployeeNo() {
        return employeeNo;
    }

    public void setEmployeeNo(String employeeNo) {
        this.employeeNo = employeeNo;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getPrinterId() {
        return printerId;
    }

    public void setPrinterId(String printerId) {
        this.printerId = printerId;
    }

    public String getPrinterType() {
        return printerType;
    }

    public void setPrinterType(String printerType) {
        this.printerType = printerType;
    }

    public String getCartridgeId() {
        return cartridgeId;
    }

    public void setCartridgeId(String cartridgeId) {
        this.cartridgeId = cartridgeId;
    }

    public String getColour() {
        return colour;
    }

    public void setColour(String colour) {
        this.colour = colour;
    }

    public Integer getQuantityUsed() {
        return quantityUsed;
    }

    public void setQuantityUsed(Integer quantityUsed) {
        this.quantityUsed = quantityUsed;
    }

    public LocalDate getUsageDate() {
        return usageDate;
    }

    public void setUsageDate(LocalDate usageDate) {
        this.usageDate = usageDate;
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

    public String getRecordedByEmployeeNo() {
        return recordedByEmployeeNo;
    }

    public void setRecordedByEmployeeNo(String recordedByEmployeeNo) {
        this.recordedByEmployeeNo = recordedByEmployeeNo;
    }

    public String getRecordedByEmployeeName() {
        return recordedByEmployeeName;
    }

    public void setRecordedByEmployeeName(String recordedByEmployeeName) {
        this.recordedByEmployeeName = recordedByEmployeeName;
    }
}
