package com.iocl.procurement.service;

import com.iocl.procurement.entity.Cartridge;

public interface AlertEvaluationService {

    /**
     * Evaluates Alert 1 (Procurement Threshold: Rate Contract Net Available <= PO Threshold)
     */
    void evaluateProcurementThreshold(Cartridge cartridge);

    /**
     * Evaluates Alert 1 for all active cartridges
     */
    void evaluateAllProcurementThresholds();

    /**
     * Evaluates Alert 2 (URGENT Tendering Required: Combined Stores + Rate Contract Net Available < Tendering Threshold)
     */
    void evaluateTenderingThreshold(Cartridge cartridge);

    /**
     * Evaluates Alert 2 for all active cartridges
     */
    void evaluateAllTenderingThresholds();

    /**
     * Evaluates both Alert 1 and Alert 2 for the specified cartridge
     */
    void evaluateAllAlerts(Cartridge cartridge);

    /**
     * Evaluates both Alert 1 and Alert 2 for all active cartridges
     */
    void evaluateAllAlerts();
}
