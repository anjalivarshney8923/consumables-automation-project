package com.iocl.procurement.controller;

import com.iocl.procurement.dto.report.*;
import com.iocl.procurement.service.ExcelExportService;
import com.iocl.procurement.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {

    private static final String EXCEL_MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    private static final DateTimeFormatter DATE_FILE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final ReportService reportService;
    private final ExcelExportService excelExportService;

    public AdminReportController(ReportService reportService, ExcelExportService excelExportService) {
        this.reportService = reportService;
        this.excelExportService = excelExportService;
    }

    // =========================================================================
    // 1. UNIFIED DISPATCH ENDPOINTS (Matching reportService.js)
    // =========================================================================
    @GetMapping("/data")
    public ResponseEntity<ReportPageResponse<?>> getReportData(
            @RequestParam(defaultValue = "ASSET_USAGE") String reportType,
            @ModelAttribute ReportFilterDTO filter
    ) {
        ReportType type = ReportType.fromString(reportType);
        ReportPageResponse<?> response = reportService.getReportData(type, filter);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<Object> getReportSummary(
            @RequestParam(defaultValue = "ASSET_USAGE") String reportType,
            @ModelAttribute ReportFilterDTO filter
    ) {
        ReportType type = ReportType.fromString(reportType);
        Object summary = reportService.getReportSummary(type, filter);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportReportToExcel(
            @RequestParam(defaultValue = "ASSET_USAGE") String reportType,
            @ModelAttribute ReportFilterDTO filter
    ) {
        ReportType type = ReportType.fromString(reportType);
        byte[] excelBytes = excelExportService.exportReportToExcel(type, filter);
        String filename = generateFilename(type, "xlsx");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(EXCEL_MIME_TYPE))
                .body(excelBytes);
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportReportToCsv(
            @RequestParam(defaultValue = "ASSET_USAGE") String reportType,
            @ModelAttribute ReportFilterDTO filter
    ) {
        ReportType type = ReportType.fromString(reportType);
        byte[] csvBytes = excelExportService.exportReportToCsv(type, filter);
        String filename = generateFilename(type, "csv");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    // =========================================================================
    // 2. DEDICATED REST ENDPOINTS
    // =========================================================================

    // A. Asset Usage
    @GetMapping("/asset-usage")
    public ResponseEntity<ReportPageResponse<AssetUsageReportDTO>> getAssetUsageReport(@ModelAttribute ReportFilterDTO filter) {
        return ResponseEntity.ok(reportService.getAssetUsageReport(filter));
    }

    @GetMapping("/asset-usage/summary")
    public ResponseEntity<AssetUsageReportSummaryDTO> getAssetUsageSummary(@ModelAttribute ReportFilterDTO filter) {
        return ResponseEntity.ok(reportService.getAssetUsageSummary(filter));
    }

    @GetMapping("/asset-usage/export")
    public ResponseEntity<byte[]> exportAssetUsageReport(@ModelAttribute ReportFilterDTO filter) {
        return exportReportToExcel("ASSET_USAGE", filter);
    }

    // B. Store Inventory
    @GetMapping("/store-inventory")
    public ResponseEntity<ReportPageResponse<StoreInventoryReportDTO>> getStoreInventoryReport(@ModelAttribute ReportFilterDTO filter) {
        return ResponseEntity.ok(reportService.getStoreInventoryReport(filter));
    }

    @GetMapping("/store-inventory/summary")
    public ResponseEntity<StoreInventoryReportSummaryDTO> getStoreInventorySummary(@ModelAttribute ReportFilterDTO filter) {
        return ResponseEntity.ok(reportService.getStoreInventorySummary(filter));
    }

    @GetMapping("/store-inventory/export")
    public ResponseEntity<byte[]> exportStoreInventoryReport(@ModelAttribute ReportFilterDTO filter) {
        return exportReportToExcel("STORE_INVENTORY", filter);
    }

    // C. Procurement & Rate Contracts
    @GetMapping("/procurement")
    public ResponseEntity<ReportPageResponse<ProcurementReportDTO>> getProcurementReport(@ModelAttribute ReportFilterDTO filter) {
        return ResponseEntity.ok(reportService.getProcurementReport(filter));
    }

    @GetMapping("/procurement/summary")
    public ResponseEntity<ProcurementReportSummaryDTO> getProcurementSummary(@ModelAttribute ReportFilterDTO filter) {
        return ResponseEntity.ok(reportService.getProcurementSummary(filter));
    }

    @GetMapping("/procurement/export")
    public ResponseEntity<byte[]> exportProcurementReport(@ModelAttribute ReportFilterDTO filter) {
        return exportReportToExcel("PROCUREMENT", filter);
    }

    // D. Call-Up PO
    @GetMapping("/call-up-po")
    public ResponseEntity<ReportPageResponse<CallUpPOReportDTO>> getCallUpPOReport(@ModelAttribute ReportFilterDTO filter) {
        return ResponseEntity.ok(reportService.getCallUpPOReport(filter));
    }

    @GetMapping("/call-up-po/summary")
    public ResponseEntity<CallUpPOReportSummaryDTO> getCallUpPOSummary(@ModelAttribute ReportFilterDTO filter) {
        return ResponseEntity.ok(reportService.getCallUpPOSummary(filter));
    }

    @GetMapping("/call-up-po/export")
    public ResponseEntity<byte[]> exportCallUpPOReport(@ModelAttribute ReportFilterDTO filter) {
        return exportReportToExcel("CALL_UP_PO", filter);
    }

    // E. Employees
    @GetMapping("/employees")
    public ResponseEntity<ReportPageResponse<EmployeeReportDTO>> getEmployeeReport(@ModelAttribute ReportFilterDTO filter) {
        return ResponseEntity.ok(reportService.getEmployeeReport(filter));
    }

    @GetMapping("/employees/summary")
    public ResponseEntity<EmployeeReportSummaryDTO> getEmployeeSummary(@ModelAttribute ReportFilterDTO filter) {
        return ResponseEntity.ok(reportService.getEmployeeSummary(filter));
    }

    @GetMapping("/employees/export")
    public ResponseEntity<byte[]> exportEmployeeReport(@ModelAttribute ReportFilterDTO filter) {
        return exportReportToExcel("EMPLOYEE", filter);
    }

    // F. Store Stock Movement / History
    @GetMapping("/store-stock-history")
    public ResponseEntity<ReportPageResponse<StockMovementReportDTO>> getStockMovementReport(@ModelAttribute ReportFilterDTO filter) {
        return ResponseEntity.ok(reportService.getStockMovementReport(filter));
    }

    @GetMapping("/store-stock-history/summary")
    public ResponseEntity<StockMovementReportSummaryDTO> getStockMovementSummary(@ModelAttribute ReportFilterDTO filter) {
        return ResponseEntity.ok(reportService.getStockMovementSummary(filter));
    }

    @GetMapping("/store-stock-history/export")
    public ResponseEntity<byte[]> exportStockMovementReport(@ModelAttribute ReportFilterDTO filter) {
        return exportReportToExcel("STOCK_HISTORY", filter);
    }

    private String generateFilename(ReportType type, String extension) {
        String baseName = switch (type) {
            case ASSET_USAGE -> "asset_usage_report";
            case STORE_INVENTORY -> "store_inventory_report";
            case PROCUREMENT -> "procurement_report";
            case CALL_UP_PO -> "call_up_po_report";
            case EMPLOYEE -> "employee_report";
            case STOCK_HISTORY -> "store_stock_history_report";
        };
        return baseName + "_" + LocalDate.now().format(DATE_FILE_FORMATTER) + "." + extension;
    }
}
