package com.iocl.procurement.dto.report;

public class CallUpPOReportSummaryDTO {

    private long totalPOs;
    private long totalPOQuantity;
    private long totalExecutedQuantity;
    private long totalRemainingQuantity;

    public CallUpPOReportSummaryDTO() {
    }

    public CallUpPOReportSummaryDTO(long totalPOs, long totalPOQuantity, long totalExecutedQuantity, long totalRemainingQuantity) {
        this.totalPOs = totalPOs;
        this.totalPOQuantity = totalPOQuantity;
        this.totalExecutedQuantity = totalExecutedQuantity;
        this.totalRemainingQuantity = totalRemainingQuantity;
    }

    public long getTotalPOs() {
        return totalPOs;
    }

    public void setTotalPOs(long totalPOs) {
        this.totalPOs = totalPOs;
    }

    public long getTotalPOQuantity() {
        return totalPOQuantity;
    }

    public void setTotalPOQuantity(long totalPOQuantity) {
        this.totalPOQuantity = totalPOQuantity;
    }

    public long getTotalExecutedQuantity() {
        return totalExecutedQuantity;
    }

    public void setTotalExecutedQuantity(long totalExecutedQuantity) {
        this.totalExecutedQuantity = totalExecutedQuantity;
    }

    public long getTotalRemainingQuantity() {
        return totalRemainingQuantity;
    }

    public void setTotalRemainingQuantity(long totalRemainingQuantity) {
        this.totalRemainingQuantity = totalRemainingQuantity;
    }
}
