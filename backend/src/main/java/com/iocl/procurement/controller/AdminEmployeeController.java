package com.iocl.procurement.controller;

import com.iocl.procurement.dto.request.EmployeeRequestDTO;
import com.iocl.procurement.dto.response.EmployeePageResponse;
import com.iocl.procurement.dto.response.EmployeeResponseDTO;
import com.iocl.procurement.dto.response.EmployeeSummaryDTO;
import com.iocl.procurement.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/employees")
@PreAuthorize("hasRole('ADMIN')")
public class AdminEmployeeController {

    private final EmployeeService employeeService;

    public AdminEmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    /**
     * Get paginated, filtered, and sorted Employee list for Admin Employee Master.
     * GET /api/admin/employees
     */
    @GetMapping({"", "/search"})
    public ResponseEntity<EmployeePageResponse> getEmployees(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "designation", required = false) String designation,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size,
            @RequestParam(value = "sortBy", required = false, defaultValue = "employeeNumber") String sortBy,
            @RequestParam(value = "sortDir", required = false, defaultValue = "asc") String sortDir
    ) {
        EmployeePageResponse response = employeeService.searchEmployees(
                search, department, designation, status, location, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Get summary KPI cards metrics for Employee Master.
     * GET /api/admin/employees/summary
     */
    @GetMapping("/summary")
    public ResponseEntity<EmployeeSummaryDTO> getEmployeeSummary() {
        EmployeeSummaryDTO summary = employeeService.getEmployeeSummary();
        return ResponseEntity.ok(summary);
    }

    /**
     * Get single employee by ID.
     * GET /api/admin/employees/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponseDTO> getEmployeeById(@PathVariable("id") Long id) {
        EmployeeResponseDTO response = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Add new employee to Employee Master.
     * POST /api/admin/employees
     */
    @PostMapping
    public ResponseEntity<EmployeeResponseDTO> createEmployee(@Valid @RequestBody EmployeeRequestDTO request) {
        EmployeeResponseDTO response = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update an existing employee.
     * PUT /api/admin/employees/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponseDTO> updateEmployee(
            @PathVariable("id") Long id,
            @Valid @RequestBody EmployeeRequestDTO request
    ) {
        EmployeeResponseDTO response = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Toggle or update employee active/inactive status.
     * PATCH /api/admin/employees/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<EmployeeResponseDTO> toggleEmployeeStatus(
            @PathVariable("id") Long id,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestParam(value = "status", required = false) String statusParam
    ) {
        String status = statusParam;
        if ((status == null || status.trim().isEmpty()) && body != null && body.containsKey("status")) {
            status = String.valueOf(body.get("status"));
        }

        EmployeeResponseDTO response = employeeService.toggleEmployeeStatus(id, status);
        return ResponseEntity.ok(response);
    }
}
