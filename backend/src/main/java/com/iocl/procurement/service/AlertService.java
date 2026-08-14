package com.iocl.procurement.service;

import com.iocl.procurement.dto.response.AlertCountResponse;
import com.iocl.procurement.dto.response.AlertResponse;

import java.util.List;

public interface AlertService {

    List<AlertResponse> getAllAlerts();

    List<AlertResponse> getUnreadAlerts();

    AlertCountResponse getAlertCounts();

    AlertResponse markAsRead(Long alertId);

    void markAllAsRead();
}
