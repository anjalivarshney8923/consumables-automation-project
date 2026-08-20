package com.iocl.procurement.controller;

import com.iocl.procurement.dto.request.AssetUsageRequestDTO;
import com.iocl.procurement.dto.response.AssetUsageResponseDTO;
import com.iocl.procurement.service.AssetUsageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/user/asset-usage")
public class AssetUsageController {

    private final AssetUsageService assetUsageService;

    public AssetUsageController(AssetUsageService assetUsageService) {
        this.assetUsageService = assetUsageService;
    }

    /**
     * Record a new cartridge / asset consumable usage transaction for the authenticated user.
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
     * Get usage history for the currently authenticated user (User data isolation).
     * GET /api/user/asset-usage
     */
    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<AssetUsageResponseDTO>> getUserUsageHistory(Principal principal) {
        String username = principal != null ? principal.getName() : null;
        List<AssetUsageResponseDTO> history = assetUsageService.getUserUsageHistory(username);
        return ResponseEntity.ok(history);
    }

    /**
     * Get a single usage record by ID for the authenticated user.
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
     * Admin endpoint to inspect all usage transactions across the enterprise.
     * GET /api/user/asset-usage/admin/all
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AssetUsageResponseDTO>> getAllUsageForAdmin() {
        List<AssetUsageResponseDTO> allUsage = assetUsageService.getAllUsageForAdmin();
        return ResponseEntity.ok(allUsage);
    }
}
