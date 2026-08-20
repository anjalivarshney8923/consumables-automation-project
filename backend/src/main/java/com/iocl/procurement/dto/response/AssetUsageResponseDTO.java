package com.iocl.procurement.dto.response;

import com.iocl.procurement.entity.AssetUsage;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AssetUsageResponseDTO {

    private Long id;
    private Long userId;
    private String employeeNo;
    private String employeeName;
    private String department;
    private String seatOrCabinNo;
    private String location;
    private Long assetId;
    private String printerModel;
    private String printerType;
    private Long cartridgeId;
    private String cartridgeName;
    private String partNumber;
    private String colour;
    private Integer quantityUsed;
    private LocalDate usageDate;
    private String remarks;
    private String workOrderReference;
    private LocalDateTime createdAt;

    public AssetUsageResponseDTO() {
    }

    public AssetUsageResponseDTO(AssetUsage usage) {
        if (usage != null) {
            this.id = usage.getId();
            this.userId = usage.getUser() != null ? usage.getUser().getId() : null;
            this.employeeNo = usage.getEmployeeId();
            this.employeeName = usage.getEmployeeName();
            this.department = usage.getDepartment();
            this.seatOrCabinNo = usage.getSeatOrCabinNo();
            this.location = usage.getLocation();
            this.assetId = usage.getAsset() != null ? usage.getAsset().getId() : null;
            this.printerModel = usage.getPrinterModel();
            this.printerType = usage.getPrinterType() != null ? usage.getPrinterType().name() : null;
            this.cartridgeId = usage.getCartridge() != null ? usage.getCartridge().getId() : null;
            this.cartridgeName = usage.getCartridgeName();
            this.partNumber = usage.getPartNumber();
            this.colour = usage.getColour() != null ? usage.getColour().name() : null;
            this.quantityUsed = usage.getQuantityUsed();
            this.usageDate = usage.getUsageDate();
            this.remarks = usage.getRemarks();
            this.workOrderReference = usage.getWorkOrderReference();
            this.createdAt = usage.getCreatedAt();
        }
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public Long getAssetId() {
        return assetId;
    }

    public void setAssetId(Long assetId) {
        this.assetId = assetId;
    }

    public String getPrinterModel() {
        return printerModel;
    }

    public void setPrinterModel(String printerModel) {
        this.printerModel = printerModel;
    }

    public String getPrinterType() {
        return printerType;
    }

    public void setPrinterType(String printerType) {
        this.printerType = printerType;
    }

    public Long getCartridgeId() {
        return cartridgeId;
    }

    public void setCartridgeId(Long cartridgeId) {
        this.cartridgeId = cartridgeId;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
