package com.iocl.procurement.dto.response;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class CartridgeProcurementHistoryResponse {

    private Long cartridgeId;
    private Long rateContractId;
    private String supplierName;
    private String partNumber;
    private String cartridgeName;
    private String printerName;
    private Integer currentNetAvailable;
    private Integer totalContractQuantity;
    private Integer totalTakenThroughWO;
    private Integer totalAlreadyExecuted;
    private Integer totalRateContracts;
    private Integer totalCallUpPOs;
    private Integer totalEntries;
    private LocalDate latestPODate;
    private List<ProcurementHistoryItemResponse> history = new ArrayList<>();

    public CartridgeProcurementHistoryResponse() {
    }

    public CartridgeProcurementHistoryResponse(
            Long cartridgeId,
            Long rateContractId,
            String supplierName,
            String partNumber,
            String cartridgeName,
            String printerName,
            Integer currentNetAvailable,
            Integer totalContractQuantity,
            Integer totalTakenThroughWO,
            Integer totalAlreadyExecuted,
            Integer totalRateContracts,
            Integer totalCallUpPOs,
            LocalDate latestPODate,
            List<ProcurementHistoryItemResponse> history
    ) {
        this.cartridgeId = cartridgeId;
        this.rateContractId = rateContractId;
        this.supplierName = supplierName;
        this.partNumber = partNumber;
        this.cartridgeName = cartridgeName;
        this.printerName = printerName;
        this.currentNetAvailable = currentNetAvailable != null ? currentNetAvailable : 0;
        this.totalContractQuantity = totalContractQuantity != null ? totalContractQuantity : 0;
        this.totalTakenThroughWO = totalTakenThroughWO != null ? totalTakenThroughWO : 0;
        this.totalAlreadyExecuted = totalAlreadyExecuted != null ? totalAlreadyExecuted : 0;
        this.totalRateContracts = totalRateContracts != null ? totalRateContracts : 0;
        this.totalCallUpPOs = totalCallUpPOs != null ? totalCallUpPOs : 0;
        this.history = history != null ? history : new ArrayList<>();
        this.totalEntries = this.history.size();
        this.latestPODate = latestPODate;
    }

    public CartridgeProcurementHistoryResponse(
            Long cartridgeId,
            String partNumber,
            String cartridgeName,
            String printerName,
            Integer currentNetAvailable,
            Integer totalContractQuantity,
            Integer totalTakenThroughWO,
            Integer totalAlreadyExecuted,
            Integer totalRateContracts,
            Integer totalCallUpPOs,
            LocalDate latestPODate,
            List<ProcurementHistoryItemResponse> history
    ) {
        this(cartridgeId, null, null, partNumber, cartridgeName, printerName, currentNetAvailable,
                totalContractQuantity, totalTakenThroughWO, totalAlreadyExecuted, totalRateContracts, totalCallUpPOs, latestPODate, history);
    }

    // Getters and Setters

    public Long getCartridgeId() {
        return cartridgeId;
    }

    public void setCartridgeId(Long cartridgeId) {
        this.cartridgeId = cartridgeId;
    }

    public Long getRateContractId() {
        return rateContractId;
    }

    public void setRateContractId(Long rateContractId) {
        this.rateContractId = rateContractId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getPartNumber() {
        return partNumber;
    }

    public void setPartNumber(String partNumber) {
        this.partNumber = partNumber;
    }

    public String getCartridgeName() {
        return cartridgeName;
    }

    public void setCartridgeName(String cartridgeName) {
        this.cartridgeName = cartridgeName;
    }

    public String getPrinterName() {
        return printerName;
    }

    public void setPrinterName(String printerName) {
        this.printerName = printerName;
    }

    public Integer getCurrentNetAvailable() {
        return currentNetAvailable;
    }

    public void setCurrentNetAvailable(Integer currentNetAvailable) {
        this.currentNetAvailable = currentNetAvailable;
    }

    public Integer getTotalContractQuantity() {
        return totalContractQuantity;
    }

    public void setTotalContractQuantity(Integer totalContractQuantity) {
        this.totalContractQuantity = totalContractQuantity;
    }

    public Integer getTotalTakenThroughWO() {
        return totalTakenThroughWO;
    }

    public void setTotalTakenThroughWO(Integer totalTakenThroughWO) {
        this.totalTakenThroughWO = totalTakenThroughWO;
    }

    public Integer getTotalAlreadyExecuted() {
        return totalAlreadyExecuted;
    }

    public void setTotalAlreadyExecuted(Integer totalAlreadyExecuted) {
        this.totalAlreadyExecuted = totalAlreadyExecuted;
    }

    public Integer getTotalRateContracts() {
        return totalRateContracts;
    }

    public void setTotalRateContracts(Integer totalRateContracts) {
        this.totalRateContracts = totalRateContracts;
    }

    public Integer getTotalCallUpPOs() {
        return totalCallUpPOs;
    }

    public void setTotalCallUpPOs(Integer totalCallUpPOs) {
        this.totalCallUpPOs = totalCallUpPOs;
    }

    public Integer getTotalEntries() {
        return totalEntries;
    }

    public void setTotalEntries(Integer totalEntries) {
        this.totalEntries = totalEntries;
    }

    public LocalDate getLatestPODate() {
        return latestPODate;
    }

    public void setLatestPODate(LocalDate latestPODate) {
        this.latestPODate = latestPODate;
    }

    public List<ProcurementHistoryItemResponse> getHistory() {
        return history;
    }

    public void setHistory(List<ProcurementHistoryItemResponse> history) {
        this.history = history;
        this.totalEntries = history != null ? history.size() : 0;
    }
}
