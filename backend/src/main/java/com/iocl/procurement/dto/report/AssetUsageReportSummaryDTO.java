package com.iocl.procurement.dto.report;

public class AssetUsageReportSummaryDTO {

    private long totalRecords;
    private long totalQuantityUsed;
    private long totalEngineers;
    private long totalBeneficiaries;

    public AssetUsageReportSummaryDTO() {
    }

    public AssetUsageReportSummaryDTO(long totalRecords, long totalQuantityUsed, long totalEngineers, long totalBeneficiaries) {
        this.totalRecords = totalRecords;
        this.totalQuantityUsed = totalQuantityUsed;
        this.totalEngineers = totalEngineers;
        this.totalBeneficiaries = totalBeneficiaries;
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

    public long getTotalEngineers() {
        return totalEngineers;
    }

    public void setTotalEngineers(long totalEngineers) {
        this.totalEngineers = totalEngineers;
    }

    public long getTotalBeneficiaries() {
        return totalBeneficiaries;
    }

    public void setTotalBeneficiaries(long totalBeneficiaries) {
        this.totalBeneficiaries = totalBeneficiaries;
    }
}
