package com.iocl.procurement.dto.report;

public enum ReportType {
    ASSET_USAGE,
    STORE_INVENTORY,
    PROCUREMENT,
    CALL_UP_PO,
    EMPLOYEE,
    STOCK_HISTORY;

    public static ReportType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return ASSET_USAGE;
        }
        String normalized = value.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        for (ReportType type : values()) {
            if (type.name().equalsIgnoreCase(normalized)) {
                return type;
            }
        }
        return ASSET_USAGE;
    }
}
