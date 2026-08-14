package com.iocl.procurement.service;

import com.iocl.procurement.dto.request.UpdateThresholdRequest;
import com.iocl.procurement.dto.response.CartridgeThresholdResponse;

import java.util.List;

public interface ThresholdService {

    List<CartridgeThresholdResponse> getAllThresholds();

    CartridgeThresholdResponse getThresholdByCartridgeId(Long cartridgeId);

    CartridgeThresholdResponse updateThreshold(Long cartridgeId, UpdateThresholdRequest request);
}
