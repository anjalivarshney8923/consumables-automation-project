package com.iocl.procurement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iocl.procurement.dto.request.EmployeeRequestDTO;
import com.iocl.procurement.entity.*;
import com.iocl.procurement.repository.AdminRepository;
import com.iocl.procurement.repository.EmployeeRepository;
import com.iocl.procurement.repository.UserRepository;
import com.iocl.procurement.security.AdminUserDetails;
import com.iocl.procurement.security.JwtService;
import com.iocl.procurement.security.UserUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AdminEmployeeMasterIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    private String adminToken;
    private String userToken;

    @BeforeEach
    void setUp() {
        employeeRepository.deleteAll();

        // 1. Setup Admin
        Admin admin = adminRepository.findByEmailIgnoreCase("admin@iocl.co.in")
                .orElseGet(() -> {
                    Admin a = new Admin();
                    a.setEmail("admin@iocl.co.in");
                    a.setPassword("$2a$10$dummyHashAdminPassword");
                    a.setName("System Administrator");
                    a.setRole(Role.ADMIN);
                    return adminRepository.save(a);
                });
        adminToken = "Bearer " + jwtService.generateToken(new AdminUserDetails(admin));

        // 2. Setup Non-Admin User (Engineer)
        User engineer = userRepository.findByUsernameIgnoreCase("test.engineer")
                .orElseGet(() -> {
                    User u = new User();
                    u.setUsername("test.engineer");
                    u.setEmail("test.engineer@iocl.co.in");
                    u.setPassword("$2a$10$dummyHashUserPassword");
                    u.setFullName("Test Engineer");
                    u.setEmployeeId("ENG999");
                    u.setDepartment("IT");
                    u.setLocation("Head Office");
                    u.setRole(Role.USER);
                    u.setStatus(UserStatus.ACTIVE);
                    return userRepository.save(u);
                });
        userToken = "Bearer " + jwtService.generateToken(new UserUserDetails(engineer));
    }

    @Test
    @DisplayName("Test 1: Admin can successfully create a new employee")
    void testCreateEmployeeSuccess() throws Exception {
        EmployeeRequestDTO request = new EmployeeRequestDTO();
        request.setEmployeeNumber("93917");
        request.setEmployeeName("Rajesh Kumar");
        request.setEmail("rajesh.kumar@iocl.co.in");
        request.setDepartment("Information Systems");
        request.setDesignation("Senior Engineer");
        request.setGd("Grade E");
        request.setCabinNumber("Cabin-412");
        request.setLocation("Refinery Complex");
        request.setPrinterName("Canon LBP246dw");
        request.setPrinterSerialNumber("CN-SER-41289");
        request.setPrinterType("Black & White");
        request.setStatus("ACTIVE");
        request.setRemarks("Primary floor printer");

        mockMvc.perform(post("/api/admin/employees")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.employeeNumber", is("93917")))
                .andExpect(jsonPath("$.employeeName", is("Rajesh Kumar")))
                .andExpect(jsonPath("$.email", is("rajesh.kumar@iocl.co.in")))
                .andExpect(jsonPath("$.department", is("Information Systems")))
                .andExpect(jsonPath("$.designation", is("Senior Engineer")))
                .andExpect(jsonPath("$.gd", is("Grade E")))
                .andExpect(jsonPath("$.cabinNumber", is("Cabin-412")))
                .andExpect(jsonPath("$.printerName", is("Canon LBP246dw")))
                .andExpect(jsonPath("$.printerSerialNumber", is("CN-SER-41289")))
                .andExpect(jsonPath("$.status", is("ACTIVE")));

        assertTrue(employeeRepository.existsByEmployeeNumberIgnoreCase("93917"));
    }

    @Test
    @DisplayName("Test 2: Duplicate Employee Number is rejected with 409 Conflict")
    void testDuplicateEmployeeNumberRejected() throws Exception {
        // Create initial employee
        Employee existing = new Employee();
        existing.setEmployeeNumber("93917");
        existing.setFullName("Existing Employee");
        existing.setEmail("existing@iocl.co.in");
        existing.setDepartment("Operations");
        existing.setStatus(EmployeeStatus.ACTIVE);
        employeeRepository.save(existing);

        // Attempt to create another employee with same employee number
        EmployeeRequestDTO duplicate = new EmployeeRequestDTO();
        duplicate.setEmployeeNumber("93917");
        duplicate.setEmployeeName("Another Employee");
        duplicate.setEmail("another@iocl.co.in");
        duplicate.setDepartment("IT");

        mockMvc.perform(post("/api/admin/employees")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("93917")));
    }

    @Test
    @DisplayName("Test 3: Update employee successfully updates details without creating duplicates")
    void testUpdateEmployeeSuccess() throws Exception {
        Employee emp = new Employee();
        emp.setEmployeeNumber("93917");
        emp.setFullName("Rajesh Kumar");
        emp.setEmail("rajesh.kumar@iocl.co.in");
        emp.setDepartment("Operations");
        emp.setCabinNumber("Cabin-101");
        emp.setStatus(EmployeeStatus.ACTIVE);
        Employee saved = employeeRepository.save(emp);

        EmployeeRequestDTO updateRequest = new EmployeeRequestDTO();
        updateRequest.setEmployeeNumber("93917");
        updateRequest.setEmployeeName("Rajesh K. Sharma");
        updateRequest.setEmail("rajesh.sharma@iocl.co.in");
        updateRequest.setDepartment("Information Systems");
        updateRequest.setCabinNumber("Admin-505");
        updateRequest.setDesignation("Manager (IS)");
        updateRequest.setPrinterName("HP LaserJet M454dn");
        updateRequest.setPrinterSerialNumber("HP-SER-505");

        mockMvc.perform(put("/api/admin/employees/" + saved.getId())
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(saved.getId().intValue())))
                .andExpect(jsonPath("$.employeeName", is("Rajesh K. Sharma")))
                .andExpect(jsonPath("$.department", is("Information Systems")))
                .andExpect(jsonPath("$.cabinNumber", is("Admin-505")))
                .andExpect(jsonPath("$.designation", is("Manager (IS)")))
                .andExpect(jsonPath("$.printerName", is("HP LaserJet M454dn")));

        assertEquals(1, employeeRepository.count());
    }

    @Test
    @DisplayName("Test 4: Deactivate employee sets status to INACTIVE and preserves record")
    void testDeactivateEmployeePreservesRecord() throws Exception {
        Employee emp = new Employee();
        emp.setEmployeeNumber("93917");
        emp.setFullName("Rajesh Kumar");
        emp.setEmail("rajesh.kumar@iocl.co.in");
        emp.setDepartment("Operations");
        emp.setStatus(EmployeeStatus.ACTIVE);
        Employee saved = employeeRepository.save(emp);

        mockMvc.perform(patch("/api/admin/employees/" + saved.getId() + "/status")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "INACTIVE"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("INACTIVE")));

        Employee reloaded = employeeRepository.findById(saved.getId()).orElseThrow();
        assertEquals(EmployeeStatus.INACTIVE, reloaded.getStatus());
        assertEquals(1, employeeRepository.count());
    }

    @Test
    @DisplayName("Test 5: Search employees by partial name, employee number, department, or cabin")
    void testSearchEmployees() throws Exception {
        createTestEmployee("93917", "Rajesh Kumar", "rajesh@iocl.co.in", "Operations", "Cabin-101", "HP M454", EmployeeStatus.ACTIVE);
        createTestEmployee("93918", "Priya Sharma", "priya@iocl.co.in", "Finance", "Room-202", "Canon 246", EmployeeStatus.ACTIVE);
        createTestEmployee("93919", "Rakesh Verma", "rakesh@iocl.co.in", "Operations", "Plant-303", null, EmployeeStatus.ACTIVE);

        // Search "Raj" -> should match Rajesh Kumar
        mockMvc.perform(get("/api/admin/employees")
                        .header("Authorization", adminToken)
                        .param("search", "Raj"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].employeeName", is("Rajesh Kumar")));

        // Search by Employee Number "93918" -> should match Priya Sharma
        mockMvc.perform(get("/api/admin/employees")
                        .header("Authorization", adminToken)
                        .param("search", "93918"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].employeeName", is("Priya Sharma")));
    }

    @Test
    @DisplayName("Test 6: Filter by Status (ACTIVE vs INACTIVE)")
    void testFilterByStatus() throws Exception {
        createTestEmployee("EMP1", "Active Employee", "act@iocl.co.in", "IT", "C-1", "P-1", EmployeeStatus.ACTIVE);
        createTestEmployee("EMP2", "Inactive Employee", "inact@iocl.co.in", "IT", "C-2", "P-2", EmployeeStatus.INACTIVE);

        // Filter ACTIVE
        mockMvc.perform(get("/api/admin/employees")
                        .header("Authorization", adminToken)
                        .param("status", "ACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].employeeNumber", is("EMP1")));

        // Filter INACTIVE
        mockMvc.perform(get("/api/admin/employees")
                        .header("Authorization", adminToken)
                        .param("status", "INACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].employeeNumber", is("EMP2")));
    }

    @Test
    @DisplayName("Test 7: Filter by Department")
    void testFilterByDepartment() throws Exception {
        createTestEmployee("EMP10", "Dev One", "dev1@iocl.co.in", "Information Systems", "C-1", null, EmployeeStatus.ACTIVE);
        createTestEmployee("EMP20", "Ops One", "ops1@iocl.co.in", "Operations", "C-2", null, EmployeeStatus.ACTIVE);

        mockMvc.perform(get("/api/admin/employees")
                        .header("Authorization", adminToken)
                        .param("department", "Information Systems"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].employeeNumber", is("EMP10")));
    }

    @Test
    @DisplayName("Test 8: Pagination and Sorting")
    void testPaginationAndSorting() throws Exception {
        for (int i = 1; i <= 25; i++) {
            String padded = String.format("%03d", i);
            createTestEmployee("EMP" + padded, "Employee " + padded, "emp" + padded + "@iocl.co.in", "IT", "Room-" + i, null, EmployeeStatus.ACTIVE);
        }

        // Page 0, Size 10
        mockMvc.perform(get("/api/admin/employees")
                        .header("Authorization", adminToken)
                        .param("page", "0")
                        .param("size", "10")
                        .param("sortBy", "employeeNumber")
                        .param("sortDir", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(25)))
                .andExpect(jsonPath("$.totalPages", is(3)))
                .andExpect(jsonPath("$.content", hasSize(10)))
                .andExpect(jsonPath("$.content[0].employeeNumber", is("EMP001")))
                .andExpect(jsonPath("$.first", is(true)))
                .andExpect(jsonPath("$.last", is(false)));

        // Page 2 (last page), Size 10
        mockMvc.perform(get("/api/admin/employees")
                        .header("Authorization", adminToken)
                        .param("page", "2")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.last", is(true)));
    }

    @Test
    @DisplayName("Test 9: Summary API returns accurate enterprise KPI metrics")
    void testSummaryAPI() throws Exception {
        createTestEmployee("EMP1", "Emp 1", "e1@iocl.co.in", "Information Systems", "C-1", "Canon 246", EmployeeStatus.ACTIVE);
        createTestEmployee("EMP2", "Emp 2", "e2@iocl.co.in", "Information Systems", "C-2", "HP M454", EmployeeStatus.ACTIVE);
        createTestEmployee("EMP3", "Emp 3", "e3@iocl.co.in", "Operations", "C-3", null, EmployeeStatus.ACTIVE);
        createTestEmployee("EMP4", "Emp 4", "e4@iocl.co.in", "Finance", "C-4", null, EmployeeStatus.INACTIVE);

        mockMvc.perform(get("/api/admin/employees/summary")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEmployees", is(4)))
                .andExpect(jsonPath("$.activeEmployees", is(3)))
                .andExpect(jsonPath("$.totalDepartments", is(3))) // IS, Operations, Finance
                .andExpect(jsonPath("$.employeesWithPrinters", is(2))); // EMP1, EMP2
    }

    @Test
    @DisplayName("Test 10: Security authorization checks")
    void testSecurityAuthorization() throws Exception {
        // Unauthenticated -> 401 Unauthorized
        mockMvc.perform(get("/api/admin/employees"))
                .andExpect(status().isUnauthorized());

        // Non-Admin User (Engineer) -> 403 Forbidden
        mockMvc.perform(get("/api/admin/employees")
                        .header("Authorization", userToken))
                .andExpect(status().isForbidden());

        // Non-Admin User cannot create employee -> 403 Forbidden
        EmployeeRequestDTO req = new EmployeeRequestDTO();
        req.setEmployeeNumber("EMP999");
        req.setEmployeeName("Unauthorized");
        req.setEmail("unauth@iocl.co.in");
        req.setDepartment("IT");

        mockMvc.perform(post("/api/admin/employees")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    private Employee createTestEmployee(
            String empNo,
            String name,
            String email,
            String dept,
            String cabin,
            String printer,
            EmployeeStatus status
    ) {
        Employee emp = new Employee();
        emp.setEmployeeNumber(empNo);
        emp.setFullName(name);
        emp.setEmail(email);
        emp.setDepartment(dept);
        emp.setCabinNumber(cabin);
        emp.setPrinterName(printer);
        emp.setPrinterSerialNumber(printer != null ? "SN-" + empNo : null);
        emp.setStatus(status);
        return employeeRepository.save(emp);
    }
}
