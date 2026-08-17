package com.iocl.procurement.entity;

public enum AssetStatus {
    ACTIVE,
    INACTIVE,
    UNDER_MAINTENANCE;

    public static AssetStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return ACTIVE; // Default status
        }
        String normalized = value.trim().toUpperCase().replace(" ", "_").replace("-", "_");
        for (AssetStatus status : values()) {
            if (status.name().equals(normalized)) {
                return status;
            }
        }
        return null;
    }
}
