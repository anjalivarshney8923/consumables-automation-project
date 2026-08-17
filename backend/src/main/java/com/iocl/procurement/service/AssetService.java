package com.iocl.procurement.service;

import com.iocl.procurement.dto.request.AssetRequest;
import com.iocl.procurement.dto.response.AssetResponse;

import java.util.List;

public interface AssetService {

    AssetResponse createAsset(AssetRequest request);

    AssetResponse updateAsset(Long id, AssetRequest request);

    List<AssetResponse> getAllAssets(String search, String status);

    AssetResponse getAssetById(Long id);
}
