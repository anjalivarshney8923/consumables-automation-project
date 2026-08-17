package com.iocl.procurement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AssetRequest {

    @NotBlank(message = "Model name is required")
    @Size(min = 2, max = 255, message = "Model name must be between 2 and 255 characters")
    private String modelName;

    @NotBlank(message = "Serial number is required")
    @Size(min = 2, max = 100, message = "Serial number must be between 2 and 100 characters")
    private String serialNumber;

    @NotBlank(message = "Department / location is required")
    @Size(max = 150, message = "Department name cannot exceed 150 characters")
    private String department;

    @NotBlank(message = "Compatible cartridge is required")
    private String compatibleCartridge;

    @NotBlank(message = "Printer type is required")
    private String printerType; // e.g. "BLACK_AND_WHITE" or "Black & White" or "COLOR" or "Color"

    private String status; // Optional, default "ACTIVE" if omitted

    public AssetRequest() {
    }

    public AssetRequest(
            String modelName,
            String serialNumber,
            String department,
            String compatibleCartridge,
            String printerType,
            String status
    ) {
        this.modelName = modelName;
        this.serialNumber = serialNumber;
        this.department = department;
        this.compatibleCartridge = compatibleCartridge;
        this.printerType = printerType;
        this.status = status;
    }

    // Getters and Setters

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
