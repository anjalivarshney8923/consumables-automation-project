package com.iocl.procurement.entity;

public enum EmployeeStatus {
    ACTIVE,
    INACTIVE;

    public static EmployeeStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        for (EmployeeStatus status : EmployeeStatus.values()) {
            if (status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        return null;
    }
}
