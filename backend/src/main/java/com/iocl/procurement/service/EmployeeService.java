package com.iocl.procurement.service;

import com.iocl.procurement.dto.request.EmployeeRequestDTO;
import com.iocl.procurement.dto.response.EmployeePageResponse;
import com.iocl.procurement.dto.response.EmployeeResponseDTO;
import com.iocl.procurement.dto.response.EmployeeSummaryDTO;
import com.iocl.procurement.dto.response.UserDirectoryDTO;

import java.util.List;

public interface EmployeeService {

    EmployeeResponseDTO createEmployee(EmployeeRequestDTO request);

    EmployeeResponseDTO updateEmployee(Long id, EmployeeRequestDTO request);

    EmployeeResponseDTO getEmployeeById(Long id);

    EmployeeResponseDTO toggleEmployeeStatus(Long id, String status);

    EmployeePageResponse searchEmployees(
            String search,
            String department,
            String designation,
            String status,
            String location,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    EmployeeSummaryDTO getEmployeeSummary();

    List<UserDirectoryDTO> searchActiveBeneficiaries(String query);
}
