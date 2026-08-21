package com.iocl.procurement.service;

import com.iocl.procurement.dto.request.AssetUsageRequestDTO;
import com.iocl.procurement.dto.response.AssetUsagePageResponse;
import com.iocl.procurement.dto.response.AssetUsageResponseDTO;
import com.iocl.procurement.dto.response.AssetUsageSummaryDTO;
import com.iocl.procurement.dto.response.UserDirectoryDTO;

import java.time.LocalDate;
import java.util.List;

public interface AssetUsageService {

    AssetUsageResponseDTO recordUsage(String authenticatedUsername, AssetUsageRequestDTO request);

    List<AssetUsageResponseDTO> getUserUsageHistory(String authenticatedUsername);

    AssetUsageResponseDTO getUserUsageById(String authenticatedUsername, Long id);

    List<AssetUsageResponseDTO> getAllUsageForAdmin();

    List<UserDirectoryDTO> searchBeneficiaries(String query);

    AssetUsagePageResponse searchUserUsageHistory(
            String authenticatedUsername,
            String search,
            LocalDate fromDate,
            LocalDate toDate,
            Long cartridgeId,
            String colour,
            String printerId,
            String beneficiaryEmployeeNo,
            String department,
            String status,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    AssetUsageResponseDTO getAdminUsageById(Long id);

    AssetUsagePageResponse searchAllUsageForAdmin(
            String search,
            LocalDate fromDate,
            LocalDate toDate,
            Long cartridgeId,
            String colour,
            String printerId,
            String beneficiaryEmployeeNo,
            String department,
            String status,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    AssetUsagePageResponse searchAllUsageForAdmin(
            String search,
            LocalDate fromDate,
            LocalDate toDate,
            Long cartridgeId,
            String partNumber,
            String engineer,
            String beneficiary,
            String department,
            String location,
            String colour,
            String printerId,
            String status,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    AssetUsageSummaryDTO getUsageSummary(String authenticatedUsername);

    AssetUsageSummaryDTO getAdminUsageSummary();

    byte[] exportAdminUsageToCsv(
            String search,
            LocalDate fromDate,
            LocalDate toDate,
            Long cartridgeId,
            String partNumber,
            String engineer,
            String beneficiary,
            String department,
            String location
    );
}
