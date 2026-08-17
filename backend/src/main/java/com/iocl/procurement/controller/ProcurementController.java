package com.iocl.procurement.controller;

import com.iocl.procurement.dto.request.CallUpPORequest;
import com.iocl.procurement.dto.request.RateContractRequest;
import com.iocl.procurement.dto.response.CallUpPOResponse;
import com.iocl.procurement.dto.response.CartridgeResponse;
import com.iocl.procurement.dto.response.RateContractResponse;
import com.iocl.procurement.service.CallUpPOService;
import com.iocl.procurement.service.CartridgeService;
import com.iocl.procurement.service.RateContractService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/procurement")
public class ProcurementController {

    private final CartridgeService cartridgeService;
    private final RateContractService rateContractService;
    private final CallUpPOService callUpPOService;

    public ProcurementController(
            CartridgeService cartridgeService,
            RateContractService rateContractService,
            CallUpPOService callUpPOService
    ) {
        this.cartridgeService = cartridgeService;
        this.rateContractService = rateContractService;
        this.callUpPOService = callUpPOService;
    }

    // ===================================================================
    // Cartridge Reference Data Endpoints
    // ===================================================================

    @GetMapping("/cartridges")
    public ResponseEntity<List<CartridgeResponse>> getAllCartridges() {
        List<CartridgeResponse> cartridges = cartridgeService.getAllActiveCartridges();
        return ResponseEntity.ok(cartridges);
    }

    @GetMapping("/cartridges/{id}")
    public ResponseEntity<CartridgeResponse> getCartridgeById(@PathVariable Long id) {
        CartridgeResponse cartridge = cartridgeService.getCartridgeById(id);
        return ResponseEntity.ok(cartridge);
    }

    // ===================================================================
    // Rate Contract Endpoints
    // ===================================================================

    @PostMapping("/rate-contracts")
    public ResponseEntity<RateContractResponse> createRateContract(
            @Valid @RequestBody RateContractRequest request
    ) {
        RateContractResponse response = rateContractService.createRateContract(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/rate-contracts")
    public ResponseEntity<List<RateContractResponse>> getAllRateContracts() {
        List<RateContractResponse> rateContracts = rateContractService.getAllRateContracts();
        return ResponseEntity.ok(rateContracts);
    }

    @GetMapping("/rate-contracts/{id}")
    public ResponseEntity<com.iocl.procurement.dto.response.RateContractDetailsResponse> getRateContractById(@PathVariable Long id) {
        com.iocl.procurement.dto.response.RateContractDetailsResponse rateContract = rateContractService.getRateContractDetails(id);
        return ResponseEntity.ok(rateContract);
    }

    @GetMapping("/rate-contracts/{id}/call-up-pos")
    public ResponseEntity<List<CallUpPOResponse>> getCallUpPOsByRateContractId(@PathVariable Long id) {
        List<CallUpPOResponse> callUpPOs = rateContractService.getCallUpPOsByRateContractId(id);
        return ResponseEntity.ok(callUpPOs);
    }

    // ===================================================================
    // Call-Up Purchase Order Endpoints
    // ===================================================================

    @PostMapping("/call-up-pos")
    public ResponseEntity<CallUpPOResponse> createCallUpPO(
            @Valid @RequestBody CallUpPORequest request
    ) {
        CallUpPOResponse response = callUpPOService.createCallUpPO(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/call-up-pos")
    public ResponseEntity<List<CallUpPOResponse>> getAllCallUpPOs() {
        List<CallUpPOResponse> callUpPOs = callUpPOService.getAllCallUpPOs();
        return ResponseEntity.ok(callUpPOs);
    }

    @GetMapping("/call-up-pos/{id}")
    public ResponseEntity<CallUpPOResponse> getCallUpPOById(@PathVariable Long id) {
        CallUpPOResponse callUpPO = callUpPOService.getCallUpPOById(id);
        return ResponseEntity.ok(callUpPO);
    }
}
