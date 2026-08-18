package com.iocl.procurement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets", uniqueConstraints = {
        @UniqueConstraint(name = "uk_assets_serial_number", columnNames = "serial_number")
})
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "model_name", nullable = false)
    private String modelName;

    @Column(name = "serial_number", nullable = false, unique = true, length = 100)
    private String serialNumber;

    @Column(name = "department", nullable = false, length = 150)
    private String department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cartridge_id", nullable = false)
    private Cartridge cartridge;

    @Enumerated(EnumType.STRING)
    @Column(name = "printer_type", nullable = false, length = 30)
    private PrinterType printerType;

    @Enumerated(EnumType.STRING)
    @Column(name = "colour", length = 30)
    private CartridgeColor colour;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30, columnDefinition = "varchar(30) default 'ACTIVE'")
    private AssetStatus status = AssetStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Asset() {
    }

    public Asset(
            String modelName,
            String serialNumber,
            String department,
            Cartridge cartridge,
            PrinterType printerType,
            AssetStatus status
    ) {
        this(modelName, serialNumber, department, cartridge, printerType, null, status);
    }

    public Asset(
            String modelName,
            String serialNumber,
            String department,
            Cartridge cartridge,
            PrinterType printerType,
            CartridgeColor colour,
            AssetStatus status
    ) {
        this.modelName = modelName;
        this.serialNumber = serialNumber;
        this.department = department;
        this.cartridge = cartridge;
        this.printerType = printerType;
        this.colour = colour;
        this.status = status != null ? status : AssetStatus.ACTIVE;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = AssetStatus.ACTIVE;
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

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Cartridge getCartridge() {
        return cartridge;
    }

    public void setCartridge(Cartridge cartridge) {
        this.cartridge = cartridge;
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

    public CartridgeColor getColor() {
        return colour;
    }

    public void setColor(CartridgeColor color) {
        this.colour = color;
    }

    public AssetStatus getStatus() {
        return status;
    }

    public void setStatus(AssetStatus status) {
        this.status = status != null ? status : AssetStatus.ACTIVE;
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
