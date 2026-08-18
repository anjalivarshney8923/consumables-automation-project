package com.iocl.procurement.entity;

public enum CartridgeColor {
    BLACK,
    CYAN,
    MAGENTA,
    YELLOW;

    public static CartridgeColor fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String normalized = value.trim().toUpperCase().replace(" ", "_").replace("-", "_");
        for (CartridgeColor color : values()) {
            if (color.name().equals(normalized)) {
                return color;
            }
        }
        return null;
    }
}
