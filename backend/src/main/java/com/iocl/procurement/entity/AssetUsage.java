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

    // Authoritative Engineer who recorded the transaction (from JWT)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "recorded_by_employee_no", length = 50)
    private String recordedByEmployeeNo;

    @Column(name = "recorded_by_employee_name", length = 100)
    private String recordedByEmployeeName;

    // Beneficiary Employee & Cabin where consumption occurred
    @Column(name = "beneficiary_employee_no", nullable = false, length = 50)
    private String beneficiaryEmployeeNo;

    @Column(name = "beneficiary_employee_name", nullable = false, length = 100)
    private String beneficiaryEmployeeName;

    @Column(name = "beneficiary_department", nullable = false, length = 100)
    private String beneficiaryDepartment;

    @Column(name = "beneficiary_seat_or_cabin_no", nullable = false, length = 100)
    private String beneficiarySeatOrCabinNo;

    @Column(name = "beneficiary_location", nullable = false, length = 100)
    private String beneficiaryLocation;

    @Column(name = "beneficiary_email", length = 255)
    private String beneficiaryEmail;

    // Legacy column mappings for backward compatibility
    @Column(name = "employee_id", length = 50)
    private String employeeId;

    @Column(name = "employee_name", length = 100)
    private String employeeName;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "seat_or_cabin_no", length = 100)
    private String seatOrCabinNo;

    @Column(name = "location", length = 100)
    private String location;

    // Consumable & Asset relationships
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
        syncLegacyFields();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        syncLegacyFields();
    }

    private void syncLegacyFields() {
        // Sync legacy columns with beneficiary / recorded by fields for safe backward compatibility
        if (this.beneficiaryEmployeeNo != null) {
            this.employeeId = this.beneficiaryEmployeeNo;
        } else if (this.employeeId != null) {
            this.beneficiaryEmployeeNo = this.employeeId;
        }

        if (this.beneficiaryEmployeeName != null) {
            this.employeeName = this.beneficiaryEmployeeName;
        } else if (this.employeeName != null) {
            this.beneficiaryEmployeeName = this.employeeName;
        }

        if (this.beneficiaryDepartment != null) {
            this.department = this.beneficiaryDepartment;
        } else if (this.department != null) {
            this.beneficiaryDepartment = this.department;
        }

        if (this.beneficiarySeatOrCabinNo != null) {
            this.seatOrCabinNo = this.beneficiarySeatOrCabinNo;
        } else if (this.seatOrCabinNo != null) {
            this.beneficiarySeatOrCabinNo = this.seatOrCabinNo;
        }

        if (this.beneficiaryLocation != null) {
            this.location = this.beneficiaryLocation;
        } else if (this.location != null) {
            this.beneficiaryLocation = this.location;
        }

        if (this.user != null) {
            if (this.recordedByEmployeeNo == null) {
                this.recordedByEmployeeNo = this.user.getEmployeeId();
            }
            if (this.recordedByEmployeeName == null) {
                this.recordedByEmployeeName = this.user.getFullName();
            }
        }
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
        return beneficiaryEmployeeNo != null ? beneficiaryEmployeeNo : employeeId;
    }

    public void setBeneficiaryEmployeeNo(String beneficiaryEmployeeNo) {
        this.beneficiaryEmployeeNo = beneficiaryEmployeeNo;
        this.employeeId = beneficiaryEmployeeNo;
    }

    public String getBeneficiaryEmployeeName() {
        return beneficiaryEmployeeName != null ? beneficiaryEmployeeName : employeeName;
    }

    public void setBeneficiaryEmployeeName(String beneficiaryEmployeeName) {
        this.beneficiaryEmployeeName = beneficiaryEmployeeName;
        this.employeeName = beneficiaryEmployeeName;
    }

    public String getBeneficiaryDepartment() {
        return beneficiaryDepartment != null ? beneficiaryDepartment : department;
    }

    public void setBeneficiaryDepartment(String beneficiaryDepartment) {
        this.beneficiaryDepartment = beneficiaryDepartment;
        this.department = beneficiaryDepartment;
    }

    public String getBeneficiarySeatOrCabinNo() {
        return beneficiarySeatOrCabinNo != null ? beneficiarySeatOrCabinNo : seatOrCabinNo;
    }

    public void setBeneficiarySeatOrCabinNo(String beneficiarySeatOrCabinNo) {
        this.beneficiarySeatOrCabinNo = beneficiarySeatOrCabinNo;
        this.seatOrCabinNo = beneficiarySeatOrCabinNo;
    }

    public String getBeneficiaryLocation() {
        return beneficiaryLocation != null ? beneficiaryLocation : location;
    }

    public void setBeneficiaryLocation(String beneficiaryLocation) {
        this.beneficiaryLocation = beneficiaryLocation;
        this.location = beneficiaryLocation;
    }

    public String getBeneficiaryEmail() {
        return beneficiaryEmail;
    }

    public void setBeneficiaryEmail(String beneficiaryEmail) {
        this.beneficiaryEmail = beneficiaryEmail;
    }

    // Legacy getters/setters for full compatibility with existing code
    public String getEmployeeId() {
        return getBeneficiaryEmployeeNo();
    }

    public void setEmployeeId(String employeeId) {
        setBeneficiaryEmployeeNo(employeeId);
    }

    public String getEmployeeName() {
        return getBeneficiaryEmployeeName();
    }

    public void setEmployeeName(String employeeName) {
        setBeneficiaryEmployeeName(employeeName);
    }

    public String getDepartment() {
        return getBeneficiaryDepartment();
    }

    public void setDepartment(String department) {
        setBeneficiaryDepartment(department);
    }

    public String getSeatOrCabinNo() {
        return getBeneficiarySeatOrCabinNo();
    }

    public void setSeatOrCabinNo(String seatOrCabinNo) {
        setBeneficiarySeatOrCabinNo(seatOrCabinNo);
    }

    public String getLocation() {
        return getBeneficiaryLocation();
    }

    public void setLocation(String location) {
        setBeneficiaryLocation(location);
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
