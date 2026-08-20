package com.iocl.procurement.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class AssetUsageRequestDTO {

    @NotBlank(message = "Seat or cabin number is required.")
    @Size(max = 100, message = "Seat or cabin number cannot exceed 100 characters.")
    private String seatOrCabinNo;

    @NotBlank(message = "Location is required.")
    @Size(max = 100, message = "Location cannot exceed 100 characters.")
    private String location;

    @NotBlank(message = "Printer is required.")
    @Size(max = 150, message = "Printer identifier cannot exceed 150 characters.")
    private String printerId;

    private String printerType;

    @NotBlank(message = "Cartridge is required.")
    @Size(max = 150, message = "Cartridge identifier cannot exceed 150 characters.")
    private String cartridgeId;

    private String colour;

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

    // Optional snapshot fields if passed, but authenticated user takes precedence
    private String employeeNo;
    private String employeeName;
    private String department;

    public AssetUsageRequestDTO() {
    }

    // Getters and Setters

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

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}
