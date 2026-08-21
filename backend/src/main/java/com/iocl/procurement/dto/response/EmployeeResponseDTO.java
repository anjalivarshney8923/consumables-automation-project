package com.iocl.procurement.dto.response;

import com.iocl.procurement.entity.Employee;
import java.time.LocalDateTime;

public class EmployeeResponseDTO {

    private Long id;
    private String employeeNumber;
    private String employeeName;
    private String name;
    private String email;
    private String department;
    private String designation;
    private String gd;
    private String cabinNumber;
    private String roomNumber;
    private String seatNumber;
    private String seatOrCabinNo;
    private String location;
    private String printerName;
    private String printerModel;
    private String printerSerialNumber;
    private String printerType;
    private String status;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EmployeeResponseDTO() {
    }

    public EmployeeResponseDTO(Employee emp) {
        if (emp != null) {
            this.id = emp.getId();
            this.employeeNumber = emp.getEmployeeNumber();
            this.employeeName = emp.getFullName();
            this.name = emp.getFullName();
            this.email = emp.getEmail();
            this.department = emp.getDepartment();
            this.designation = emp.getDesignation();
            this.gd = emp.getGd();
            this.cabinNumber = emp.getCabinNumber();
            this.roomNumber = emp.getCabinNumber();
            this.seatNumber = emp.getSeatNumber();
            this.seatOrCabinNo = emp.getCabinNumber();
            this.location = emp.getLocation();
            this.printerName = emp.getPrinterName();
            this.printerModel = emp.getPrinterName();
            this.printerSerialNumber = emp.getPrinterSerialNumber();
            this.printerType = emp.getPrinterType();
            this.status = emp.getStatus() != null ? emp.getStatus().name() : "ACTIVE";
            this.remarks = emp.getRemarks();
            this.createdAt = emp.getCreatedAt();
            this.updatedAt = emp.getUpdatedAt();
        }
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmployeeNumber() {
        return employeeNumber;
    }

    public void setEmployeeNumber(String employeeNumber) {
        this.employeeNumber = employeeNumber;
    }

    public String getEmployeeId() {
        return employeeNumber;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
        this.name = employeeName;
    }

    public String getName() {
        return name != null ? name : employeeName;
    }

    public void setName(String name) {
        this.name = name;
        this.employeeName = name;
    }

    public String getFullName() {
        return employeeName;
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
        this.roomNumber = cabinNumber;
        this.seatOrCabinNo = cabinNumber;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
        this.cabinNumber = roomNumber;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public String getSeatOrCabinNo() {
        return seatOrCabinNo != null ? seatOrCabinNo : cabinNumber;
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

    public String getPrinterName() {
        return printerName;
    }

    public void setPrinterName(String printerName) {
        this.printerName = printerName;
        this.printerModel = printerName;
    }

    public String getPrinterModel() {
        return printerModel;
    }

    public void setPrinterModel(String printerModel) {
        this.printerModel = printerModel;
        this.printerName = printerModel;
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
