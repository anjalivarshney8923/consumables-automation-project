package com.iocl.procurement.service;

import com.iocl.procurement.dto.report.ReportFilterDTO;
import com.iocl.procurement.dto.report.ReportType;

public interface ExcelExportService {

    byte[] exportReportToExcel(ReportType reportType, ReportFilterDTO filter);

    byte[] exportReportToCsv(ReportType reportType, ReportFilterDTO filter);
}
