package com.iocl.procurement.controller;

import com.iocl.procurement.dto.response.FullViewPageResponse;
import com.iocl.procurement.dto.response.FullViewRecordResponse;
import com.iocl.procurement.service.FullViewService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/procurement/full-view")
public class FullViewController {

    private final FullViewService fullViewService;

    public FullViewController(FullViewService fullViewService) {
        this.fullViewService = fullViewService;
    }

    /**
     * READ-ONLY Full View of Procurement Records.
     * Supports search, filtering, pagination, and sorting.
     * Protected by JWT Security.
     */
    @GetMapping
    public ResponseEntity<FullViewPageResponse> getFullViewRecords(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String supplier,
            @RequestParam(required = false) String cartridge,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "contractDate,desc") String sort
    ) {
        String[] sortParams = sort.split(",");
        String sortProperty = sortParams[0];
        Sort.Direction direction = (sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        // Prevent unsafe sorting properties
        if (!sortProperty.equalsIgnoreCase("contractDate") &&
            !sortProperty.equalsIgnoreCase("supplierName") &&
            !sortProperty.equalsIgnoreCase("totalContractQuantity") &&
            !sortProperty.equalsIgnoreCase("id")) {
            sortProperty = "contractDate";
        }

        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(direction, sortProperty));

        FullViewPageResponse response = fullViewService.getFullViewRecords(
                search, supplier, cartridge, status, fromDate, toDate, pageable
        );

        return ResponseEntity.ok(response);
    }

    /**
     * READ-ONLY single procurement record details by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<FullViewRecordResponse> getFullViewRecordById(@PathVariable Long id) {
        FullViewRecordResponse response = fullViewService.getFullViewRecordById(id);
        return ResponseEntity.ok(response);
    }
}
