package com.iocl.procurement.service.impl;

import com.iocl.procurement.dto.request.EmployeeRequestDTO;
import com.iocl.procurement.dto.response.EmployeePageResponse;
import com.iocl.procurement.dto.response.EmployeeResponseDTO;
import com.iocl.procurement.dto.response.EmployeeSummaryDTO;
import com.iocl.procurement.dto.response.UserDirectoryDTO;
import com.iocl.procurement.entity.Employee;
import com.iocl.procurement.entity.EmployeeStatus;
import com.iocl.procurement.exception.AppException;
import com.iocl.procurement.repository.EmployeeRepository;
import com.iocl.procurement.service.EmployeeService;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class EmployeeServiceImpl implements EmployeeService {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeServiceImpl.class);

    private final EmployeeRepository employeeRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional
    public EmployeeResponseDTO createEmployee(EmployeeRequestDTO request) {
        if (request == null) {
            throw new AppException("Employee data cannot be null.", HttpStatus.BAD_REQUEST);
        }

        String empNo = request.getResolvedEmployeeNumber();
        if (empNo == null || empNo.trim().isEmpty()) {
            throw new AppException("Employee Number is required.", HttpStatus.BAD_REQUEST);
        }

        // Duplicate Employee Number check
        if (employeeRepository.existsByEmployeeNumberIgnoreCase(empNo.trim())) {
            throw new AppException(
                    "Employee with Employee Number [" + empNo.trim() + "] already exists in the system.",
                    HttpStatus.CONFLICT
            );
        }

        String empName = request.getResolvedEmployeeName();
        if (empName == null || empName.trim().isEmpty()) {
            throw new AppException("Employee Name is required.", HttpStatus.BAD_REQUEST);
        }

        String dept = request.getDepartment();
        if (dept == null || dept.trim().isEmpty()) {
            throw new AppException("Department is required.", HttpStatus.BAD_REQUEST);
        }

        String email = request.getEmail();
        if (email != null && !email.trim().isEmpty()) {
            email = email.trim().toLowerCase();
            if (!email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
                throw new AppException("Please enter a valid email address.", HttpStatus.BAD_REQUEST);
            }
        }

        EmployeeStatus status = EmployeeStatus.ACTIVE;
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            EmployeeStatus parsed = EmployeeStatus.fromString(request.getStatus());
            if (parsed != null) {
                status = parsed;
            }
        }

        Employee employee = new Employee();
        employee.setEmployeeNumber(empNo.trim());
        employee.setFullName(empName.trim());
        employee.setEmail(email);
        employee.setDepartment(dept.trim());
        employee.setDesignation(request.getDesignation() != null ? request.getDesignation().trim() : null);
        employee.setGd(request.getGd() != null ? request.getGd().trim() : null);
        employee.setCabinNumber(request.getResolvedCabinNumber());
        employee.setSeatNumber(request.getSeatNumber() != null ? request.getSeatNumber().trim() : null);
        employee.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        employee.setPrinterName(request.getResolvedPrinterName());
        employee.setPrinterSerialNumber(request.getPrinterSerialNumber() != null ? request.getPrinterSerialNumber().trim() : null);
        employee.setPrinterType(request.getPrinterType() != null ? request.getPrinterType().trim() : null);
        employee.setStatus(status);
        employee.setRemarks(request.getRemarks() != null ? request.getRemarks().trim() : null);

        Employee saved = employeeRepository.save(employee);
        logger.info("Successfully created employee record for [{} - {}]", saved.getEmployeeNumber(), saved.getFullName());
        return new EmployeeResponseDTO(saved);
    }

    @Override
    @Transactional
    public EmployeeResponseDTO updateEmployee(Long id, EmployeeRequestDTO request) {
        if (id == null) {
            throw new AppException("Employee ID is required.", HttpStatus.BAD_REQUEST);
        }
        if (request == null) {
            throw new AppException("Employee update data cannot be null.", HttpStatus.BAD_REQUEST);
        }

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new AppException("Employee not found with ID: " + id, HttpStatus.NOT_FOUND));

        String empNo = request.getResolvedEmployeeNumber();
        if (empNo != null && !empNo.trim().isEmpty() && !empNo.trim().equalsIgnoreCase(employee.getEmployeeNumber())) {
            // If changing employee number, verify uniqueness
            if (employeeRepository.existsByEmployeeNumberIgnoreCaseAndIdNot(empNo.trim(), id)) {
                throw new AppException(
                        "Another employee with Employee Number [" + empNo.trim() + "] already exists.",
                        HttpStatus.CONFLICT
                );
            }
            employee.setEmployeeNumber(empNo.trim());
        }

        String empName = request.getResolvedEmployeeName();
        if (empName != null && !empName.trim().isEmpty()) {
            employee.setFullName(empName.trim());
        }

        String dept = request.getDepartment();
        if (dept != null && !dept.trim().isEmpty()) {
            employee.setDepartment(dept.trim());
        }

        String email = request.getEmail();
        if (email != null && !email.trim().isEmpty()) {
            email = email.trim().toLowerCase();
            if (!email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
                throw new AppException("Please enter a valid email address.", HttpStatus.BAD_REQUEST);
            }
            employee.setEmail(email);
        }

        if (request.getDesignation() != null) {
            employee.setDesignation(request.getDesignation().trim());
        }
        if (request.getGd() != null) {
            employee.setGd(request.getGd().trim());
        }
        if (request.getResolvedCabinNumber() != null) {
            employee.setCabinNumber(request.getResolvedCabinNumber());
        }
        if (request.getSeatNumber() != null) {
            employee.setSeatNumber(request.getSeatNumber().trim());
        }
        if (request.getLocation() != null) {
            employee.setLocation(request.getLocation().trim());
        }
        if (request.getResolvedPrinterName() != null) {
            employee.setPrinterName(request.getResolvedPrinterName());
        }
        if (request.getPrinterSerialNumber() != null) {
            employee.setPrinterSerialNumber(request.getPrinterSerialNumber().trim());
        }
        if (request.getPrinterType() != null) {
            employee.setPrinterType(request.getPrinterType().trim());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            EmployeeStatus parsed = EmployeeStatus.fromString(request.getStatus());
            if (parsed != null) {
                employee.setStatus(parsed);
            }
        }
        if (request.getRemarks() != null) {
            employee.setRemarks(request.getRemarks().trim());
        }

        Employee updated = employeeRepository.save(employee);
        logger.info("Successfully updated employee record [ID: {} - {}]", updated.getId(), updated.getEmployeeNumber());
        return new EmployeeResponseDTO(updated);
    }

    @Override
    public EmployeeResponseDTO getEmployeeById(Long id) {
        if (id == null) {
            throw new AppException("Employee ID cannot be null.", HttpStatus.BAD_REQUEST);
        }
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new AppException("Employee record not found with ID: " + id, HttpStatus.NOT_FOUND));
        return new EmployeeResponseDTO(employee);
    }

    @Override
    @Transactional
    public EmployeeResponseDTO toggleEmployeeStatus(Long id, String status) {
        if (id == null) {
            throw new AppException("Employee ID cannot be null.", HttpStatus.BAD_REQUEST);
        }

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new AppException("Employee not found with ID: " + id, HttpStatus.NOT_FOUND));

        EmployeeStatus newStatus = EmployeeStatus.fromString(status);
        if (newStatus == null) {
            // If null, toggle the existing status
            newStatus = employee.getStatus() == EmployeeStatus.ACTIVE ? EmployeeStatus.INACTIVE : EmployeeStatus.ACTIVE;
        }

        employee.setStatus(newStatus);
        Employee saved = employeeRepository.save(employee);
        logger.info("Employee [ID: {} - {}] status toggled to [{}]", saved.getId(), saved.getEmployeeNumber(), newStatus);
        return new EmployeeResponseDTO(saved);
    }

    @Override
    public EmployeePageResponse searchEmployees(
            String search,
            String department,
            String designation,
            String status,
            String location,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        validatePagination(page, size);
        Sort sort = buildSort(sortBy, sortDir);
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Employee> spec = buildEmployeeSpecification(search, department, designation, status, location);
        Page<Employee> empPage = employeeRepository.findAll(spec, pageable);

        List<EmployeeResponseDTO> content = empPage.getContent().stream()
                .map(EmployeeResponseDTO::new)
                .collect(Collectors.toList());

        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long totalDepartments = employeeRepository.countDistinctDepartments();
        long employeesWithPrinters = employeeRepository.countEmployeesWithPrinters();

        return new EmployeePageResponse(
                content,
                empPage.getNumber(),
                empPage.getSize(),
                empPage.getTotalElements(),
                empPage.getTotalPages(),
                empPage.isFirst(),
                empPage.isLast(),
                totalEmployees,
                activeEmployees,
                totalDepartments,
                employeesWithPrinters
        );
    }

    @Override
    public EmployeeSummaryDTO getEmployeeSummary() {
        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long totalDepartments = employeeRepository.countDistinctDepartments();
        long employeesWithPrinters = employeeRepository.countEmployeesWithPrinters();

        return new EmployeeSummaryDTO(
                totalEmployees,
                activeEmployees,
                totalDepartments,
                employeesWithPrinters
        );
    }

    @Override
    public List<UserDirectoryDTO> searchActiveBeneficiaries(String query) {
        if (query == null || query.trim().isEmpty()) {
            return employeeRepository.findByStatusOrderByFullNameAsc(EmployeeStatus.ACTIVE)
                    .stream()
                    .map(UserDirectoryDTO::new)
                    .collect(Collectors.toList());
        }
        String trimmed = query.trim();
        return employeeRepository.searchActiveEmployees(trimmed, EmployeeStatus.ACTIVE)
                .stream()
                .map(UserDirectoryDTO::new)
                .collect(Collectors.toList());
    }

    // Helper Methods

    private void validatePagination(int page, int size) {
        if (page < 0) {
            throw new AppException("Page index cannot be negative.", HttpStatus.BAD_REQUEST);
        }
        if (size <= 0 || size > 100) {
            throw new AppException("Page size must be between 1 and 100.", HttpStatus.BAD_REQUEST);
        }
    }

    private Sort buildSort(String sortBy, String sortDir) {
        String field = "employeeNumber";
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            String candidate = sortBy.trim();
            if (candidate.equalsIgnoreCase("employeeNumber") || candidate.equalsIgnoreCase("employeeId")
                    || candidate.equalsIgnoreCase("fullName") || candidate.equalsIgnoreCase("employeeName")
                    || candidate.equalsIgnoreCase("department") || candidate.equalsIgnoreCase("designation")
                    || candidate.equalsIgnoreCase("status") || candidate.equalsIgnoreCase("createdAt")
                    || candidate.equalsIgnoreCase("location") || candidate.equalsIgnoreCase("id")) {
                if (candidate.equalsIgnoreCase("employeeId")) field = "employeeNumber";
                else if (candidate.equalsIgnoreCase("employeeName")) field = "fullName";
                else field = candidate;
            } else {
                throw new AppException("Invalid sort field: '" + sortBy + "'. Allowed: employeeNumber, fullName, department, designation, status, createdAt, location, id", HttpStatus.BAD_REQUEST);
            }
        }

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return Sort.by(direction, field).and(Sort.by(Sort.Direction.ASC, "id"));
    }

    private Specification<Employee> buildEmployeeSpecification(
            String search,
            String department,
            String designation,
            String status,
            String location
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. General search query across key text fields
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate searchPred = cb.or(
                        cb.like(cb.lower(root.get("employeeNumber")), pattern),
                        cb.like(cb.lower(root.get("fullName")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("department")), pattern),
                        cb.like(cb.lower(root.get("designation")), pattern),
                        cb.like(cb.lower(root.get("gd")), pattern),
                        cb.like(cb.lower(root.get("cabinNumber")), pattern),
                        cb.like(cb.lower(root.get("seatNumber")), pattern),
                        cb.like(cb.lower(root.get("location")), pattern),
                        cb.like(cb.lower(root.get("printerName")), pattern),
                        cb.like(cb.lower(root.get("printerSerialNumber")), pattern),
                        cb.like(cb.lower(root.get("remarks")), pattern)
                );
                predicates.add(searchPred);
            }

            // 2. Department filter
            if (department != null && !department.trim().isEmpty() && !"ALL".equalsIgnoreCase(department.trim()) && !"All Departments".equalsIgnoreCase(department.trim())) {
                predicates.add(cb.equal(
                        cb.upper(root.get("department")),
                        department.trim().toUpperCase()
                ));
            }

            // 3. Designation filter
            if (designation != null && !designation.trim().isEmpty() && !"ALL".equalsIgnoreCase(designation.trim())) {
                predicates.add(cb.like(
                        cb.lower(root.get("designation")),
                        "%" + designation.trim().toLowerCase() + "%"
                ));
            }

            // 4. Status filter
            if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim())) {
                EmployeeStatus parsed = EmployeeStatus.fromString(status);
                if (parsed != null) {
                    predicates.add(cb.equal(root.get("status"), parsed));
                }
            }

            // 5. Location filter
            if (location != null && !location.trim().isEmpty() && !"ALL".equalsIgnoreCase(location.trim()) && !"All Locations".equalsIgnoreCase(location.trim())) {
                predicates.add(cb.like(
                        cb.lower(root.get("location")),
                        "%" + location.trim().toLowerCase() + "%"
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
