package com.iocl.procurement.dto.response;

import java.time.LocalDate;

public class AssetUsageSummaryDTO {

    private long totalRecords;
    private long totalQuantityUsed;
    private long thisMonthCount;
    private LocalDate lastUsageDate;

    public AssetUsageSummaryDTO() {
    }

    public AssetUsageSummaryDTO(long totalRecords, long totalQuantityUsed, long thisMonthCount, LocalDate lastUsageDate) {
        this.totalRecords = totalRecords;
        this.totalQuantityUsed = totalQuantityUsed;
        this.thisMonthCount = thisMonthCount;
        this.lastUsageDate = lastUsageDate;
    }

    public long getTotalRecords() {
        return totalRecords;
    }

    public void setTotalRecords(long totalRecords) {
        this.totalRecords = totalRecords;
    }

    public long getTotalQuantityUsed() {
        return totalQuantityUsed;
    }

    public void setTotalQuantityUsed(long totalQuantityUsed) {
        this.totalQuantityUsed = totalQuantityUsed;
    }

    public long getThisMonthCount() {
        return thisMonthCount;
    }

    public void setThisMonthCount(long thisMonthCount) {
        this.thisMonthCount = thisMonthCount;
    }

    public LocalDate getLastUsageDate() {
        return lastUsageDate;
    }

    public void setLastUsageDate(LocalDate lastUsageDate) {
        this.lastUsageDate = lastUsageDate;
    }
}
