package com.iocl.procurement.dto.response;

import com.iocl.procurement.entity.Employee;
import com.iocl.procurement.entity.User;

public class UserDirectoryDTO {

    private Long id;
    private String employeeNo;
    private String employeeName;
    private String department;
    private String location;
    private String email;
    private String designation;
    private String cabinNumber;
    private String printerName;
    private String printerSerialNumber;

    public UserDirectoryDTO() {
    }

    public UserDirectoryDTO(User user) {
        if (user != null) {
            this.id = user.getId();
            this.employeeNo = user.getEmployeeId();
            this.employeeName = user.getFullName();
            this.department = user.getDepartment();
            this.location = user.getLocation();
            this.email = user.getEmail();
        }
    }

    public UserDirectoryDTO(Employee emp) {
        if (emp != null) {
            this.id = emp.getId();
            this.employeeNo = emp.getEmployeeNumber();
            this.employeeName = emp.getFullName();
            this.department = emp.getDepartment();
            this.location = emp.getLocation();
            this.email = emp.getEmail();
            this.designation = emp.getDesignation();
            this.cabinNumber = emp.getCabinNumber();
            this.printerName = emp.getPrinterName();
            this.printerSerialNumber = emp.getPrinterSerialNumber();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getCabinNumber() {
        return cabinNumber;
    }

    public void setCabinNumber(String cabinNumber) {
        this.cabinNumber = cabinNumber;
    }

    public String getPrinterName() {
        return printerName;
    }

    public void setPrinterName(String printerName) {
        this.printerName = printerName;
    }

    public String getPrinterSerialNumber() {
        return printerSerialNumber;
    }

    public void setPrinterSerialNumber(String printerSerialNumber) {
        this.printerSerialNumber = printerSerialNumber;
    }
}

