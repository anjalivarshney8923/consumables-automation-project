package com.iocl.procurement.service.impl;

import com.iocl.procurement.dto.report.*;
import com.iocl.procurement.service.ExcelExportService;
import com.iocl.procurement.service.ReportService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExcelExportServiceImpl implements ExcelExportService {

    private static final Logger logger = LoggerFactory.getLogger(ExcelExportServiceImpl.class);
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm:ss");

    private final ReportService reportService;

    public ExcelExportServiceImpl(ReportService reportService) {
        this.reportService = reportService;
    }

    @Override
    public byte[] exportReportToExcel(ReportType reportType, ReportFilterDTO filter) {
        // For export, fetch all matching elements (up to 5000)
        ReportFilterDTO exportFilter = cloneFilterForExport(filter);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet(getReportSheetName(reportType));
            sheet.setDisplayGridlines(true);

            // Styles
            CellStyle titleStyle = createTitleStyle(workbook);
            CellStyle subtitleStyle = createSubtitleStyle(workbook);
            CellStyle filterStyle = createFilterStyle(workbook);
            CellStyle summaryLabelStyle = createSummaryLabelStyle(workbook);
            CellStyle summaryValueStyle = createSummaryValueStyle(workbook);
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle noDataStyle = createNoDataStyle(workbook);

            int rowIdx = 0;

            // 1. Title Banner
            Row titleRow = sheet.createRow(rowIdx++);
            titleRow.setHeightInPoints(24);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("INDIAN OIL CORPORATION LIMITED (IOCL)");
            titleCell.setCellStyle(titleStyle);

            Row subTitleRow = sheet.createRow(rowIdx++);
            subTitleRow.setHeightInPoints(20);
            Cell subTitleCell = subTitleRow.createCell(0);
            subTitleCell.setCellValue(getReportTitle(reportType).toUpperCase() + " - OPERATIONAL AUDIT REPORT");
            subTitleCell.setCellStyle(subtitleStyle);

            Row genRow = sheet.createRow(rowIdx++);
            Cell genCell = genRow.createCell(0);
            genCell.setCellValue("Generated on: " + LocalDateTime.now().format(DATE_TIME_FORMATTER) + " | Confidential - IOCL Internal Use Only");
            genCell.setCellStyle(filterStyle);

            // 2. Applied Filters Summary Line
            Row filterRow = sheet.createRow(rowIdx++);
            Cell filterCell = filterRow.createCell(0);
            filterCell.setCellValue("Applied Filters: " + formatAppliedFilters(exportFilter));
            filterCell.setCellStyle(filterStyle);

            rowIdx++; // Blank spacer

            // 3. Summary Metrics Box & Data Table
            switch (reportType) {
                case ASSET_USAGE -> writeAssetUsageExcel(sheet, exportFilter, rowIdx, headerStyle, dataStyle, numberStyle, dateStyle, summaryLabelStyle, summaryValueStyle, noDataStyle);
                case STORE_INVENTORY -> writeStoreInventoryExcel(sheet, exportFilter, rowIdx, headerStyle, dataStyle, numberStyle, dateStyle, summaryLabelStyle, summaryValueStyle, noDataStyle);
                case PROCUREMENT -> writeProcurementExcel(sheet, exportFilter, rowIdx, headerStyle, dataStyle, numberStyle, dateStyle, summaryLabelStyle, summaryValueStyle, noDataStyle);
                case CALL_UP_PO -> writeCallUpPOExcel(sheet, exportFilter, rowIdx, headerStyle, dataStyle, numberStyle, dateStyle, summaryLabelStyle, summaryValueStyle, noDataStyle);
                case EMPLOYEE -> writeEmployeeExcel(sheet, exportFilter, rowIdx, headerStyle, dataStyle, numberStyle, dateStyle, summaryLabelStyle, summaryValueStyle, noDataStyle);
                case STOCK_HISTORY -> writeStockHistoryExcel(sheet, exportFilter, rowIdx, headerStyle, dataStyle, numberStyle, dateStyle, summaryLabelStyle, summaryValueStyle, noDataStyle);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            logger.error("Failed to generate Excel report for type: [{}]", reportType, e);
            throw new RuntimeException("Failed to generate Excel workbook: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] exportReportToCsv(ReportType reportType, ReportFilterDTO filter) {
        ReportFilterDTO exportFilter = cloneFilterForExport(filter);
        StringBuilder sb = new StringBuilder();

        sb.append("IOCL ").append(getReportTitle(reportType)).append(" Report\n");
        sb.append("Generated,").append(LocalDateTime.now().format(DATE_TIME_FORMATTER)).append("\n");
        sb.append("Filters,").append(escapeCsv(formatAppliedFilters(exportFilter))).append("\n\n");

        switch (reportType) {
            case ASSET_USAGE -> {
                sb.append("Usage ID,Date,Engineer Name,Engineer Emp No,Beneficiary Name,Beneficiary Emp No,Department,Part Number,Cartridge,Printer,Quantity Used,Cabin/Room,Location,Remarks\n");
                List<AssetUsageReportDTO> data = reportService.getAssetUsageReport(exportFilter).getContent();
                for (AssetUsageReportDTO r : data) {
                    sb.append(r.getId()).append(",")
                            .append(r.getUsageDate() != null ? r.getUsageDate() : "").append(",")
                            .append(escapeCsv(r.getRecordedByEngineerName())).append(",")
                            .append(escapeCsv(r.getRecordedByEmployeeNo())).append(",")
                            .append(escapeCsv(r.getBeneficiaryEmployeeName())).append(",")
                            .append(escapeCsv(r.getBeneficiaryEmployeeNo())).append(",")
                            .append(escapeCsv(r.getBeneficiaryDepartment())).append(",")
                            .append(escapeCsv(r.getPartNumber())).append(",")
                            .append(escapeCsv(r.getCartridgeName())).append(",")
                            .append(escapeCsv(r.getPrinterName())).append(",")
                            .append(r.getQuantityUsed() != null ? r.getQuantityUsed() : 1).append(",")
                            .append(escapeCsv(r.getBeneficiarySeatOrCabinNo())).append(",")
                            .append(escapeCsv(r.getBeneficiaryLocation())).append(",")
                            .append(escapeCsv(r.getRemarks())).append("\n");
                }
            }
            case STORE_INVENTORY -> {
                sb.append("Part Number,Cartridge Name,Printer,Colour,Store Qty,Total RC,Qty Taken Vide WO,Net Available RC,Combined Net Qty,Threshold,Status\n");
                List<StoreInventoryReportDTO> data = reportService.getStoreInventoryReport(exportFilter).getContent();
                for (StoreInventoryReportDTO r : data) {
                    sb.append(escapeCsv(r.getPartNumber())).append(",")
                            .append(escapeCsv(r.getCartridgeName())).append(",")
                            .append(escapeCsv(r.getPrinterName())).append(",")
                            .append(escapeCsv(r.getColour())).append(",")
                            .append(r.getStoreQuantity() != null ? r.getStoreQuantity() : 0).append(",")
                            .append(r.getTotalRcQuantity() != null ? r.getTotalRcQuantity() : 0).append(",")
                            .append(r.getQtyTakenVideWO() != null ? r.getQtyTakenVideWO() : 0).append(",")
                            .append(r.getNetAvailableRc() != null ? r.getNetAvailableRc() : 0).append(",")
                            .append(r.getCombinedNetQty() != null ? r.getCombinedNetQty() : 0).append(",")
                            .append(r.getThresholdLimit() != null ? r.getThresholdLimit() : 0).append(",")
                            .append(escapeCsv(r.getStatus())).append("\n");
                }
            }
            case PROCUREMENT -> {
                sb.append("Contract Number,Part Number,Description,Supplier,Contract Qty,Qty Taken Vide WO,Net Available RC,Start Date,End Date,Status\n");
                List<ProcurementReportDTO> data = reportService.getProcurementReport(exportFilter).getContent();
                for (ProcurementReportDTO r : data) {
                    sb.append(escapeCsv(r.getContractNumber())).append(",")
                            .append(escapeCsv(r.getPartNumber())).append(",")
                            .append(escapeCsv(r.getDescription())).append(",")
                            .append(escapeCsv(r.getSupplierName())).append(",")
                            .append(r.getContractQuantity() != null ? r.getContractQuantity() : 0).append(",")
                            .append(r.getQtyTakenVideWO() != null ? r.getQtyTakenVideWO() : 0).append(",")
                            .append(r.getNetAvailableRc() != null ? r.getNetAvailableRc() : 0).append(",")
                            .append(r.getStartDate() != null ? r.getStartDate() : "").append(",")
                            .append(r.getEndDate() != null ? r.getEndDate() : "").append(",")
                            .append(escapeCsv(r.getStatus())).append("\n");
                }
            }
            case CALL_UP_PO -> {
                sb.append("PO Number,PO Date,Rate Contract,Part Number,Supplier,Order Qty,Executed Qty,Remaining Qty,Status\n");
                List<CallUpPOReportDTO> data = reportService.getCallUpPOReport(exportFilter).getContent();
                for (CallUpPOReportDTO r : data) {
                    sb.append(escapeCsv(r.getPoNumber())).append(",")
                            .append(r.getPoDate() != null ? r.getPoDate() : "").append(",")
                            .append(escapeCsv(r.getRateContractNumber())).append(",")
                            .append(escapeCsv(r.getPartNumber())).append(",")
                            .append(escapeCsv(r.getSupplierName())).append(",")
                            .append(r.getOrderQuantity() != null ? r.getOrderQuantity() : 0).append(",")
                            .append(r.getExecutedQuantity() != null ? r.getExecutedQuantity() : 0).append(",")
                            .append(r.getRemainingQuantity() != null ? r.getRemainingQuantity() : 0).append(",")
                            .append(escapeCsv(r.getStatus())).append("\n");
                }
            }
            case EMPLOYEE -> {
                sb.append("Employee Number,Full Name,Department,Designation,GD,Email,Cabin/Room,Location,Printer Name,Printer Serial No,Status\n");
                List<EmployeeReportDTO> data = reportService.getEmployeeReport(exportFilter).getContent();
                for (EmployeeReportDTO r : data) {
                    sb.append(escapeCsv(r.getEmployeeNumber())).append(",")
                            .append(escapeCsv(r.getEmployeeName())).append(",")
                            .append(escapeCsv(r.getDepartment())).append(",")
                            .append(escapeCsv(r.getDesignation())).append(",")
                            .append(escapeCsv(r.getGd())).append(",")
                            .append(escapeCsv(r.getEmail())).append(",")
                            .append(escapeCsv(r.getCabinNumber())).append(",")
                            .append(escapeCsv(r.getLocation())).append(",")
                            .append(escapeCsv(r.getPrinterName())).append(",")
                            .append(escapeCsv(r.getPrinterSerialNumber())).append(",")
                            .append(escapeCsv(r.getStatus())).append("\n");
                }
            }
            case STOCK_HISTORY -> {
                sb.append("Date & Time,Part Number,Cartridge,Transaction Type,Reference,Qty In,Qty Out,Source,Remarks\n");
                List<StockMovementReportDTO> data = reportService.getStockMovementReport(exportFilter).getContent();
                for (StockMovementReportDTO r : data) {
                    sb.append(r.getTransactionDate() != null ? r.getTransactionDate() : "").append(",")
                            .append(escapeCsv(r.getPartNumber())).append(",")
                            .append(escapeCsv(r.getCartridgeName())).append(",")
                            .append(escapeCsv(r.getTransactionType())).append(",")
                            .append(escapeCsv(r.getReference())).append(",")
                            .append(r.getQuantityIn() != null ? r.getQuantityIn() : 0).append(",")
                            .append(r.getQuantityOut() != null ? r.getQuantityOut() : 0).append(",")
                            .append(escapeCsv(r.getSource())).append(",")
                            .append(escapeCsv(r.getRemarks())).append("\n");
                }
            }
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    // =========================================================================
    // EXCEL SHEET WRITERS
    // =========================================================================
    private void writeAssetUsageExcel(Sheet sheet, ReportFilterDTO filter, int startRow,
                                      CellStyle headerStyle, CellStyle dataStyle, CellStyle numberStyle, CellStyle dateStyle,
                                      CellStyle summaryLabelStyle, CellStyle summaryValueStyle, CellStyle noDataStyle) {
        // Summary Block
        AssetUsageReportSummaryDTO summary = reportService.getAssetUsageSummary(filter);
        int rowIdx = startRow;

        Row sumRow1 = sheet.createRow(rowIdx++);
        sumRow1.createCell(0).setCellValue("Total Usage Records:");
        sumRow1.getCell(0).setCellStyle(summaryLabelStyle);
        sumRow1.createCell(1).setCellValue(summary.getTotalRecords());
        sumRow1.getCell(1).setCellStyle(summaryValueStyle);

        sumRow1.createCell(3).setCellValue("Total Quantity Used:");
        sumRow1.getCell(3).setCellStyle(summaryLabelStyle);
        sumRow1.createCell(4).setCellValue(summary.getTotalQuantityUsed());
        sumRow1.getCell(4).setCellStyle(summaryValueStyle);

        Row sumRow2 = sheet.createRow(rowIdx++);
        sumRow2.createCell(0).setCellValue("Total Engineers:");
        sumRow2.getCell(0).setCellStyle(summaryLabelStyle);
        sumRow2.createCell(1).setCellValue(summary.getTotalEngineers());
        sumRow2.getCell(1).setCellStyle(summaryValueStyle);

        sumRow2.createCell(3).setCellValue("Total Beneficiaries:");
        sumRow2.getCell(3).setCellStyle(summaryLabelStyle);
        sumRow2.createCell(4).setCellValue(summary.getTotalBeneficiaries());
        sumRow2.getCell(4).setCellStyle(summaryValueStyle);

        rowIdx++; // Spacer

        // Table Headers
        String[] headers = {"Usage ID", "Date", "Engineer Name", "Eng Emp No", "Beneficiary Name", "Ben Emp No", "Department", "Part Number", "Cartridge Name", "Printer ID", "Qty Used", "Seat/Cabin", "Location", "Remarks"};
        Row headerRow = sheet.createRow(rowIdx++);
        headerRow.setHeightInPoints(20);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        List<AssetUsageReportDTO> data = reportService.getAssetUsageReport(filter).getContent();
        if (data.isEmpty()) {
            writeNoDataRow(sheet, rowIdx, headers.length, noDataStyle);
            return;
        }

        for (AssetUsageReportDTO item : data) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue(item.getId());
            r.getCell(0).setCellStyle(numberStyle);

            r.createCell(1).setCellValue(item.getUsageDate() != null ? item.getUsageDate().toString() : "");
            r.getCell(1).setCellStyle(dateStyle);

            r.createCell(2).setCellValue(defaultStr(item.getRecordedByEngineerName()));
            r.getCell(2).setCellStyle(dataStyle);

            r.createCell(3).setCellValue(defaultStr(item.getRecordedByEmployeeNo()));
            r.getCell(3).setCellStyle(dataStyle);

            r.createCell(4).setCellValue(defaultStr(item.getBeneficiaryEmployeeName()));
            r.getCell(4).setCellStyle(dataStyle);

            r.createCell(5).setCellValue(defaultStr(item.getBeneficiaryEmployeeNo()));
            r.getCell(5).setCellStyle(dataStyle);

            r.createCell(6).setCellValue(defaultStr(item.getBeneficiaryDepartment()));
            r.getCell(6).setCellStyle(dataStyle);

            r.createCell(7).setCellValue(defaultStr(item.getPartNumber()));
            r.getCell(7).setCellStyle(dataStyle);

            r.createCell(8).setCellValue(defaultStr(item.getCartridgeName()));
            r.getCell(8).setCellStyle(dataStyle);

            r.createCell(9).setCellValue(defaultStr(item.getPrinterName()));
            r.getCell(9).setCellStyle(dataStyle);

            r.createCell(10).setCellValue(item.getQuantityUsed() != null ? item.getQuantityUsed() : 1);
            r.getCell(10).setCellStyle(numberStyle);

            r.createCell(11).setCellValue(defaultStr(item.getBeneficiarySeatOrCabinNo()));
            r.getCell(11).setCellStyle(dataStyle);

            r.createCell(12).setCellValue(defaultStr(item.getBeneficiaryLocation()));
            r.getCell(12).setCellStyle(dataStyle);

            r.createCell(13).setCellValue(defaultStr(item.getRemarks()));
            r.getCell(13).setCellStyle(dataStyle);
        }

        autoSizeColumns(sheet, headers.length);
    }

    private void writeStoreInventoryExcel(Sheet sheet, ReportFilterDTO filter, int startRow,
                                          CellStyle headerStyle, CellStyle dataStyle, CellStyle numberStyle, CellStyle dateStyle,
                                          CellStyle summaryLabelStyle, CellStyle summaryValueStyle, CellStyle noDataStyle) {
        StoreInventoryReportSummaryDTO summary = reportService.getStoreInventorySummary(filter);
        int rowIdx = startRow;

        Row sumRow1 = sheet.createRow(rowIdx++);
        sumRow1.createCell(0).setCellValue("Total Items:");
        sumRow1.getCell(0).setCellStyle(summaryLabelStyle);
        sumRow1.createCell(1).setCellValue(summary.getTotalItems());
        sumRow1.getCell(1).setCellStyle(summaryValueStyle);

        sumRow1.createCell(3).setCellValue("Total Store Quantity:");
        sumRow1.getCell(3).setCellStyle(summaryLabelStyle);
        sumRow1.createCell(4).setCellValue(summary.getTotalStoreQuantity());
        sumRow1.getCell(4).setCellStyle(summaryValueStyle);

        Row sumRow2 = sheet.createRow(rowIdx++);
        sumRow2.createCell(0).setCellValue("Low Stock Items:");
        sumRow2.getCell(0).setCellStyle(summaryLabelStyle);
        sumRow2.createCell(1).setCellValue(summary.getLowStockItems());
        sumRow2.getCell(1).setCellStyle(summaryValueStyle);

        sumRow2.createCell(3).setCellValue("Out of Stock Items:");
        sumRow2.getCell(3).setCellStyle(summaryLabelStyle);
        sumRow2.createCell(4).setCellValue(summary.getOutOfStockItems());
        sumRow2.getCell(4).setCellStyle(summaryValueStyle);

        rowIdx++;

        String[] headers = {"Part Number", "Cartridge Name", "Printer Name", "Colour", "Store Qty", "Total RC Qty", "Qty Taken WO", "Net Available RC", "Combined Net Qty", "Threshold", "Status", "Location"};
        Row headerRow = sheet.createRow(rowIdx++);
        headerRow.setHeightInPoints(20);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        List<StoreInventoryReportDTO> data = reportService.getStoreInventoryReport(filter).getContent();
        if (data.isEmpty()) {
            writeNoDataRow(sheet, rowIdx, headers.length, noDataStyle);
            return;
        }

        for (StoreInventoryReportDTO item : data) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue(defaultStr(item.getPartNumber()));
            r.getCell(0).setCellStyle(dataStyle);

            r.createCell(1).setCellValue(defaultStr(item.getCartridgeName()));
            r.getCell(1).setCellStyle(dataStyle);

            r.createCell(2).setCellValue(defaultStr(item.getPrinterName()));
            r.getCell(2).setCellStyle(dataStyle);

            r.createCell(3).setCellValue(defaultStr(item.getColour()));
            r.getCell(3).setCellStyle(dataStyle);

            r.createCell(4).setCellValue(item.getStoreQuantity() != null ? item.getStoreQuantity() : 0);
            r.getCell(4).setCellStyle(numberStyle);

            r.createCell(5).setCellValue(item.getTotalRcQuantity() != null ? item.getTotalRcQuantity() : 0);
            r.getCell(5).setCellStyle(numberStyle);

            r.createCell(6).setCellValue(item.getQtyTakenVideWO() != null ? item.getQtyTakenVideWO() : 0);
            r.getCell(6).setCellStyle(numberStyle);

            r.createCell(7).setCellValue(item.getNetAvailableRc() != null ? item.getNetAvailableRc() : 0);
            r.getCell(7).setCellStyle(numberStyle);

            r.createCell(8).setCellValue(item.getCombinedNetQty() != null ? item.getCombinedNetQty() : 0);
            r.getCell(8).setCellStyle(numberStyle);

            r.createCell(9).setCellValue(item.getThresholdLimit() != null ? item.getThresholdLimit() : 0);
            r.getCell(9).setCellStyle(numberStyle);

            r.createCell(10).setCellValue(defaultStr(item.getStatus()));
            r.getCell(10).setCellStyle(dataStyle);

            r.createCell(11).setCellValue(defaultStr(item.getLocation()));
            r.getCell(11).setCellStyle(dataStyle);
        }

        autoSizeColumns(sheet, headers.length);
    }

    private void writeProcurementExcel(Sheet sheet, ReportFilterDTO filter, int startRow,
                                       CellStyle headerStyle, CellStyle dataStyle, CellStyle numberStyle, CellStyle dateStyle,
                                       CellStyle summaryLabelStyle, CellStyle summaryValueStyle, CellStyle noDataStyle) {
        ProcurementReportSummaryDTO summary = reportService.getProcurementSummary(filter);
        int rowIdx = startRow;

        Row sumRow1 = sheet.createRow(rowIdx++);
        sumRow1.createCell(0).setCellValue("Total Rate Contracts:");
        sumRow1.getCell(0).setCellStyle(summaryLabelStyle);
        sumRow1.createCell(1).setCellValue(summary.getTotalRateContracts());
        sumRow1.getCell(1).setCellStyle(summaryValueStyle);

        sumRow1.createCell(3).setCellValue("Total Contract Quantity:");
        sumRow1.getCell(3).setCellStyle(summaryLabelStyle);
        sumRow1.createCell(4).setCellValue(summary.getTotalContractQuantity());
        sumRow1.getCell(4).setCellStyle(summaryValueStyle);

        Row sumRow2 = sheet.createRow(rowIdx++);
        sumRow2.createCell(0).setCellValue("Qty Taken Vide WO:");
        sumRow2.getCell(0).setCellStyle(summaryLabelStyle);
        sumRow2.createCell(1).setCellValue(summary.getTotalQtyTakenVideWO());
        sumRow2.getCell(1).setCellStyle(summaryValueStyle);

        sumRow2.createCell(3).setCellValue("Net Available RC:");
        sumRow2.getCell(3).setCellStyle(summaryLabelStyle);
        sumRow2.createCell(4).setCellValue(summary.getTotalNetAvailableRC());
        sumRow2.getCell(4).setCellStyle(summaryValueStyle);

        rowIdx++;

        String[] headers = {"Rate Contract No.", "Part Number", "Description", "Supplier", "Contract Qty", "Qty Taken WO", "Net Available RC", "Start Date", "End Date", "Status"};
        Row headerRow = sheet.createRow(rowIdx++);
        headerRow.setHeightInPoints(20);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        List<ProcurementReportDTO> data = reportService.getProcurementReport(filter).getContent();
        if (data.isEmpty()) {
            writeNoDataRow(sheet, rowIdx, headers.length, noDataStyle);
            return;
        }

        for (ProcurementReportDTO item : data) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue(defaultStr(item.getContractNumber()));
            r.getCell(0).setCellStyle(dataStyle);

            r.createCell(1).setCellValue(defaultStr(item.getPartNumber()));
            r.getCell(1).setCellStyle(dataStyle);

            r.createCell(2).setCellValue(defaultStr(item.getDescription()));
            r.getCell(2).setCellStyle(dataStyle);

            r.createCell(3).setCellValue(defaultStr(item.getSupplierName()));
            r.getCell(3).setCellStyle(dataStyle);

            r.createCell(4).setCellValue(item.getContractQuantity() != null ? item.getContractQuantity() : 0);
            r.getCell(4).setCellStyle(numberStyle);

            r.createCell(5).setCellValue(item.getQtyTakenVideWO() != null ? item.getQtyTakenVideWO() : 0);
            r.getCell(5).setCellStyle(numberStyle);

            r.createCell(6).setCellValue(item.getNetAvailableRc() != null ? item.getNetAvailableRc() : 0);
            r.getCell(6).setCellStyle(numberStyle);

            r.createCell(7).setCellValue(item.getStartDate() != null ? item.getStartDate().toString() : "");
            r.getCell(7).setCellStyle(dateStyle);

            r.createCell(8).setCellValue(item.getEndDate() != null ? item.getEndDate().toString() : "");
            r.getCell(8).setCellStyle(dateStyle);

            r.createCell(9).setCellValue(defaultStr(item.getStatus()));
            r.getCell(9).setCellStyle(dataStyle);
        }

        autoSizeColumns(sheet, headers.length);
    }

    private void writeCallUpPOExcel(Sheet sheet, ReportFilterDTO filter, int startRow,
                                    CellStyle headerStyle, CellStyle dataStyle, CellStyle numberStyle, CellStyle dateStyle,
                                    CellStyle summaryLabelStyle, CellStyle summaryValueStyle, CellStyle noDataStyle) {
        CallUpPOReportSummaryDTO summary = reportService.getCallUpPOSummary(filter);
        int rowIdx = startRow;

        Row sumRow1 = sheet.createRow(rowIdx++);
        sumRow1.createCell(0).setCellValue("Total Call-Up POs:");
        sumRow1.getCell(0).setCellStyle(summaryLabelStyle);
        sumRow1.createCell(1).setCellValue(summary.getTotalPOs());
        sumRow1.getCell(1).setCellStyle(summaryValueStyle);

        sumRow1.createCell(3).setCellValue("Total PO Quantity:");
        sumRow1.getCell(3).setCellStyle(summaryLabelStyle);
        sumRow1.createCell(4).setCellValue(summary.getTotalPOQuantity());
        sumRow1.getCell(4).setCellStyle(summaryValueStyle);

        Row sumRow2 = sheet.createRow(rowIdx++);
        sumRow2.createCell(0).setCellValue("Total Executed Qty:");
        sumRow2.getCell(0).setCellStyle(summaryLabelStyle);
        sumRow2.createCell(1).setCellValue(summary.getTotalExecutedQuantity());
        sumRow2.getCell(1).setCellStyle(summaryValueStyle);

        sumRow2.createCell(3).setCellValue("Total Remaining Qty:");
        sumRow2.getCell(3).setCellStyle(summaryLabelStyle);
        sumRow2.createCell(4).setCellValue(summary.getTotalRemainingQuantity());
        sumRow2.getCell(4).setCellStyle(summaryValueStyle);

        rowIdx++;

        String[] headers = {"PO Number", "PO Date", "Rate Contract Ref", "Part Number", "Supplier", "Order Qty", "Executed Qty", "Remaining Qty", "Status"};
        Row headerRow = sheet.createRow(rowIdx++);
        headerRow.setHeightInPoints(20);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        List<CallUpPOReportDTO> data = reportService.getCallUpPOReport(filter).getContent();
        if (data.isEmpty()) {
            writeNoDataRow(sheet, rowIdx, headers.length, noDataStyle);
            return;
        }

        for (CallUpPOReportDTO item : data) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue(defaultStr(item.getPoNumber()));
            r.getCell(0).setCellStyle(dataStyle);

            r.createCell(1).setCellValue(item.getPoDate() != null ? item.getPoDate().toString() : "");
            r.getCell(1).setCellStyle(dateStyle);

            r.createCell(2).setCellValue(defaultStr(item.getRateContractNumber()));
            r.getCell(2).setCellStyle(dataStyle);

            r.createCell(3).setCellValue(defaultStr(item.getPartNumber()));
            r.getCell(3).setCellStyle(dataStyle);

            r.createCell(4).setCellValue(defaultStr(item.getSupplierName()));
            r.getCell(4).setCellStyle(dataStyle);

            r.createCell(5).setCellValue(item.getOrderQuantity() != null ? item.getOrderQuantity() : 0);
            r.getCell(5).setCellStyle(numberStyle);

            r.createCell(6).setCellValue(item.getExecutedQuantity() != null ? item.getExecutedQuantity() : 0);
            r.getCell(6).setCellStyle(numberStyle);

            r.createCell(7).setCellValue(item.getRemainingQuantity() != null ? item.getRemainingQuantity() : 0);
            r.getCell(7).setCellStyle(numberStyle);

            r.createCell(8).setCellValue(defaultStr(item.getStatus()));
            r.getCell(8).setCellStyle(dataStyle);
        }

        autoSizeColumns(sheet, headers.length);
    }

    private void writeEmployeeExcel(Sheet sheet, ReportFilterDTO filter, int startRow,
                                    CellStyle headerStyle, CellStyle dataStyle, CellStyle numberStyle, CellStyle dateStyle,
                                    CellStyle summaryLabelStyle, CellStyle summaryValueStyle, CellStyle noDataStyle) {
        EmployeeReportSummaryDTO summary = reportService.getEmployeeSummary(filter);
        int rowIdx = startRow;

        Row sumRow1 = sheet.createRow(rowIdx++);
        sumRow1.createCell(0).setCellValue("Total Employees:");
        sumRow1.getCell(0).setCellStyle(summaryLabelStyle);
        sumRow1.createCell(1).setCellValue(summary.getTotalEmployees());
        sumRow1.getCell(1).setCellStyle(summaryValueStyle);

        sumRow1.createCell(3).setCellValue("Active Employees:");
        sumRow1.getCell(3).setCellStyle(summaryLabelStyle);
        sumRow1.createCell(4).setCellValue(summary.getActiveEmployees());
        sumRow1.getCell(4).setCellStyle(summaryValueStyle);

        Row sumRow2 = sheet.createRow(rowIdx++);
        sumRow2.createCell(0).setCellValue("Total Departments:");
        sumRow2.getCell(0).setCellStyle(summaryLabelStyle);
        sumRow2.createCell(1).setCellValue(summary.getTotalDepartments());
        sumRow2.getCell(1).setCellStyle(summaryValueStyle);

        sumRow2.createCell(3).setCellValue("With Printers:");
        sumRow2.getCell(3).setCellStyle(summaryLabelStyle);
        sumRow2.createCell(4).setCellValue(summary.getEmployeesWithPrinters());
        sumRow2.getCell(4).setCellStyle(summaryValueStyle);

        rowIdx++;

        String[] headers = {"Employee Number", "Full Name", "Department", "Designation", "GD", "Email", "Cabin/Room", "Location", "Printer Name", "Printer Serial No", "Status"};
        Row headerRow = sheet.createRow(rowIdx++);
        headerRow.setHeightInPoints(20);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        List<EmployeeReportDTO> data = reportService.getEmployeeReport(filter).getContent();
        if (data.isEmpty()) {
            writeNoDataRow(sheet, rowIdx, headers.length, noDataStyle);
            return;
        }

        for (EmployeeReportDTO item : data) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue(defaultStr(item.getEmployeeNumber()));
            r.getCell(0).setCellStyle(dataStyle);

            r.createCell(1).setCellValue(defaultStr(item.getEmployeeName()));
            r.getCell(1).setCellStyle(dataStyle);

            r.createCell(2).setCellValue(defaultStr(item.getDepartment()));
            r.getCell(2).setCellStyle(dataStyle);

            r.createCell(3).setCellValue(defaultStr(item.getDesignation()));
            r.getCell(3).setCellStyle(dataStyle);

            r.createCell(4).setCellValue(defaultStr(item.getGd()));
            r.getCell(4).setCellStyle(dataStyle);

            r.createCell(5).setCellValue(defaultStr(item.getEmail()));
            r.getCell(5).setCellStyle(dataStyle);

            r.createCell(6).setCellValue(defaultStr(item.getCabinNumber()));
            r.getCell(6).setCellStyle(dataStyle);

            r.createCell(7).setCellValue(defaultStr(item.getLocation()));
            r.getCell(7).setCellStyle(dataStyle);

            r.createCell(8).setCellValue(defaultStr(item.getPrinterName()));
            r.getCell(8).setCellStyle(dataStyle);

            r.createCell(9).setCellValue(defaultStr(item.getPrinterSerialNumber()));
            r.getCell(9).setCellStyle(dataStyle);

            r.createCell(10).setCellValue(defaultStr(item.getStatus()));
            r.getCell(10).setCellStyle(dataStyle);
        }

        autoSizeColumns(sheet, headers.length);
    }

    private void writeStockHistoryExcel(Sheet sheet, ReportFilterDTO filter, int startRow,
                                        CellStyle headerStyle, CellStyle dataStyle, CellStyle numberStyle, CellStyle dateStyle,
                                        CellStyle summaryLabelStyle, CellStyle summaryValueStyle, CellStyle noDataStyle) {
        StockMovementReportSummaryDTO summary = reportService.getStockMovementSummary(filter);
        int rowIdx = startRow;

        Row sumRow1 = sheet.createRow(rowIdx++);
        sumRow1.createCell(0).setCellValue("Total Transactions:");
        sumRow1.getCell(0).setCellStyle(summaryLabelStyle);
        sumRow1.createCell(1).setCellValue(summary.getTotalTransactions());
        sumRow1.getCell(1).setCellStyle(summaryValueStyle);

        sumRow1.createCell(3).setCellValue("Total Stock In:");
        sumRow1.getCell(3).setCellStyle(summaryLabelStyle);
        sumRow1.createCell(4).setCellValue(summary.getTotalStockIn());
        sumRow1.getCell(4).setCellStyle(summaryValueStyle);

        Row sumRow2 = sheet.createRow(rowIdx++);
        sumRow2.createCell(0).setCellValue("Total Stock Out:");
        sumRow2.getCell(0).setCellStyle(summaryLabelStyle);
        sumRow2.createCell(1).setCellValue(summary.getTotalStockOut());
        sumRow2.getCell(1).setCellStyle(summaryValueStyle);

        sumRow2.createCell(3).setCellValue("Net Movement:");
        sumRow2.getCell(3).setCellStyle(summaryLabelStyle);
        sumRow2.createCell(4).setCellValue(summary.getNetMovement());
        sumRow2.getCell(4).setCellStyle(summaryValueStyle);

        rowIdx++;

        String[] headers = {"Date & Time", "Part Number", "Cartridge", "Transaction Type", "Reference", "Qty In", "Qty Out", "Source / Beneficiary", "Remarks"};
        Row headerRow = sheet.createRow(rowIdx++);
        headerRow.setHeightInPoints(20);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        List<StockMovementReportDTO> data = reportService.getStockMovementReport(filter).getContent();
        if (data.isEmpty()) {
            writeNoDataRow(sheet, rowIdx, headers.length, noDataStyle);
            return;
        }

        for (StockMovementReportDTO item : data) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue(item.getTransactionDate() != null ? item.getTransactionDate().format(DATE_TIME_FORMATTER) : "");
            r.getCell(0).setCellStyle(dateStyle);

            r.createCell(1).setCellValue(defaultStr(item.getPartNumber()));
            r.getCell(1).setCellStyle(dataStyle);

            r.createCell(2).setCellValue(defaultStr(item.getCartridgeName()));
            r.getCell(2).setCellStyle(dataStyle);

            r.createCell(3).setCellValue(defaultStr(item.getTransactionType()));
            r.getCell(3).setCellStyle(dataStyle);

            r.createCell(4).setCellValue(defaultStr(item.getReference()));
            r.getCell(4).setCellStyle(dataStyle);

            r.createCell(5).setCellValue(item.getQuantityIn() != null ? item.getQuantityIn() : 0);
            r.getCell(5).setCellStyle(numberStyle);

            r.createCell(6).setCellValue(item.getQuantityOut() != null ? item.getQuantityOut() : 0);
            r.getCell(6).setCellStyle(numberStyle);

            r.createCell(7).setCellValue(defaultStr(item.getSource()));
            r.getCell(7).setCellStyle(dataStyle);

            r.createCell(8).setCellValue(defaultStr(item.getRemarks()));
            r.getCell(8).setCellStyle(dataStyle);
        }

        autoSizeColumns(sheet, headers.length);
    }

    private void writeNoDataRow(Sheet sheet, int rowIdx, int colSpan, CellStyle noDataStyle) {
        Row row = sheet.createRow(rowIdx);
        row.setHeightInPoints(28);
        Cell cell = row.createCell(0);
        cell.setCellValue("No operational records found matching the specified report filters.");
        cell.setCellStyle(noDataStyle);
        if (colSpan > 1) {
            sheet.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, 0, colSpan - 1));
        }
    }

    private void autoSizeColumns(Sheet sheet, int numCols) {
        for (int i = 0; i < numCols; i++) {
            sheet.autoSizeColumn(i);
            int width = sheet.getColumnWidth(i);
            sheet.setColumnWidth(i, Math.min(Math.max(width + 1024, 3000), 12000));
        }
    }

    // =========================================================================
    // STYLE FACTORY
    // =========================================================================
    private CellStyle createTitleStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setFontName("Arial");
        f.setFontHeightInPoints((short) 13);
        f.setBold(true);
        f.setColor(IndexedColors.DARK_BLUE.getIndex());
        s.setFont(f);
        return s;
    }

    private CellStyle createSubtitleStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setFontName("Arial");
        f.setFontHeightInPoints((short) 11);
        f.setBold(true);
        s.setFont(f);
        return s;
    }

    private CellStyle createFilterStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setFontName("Arial");
        f.setFontHeightInPoints((short) 9);
        f.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        s.setFont(f);
        return s;
    }

    private CellStyle createSummaryLabelStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setFontName("Arial");
        f.setFontHeightInPoints((short) 9);
        f.setBold(true);
        f.setColor(IndexedColors.DARK_BLUE.getIndex());
        s.setFont(f);
        s.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
        return s;
    }

    private CellStyle createSummaryValueStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setFontName("Arial");
        f.setFontHeightInPoints((short) 10);
        f.setBold(true);
        s.setFont(f);
        s.setFillForegroundColor(IndexedColors.WHITE.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
        return s;
    }

    private CellStyle createHeaderStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setFontName("Arial");
        f.setFontHeightInPoints((short) 10);
        f.setBold(true);
        f.setColor(IndexedColors.WHITE.getIndex());
        s.setFont(f);
        s.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        s.setBorderBottom(BorderStyle.MEDIUM);
        s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
        return s;
    }

    private CellStyle createDataStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setFontName("Arial");
        f.setFontHeightInPoints((short) 9);
        s.setFont(f);
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        return s;
    }

    private CellStyle createNumberStyle(Workbook wb) {
        CellStyle s = createDataStyle(wb);
        s.setAlignment(HorizontalAlignment.RIGHT);
        return s;
    }

    private CellStyle createDateStyle(Workbook wb) {
        CellStyle s = createDataStyle(wb);
        s.setAlignment(HorizontalAlignment.CENTER);
        return s;
    }

    private CellStyle createNoDataStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setFontName("Arial");
        f.setFontHeightInPoints((short) 10);
        f.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        f.setItalic(true);
        s.setFont(f);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
        return s;
    }

    private String getReportTitle(ReportType type) {
        return switch (type) {
            case ASSET_USAGE -> "Asset Usage";
            case STORE_INVENTORY -> "Store Inventory";
            case PROCUREMENT -> "Procurement & Rate Contracts";
            case CALL_UP_PO -> "Call-Up Purchase Orders";
            case EMPLOYEE -> "Employee Directory";
            case STOCK_HISTORY -> "Store Stock Movement";
        };
    }

    private String getReportSheetName(ReportType type) {
        return switch (type) {
            case ASSET_USAGE -> "Asset Usage Report";
            case STORE_INVENTORY -> "Store Inventory Report";
            case PROCUREMENT -> "Procurement Report";
            case CALL_UP_PO -> "Call-Up PO Report";
            case EMPLOYEE -> "Employee Report";
            case STOCK_HISTORY -> "Stock Movement Report";
        };
    }

    private String formatAppliedFilters(ReportFilterDTO filter) {
        StringBuilder sb = new StringBuilder();
        if (filter.getFromDate() != null && filter.getToDate() != null) {
            sb.append("Period: ").append(filter.getFromDate()).append(" to ").append(filter.getToDate()).append("; ");
        } else if (filter.getFromDate() != null) {
            sb.append("From Date: ").append(filter.getFromDate()).append("; ");
        } else if (filter.getToDate() != null) {
            sb.append("To Date: ").append(filter.getToDate()).append("; ");
        } else {
            sb.append("Period: All Available Dates; ");
        }

        if (filter.getPartNumber() != null && !filter.getPartNumber().isEmpty()) {
            sb.append("Part No: ").append(filter.getPartNumber()).append("; ");
        }
        if (filter.getDepartment() != null && !filter.getDepartment().equalsIgnoreCase("ALL")) {
            sb.append("Department: ").append(filter.getDepartment()).append("; ");
        }
        if (filter.getStatus() != null && !filter.getStatus().equalsIgnoreCase("ALL")) {
            sb.append("Status: ").append(filter.getStatus()).append("; ");
        }
        if (filter.getSearch() != null && !filter.getSearch().isEmpty()) {
            sb.append("Search: ").append(filter.getSearch()).append("; ");
        }

        return sb.toString();
    }

    private ReportFilterDTO cloneFilterForExport(ReportFilterDTO filter) {
        ReportFilterDTO exportFilter = new ReportFilterDTO();
        if (filter != null) {
            exportFilter.setFromDate(filter.getFromDate());
            exportFilter.setToDate(filter.getToDate());
            exportFilter.setSearch(filter.getSearch());
            exportFilter.setPartNumber(filter.getPartNumber());
            exportFilter.setEngineer(filter.getEngineer());
            exportFilter.setBeneficiary(filter.getBeneficiary());
            exportFilter.setEmployeeNumber(filter.getEmployeeNumber());
            exportFilter.setName(filter.getName());
            exportFilter.setDepartment(filter.getDepartment());
            exportFilter.setDesignation(filter.getDesignation());
            exportFilter.setStatus(filter.getStatus());
            exportFilter.setLocation(filter.getLocation());
            exportFilter.setColour(filter.getColour());
            exportFilter.setSupplier(filter.getSupplier());
            exportFilter.setRateContract(filter.getRateContract());
            exportFilter.setPoNumber(filter.getPoNumber());
            exportFilter.setTransactionType(filter.getTransactionType());
            exportFilter.setDirection(filter.getDirection());
            exportFilter.setSortBy(filter.getSortBy());
            exportFilter.setSortDir(filter.getSortDir());
        }
        exportFilter.setPage(0);
        exportFilter.setSize(5000); // Export full dataset
        return exportFilter;
    }

    private String defaultStr(String str) {
        return str != null ? str : "--";
    }

    private String escapeCsv(String str) {
        if (str == null) return "";
        if (str.contains(",") || str.contains("\"") || str.contains("\n")) {
            return "\"" + str.replace("\"", "\"\"") + "\"";
        }
        return str;
    }
}
