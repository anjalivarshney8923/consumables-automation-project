package com.iocl.procurement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "employees", indexes = {
        @Index(name = "idx_employee_number", columnList = "employee_number", unique = true),
        @Index(name = "idx_employee_name", columnList = "full_name"),
        @Index(name = "idx_employee_department", columnList = "department"),
        @Index(name = "idx_employee_status", columnList = "status"),
        @Index(name = "idx_employee_location", columnList = "location")
})
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_number", nullable = false, unique = true, length = 50)
    private String employeeNumber;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "department", nullable = false, length = 100)
    private String department;

    @Column(name = "designation", length = 100)
    private String designation;

    @Column(name = "gd", length = 50)
    private String gd;

    @Column(name = "cabin_number", length = 100)
    private String cabinNumber;

    @Column(name = "seat_number", length = 50)
    private String seatNumber;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "printer_name", length = 150)
    private String printerName;

    @Column(name = "printer_serial_number", length = 100)
    private String printerSerialNumber;

    @Column(name = "printer_type", length = 50)
    private String printerType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private EmployeeStatus status = EmployeeStatus.ACTIVE;

    @Column(name = "remarks", length = 1000)
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Employee() {
    }

    public Employee(
            String employeeNumber,
            String fullName,
            String email,
            String department,
            String designation,
            String location,
            EmployeeStatus status
    ) {
        this.employeeNumber = employeeNumber;
        this.fullName = fullName;
        this.email = email;
        this.department = department;
        this.designation = designation;
        this.location = location;
        this.status = status != null ? status : EmployeeStatus.ACTIVE;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = EmployeeStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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
        this.employeeNumber = employeeNumber != null ? employeeNumber.trim() : null;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName != null ? fullName.trim() : null;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.trim().toLowerCase() : null;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department != null ? department.trim() : null;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation != null ? designation.trim() : null;
    }

    public String getGd() {
        return gd;
    }

    public void setGd(String gd) {
        this.gd = gd != null ? gd.trim() : null;
    }

    public String getCabinNumber() {
        return cabinNumber;
    }

    public void setCabinNumber(String cabinNumber) {
        this.cabinNumber = cabinNumber != null ? cabinNumber.trim() : null;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber != null ? seatNumber.trim() : null;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location != null ? location.trim() : null;
    }

    public String getPrinterName() {
        return printerName;
    }

    public void setPrinterName(String printerName) {
        this.printerName = printerName != null ? printerName.trim() : null;
    }

    public String getPrinterSerialNumber() {
        return printerSerialNumber;
    }

    public void setPrinterSerialNumber(String printerSerialNumber) {
        this.printerSerialNumber = printerSerialNumber != null ? printerSerialNumber.trim() : null;
    }

    public String getPrinterType() {
        return printerType;
    }

    public void setPrinterType(String printerType) {
        this.printerType = printerType != null ? printerType.trim() : null;
    }

    public EmployeeStatus getStatus() {
        return status;
    }

    public void setStatus(EmployeeStatus status) {
        this.status = status != null ? status : EmployeeStatus.ACTIVE;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks != null ? remarks.trim() : null;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Employee employee = (Employee) o;
        return Objects.equals(id, employee.id) ||
                (employeeNumber != null && employeeNumber.equalsIgnoreCase(employee.employeeNumber));
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, employeeNumber);
    }
}
