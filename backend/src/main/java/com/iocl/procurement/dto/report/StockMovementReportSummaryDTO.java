package com.iocl.procurement.dto.report;

public class StockMovementReportSummaryDTO {

    private long totalTransactions;
    private long totalStockIn;
    private long totalStockOut;
    private long netMovement;

    public StockMovementReportSummaryDTO() {
    }

    public StockMovementReportSummaryDTO(long totalTransactions, long totalStockIn, long totalStockOut, long netMovement) {
        this.totalTransactions = totalTransactions;
        this.totalStockIn = totalStockIn;
        this.totalStockOut = totalStockOut;
        this.netMovement = netMovement;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public long getTotalStockIn() {
        return totalStockIn;
    }

    public void setTotalStockIn(long totalStockIn) {
        this.totalStockIn = totalStockIn;
    }

    public long getTotalStockOut() {
        return totalStockOut;
    }

    public void setTotalStockOut(long totalStockOut) {
        this.totalStockOut = totalStockOut;
    }

    public long getNetMovement() {
        return netMovement;
    }

    public void setNetMovement(long netMovement) {
        this.netMovement = netMovement;
    }
}
