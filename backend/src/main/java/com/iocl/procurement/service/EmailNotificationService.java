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

    /**
     * Sends an email notification for a triggered URGENT Tendering Alert (Alert 2).
     *
     * @param alert the persisted or active tendering alert
     * @param cartridge the cartridge consumable associated with the alert
     * @param storeAvailable the store net available quantity
     * @param rcAvailable the rate contract net available quantity
     * @param combinedAvailable the sum of store and rate contract net available
     * @param tenderingThreshold the configured tendering threshold limit
     */
    void sendTenderingAlertEmail(ProcurementAlert alert, Cartridge cartridge, Integer storeAvailable, Integer rcAvailable, Integer combinedAvailable, Integer tenderingThreshold);
}
