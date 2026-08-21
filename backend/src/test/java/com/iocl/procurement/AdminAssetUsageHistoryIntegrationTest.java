package com.iocl.procurement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iocl.procurement.dto.request.AssetUsageRequestDTO;
import com.iocl.procurement.entity.*;
import com.iocl.procurement.repository.*;
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

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AdminAssetUsageHistoryIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AssetUsageRepository assetUsageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private CartridgeRepository cartridgeRepository;

    @Autowired
    private AssetRepository assetRepository;

    private String adminToken;
    private String userToken1;
    private String userToken2;

    private User engineer1;
    private User engineer2;
    private Cartridge cartridge1;
    private Cartridge cartridge2;
    private Asset asset1;

    @BeforeEach
    void setUp() {
        // Clean previous test data
        assetUsageRepository.deleteAll();
        assetRepository.deleteAll();

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

        // 2. Setup Engineers
        engineer1 = userRepository.findByUsernameIgnoreCase("engineer.sagar")
                .orElseGet(() -> {
                    User u = new User();
                    u.setUsername("engineer.sagar");
                    u.setEmail("sagar.v@iocl.co.in");
                    u.setEmployeeId("IOCL1005");
                    u.setFullName("Sagar Varshney");
                    u.setDepartment("Maintenance");
                    u.setLocation("Refinery Block A");
                    u.setPassword("$2a$10$dummyHashPassword");
                    u.setRole(Role.USER);
                    u.setStatus(UserStatus.ACTIVE);
                    return userRepository.save(u);
                });
        userToken1 = "Bearer " + jwtService.generateToken(new UserUserDetails(engineer1));

        engineer2 = userRepository.findByUsernameIgnoreCase("engineer.rahul")
                .orElseGet(() -> {
                    User u = new User();
                    u.setUsername("engineer.rahul");
                    u.setEmail("rahul.k@iocl.co.in");
                    u.setEmployeeId("IOCL1006");
                    u.setFullName("Rahul Kumar");
                    u.setDepartment("Operations");
                    u.setLocation("Admin Complex");
                    u.setPassword("$2a$10$dummyHashPassword");
                    u.setRole(Role.USER);
                    u.setStatus(UserStatus.ACTIVE);
                    return userRepository.save(u);
                });
        userToken2 = "Bearer " + jwtService.generateToken(new UserUserDetails(engineer2));

        // 3. Setup Cartridges & Assets
        cartridge1 = cartridgeRepository.findByPartNumberIgnoreCase("070-BLK")
                .orElseGet(() -> {
                    Cartridge c = new Cartridge();
                    c.setPartNumber("070-BLK");
                    c.setCartridgeName("Canon 070 Black");
                    c.setPrinterName("Canon LBP246dw");
                    c.setStoreQuantity(100);
                    c.setActive(true);
                    return cartridgeRepository.save(c);
                });
        cartridge1.setStoreQuantity(100);
        cartridgeRepository.save(cartridge1);

        cartridge2 = cartridgeRepository.findByPartNumberIgnoreCase("W2040X")
                .orElseGet(() -> {
                    Cartridge c = new Cartridge();
                    c.setPartNumber("W2040X");
                    c.setCartridgeName("HP 416X Black");
                    c.setPrinterName("HP Color LaserJet Pro M454dn");
                    c.setStoreQuantity(80);
                    c.setActive(true);
                    return cartridgeRepository.save(c);
                });
        cartridge2.setStoreQuantity(80);
        cartridgeRepository.save(cartridge2);

        asset1 = new Asset();
        asset1.setCartridge(cartridge1);
        asset1.setModelName("Canon LBP246dw");
        asset1.setSerialNumber("CN-SER-41289");
        asset1.setPrinterType(PrinterType.BLACK_AND_WHITE);
        asset1.setDepartment("Information Systems");
        asset1.setStatus(AssetStatus.ACTIVE);
        asset1 = assetRepository.save(asset1);
    }

    @Test
    @DisplayName("Test 1: Record usage by engineer and verify it appears in Admin History with separate Engineer & Beneficiary")
    void testBasicAdminHistoryRetrieval() throws Exception {
        // Engineer 1 records usage for Beneficiary Rajesh Kumar
        AssetUsageRequestDTO request = new AssetUsageRequestDTO();
        request.setCartridgeId(String.valueOf(cartridge1.getId()));
        request.setPrinterId(String.valueOf(asset1.getId()));
        request.setBeneficiaryEmployeeNo("93917");
        request.setBeneficiaryEmployeeName("Rajesh Kumar");
        request.setBeneficiaryDepartment("Information Systems");
        request.setBeneficiarySeatOrCabinNo("Cabin 412");
        request.setBeneficiaryLocation("Refinery Complex");
        request.setBeneficiaryEmail("rajesh.kumar@iocl.co.in");
        request.setQuantityUsed(2);
        request.setUsageDate(LocalDate.of(2026, 8, 20));
        request.setRemarks("Quarterly cartridge replacement");
        request.setWorkOrderReference("WO-2026-08-99");

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", userToken1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Admin queries history via dedicated /api/admin/asset-usage/history endpoint
        mockMvc.perform(get("/api/admin/asset-usage/history")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].partNumber", is("070-BLK")))
                .andExpect(jsonPath("$.content[0].quantityUsed", is(2)))
                // Verify Submitting Engineer
                .andExpect(jsonPath("$.content[0].recordedByEmployeeName", is("Sagar Varshney")))
                .andExpect(jsonPath("$.content[0].recordedByEmployeeNo", is("IOCL1005")))
                .andExpect(jsonPath("$.content[0].engineerEmail", is("sagar.v@iocl.co.in")))
                // Verify Beneficiary (End User)
                .andExpect(jsonPath("$.content[0].beneficiaryEmployeeName", is("Rajesh Kumar")))
                .andExpect(jsonPath("$.content[0].beneficiaryEmployeeNo", is("93917")))
                .andExpect(jsonPath("$.content[0].beneficiaryDepartment", is("Information Systems")))
                .andExpect(jsonPath("$.content[0].beneficiarySeatOrCabinNo", is("Cabin 412")))
                .andExpect(jsonPath("$.content[0].beneficiaryEmail", is("rajesh.kumar@iocl.co.in")))
                .andExpect(jsonPath("$.content[0].printerSerialNumber", is("CN-SER-41289")))
                .andExpect(jsonPath("$.content[0].workOrderReference", is("WO-2026-08-99")));
    }

    @Test
    @DisplayName("Test 2: Multiple engineers, same beneficiary, distinct aggregation counts")
    void testMultipleEngineersAndSummaryKPIs() throws Exception {
        // Usage 1 by Engineer 1 for Rajesh (qty: 2)
        AssetUsage u1 = new AssetUsage();
        u1.setUser(engineer1);
        u1.setRecordedByEmployeeNo("IOCL1005");
        u1.setRecordedByEmployeeName("Sagar Varshney");
        u1.setCartridge(cartridge1);
        u1.setCartridgeName(cartridge1.getCartridgeName());
        u1.setPartNumber(cartridge1.getPartNumber());
        u1.setBeneficiaryEmployeeNo("93917");
        u1.setBeneficiaryEmployeeName("Rajesh Kumar");
        u1.setBeneficiaryDepartment("Information Systems");
        u1.setBeneficiarySeatOrCabinNo("Cabin 412");
        u1.setBeneficiaryLocation("Refinery Complex");
        u1.setQuantityUsed(2);
        u1.setUsageDate(LocalDate.of(2026, 8, 15));
        u1.setPrinterType(PrinterType.BLACK_AND_WHITE);
        assetUsageRepository.save(u1);

        // Usage 2 by Engineer 2 for Rajesh (qty: 3)
        AssetUsage u2 = new AssetUsage();
        u2.setUser(engineer2);
        u2.setRecordedByEmployeeNo("IOCL1006");
        u2.setRecordedByEmployeeName("Rahul Kumar");
        u2.setCartridge(cartridge1);
        u2.setCartridgeName(cartridge1.getCartridgeName());
        u2.setPartNumber(cartridge1.getPartNumber());
        u2.setBeneficiaryEmployeeNo("93917");
        u2.setBeneficiaryEmployeeName("Rajesh Kumar");
        u2.setBeneficiaryDepartment("Information Systems");
        u2.setBeneficiarySeatOrCabinNo("Cabin 412");
        u2.setBeneficiaryLocation("Refinery Complex");
        u2.setQuantityUsed(3);
        u2.setUsageDate(LocalDate.of(2026, 8, 18));
        u2.setPrinterType(PrinterType.BLACK_AND_WHITE);
        assetUsageRepository.save(u2);

        // Usage 3 by Engineer 1 for Anjali (qty: 4)
        AssetUsage u3 = new AssetUsage();
        u3.setUser(engineer1);
        u3.setRecordedByEmployeeNo("IOCL1005");
        u3.setRecordedByEmployeeName("Sagar Varshney");
        u3.setCartridge(cartridge2);
        u3.setCartridgeName(cartridge2.getCartridgeName());
        u3.setPartNumber(cartridge2.getPartNumber());
        u3.setBeneficiaryEmployeeNo("88412");
        u3.setBeneficiaryEmployeeName("Anjali Varshney");
        u3.setBeneficiaryDepartment("Finance & Accounts");
        u3.setBeneficiarySeatOrCabinNo("Cabin 724");
        u3.setBeneficiaryLocation("Admin Block");
        u3.setQuantityUsed(4);
        u3.setUsageDate(LocalDate.of(2026, 8, 20));
        u3.setPrinterType(PrinterType.COLOR);
        assetUsageRepository.save(u3);

        // Verify Admin Summary API
        mockMvc.perform(get("/api/admin/asset-usage/summary")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRecords", is(3)))
                .andExpect(jsonPath("$.totalQuantityUsed", is(9))) // 2 + 3 + 4 = 9
                .andExpect(jsonPath("$.totalEngineers", is(2)))    // engineer1, engineer2
                .andExpect(jsonPath("$.totalBeneficiaries", is(2))); // Rajesh (93917), Anjali (88412)

        // Verify Beneficiary Filter for Rajesh (should return 2 records from 2 distinct engineers)
        mockMvc.perform(get("/api/admin/asset-usage/history")
                        .param("beneficiary", "Rajesh")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(2)))
                .andExpect(jsonPath("$.content", hasSize(2)));

        // Verify Part Number Filter for 070-BLK
        mockMvc.perform(get("/api/admin/asset-usage/history")
                        .param("partNumber", "070-BLK")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(2)));

        // Verify Date Range Filter
        mockMvc.perform(get("/api/admin/asset-usage/history")
                        .param("fromDate", "2026-08-17")
                        .param("toDate", "2026-08-20")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(2))); // u2 (18th) and u3 (20th)
    }

    @Test
    @DisplayName("Test 3: Security enforcement — non-admin user is blocked from admin history")
    void testSecurityAccessControl() throws Exception {
        // Non-admin engineer token should receive 403 Forbidden
        mockMvc.perform(get("/api/admin/asset-usage/history")
                        .header("Authorization", userToken1))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/user/asset-usage/admin/search")
                        .header("Authorization", userToken1))
                .andExpect(status().isForbidden());

        // Unauthenticated request should receive 401 Unauthorized
        mockMvc.perform(get("/api/admin/asset-usage/history"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test 4: Single record detail endpoint and CSV export")
    void testSingleRecordDetailAndCsvExport() throws Exception {
        AssetUsage u = new AssetUsage();
        u.setUser(engineer1);
        u.setRecordedByEmployeeNo("IOCL1005");
        u.setRecordedByEmployeeName("Sagar Varshney");
        u.setCartridge(cartridge1);
        u.setCartridgeName(cartridge1.getCartridgeName());
        u.setPartNumber(cartridge1.getPartNumber());
        u.setBeneficiaryEmployeeNo("93917");
        u.setBeneficiaryEmployeeName("Rajesh Kumar");
        u.setBeneficiaryDepartment("Information Systems");
        u.setBeneficiarySeatOrCabinNo("Cabin 412");
        u.setBeneficiaryLocation("Refinery Complex");
        u.setQuantityUsed(5);
        u.setUsageDate(LocalDate.of(2026, 8, 20));
        u.setPrinterType(PrinterType.BLACK_AND_WHITE);
        u.setRemarks("Routine maintenance audit test");
        u = assetUsageRepository.save(u);

        // Test GET single detail
        mockMvc.perform(get("/api/admin/asset-usage/" + u.getId())
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(u.getId().intValue())))
                .andExpect(jsonPath("$.quantityUsed", is(5)))
                .andExpect(jsonPath("$.remarks", is("Routine maintenance audit test")));

        // Test CSV export
        mockMvc.perform(get("/api/admin/asset-usage/export")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("text/csv")))
                .andExpect(content().string(containsString("Sagar Varshney")))
                .andExpect(content().string(containsString("Rajesh Kumar")))
                .andExpect(content().string(containsString("070-BLK")));
    }

    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        assetUsageRepository.deleteAll();
        assetRepository.deleteAll();
    }
}
