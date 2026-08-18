package com.iocl.procurement.scheduler;

import com.iocl.procurement.service.DailyPOThresholdReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DailyPOThresholdScheduler {

    private static final Logger logger = LoggerFactory.getLogger(DailyPOThresholdScheduler.class);

    private final DailyPOThresholdReportService dailyReportService;

    public DailyPOThresholdScheduler(DailyPOThresholdReportService dailyReportService) {
        this.dailyReportService = dailyReportService;
    }

    /**
     * Executes automatically every day at 6:00 PM IST (Asia/Kolkata).
     * Evaluates all PostgreSQL procurement records and sends ONE consolidated summary email
     * of all consumables currently having Net Available < PO Threshold.
     */
    @Scheduled(cron = "0 40 11 * * *", zone = "Asia/Kolkata")
    public void runDailyPOThresholdReport() {
        logger.info("Daily scheduled PO threshold report triggered at 4:30 PM IST (Asia/Kolkata).");
        try {
            dailyReportService.generateAndSendDailyReport();
        } catch (Exception ex) {
            logger.error("Error during scheduled daily PO threshold report execution: {}", ex.getMessage(), ex);
        }
    }
}
