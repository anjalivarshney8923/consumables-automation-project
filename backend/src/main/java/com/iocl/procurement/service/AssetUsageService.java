package com.iocl.procurement.service;

import com.iocl.procurement.dto.request.AssetUsageRequestDTO;
import com.iocl.procurement.dto.response.AssetUsageResponseDTO;

import java.util.List;

public interface AssetUsageService {

    AssetUsageResponseDTO recordUsage(String authenticatedUsername, AssetUsageRequestDTO request);

    List<AssetUsageResponseDTO> getUserUsageHistory(String authenticatedUsername);

    AssetUsageResponseDTO getUserUsageById(String authenticatedUsername, Long id);

    List<AssetUsageResponseDTO> getAllUsageForAdmin();
}
