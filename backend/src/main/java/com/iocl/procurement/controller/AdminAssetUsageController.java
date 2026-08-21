package com.iocl.procurement.controller;

import com.iocl.procurement.dto.response.AssetUsagePageResponse;
import com.iocl.procurement.dto.response.AssetUsageResponseDTO;
import com.iocl.procurement.dto.response.AssetUsageSummaryDTO;
import com.iocl.procurement.service.AssetUsageService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Dedicated Admin Controller for Asset Usage History.
 * Provides a read-only audit view of all consumable usages across the enterprise.
 * Base path: /api/admin/asset-usage
 */
@RestController
@RequestMapping("/api/admin/asset-usage")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAssetUsageController {

    private final AssetUsageService assetUsageService;

    public AdminAssetUsageController(AssetUsageService assetUsageService) {
        this.assetUsageService = assetUsageService;
    }

    /**
     * Get paginated, sorted, and filtered Asset Usage History for Admin Audit.
     * GET /api/admin/asset-usage/history
     */
    @GetMapping({"/history", "/search", ""})
    public ResponseEntity<AssetUsagePageResponse> getAdminAssetUsageHistory(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(value = "cartridgeId", required = false) Long cartridgeId,
            @RequestParam(value = "partNumber", required = false) String partNumber,
            @RequestParam(value = "engineer", required = false) String engineer,
            @RequestParam(value = "beneficiary", required = false) String beneficiary,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "colour", required = false) String colour,
            @RequestParam(value = "printerId", required = false) String printerId,
            @RequestParam(value = "beneficiaryEmployeeNo", required = false) String beneficiaryEmployeeNo,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size,
            @RequestParam(value = "sortBy", required = false, defaultValue = "usageDate") String sortBy,
            @RequestParam(value = "sortDir", required = false, defaultValue = "desc") String sortDir
    ) {
        String effectiveBeneficiary = beneficiary != null && !beneficiary.trim().isEmpty() ? beneficiary : beneficiaryEmployeeNo;

        AssetUsagePageResponse pageResponse = assetUsageService.searchAllUsageForAdmin(
                search, fromDate, toDate, cartridgeId, partNumber, engineer, effectiveBeneficiary,
                department, location, colour, printerId, status, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(pageResponse);
    }

    /**
     * Get high-level summary KPIs (Total Records, Total Quantity, Total Engineers, Total Beneficiaries).
     * GET /api/admin/asset-usage/summary
     */
    @GetMapping("/summary")
    public ResponseEntity<AssetUsageSummaryDTO> getAdminUsageSummary() {
        AssetUsageSummaryDTO summary = assetUsageService.getAdminUsageSummary();
        return ResponseEntity.ok(summary);
    }

    /**
     * Get single Asset Usage record details by ID.
     * GET /api/admin/asset-usage/{id} or /api/admin/asset-usage/history/{id}
     */
    @GetMapping({"/{id}", "/history/{id}"})
    public ResponseEntity<AssetUsageResponseDTO> getAdminUsageById(@PathVariable("id") Long id) {
        AssetUsageResponseDTO response = assetUsageService.getAdminUsageById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Export usage records to CSV.
     * GET /api/admin/asset-usage/export
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportAdminUsageToCsv(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(value = "cartridgeId", required = false) Long cartridgeId,
            @RequestParam(value = "partNumber", required = false) String partNumber,
            @RequestParam(value = "engineer", required = false) String engineer,
            @RequestParam(value = "beneficiary", required = false) String beneficiary,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "location", required = false) String location
    ) {
        byte[] csvBytes = assetUsageService.exportAdminUsageToCsv(
                search, fromDate, toDate, cartridgeId, partNumber, engineer, beneficiary, department, location
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"asset_usage_history.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}
