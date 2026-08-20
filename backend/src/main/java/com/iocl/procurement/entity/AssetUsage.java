package com.iocl.procurement.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "asset_usages", indexes = {
        @Index(name = "idx_asset_usage_user_id", columnList = "user_id"),
        @Index(name = "idx_asset_usage_asset_id", columnList = "asset_id"),
        @Index(name = "idx_asset_usage_cartridge_id", columnList = "cartridge_id"),
        @Index(name = "idx_asset_usage_date", columnList = "usage_date")
})
public class AssetUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "employee_id", nullable = false, length = 50)
    private String employeeId;

    @Column(name = "employee_name", nullable = false, length = 100)
    private String employeeName;

    @Column(name = "department", nullable = false, length = 100)
    private String department;

    @Column(name = "seat_or_cabin_no", nullable = false, length = 100)
    private String seatOrCabinNo;

    @Column(name = "location", nullable = false, length = 100)
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset asset;

    @Column(name = "printer_model", length = 150)
    private String printerModel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cartridge_id", nullable = false)
    private Cartridge cartridge;

    @Column(name = "cartridge_name", length = 150)
    private String cartridgeName;

    @Column(name = "part_number", length = 100)
    private String partNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "printer_type", nullable = false, length = 30)
    private PrinterType printerType;

    @Enumerated(EnumType.STRING)
    @Column(name = "colour", length = 30)
    private CartridgeColor colour;

    @Column(name = "quantity_used", nullable = false)
    private Integer quantityUsed;

    @Column(name = "usage_date", nullable = false)
    private LocalDate usageDate;

    @Column(name = "remarks", length = 1000)
    private String remarks;

    @Column(name = "work_order_reference", length = 100)
    private String workOrderReference;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public AssetUsage() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.printerType == null) {
            this.printerType = PrinterType.BLACK_AND_WHITE;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
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

    public Asset getAsset() {
        return asset;
    }

    public void setAsset(Asset asset) {
        this.asset = asset;
    }

    public String getPrinterModel() {
        return printerModel;
    }

    public void setPrinterModel(String printerModel) {
        this.printerModel = printerModel;
    }

    public Cartridge getCartridge() {
        return cartridge;
    }

    public void setCartridge(Cartridge cartridge) {
        this.cartridge = cartridge;
    }

    public String getCartridgeName() {
        return cartridgeName;
    }

    public void setCartridgeName(String cartridgeName) {
        this.cartridgeName = cartridgeName;
    }

    public String getPartNumber() {
        return partNumber;
    }

    public void setPartNumber(String partNumber) {
        this.partNumber = partNumber;
    }

    public PrinterType getPrinterType() {
        return printerType;
    }

    public void setPrinterType(PrinterType printerType) {
        this.printerType = printerType;
    }

    public CartridgeColor getColour() {
        return colour;
    }

    public void setColour(CartridgeColor colour) {
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
