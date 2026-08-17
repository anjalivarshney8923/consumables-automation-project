package com.iocl.procurement.entity;

public enum PrinterType {
    BLACK_AND_WHITE,
    COLOR;

    public static PrinterType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String normalized = value.trim().toUpperCase().replace(" ", "_").replace("&", "AND").replace("-", "_");
        for (PrinterType type : values()) {
            if (type.name().equals(normalized)) {
                return type;
            }
        }
        return null;
    }
}
