package com.iocl.procurement.controller;

import com.iocl.procurement.dto.request.UpdateThresholdRequest;
import com.iocl.procurement.dto.response.CartridgeThresholdResponse;
import com.iocl.procurement.service.ThresholdService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/thresholds")
public class ThresholdController {

    private final ThresholdService thresholdService;

    public ThresholdController(ThresholdService thresholdService) {
        this.thresholdService = thresholdService;
    }

    @GetMapping
    public ResponseEntity<List<CartridgeThresholdResponse>> getAllThresholds() {
        List<CartridgeThresholdResponse> thresholds = thresholdService.getAllThresholds();
        return ResponseEntity.ok(thresholds);
    }

    @GetMapping("/{cartridgeId}")
    public ResponseEntity<CartridgeThresholdResponse> getThresholdByCartridgeId(@PathVariable Long cartridgeId) {
        CartridgeThresholdResponse response = thresholdService.getThresholdByCartridgeId(cartridgeId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{cartridgeId}")
    public ResponseEntity<CartridgeThresholdResponse> updateThreshold(
            @PathVariable Long cartridgeId,
            @Valid @RequestBody UpdateThresholdRequest request
    ) {
        CartridgeThresholdResponse response = thresholdService.updateThreshold(cartridgeId, request);
        return ResponseEntity.ok(response);
    }
}
