package com.iocl.procurement.service;

import com.iocl.procurement.dto.response.AlertCountResponse;
import com.iocl.procurement.dto.response.AlertResponse;
import com.iocl.procurement.dto.response.TenderingAlertResponse;

import java.util.List;

public interface AlertService {

    List<AlertResponse> getAllAlerts();

    List<AlertResponse> getUnreadAlerts();

    List<TenderingAlertResponse> getTenderingAlerts();

    AlertCountResponse getAlertCounts();

    AlertResponse markAsRead(Long alertId);

    void markAllAsRead();
}
