package com.iocl.procurement.service;

import com.iocl.procurement.entity.Cartridge;

public interface AlertEvaluationService {

    void evaluateProcurementThreshold(Cartridge cartridge);

    void evaluateAllProcurementThresholds();
}
