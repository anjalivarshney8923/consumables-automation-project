package com.iocl.procurement.dto.response;

import com.iocl.procurement.entity.Asset;

import java.time.LocalDateTime;

public class AssetResponse {

    private Long id;
    private String modelName;
    private String serialNumber;
    private String department;
    private Long cartridgeId;
    private String cartridgePartNumber;
    private String cartridgeName;
    private String compatibleCartridge;
    private String printerType;
    private String colour;
    private String color;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AssetResponse() {
    }

    public AssetResponse(Asset asset) {
        if (asset != null) {
            this.id = asset.getId();
            this.modelName = asset.getModelName();
            this.serialNumber = asset.getSerialNumber();
            this.department = asset.getDepartment();
            if (asset.getCartridge() != null) {
                this.cartridgeId = asset.getCartridge().getId();
                this.cartridgePartNumber = asset.getCartridge().getPartNumber();
                this.cartridgeName = asset.getCartridge().getCartridgeName();
                this.compatibleCartridge = asset.getCartridge().getPartNumber();
            }
            this.printerType = asset.getPrinterType() != null ? asset.getPrinterType().name() : null;
            this.colour = asset.getColour() != null ? asset.getColour().name() : null;
            this.color = this.colour;
            this.status = asset.getStatus() != null ? asset.getStatus().name() : null;
            this.createdAt = asset.getCreatedAt();
            this.updatedAt = asset.getUpdatedAt();
        }
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

    public Long getCartridgeId() {
        return cartridgeId;
    }

    public void setCartridgeId(Long cartridgeId) {
        this.cartridgeId = cartridgeId;
    }

    public String getCartridgePartNumber() {
        return cartridgePartNumber;
    }

    public void setCartridgePartNumber(String cartridgePartNumber) {
        this.cartridgePartNumber = cartridgePartNumber;
    }

    public String getCartridgeName() {
        return cartridgeName;
    }

    public void setCartridgeName(String cartridgeName) {
        this.cartridgeName = cartridgeName;
    }

    public String getCompatibleCartridge() {
        return compatibleCartridge;
    }

    public void setCompatibleCartridge(String compatibleCartridge) {
        this.compatibleCartridge = compatibleCartridge;
    }

    public String getPrinterType() {
        return printerType;
    }

    public void setPrinterType(String printerType) {
        this.printerType = printerType;
    }

    public String getColour() {
        return colour;
    }

    public void setColour(String colour) {
        this.colour = colour;
        if (this.color == null) {
            this.color = colour;
        }
    }

    public String getColor() {
        return color != null ? color : colour;
    }

    public void setColor(String color) {
        this.color = color;
        if (this.colour == null) {
            this.colour = color;
        }
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
