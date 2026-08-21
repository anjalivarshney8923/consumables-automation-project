package com.iocl.procurement.dto.report;

public class ProcurementReportSummaryDTO {

    private long totalRateContracts;
    private long totalContractQuantity;
    private long totalQtyTakenVideWO;
    private long totalNetAvailableRC;

    public ProcurementReportSummaryDTO() {
    }

    public ProcurementReportSummaryDTO(long totalRateContracts, long totalContractQuantity, long totalQtyTakenVideWO, long totalNetAvailableRC) {
        this.totalRateContracts = totalRateContracts;
        this.totalContractQuantity = totalContractQuantity;
        this.totalQtyTakenVideWO = totalQtyTakenVideWO;
        this.totalNetAvailableRC = totalNetAvailableRC;
    }

    public long getTotalRateContracts() {
        return totalRateContracts;
    }

    public void setTotalRateContracts(long totalRateContracts) {
        this.totalRateContracts = totalRateContracts;
    }

    public long getTotalContractQuantity() {
        return totalContractQuantity;
    }

    public void setTotalContractQuantity(long totalContractQuantity) {
        this.totalContractQuantity = totalContractQuantity;
    }

    public long getTotalQtyTakenVideWO() {
        return totalQtyTakenVideWO;
    }

    public void setTotalQtyTakenVideWO(long totalQtyTakenVideWO) {
        this.totalQtyTakenVideWO = totalQtyTakenVideWO;
    }

    public long getTotalNetAvailableRC() {
        return totalNetAvailableRC;
    }

    public void setTotalNetAvailableRC(long totalNetAvailableRC) {
        this.totalNetAvailableRC = totalNetAvailableRC;
    }
}
