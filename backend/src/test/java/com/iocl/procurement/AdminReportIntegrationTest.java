package com.iocl.procurement;

import com.iocl.procurement.dto.report.ReportType;
import com.iocl.procurement.entity.*;
import com.iocl.procurement.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AdminReportIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProcurementAlertRepository alertRepository;

    @Autowired
    private CartridgeThresholdRepository thresholdRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private CartridgeRepository cartridgeRepository;

    @Autowired
    private RateContractRepository rateContractRepository;

    @Autowired
    private CallUpPurchaseOrderRepository callUpPORepository;

    @Autowired
    private AssetUsageRepository assetUsageRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Cartridge testCartridge;
    private RateContract testRateContract;
    private CallUpPurchaseOrder testPO;
    private User testUser;
    private AssetUsage testUsage;
    private Employee testEmployee;

    @BeforeEach
    void setUp() {
        alertRepository.deleteAll();
        thresholdRepository.deleteAll();
        assetUsageRepository.deleteAll();
        callUpPORepository.deleteAll();
        rateContractRepository.deleteAll();
        assetRepository.deleteAll();
        employeeRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Get or Create Test Cartridge
        testCartridge = cartridgeRepository.findByPartNumberIgnoreCase("070-BLK")
                .orElseGet(() -> {
                    Cartridge c = new Cartridge();
                    c.setPartNumber("070-BLK");
                    c.setCartridgeName("Canon 070 Black");
                    c.setPrinterName("Canon LBP246dw");
                    c.setNumberOfPrinters(5);
                    return c;
                });
        testCartridge.setStoreQuantity(150);
        testCartridge.setActive(true);
        testCartridge = cartridgeRepository.save(testCartridge);

        // 2. Create Test Rate Contract
        testRateContract = new RateContract();
        testRateContract.setCartridge(testCartridge);
        testRateContract.setSupplierName("M/s Canon India Pvt Ltd");
        testRateContract.setTotalContractQuantity(1000);
        testRateContract.setQuantityTakenThroughWO(200);
        testRateContract.setRatePerUnit(java.math.BigDecimal.valueOf(4500.0));
        testRateContract.setTaxPercentage(java.math.BigDecimal.valueOf(18.0));
        testRateContract.setContractDate(LocalDate.of(2026, 1, 15));
        testRateContract = rateContractRepository.save(testRateContract);

        // 3. Create Test Call-Up PO
        testPO = new CallUpPurchaseOrder();
        testPO.setPoNumber("PO-2026-001");
        testPO.setRateContract(testRateContract);
        testPO.setSupplierName("M/s Canon India Pvt Ltd");
        testPO.setQuantity(200);
        testPO.setPoDate(LocalDate.of(2026, 2, 1));
        testPO = callUpPORepository.save(testPO);

        // 4. Create Test Engineer & Usage
        testUser = new User();
        testUser.setUsername("test.engineer");
        testUser.setFullName("Test Engineer");
        testUser.setEmail("engineer@iocl.co.in");
        testUser.setPassword(passwordEncoder.encode("Password@123"));
        testUser.setRole(Role.USER);
        testUser.setEmployeeId("ENG101");
        testUser = userRepository.save(testUser);

        testUsage = new AssetUsage();
        testUsage.setUser(testUser);
        testUsage.setCartridge(testCartridge);
        testUsage.setQuantityUsed(2);
        testUsage.setUsageDate(LocalDate.of(2026, 8, 10));
        testUsage.setBeneficiaryEmployeeName("Rajesh Kumar");
        testUsage.setBeneficiaryEmployeeNo("93917");
        testUsage.setBeneficiaryDepartment("Information Systems");
        testUsage.setBeneficiaryLocation("Refinery Complex");
        testUsage.setBeneficiarySeatOrCabinNo("Cabin-401");
        testUsage.setRemarks("Monthly replenishment");
        testUsage = assetUsageRepository.save(testUsage);

        // 5. Create Test Employee
        testEmployee = new Employee();
        testEmployee.setEmployeeNumber("93917");
        testEmployee.setFullName("Rajesh Kumar");
        testEmployee.setEmail("rajesh.kumar@iocl.co.in");
        testEmployee.setDepartment("Information Systems");
        testEmployee.setDesignation("Manager (IS)");
        testEmployee.setLocation("Refinery Complex");
        testEmployee.setCabinNumber("Cabin-401");
        testEmployee.setPrinterName("Canon LBP246dw");
        testEmployee.setStatus(EmployeeStatus.ACTIVE);
        testEmployee = employeeRepository.save(testEmployee);
    }

    // 1. Asset Usage Report
    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAssetUsageReport_Success() throws Exception {
        mockMvc.perform(get("/api/admin/reports/asset-usage")
                        .param("partNumber", "070-BLK"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].beneficiaryEmployeeNo", is("93917")))
                .andExpect(jsonPath("$.content[0].quantityUsed", is(2)));

        mockMvc.perform(get("/api/admin/reports/asset-usage/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRecords", is(1)))
                .andExpect(jsonPath("$.totalQuantityUsed", is(2)))
                .andExpect(jsonPath("$.totalEngineers", is(1)))
                .andExpect(jsonPath("$.totalBeneficiaries", is(1)));
    }

    // 2. Store Inventory Report
    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetStoreInventoryReport_Success() throws Exception {
        mockMvc.perform(get("/api/admin/reports/store-inventory")
                        .param("partNumber", "070-BLK"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].partNumber", is("070-BLK")))
                .andExpect(jsonPath("$.content[0].storeQuantity", is(150)))
                .andExpect(jsonPath("$.content[0].totalRcQuantity", is(1000)))
                .andExpect(jsonPath("$.content[0].qtyTakenVideWO", is(200)))
                .andExpect(jsonPath("$.content[0].netAvailableRc", is(800)))
                .andExpect(jsonPath("$.content[0].combinedNetQty", is(950)));

        mockMvc.perform(get("/api/admin/reports/store-inventory/summary")
                        .param("partNumber", "070-BLK"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems", is(1)))
                .andExpect(jsonPath("$.totalStoreQuantity", is(150)));
    }

    // 3. Procurement Report
    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetProcurementReport_Success() throws Exception {
        mockMvc.perform(get("/api/admin/reports/procurement"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].partNumber", is("070-BLK")))
                .andExpect(jsonPath("$.content[0].contractQuantity", is(1000)))
                .andExpect(jsonPath("$.content[0].qtyTakenVideWO", is(200)))
                .andExpect(jsonPath("$.content[0].netAvailableRc", is(800)));

        mockMvc.perform(get("/api/admin/reports/procurement/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRateContracts", is(1)))
                .andExpect(jsonPath("$.totalContractQuantity", is(1000)))
                .andExpect(jsonPath("$.totalQtyTakenVideWO", is(200)))
                .andExpect(jsonPath("$.totalNetAvailableRC", is(800)));
    }

    // 4. Call-Up PO Report
    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetCallUpPOReport_Success() throws Exception {
        mockMvc.perform(get("/api/admin/reports/call-up-po"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].poNumber", is("PO-2026-001")))
                .andExpect(jsonPath("$.content[0].orderQuantity", is(200)))
                .andExpect(jsonPath("$.content[0].executedQuantity", is(200)))
                .andExpect(jsonPath("$.content[0].remainingQuantity", is(0)));

        mockMvc.perform(get("/api/admin/reports/call-up-po/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPOs", is(1)))
                .andExpect(jsonPath("$.totalPOQuantity", is(200)))
                .andExpect(jsonPath("$.totalExecutedQuantity", is(200)));
    }

    // 5. Employee Master Report
    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetEmployeeReport_Success() throws Exception {
        mockMvc.perform(get("/api/admin/reports/employees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].employeeNumber", is("93917")))
                .andExpect(jsonPath("$.content[0].employeeName", is("Rajesh Kumar")))
                .andExpect(jsonPath("$.content[0].status", is("ACTIVE")));

        mockMvc.perform(get("/api/admin/reports/employees/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEmployees", is(1)))
                .andExpect(jsonPath("$.activeEmployees", is(1)))
                .andExpect(jsonPath("$.totalDepartments", is(1)))
                .andExpect(jsonPath("$.employeesWithPrinters", is(1)));
    }

    // 6. Stock Movement Report
    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetStockMovementReport_Success() throws Exception {
        mockMvc.perform(get("/api/admin/reports/store-stock-history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(2))); // 1 PO + 1 Usage

        mockMvc.perform(get("/api/admin/reports/store-stock-history/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTransactions", is(2)))
                .andExpect(jsonPath("$.totalStockIn", is(200)))
                .andExpect(jsonPath("$.totalStockOut", is(2)))
                .andExpect(jsonPath("$.netMovement", is(198)));
    }

    // 7. Unified Dispatcher Endpoints (Matching frontend reportService.js)
    @Test
    @WithMockUser(roles = "ADMIN")
    void testUnifiedDispatcherEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/reports/data")
                        .param("reportType", "ASSET_USAGE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reportType", is("ASSET_USAGE")))
                .andExpect(jsonPath("$.totalElements", is(1)));

        mockMvc.perform(get("/api/admin/reports/summary")
                        .param("reportType", "EMPLOYEE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEmployees", is(1)));
    }

    // 8. Excel Export Endpoint
    @Test
    @WithMockUser(roles = "ADMIN")
    void testExcelExport_ReturnsValidBinaryWorkbook() throws Exception {
        byte[] responseBytes = mockMvc.perform(get("/api/admin/reports/export/excel")
                        .param("reportType", "ASSET_USAGE"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(header().string("Content-Disposition", containsString("attachment; filename=\"asset_usage_report_")))
                .andReturn().getResponse().getContentAsByteArray();

        assertNotNull(responseBytes);
        assertTrue(responseBytes.length > 100, "Excel output should contain generated workbook bytes");
    }

    // 9. CSV Export Endpoint
    @Test
    @WithMockUser(roles = "ADMIN")
    void testCsvExport_ReturnsValidCsv() throws Exception {
        String csvContent = mockMvc.perform(get("/api/admin/reports/export/csv")
                        .param("reportType", "STORE_INVENTORY"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv"))
                .andReturn().getResponse().getContentAsString();

        assertNotNull(csvContent);
        assertTrue(csvContent.contains("070-BLK"));
        assertTrue(csvContent.contains("Canon 070 Black"));
    }

    // 10. Security Authorization
    @Test
    void testSecurity_UnauthenticatedBlocked() throws Exception {
        mockMvc.perform(get("/api/admin/reports/asset-usage"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void testSecurity_NonAdminBlocked() throws Exception {
        mockMvc.perform(get("/api/admin/reports/asset-usage"))
                .andExpect(status().isForbidden());
    }

    // 11. Read-Only Verification
    @Test
    @WithMockUser(roles = "ADMIN")
    void testReportsAreReadOnly_NoBusinessSideEffects() throws Exception {
        int initialStoreQty = testCartridge.getStoreQuantity();
        int initialTakenWO = testRateContract.getQuantityTakenThroughWO();
        long initialUsageCount = assetUsageRepository.count();

        // Call all report endpoints
        mockMvc.perform(get("/api/admin/reports/asset-usage")).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/reports/store-inventory")).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/reports/procurement")).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/reports/call-up-po")).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/reports/employees")).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/reports/store-stock-history")).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/reports/export/excel").param("reportType", "ASSET_USAGE")).andExpect(status().isOk());

        // Verify state is 100% identical
        Cartridge refetchedCart = cartridgeRepository.findById(testCartridge.getId()).orElseThrow();
        assertEquals(initialStoreQty, refetchedCart.getStoreQuantity());

        RateContract refetchedRC = rateContractRepository.findById(testRateContract.getId()).orElseThrow();
        assertEquals(initialTakenWO, refetchedRC.getQuantityTakenThroughWO());

        assertEquals(initialUsageCount, assetUsageRepository.count());
    }
}
