package com.iocl.procurement.service;

import com.iocl.procurement.dto.DailyPOThresholdReportItem;
import java.util.List;

public interface DailyPOThresholdReportService {

    /**
     * Evaluates all active cartridges and rate contracts against configured PO thresholds in PostgreSQL,
     * finds all items where Net Available < PO Threshold, and dispatches ONE consolidated daily email report.
     *
     * @return list of items below PO threshold (empty if all items are healthy)
     */
    List<DailyPOThresholdReportItem> generateAndSendDailyReport();
}
