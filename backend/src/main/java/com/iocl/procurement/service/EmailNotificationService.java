package com.iocl.procurement.service;

import com.iocl.procurement.entity.Cartridge;
import com.iocl.procurement.entity.ProcurementAlert;

public interface EmailNotificationService {

    /**
     * Sends an email notification for a triggered Procurement Alert (Alert 1).
     *
     * @param alert the persisted or active procurement alert
     * @param cartridge the cartridge consumable associated with the alert
     * @param netAvailable the calculated net available quantity
     * @param poThreshold the configured PO threshold limit
     */
    void sendProcurementAlertEmail(ProcurementAlert alert, Cartridge cartridge, Integer netAvailable, Integer poThreshold);
}
