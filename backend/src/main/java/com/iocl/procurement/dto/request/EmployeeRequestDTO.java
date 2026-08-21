package com.iocl.procurement.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class EmployeeRequestDTO {

    @NotBlank(message = "Employee number is required.")
    @Size(max = 50, message = "Employee number cannot exceed 50 characters.")
    private String employeeNumber;

    @NotBlank(message = "Employee name is required.")
    @Size(max = 100, message = "Employee name cannot exceed 100 characters.")
    private String employeeName;

    // Optional name alias for frontend flexibility
    private String name;

    @NotBlank(message = "Email address is required.")
    @Email(message = "Please enter a valid email address.")
    @Size(max = 150, message = "Email cannot exceed 150 characters.")
    private String email;

    @NotBlank(message = "Department is required.")
    @Size(max = 100, message = "Department cannot exceed 100 characters.")
    private String department;

    @Size(max = 100, message = "Designation cannot exceed 100 characters.")
    private String designation;

    @Size(max = 50, message = "GD cannot exceed 50 characters.")
    private String gd;

    @Size(max = 100, message = "Cabin/Room number cannot exceed 100 characters.")
    private String cabinNumber;

    private String roomNumber;

    @Size(max = 50, message = "Seat number cannot exceed 50 characters.")
    private String seatNumber;

    @Size(max = 100, message = "Location cannot exceed 100 characters.")
    private String location;

    @Size(max = 150, message = "Printer name cannot exceed 150 characters.")
    private String printerName;

    private String printerModel;

    @Size(max = 100, message = "Printer serial number cannot exceed 100 characters.")
    private String printerSerialNumber;

    @Size(max = 50, message = "Printer type cannot exceed 50 characters.")
    private String printerType;

    private String status;

    @Size(max = 1000, message = "Remarks cannot exceed 1000 characters.")
    private String remarks;

    public EmployeeRequestDTO() {
    }

    public String getResolvedEmployeeNumber() {
        return employeeNumber != null ? employeeNumber.trim() : null;
    }

    public String getResolvedEmployeeName() {
        if (employeeName != null && !employeeName.trim().isEmpty()) {
            return employeeName.trim();
        }
        return name != null ? name.trim() : null;
    }

    public String getResolvedCabinNumber() {
        if (cabinNumber != null && !cabinNumber.trim().isEmpty()) {
            return cabinNumber.trim();
        }
        return roomNumber != null ? roomNumber.trim() : null;
    }

    public String getResolvedPrinterName() {
        if (printerName != null && !printerName.trim().isEmpty()) {
            return printerName.trim();
        }
        return printerModel != null ? printerModel.trim() : null;
    }

    // Getters and Setters

    public String getEmployeeNumber() {
        return employeeNumber;
    }

    public void setEmployeeNumber(String employeeNumber) {
        this.employeeNumber = employeeNumber;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getGd() {
        return gd;
    }

    public void setGd(String gd) {
        this.gd = gd;
    }

    public String getCabinNumber() {
        return cabinNumber;
    }

    public void setCabinNumber(String cabinNumber) {
        this.cabinNumber = cabinNumber;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getPrinterName() {
        return printerName;
    }

    public void setPrinterName(String printerName) {
        this.printerName = printerName;
    }

    public String getPrinterModel() {
        return printerModel;
    }

    public void setPrinterModel(String printerModel) {
        this.printerModel = printerModel;
    }

    public String getPrinterSerialNumber() {
        return printerSerialNumber;
    }

    public void setPrinterSerialNumber(String printerSerialNumber) {
        this.printerSerialNumber = printerSerialNumber;
    }

    public String getPrinterType() {
        return printerType;
    }

    public void setPrinterType(String printerType) {
        this.printerType = printerType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
