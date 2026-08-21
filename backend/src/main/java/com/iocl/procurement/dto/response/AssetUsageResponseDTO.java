package com.iocl.procurement.dto.response;

import com.iocl.procurement.entity.AssetUsage;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AssetUsageResponseDTO {

    private Long id;

    // Authoritative Engineer who recorded the usage (from JWT)
    private Long recordedByUserId;
    private String recordedByEmployeeNo;
    private String recordedByEmployeeName;

    // Beneficiary Employee & Cabin where consumption occurred
    private String beneficiaryEmployeeNo;
    private String beneficiaryEmployeeName;
    private String beneficiaryDepartment;
    private String beneficiarySeatOrCabinNo;
    private String beneficiaryLocation;
    private String beneficiaryEmail;

    // Notification status
    private Boolean emailNotificationSent;
    private String message;

    // Asset & Consumable details
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

    private String usageId;
    private String engineerEmail;
    private String printerSerialNumber;

    // Legacy fields for backward compatibility
    private Long userId;
    private String employeeNo;
    private String employeeName;
    private String department;
    private String seatOrCabinNo;
    private String location;

    public AssetUsageResponseDTO() {
    }

    public AssetUsageResponseDTO(AssetUsage usage) {
        if (usage != null) {
            this.id = usage.getId();
            this.usageId = this.id != null ? String.format("USG-%04d", this.id) : null;

            // Authoritative Recorded By
            if (usage.getUser() != null) {
                this.recordedByUserId = usage.getUser().getId();
                this.recordedByEmployeeNo = usage.getRecordedByEmployeeNo() != null
                        ? usage.getRecordedByEmployeeNo()
                        : usage.getUser().getEmployeeId();
                this.recordedByEmployeeName = usage.getRecordedByEmployeeName() != null
                        ? usage.getRecordedByEmployeeName()
                        : usage.getUser().getFullName();
                this.engineerEmail = usage.getUser().getEmail();
            } else {
                this.recordedByEmployeeNo = usage.getRecordedByEmployeeNo();
                this.recordedByEmployeeName = usage.getRecordedByEmployeeName();
            }

            // Beneficiary details
            this.beneficiaryEmployeeNo = usage.getBeneficiaryEmployeeNo();
            this.beneficiaryEmployeeName = usage.getBeneficiaryEmployeeName();
            this.beneficiaryDepartment = usage.getBeneficiaryDepartment();
            this.beneficiarySeatOrCabinNo = usage.getBeneficiarySeatOrCabinNo();
            this.beneficiaryLocation = usage.getBeneficiaryLocation();
            this.beneficiaryEmail = usage.getBeneficiaryEmail();

            // Legacy compatibility mapping
            this.userId = this.recordedByUserId;
            this.employeeNo = this.beneficiaryEmployeeNo;
            this.employeeName = this.beneficiaryEmployeeName;
            this.department = this.beneficiaryDepartment;
            this.seatOrCabinNo = this.beneficiarySeatOrCabinNo;
            this.location = this.beneficiaryLocation;

            // Asset & Cartridge details
            this.assetId = usage.getAsset() != null ? usage.getAsset().getId() : null;
            this.printerModel = usage.getPrinterModel();
            this.printerSerialNumber = usage.getAsset() != null ? usage.getAsset().getSerialNumber() : null;
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

    public Long getRecordedByUserId() {
        return recordedByUserId;
    }

    public void setRecordedByUserId(Long recordedByUserId) {
        this.recordedByUserId = recordedByUserId;
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

    public Boolean getEmailNotificationSent() {
        return emailNotificationSent;
    }

    public void setEmailNotificationSent(Boolean emailNotificationSent) {
        this.emailNotificationSent = emailNotificationSent;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getUserId() {
        return userId != null ? userId : recordedByUserId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmployeeNo() {
        return employeeNo != null ? employeeNo : beneficiaryEmployeeNo;
    }

    public void setEmployeeNo(String employeeNo) {
        this.employeeNo = employeeNo;
    }

    public String getEmployeeName() {
        return employeeName != null ? employeeName : beneficiaryEmployeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getDepartment() {
        return department != null ? department : beneficiaryDepartment;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getSeatOrCabinNo() {
        return seatOrCabinNo != null ? seatOrCabinNo : beneficiarySeatOrCabinNo;
    }

    public void setSeatOrCabinNo(String seatOrCabinNo) {
        this.seatOrCabinNo = seatOrCabinNo;
    }

    public String getLocation() {
        return location != null ? location : beneficiaryLocation;
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

    public String getUsageId() {
        return usageId;
    }

    public void setUsageId(String usageId) {
        this.usageId = usageId;
    }

    public String getEngineerEmail() {
        return engineerEmail;
    }

    public void setEngineerEmail(String engineerEmail) {
        this.engineerEmail = engineerEmail;
    }

    public String getPrinterSerialNumber() {
        return printerSerialNumber;
    }

    public void setPrinterSerialNumber(String printerSerialNumber) {
        this.printerSerialNumber = printerSerialNumber;
    }

    public String getEngineerName() {
        return recordedByEmployeeName;
    }

    public String getEngineerEmployeeNo() {
        return recordedByEmployeeNo;
    }

    public String getEngineerEmployeeNumber() {
        return recordedByEmployeeNo;
    }

    public String getBeneficiaryName() {
        return beneficiaryEmployeeName;
    }

    public String getBeneficiaryEmployeeNumber() {
        return beneficiaryEmployeeNo;
    }

    public String getAssetName() {
        return cartridgeName;
    }

    public String getPrinterName() {
        return printerModel;
    }

    public Integer getQuantity() {
        return quantityUsed;
    }

    public String getSeatNumber() {
        return beneficiarySeatOrCabinNo;
    }

    public String getCabinNumber() {
        return beneficiarySeatOrCabinNo;
    }
}
