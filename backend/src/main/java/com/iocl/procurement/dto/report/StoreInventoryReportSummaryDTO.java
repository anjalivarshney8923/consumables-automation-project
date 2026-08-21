package com.iocl.procurement.dto.report;

public class StoreInventoryReportSummaryDTO {

    private long totalItems;
    private long totalStoreQuantity;
    private long lowStockItems;
    private long outOfStockItems;

    public StoreInventoryReportSummaryDTO() {
    }

    public StoreInventoryReportSummaryDTO(long totalItems, long totalStoreQuantity, long lowStockItems, long outOfStockItems) {
        this.totalItems = totalItems;
        this.totalStoreQuantity = totalStoreQuantity;
        this.lowStockItems = lowStockItems;
        this.outOfStockItems = outOfStockItems;
    }

    public long getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(long totalItems) {
        this.totalItems = totalItems;
    }

    public long getTotalStoreQuantity() {
        return totalStoreQuantity;
    }

    public void setTotalStoreQuantity(long totalStoreQuantity) {
        this.totalStoreQuantity = totalStoreQuantity;
    }

    public long getLowStockItems() {
        return lowStockItems;
    }

    public void setLowStockItems(long lowStockItems) {
        this.lowStockItems = lowStockItems;
    }

    public long getOutOfStockItems() {
        return outOfStockItems;
    }

    public void setOutOfStockItems(long outOfStockItems) {
        this.outOfStockItems = outOfStockItems;
    }
}
