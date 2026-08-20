package com.iocl.procurement.controller;

import com.iocl.procurement.dto.request.AssetUsageRequestDTO;
import com.iocl.procurement.dto.response.AssetUsagePageResponse;
import com.iocl.procurement.dto.response.AssetUsageResponseDTO;
import com.iocl.procurement.dto.response.AssetUsageSummaryDTO;
import com.iocl.procurement.dto.response.UserDirectoryDTO;
import com.iocl.procurement.service.AssetUsageService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/user/asset-usage")
public class AssetUsageController {

    private final AssetUsageService assetUsageService;

    public AssetUsageController(AssetUsageService assetUsageService) {
        this.assetUsageService = assetUsageService;
    }

    /**
     * Record a new cartridge / asset consumable usage transaction.
     * Authenticated engineer identity is obtained authoritatively from JWT.
     * POST /api/user/asset-usage
     */
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<AssetUsageResponseDTO> recordUsage(
            @Valid @RequestBody AssetUsageRequestDTO request,
            Principal principal
    ) {
        String username = principal != null ? principal.getName() : null;
        AssetUsageResponseDTO response = assetUsageService.recordUsage(username, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get usage history recorded by the currently authenticated engineer.
     * Supports dynamic multi-criteria search, date filtering, pagination, and sorting.
     * GET /api/user/asset-usage
     */
    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserUsageHistory(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(value = "cartridgeId", required = false) Long cartridgeId,
            @RequestParam(value = "colour", required = false) String colour,
            @RequestParam(value = "printerId", required = false) String printerId,
            @RequestParam(value = "beneficiaryEmployeeNo", required = false) String beneficiaryEmployeeNo,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size,
            @RequestParam(value = "sortBy", required = false, defaultValue = "usageDate") String sortBy,
            @RequestParam(value = "sortDir", required = false, defaultValue = "desc") String sortDir,
            Principal principal
    ) {
        String username = principal != null ? principal.getName() : null;

        // If pagination or filter parameters are passed, return structured AssetUsagePageResponse
        if (page != null || size != null || (search != null && !search.trim().isEmpty())
                || fromDate != null || toDate != null || cartridgeId != null || (colour != null && !colour.trim().isEmpty())
                || (printerId != null && !printerId.trim().isEmpty())
                || (beneficiaryEmployeeNo != null && !beneficiaryEmployeeNo.trim().isEmpty())
                || (department != null && !department.trim().isEmpty())) {

            int pageIndex = page != null ? page : 0;
            int pageSize = size != null ? size : 10;

            AssetUsagePageResponse pageResponse = assetUsageService.searchUserUsageHistory(
                    username, search, fromDate, toDate, cartridgeId, colour, printerId,
                    beneficiaryEmployeeNo, department, status, pageIndex, pageSize, sortBy, sortDir
            );
            return ResponseEntity.ok(pageResponse);
        }

        // Backward compatibility: unparameterized call returns List<AssetUsageResponseDTO>
        List<AssetUsageResponseDTO> history = assetUsageService.getUserUsageHistory(username);
        return ResponseEntity.ok(history);
    }

    /**
     * Explicit paginated endpoint for Asset Usage History.
     * GET /api/user/asset-usage/paged
     */
    @GetMapping("/paged")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<AssetUsagePageResponse> getUserUsageHistoryPaged(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(value = "cartridgeId", required = false) Long cartridgeId,
            @RequestParam(value = "colour", required = false) String colour,
            @RequestParam(value = "printerId", required = false) String printerId,
            @RequestParam(value = "beneficiaryEmployeeNo", required = false) String beneficiaryEmployeeNo,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size,
            @RequestParam(value = "sortBy", required = false, defaultValue = "usageDate") String sortBy,
            @RequestParam(value = "sortDir", required = false, defaultValue = "desc") String sortDir,
            Principal principal
    ) {
        String username = principal != null ? principal.getName() : null;
        AssetUsagePageResponse pageResponse = assetUsageService.searchUserUsageHistory(
                username, search, fromDate, toDate, cartridgeId, colour, printerId,
                beneficiaryEmployeeNo, department, status, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(pageResponse);
    }

    /**
     * Get summary metrics for the authenticated user's usage history.
     * GET /api/user/asset-usage/summary
     */
    @GetMapping("/summary")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<AssetUsageSummaryDTO> getUsageSummary(Principal principal) {
        String username = principal != null ? principal.getName() : null;
        AssetUsageSummaryDTO summary = assetUsageService.getUsageSummary(username);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get a single usage record by ID for the authenticated engineer.
     * Enforces user authorization.
     * GET /api/user/asset-usage/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<AssetUsageResponseDTO> getUserUsageById(
            @PathVariable("id") Long id,
            Principal principal
    ) {
        String username = principal != null ? principal.getName() : null;
        AssetUsageResponseDTO response = assetUsageService.getUserUsageById(username, id);
        return ResponseEntity.ok(response);
    }

    /**
     * Search beneficiary employees from the active company directory.
     * GET /api/user/asset-usage/beneficiaries/search?query=
     */
    @GetMapping("/beneficiaries/search")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<UserDirectoryDTO>> searchBeneficiaries(
            @RequestParam(value = "query", required = false) String query
    ) {
        List<UserDirectoryDTO> results = assetUsageService.searchBeneficiaries(query);
        return ResponseEntity.ok(results);
    }

    /**
     * Admin endpoint to inspect all usage transactions across the enterprise.
     * GET /api/user/asset-usage/admin/all
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AssetUsageResponseDTO>> getAllUsageForAdmin() {
        List<AssetUsageResponseDTO> allUsage = assetUsageService.getAllUsageForAdmin();
        return ResponseEntity.ok(allUsage);
    }

    /**
     * Admin endpoint for paginated enterprise-wide usage transactions.
     * GET /api/user/asset-usage/admin/paged
     */
    @GetMapping("/admin/paged")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssetUsagePageResponse> getAllUsageForAdminPaged(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(value = "cartridgeId", required = false) Long cartridgeId,
            @RequestParam(value = "colour", required = false) String colour,
            @RequestParam(value = "printerId", required = false) String printerId,
            @RequestParam(value = "beneficiaryEmployeeNo", required = false) String beneficiaryEmployeeNo,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size,
            @RequestParam(value = "sortBy", required = false, defaultValue = "usageDate") String sortBy,
            @RequestParam(value = "sortDir", required = false, defaultValue = "desc") String sortDir
    ) {
        AssetUsagePageResponse pageResponse = assetUsageService.searchAllUsageForAdmin(
                search, fromDate, toDate, cartridgeId, colour, printerId,
                beneficiaryEmployeeNo, department, status, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(pageResponse);
    }

    /**
     * Admin endpoint for enterprise-wide usage summary metrics.
     * GET /api/user/asset-usage/admin/summary
     */
    @GetMapping("/admin/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssetUsageSummaryDTO> getAdminUsageSummary() {
        AssetUsageSummaryDTO summary = assetUsageService.getAdminUsageSummary();
        return ResponseEntity.ok(summary);
    }
}
