package com.iocl.procurement.service;

import com.iocl.procurement.dto.report.*;

public interface ReportService {

    ReportPageResponse<AssetUsageReportDTO> getAssetUsageReport(ReportFilterDTO filter);

    AssetUsageReportSummaryDTO getAssetUsageSummary(ReportFilterDTO filter);

    ReportPageResponse<StoreInventoryReportDTO> getStoreInventoryReport(ReportFilterDTO filter);

    StoreInventoryReportSummaryDTO getStoreInventorySummary(ReportFilterDTO filter);

    ReportPageResponse<ProcurementReportDTO> getProcurementReport(ReportFilterDTO filter);

    ProcurementReportSummaryDTO getProcurementSummary(ReportFilterDTO filter);

    ReportPageResponse<CallUpPOReportDTO> getCallUpPOReport(ReportFilterDTO filter);

    CallUpPOReportSummaryDTO getCallUpPOSummary(ReportFilterDTO filter);

    ReportPageResponse<EmployeeReportDTO> getEmployeeReport(ReportFilterDTO filter);

    EmployeeReportSummaryDTO getEmployeeSummary(ReportFilterDTO filter);

    ReportPageResponse<StockMovementReportDTO> getStockMovementReport(ReportFilterDTO filter);

    StockMovementReportSummaryDTO getStockMovementSummary(ReportFilterDTO filter);

    ReportPageResponse<?> getReportData(ReportType reportType, ReportFilterDTO filter);

    Object getReportSummary(ReportType reportType, ReportFilterDTO filter);
}
