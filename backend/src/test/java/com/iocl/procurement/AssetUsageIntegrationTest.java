package com.iocl.procurement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iocl.procurement.dto.request.AssetUsageRequestDTO;
import com.iocl.procurement.dto.request.LoginRequest;
import com.iocl.procurement.dto.request.UserLoginRequest;
import com.iocl.procurement.entity.*;
import com.iocl.procurement.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AssetUsageIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private CartridgeRepository cartridgeRepository;

    @Autowired
    private CartridgeThresholdRepository thresholdRepository;

    @Autowired
    private RateContractRepository rateContractRepository;

    @Autowired
    private ProcurementAlertRepository alertRepository;

    @Autowired
    private CallUpPurchaseOrderRepository callUpPORepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private AssetUsageRepository assetUsageRepository;

    @Autowired
    private com.iocl.procurement.repository.EmployeeRepository employeeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String userToken;
    private String adminToken;
    private User engineerRahul;
    private User beneficiaryAnjali;
    private User beneficiarySagar;
    private Cartridge testCartridgeBW;
    private Cartridge testCartridgeColor;
    private Asset testAssetBW;
    private Asset testAssetColor;
    private RateContract testRateContractBW;
    private CartridgeThreshold thresholdBW;

    @BeforeEach
    void setUp() throws Exception {
        assetUsageRepository.deleteAll();
        alertRepository.deleteAll();
        callUpPORepository.deleteAll();
        rateContractRepository.deleteAll();
        thresholdRepository.deleteAll();
        assetRepository.deleteAll();
        cartridgeRepository.deleteAll();
        employeeRepository.deleteAll();
        userRepository.deleteAll();
        adminRepository.deleteAll();

        // 1. Create Recording Engineer (Rahul)
        engineerRahul = new User();
        engineerRahul.setUsername("rahul.engineer");
        engineerRahul.setFullName("Rahul Sharma");
        engineerRahul.setEmail("rahul.sharma@iocl.co.in");
        engineerRahul.setEmployeeId("ENG1001");
        engineerRahul.setDepartment("Engineering");
        engineerRahul.setLocation("Head Office");
        engineerRahul.setPassword(passwordEncoder.encode("Password@123"));
        engineerRahul.setStatus(UserStatus.ACTIVE);
        engineerRahul.setRole(Role.USER);
        engineerRahul = userRepository.save(engineerRahul);

        // 2. Create Beneficiary Employees (Anjali & Sagar)
        beneficiaryAnjali = new User();
        beneficiaryAnjali.setUsername("anjali.varshney");
        beneficiaryAnjali.setFullName("Anjali Varshney");
        beneficiaryAnjali.setEmail("anjali.varshney@iocl.co.in");
        beneficiaryAnjali.setEmployeeId("EMP2001");
        beneficiaryAnjali.setDepartment("Finance");
        beneficiaryAnjali.setLocation("Head Office");
        beneficiaryAnjali.setPassword(passwordEncoder.encode("Password@123"));
        beneficiaryAnjali.setStatus(UserStatus.ACTIVE);
        beneficiaryAnjali.setRole(Role.USER);
        beneficiaryAnjali = userRepository.save(beneficiaryAnjali);

        beneficiarySagar = new User();
        beneficiarySagar.setUsername("sagar.varshney");
        beneficiarySagar.setFullName("Sagar Varshney");
        beneficiarySagar.setEmail("sagar.varshney@iocl.co.in");
        beneficiarySagar.setEmployeeId("EMP2002");
        beneficiarySagar.setDepartment("Operations");
        beneficiarySagar.setLocation("Refinery");
        beneficiarySagar.setPassword(passwordEncoder.encode("Password@123"));
        beneficiarySagar.setStatus(UserStatus.ACTIVE);
        beneficiarySagar.setRole(Role.USER);
        beneficiarySagar = userRepository.save(beneficiarySagar);

        // 3. Login Engineer to get JWT Bearer token
        UserLoginRequest loginReq = new UserLoginRequest("rahul.engineer", "Password@123");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        userToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();

        // 4. Create and Login Administrator
        Admin testAdmin = new Admin("IOCL Administrator", "admin@iocl.co.in", passwordEncoder.encode("Admin@12345"), Role.ADMIN);
        adminRepository.save(testAdmin);

        LoginRequest adminLogin = new LoginRequest("admin@iocl.co.in", "Admin@12345");
        MvcResult adminLoginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        adminToken = objectMapper.readTree(adminLoginResult.getResponse().getContentAsString()).get("token").asText();

        // 4. Create Cartridges
        testCartridgeBW = new Cartridge("HP LaserJet Pro M404n", 10, "HP 76A Black Toner", "CF276A", 15);
        testCartridgeBW = cartridgeRepository.save(testCartridgeBW);

        testCartridgeColor = new Cartridge("Canon Color imageCLASS LBP622Cdw", 5, "Canon 054 Cyan Toner", "054-CYN", 8);
        testCartridgeColor = cartridgeRepository.save(testCartridgeColor);

        // 5. Configure Thresholds (PO threshold = 20, Tendering threshold = 30)
        CartridgeThreshold thresholdBW = new CartridgeThreshold(testCartridgeBW, 20, 30);
        thresholdRepository.save(thresholdBW);

        // 6. Create Rate Contract for BW Cartridge (Total = 100, Executed = 20, Taken WO = 0, Net Available = 80)
        testRateContractBW = new RateContract();
        testRateContractBW.setContractDate(LocalDate.of(2026, 8, 1));
        testRateContractBW.setSupplierName("Test Consumables Ltd");
        testRateContractBW.setCartridge(testCartridgeBW);
        testRateContractBW.setRatePerUnit(new BigDecimal("1250.00"));
        testRateContractBW.setTaxPercentage(new BigDecimal("18.00"));
        testRateContractBW.setTotalContractQuantity(100);
        testRateContractBW.setQuantityAlreadyExecuted(20);
        testRateContractBW.setQuantityTakenThroughWO(0);
        testRateContractBW.recalculateNetAvailableQuantity(); // 100 - 20 - 0 = 80
        testRateContractBW = rateContractRepository.save(testRateContractBW);

        // 7. Create Assets
        testAssetBW = new Asset();
        testAssetBW.setModelName("HP LaserJet Pro M404n");
        testAssetBW.setSerialNumber("HP-PRN-001");
        testAssetBW.setDepartment("Finance");
        testAssetBW.setCartridge(testCartridgeBW);
        testAssetBW.setPrinterType(PrinterType.BLACK_AND_WHITE);
        testAssetBW.setStatus(AssetStatus.ACTIVE);
        testAssetBW = assetRepository.save(testAssetBW);

        testAssetColor = new Asset();
        testAssetColor.setModelName("Canon Color imageCLASS LBP622Cdw");
        testAssetColor.setSerialNumber("CANON-PRN-002");
        testAssetColor.setDepartment("Operations");
        testAssetColor.setCartridge(testCartridgeColor);
        testAssetColor.setPrinterType(PrinterType.COLOR);
        testAssetColor.setStatus(AssetStatus.ACTIVE);
        testAssetColor = assetRepository.save(testAssetColor);
    }

    @Test
    @DisplayName("Should successfully record Asset Usage with distinct Recorded By (Engineer) and Usage Beneficiary")
    void testSuccessfulAssetUsageSubmissionWithBeneficiary() throws Exception {
        AssetUsageRequestDTO req = new AssetUsageRequestDTO();
        req.setBeneficiaryEmployeeNo("EMP2001");
        req.setBeneficiaryEmployeeName("Anjali Varshney");
        req.setBeneficiaryDepartment("Finance");
        req.setBeneficiarySeatOrCabinNo("Cabin A-204");
        req.setBeneficiaryLocation("Head Office");
        req.setBeneficiaryEmail("anjali.varshney@iocl.co.in");
        req.setPrinterId(testAssetBW.getId().toString());
        req.setPrinterType("Black & White");
        req.setCartridgeId(testCartridgeBW.getId().toString());
        req.setQuantityUsed(2);
        req.setUsageDate(LocalDate.now());
        req.setRemarks("Cartridge replaced for finance team");
        req.setWorkOrderReference("WO-2026-AUG-01");

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.recordedByEmployeeNo", is("ENG1001")))
                .andExpect(jsonPath("$.recordedByEmployeeName", is("Rahul Sharma")))
                .andExpect(jsonPath("$.beneficiaryEmployeeNo", is("EMP2001")))
                .andExpect(jsonPath("$.beneficiaryEmployeeName", is("Anjali Varshney")))
                .andExpect(jsonPath("$.beneficiaryDepartment", is("Finance")))
                .andExpect(jsonPath("$.beneficiarySeatOrCabinNo", is("Cabin A-204")))
                .andExpect(jsonPath("$.beneficiaryLocation", is("Head Office")))
                .andExpect(jsonPath("$.beneficiaryEmail", is("anjali.varshney@iocl.co.in")))
                .andExpect(jsonPath("$.quantityUsed", is(2)))
                .andExpect(jsonPath("$.partNumber", is("CF276A")));

        // Verify PostgreSQL AssetUsage row details
        List<AssetUsage> usages = assetUsageRepository.findAll();
        assertEquals(1, usages.size());
        AssetUsage saved = usages.get(0);
        assertEquals(engineerRahul.getId(), saved.getUser().getId());
        assertEquals("ENG1001", saved.getRecordedByEmployeeNo());
        assertEquals("Rahul Sharma", saved.getRecordedByEmployeeName());
        assertEquals("EMP2001", saved.getBeneficiaryEmployeeNo());
        assertEquals("Anjali Varshney", saved.getBeneficiaryEmployeeName());
        assertEquals("Cabin A-204", saved.getBeneficiarySeatOrCabinNo());
        assertEquals("anjali.varshney@iocl.co.in", saved.getBeneficiaryEmail());
        assertEquals(2, saved.getQuantityUsed());
        assertEquals(PrinterType.BLACK_AND_WHITE, saved.getPrinterType());
        assertNull(saved.getColour());

        // Verify Store Inventory decreased from 15 to 13
        Cartridge updatedCartridge = cartridgeRepository.findById(testCartridgeBW.getId()).orElseThrow();
        assertEquals(13, updatedCartridge.getStoreQuantity());

        // Verify RateContract remains UNCHANGED by Asset Usage (CRITICAL: Rate Contract is completely isolated!)
        RateContract updatedRC = rateContractRepository.findById(testRateContractBW.getId()).orElseThrow();
        assertEquals(20, updatedRC.getQuantityAlreadyExecuted());
        assertEquals(100, updatedRC.getNetAvailableQuantity());
    }

    @Test
    @DisplayName("Should create separate transactions when same engineer records for different beneficiaries")
    void testMultipleBeneficiaryTransactionsBySameEngineer() throws Exception {
        // First transaction for Anjali (qty = 2)
        AssetUsageRequestDTO req1 = new AssetUsageRequestDTO();
        req1.setBeneficiaryEmployeeNo("EMP2001");
        req1.setBeneficiaryEmployeeName("Anjali Varshney");
        req1.setBeneficiaryDepartment("Finance");
        req1.setBeneficiarySeatOrCabinNo("Cabin A-204");
        req1.setBeneficiaryLocation("Head Office");
        req1.setBeneficiaryEmail("anjali.varshney@iocl.co.in");
        req1.setPrinterId(testAssetBW.getId().toString());
        req1.setCartridgeId(testCartridgeBW.getId().toString());
        req1.setQuantityUsed(2);
        req1.setUsageDate(LocalDate.now());

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isCreated());

        // Second transaction for Sagar (qty = 1)
        AssetUsageRequestDTO req2 = new AssetUsageRequestDTO();
        req2.setBeneficiaryEmployeeNo("EMP2002");
        req2.setBeneficiaryEmployeeName("Sagar Varshney");
        req2.setBeneficiaryDepartment("Operations");
        req2.setBeneficiarySeatOrCabinNo("Cabin B-105");
        req2.setBeneficiaryLocation("Refinery");
        req2.setBeneficiaryEmail("sagar.varshney@iocl.co.in");
        req2.setPrinterId(testAssetBW.getId().toString());
        req2.setCartridgeId(testCartridgeBW.getId().toString());
        req2.setQuantityUsed(1);
        req2.setUsageDate(LocalDate.now());

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isCreated());

        // Verify 2 separate transactions in PostgreSQL
        List<AssetUsage> usages = assetUsageRepository.findAll();
        assertEquals(2, usages.size());

        // Verify Store Inventory decreased by 2 + 1 = 3 (from 15 to 12)
        Cartridge updatedCartridge = cartridgeRepository.findById(testCartridgeBW.getId()).orElseThrow();
        assertEquals(12, updatedCartridge.getStoreQuantity());

        // Verify Rate Contract remains unchanged at 80 net available
        RateContract updatedRC = rateContractRepository.findById(testRateContractBW.getId()).orElseThrow();
        assertEquals(20, updatedRC.getQuantityAlreadyExecuted());
        assertEquals(100, updatedRC.getNetAvailableQuantity());
    }

    @Test
    @DisplayName("Should authoritatively derive Recorded-By from JWT even if client sends forged recordedBy identity")
    void testAuthoritativeRecordedByDerivation() throws Exception {
        AssetUsageRequestDTO req = new AssetUsageRequestDTO();
        req.setRecordedByEmployeeNo("EMP999_FAKE");
        req.setRecordedByEmployeeName("Fake Engineer");
        req.setBeneficiaryEmployeeNo("EMP2001");
        req.setBeneficiaryEmployeeName("Anjali Varshney");
        req.setBeneficiaryDepartment("Finance");
        req.setBeneficiarySeatOrCabinNo("Cabin A-204");
        req.setBeneficiaryLocation("Head Office");
        req.setBeneficiaryEmail("anjali.varshney@iocl.co.in");
        req.setPrinterId(testAssetBW.getId().toString());
        req.setCartridgeId(testCartridgeBW.getId().toString());
        req.setQuantityUsed(1);
        req.setUsageDate(LocalDate.now());

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.recordedByEmployeeNo", is("ENG1001")))
                .andExpect(jsonPath("$.recordedByEmployeeName", is("Rahul Sharma")));

        AssetUsage saved = assetUsageRepository.findAll().get(0);
        assertEquals("ENG1001", saved.getRecordedByEmployeeNo());
        assertEquals("Rahul Sharma", saved.getRecordedByEmployeeName());
    }

    @Test
    @DisplayName("Should search beneficiary employees from company directory")
    void testSearchBeneficiaries() throws Exception {
        mockMvc.perform(get("/api/user/asset-usage/beneficiaries/search")
                        .param("query", "Anjali")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].employeeNo", is("EMP2001")))
                .andExpect(jsonPath("$[0].employeeName", is("Anjali Varshney")))
                .andExpect(jsonPath("$[0].department", is("Finance")))
                .andExpect(jsonPath("$[0].email", is("anjali.varshney@iocl.co.in")));
    }

    @Test
    @DisplayName("Should validate Color requirement for Color printers")
    void testColorPrinterValidation() throws Exception {
        // Missing colour on Color printer -> 400
        AssetUsageRequestDTO reqNoColor = new AssetUsageRequestDTO();
        reqNoColor.setBeneficiaryEmployeeNo("EMP2001");
        reqNoColor.setBeneficiaryEmployeeName("Anjali Varshney");
        reqNoColor.setBeneficiaryDepartment("Finance");
        reqNoColor.setBeneficiarySeatOrCabinNo("Cabin-101");
        reqNoColor.setBeneficiaryLocation("Head Office");
        reqNoColor.setBeneficiaryEmail("anjali.varshney@iocl.co.in");
        reqNoColor.setPrinterId(testAssetColor.getId().toString());
        reqNoColor.setPrinterType("Color");
        reqNoColor.setCartridgeId(testCartridgeColor.getId().toString());
        reqNoColor.setQuantityUsed(1);
        reqNoColor.setUsageDate(LocalDate.now());

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqNoColor)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Colour is required for Color printers")));

        // Valid colour on Color printer -> 201
        reqNoColor.setColour("CYAN");
        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqNoColor)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.colour", is("CYAN")))
                .andExpect(jsonPath("$.quantityUsed", is(1)));
    }

    @Test
    @DisplayName("Should reject Colour specification on Black & White printers")
    void testBlackAndWhiteColorRejection() throws Exception {
        AssetUsageRequestDTO req = new AssetUsageRequestDTO();
        req.setBeneficiaryEmployeeNo("EMP2001");
        req.setBeneficiaryEmployeeName("Anjali Varshney");
        req.setBeneficiaryDepartment("Finance");
        req.setBeneficiarySeatOrCabinNo("Cabin-101");
        req.setBeneficiaryLocation("Head Office");
        req.setBeneficiaryEmail("anjali.varshney@iocl.co.in");
        req.setPrinterId(testAssetBW.getId().toString());
        req.setPrinterType("Black & White");
        req.setCartridgeId(testCartridgeBW.getId().toString());
        req.setColour("CYAN");
        req.setQuantityUsed(1);
        req.setUsageDate(LocalDate.now());

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Colour is not applicable for Black & White printers")));
    }

    @Test
    @DisplayName("Should validate Beneficiary Email format and required check")
    void testBeneficiaryEmailValidation() throws Exception {
        // Missing email -> 400
        AssetUsageRequestDTO reqNoEmail = new AssetUsageRequestDTO();
        reqNoEmail.setBeneficiaryEmployeeNo("EMP2001");
        reqNoEmail.setBeneficiaryEmployeeName("Anjali Varshney");
        reqNoEmail.setBeneficiaryDepartment("Finance");
        reqNoEmail.setBeneficiarySeatOrCabinNo("Cabin-101");
        reqNoEmail.setBeneficiaryLocation("Head Office");
        reqNoEmail.setPrinterId(testAssetBW.getId().toString());
        reqNoEmail.setPrinterType("Black & White");
        reqNoEmail.setCartridgeId(testCartridgeBW.getId().toString());
        reqNoEmail.setQuantityUsed(1);
        reqNoEmail.setUsageDate(LocalDate.now());

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqNoEmail)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Beneficiary email is required")));

        // Invalid email format -> 400
        reqNoEmail.setBeneficiaryEmail("not-an-email");
        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqNoEmail)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Please enter a valid beneficiary email address")));
    }

    @Test
    @DisplayName("Should evaluate Alert 2 (Tendering Threshold) when usage causes Combined Net Available to drop below threshold")
    void testAlert2EvaluationOnStoreUsage() throws Exception {
        // Configure threshold for testCartridgeBW: PO threshold = 20, Tendering threshold = 115
        CartridgeThreshold thresh = thresholdRepository.findByCartridgeId(testCartridgeBW.getId()).orElseThrow();
        thresh.setTenderingThreshold(115);
        thresholdRepository.save(thresh);

        // Baseline: Rate contract net available = 100, Store quantity = 15. Combined = 115. Tendering Threshold = 115.
        // Initially combined is 115, not strictly < 115.
        // User records usage of 5 units -> Store becomes 10, Rate Contract remains 100. Combined = 110 (< 115 threshold).
        AssetUsageRequestDTO req = new AssetUsageRequestDTO();
        req.setBeneficiaryEmployeeNo("EMP2001");
        req.setBeneficiaryEmployeeName("Anjali Varshney");
        req.setBeneficiaryDepartment("Finance");
        req.setBeneficiarySeatOrCabinNo("Cabin-402");
        req.setBeneficiaryLocation("Head Office");
        req.setBeneficiaryEmail("anjali.varshney@iocl.co.in");
        req.setPrinterId(testAssetBW.getId().toString());
        req.setPrinterType("Black & White");
        req.setCartridgeId(testCartridgeBW.getId().toString());
        req.setQuantityUsed(5);
        req.setUsageDate(LocalDate.now());

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // Verify Store is 10, Rate Contract is 100
        Cartridge updatedCartridge = cartridgeRepository.findById(testCartridgeBW.getId()).orElseThrow();
        assertEquals(10, updatedCartridge.getStoreQuantity());

        RateContract updatedRC = rateContractRepository.findById(testRateContractBW.getId()).orElseThrow();
        assertEquals(100, updatedRC.getNetAvailableQuantity());

        // Verify unread Alert 2 (Tendering Threshold) created in PostgreSQL
        List<ProcurementAlert> alerts = alertRepository.findAll();
        assertFalse(alerts.isEmpty());
        ProcurementAlert alert = alerts.stream()
                .filter(a -> a.getAlertType() == AlertType.TENDERING_REQUIRED)
                .findFirst()
                .orElse(null);
        assertNotNull(alert);
        assertEquals(110, alert.getCombinedNetAvailableQuantity());
        assertEquals(115, alert.getTenderingThreshold());
        assertEquals(AlertStatus.UNREAD, alert.getStatus());
    }

    @Test
    @DisplayName("Should enforce User Data Isolation: Engineer A only sees their own usage history")
    void testUserDataIsolationInUsageHistory() throws Exception {
        // 1. Create a second engineer (Pooja)
        User engineerPooja = new User();
        engineerPooja.setUsername("pooja.engineer");
        engineerPooja.setFullName("Pooja Verma");
        engineerPooja.setEmail("pooja.verma@iocl.co.in");
        engineerPooja.setEmployeeId("ENG1002");
        engineerPooja.setDepartment("Maintenance");
        engineerPooja.setLocation("Refinery");
        engineerPooja.setPassword(passwordEncoder.encode("Password@123"));
        engineerPooja.setRole(Role.USER);
        engineerPooja.setStatus(UserStatus.ACTIVE);
        userRepository.save(engineerPooja);

        UserLoginRequest loginPooja = new UserLoginRequest("pooja.engineer", "Password@123");
        MvcResult poojaLoginRes = mockMvc.perform(post("/api/auth/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginPooja)))
                .andExpect(status().isOk())
                .andReturn();
        String poojaToken = objectMapper.readTree(poojaLoginRes.getResponse().getContentAsString()).get("token").asText();

        // 2. Engineer Rahul creates 2 records
        AssetUsageRequestDTO req1 = new AssetUsageRequestDTO();
        req1.setBeneficiaryEmployeeNo("EMP2001");
        req1.setBeneficiaryEmployeeName("Anjali Varshney");
        req1.setBeneficiaryDepartment("Finance");
        req1.setBeneficiarySeatOrCabinNo("Cabin A-204");
        req1.setBeneficiaryLocation("Head Office");
        req1.setBeneficiaryEmail("anjali.varshney@iocl.co.in");
        req1.setPrinterId(testAssetBW.getId().toString());
        req1.setCartridgeId(testCartridgeBW.getId().toString());
        req1.setQuantityUsed(1);
        req1.setUsageDate(LocalDate.now());

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isCreated());

        AssetUsageRequestDTO req2 = new AssetUsageRequestDTO();
        req2.setBeneficiaryEmployeeNo("EMP2002");
        req2.setBeneficiaryEmployeeName("Sagar Varshney");
        req2.setBeneficiaryDepartment("Operations");
        req2.setBeneficiarySeatOrCabinNo("Cabin B-105");
        req2.setBeneficiaryLocation("Refinery");
        req2.setBeneficiaryEmail("sagar.varshney@iocl.co.in");
        req2.setPrinterId(testAssetBW.getId().toString());
        req2.setCartridgeId(testCartridgeBW.getId().toString());
        req2.setQuantityUsed(3);
        req2.setUsageDate(LocalDate.now());

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isCreated());

        // 3. Engineer Pooja creates 1 record
        AssetUsageRequestDTO reqPooja = new AssetUsageRequestDTO();
        reqPooja.setBeneficiaryEmployeeNo("EMP2003");
        reqPooja.setBeneficiaryEmployeeName("Vikram Singh");
        reqPooja.setBeneficiaryDepartment("Stores");
        reqPooja.setBeneficiarySeatOrCabinNo("Cabin S-101");
        reqPooja.setBeneficiaryLocation("Terminal");
        reqPooja.setBeneficiaryEmail("vikram.singh@iocl.co.in");
        reqPooja.setPrinterId(testAssetBW.getId().toString());
        reqPooja.setCartridgeId(testCartridgeBW.getId().toString());
        reqPooja.setQuantityUsed(2);
        reqPooja.setUsageDate(LocalDate.now());

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + poojaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqPooja)))
                .andExpect(status().isCreated());

        // Total 3 records in DB
        assertEquals(3, assetUsageRepository.count());

        // 4. Rahul requests history -> MUST receive exactly 2 records
        mockMvc.perform(get("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].recordedByEmployeeNo", is("ENG1001")))
                .andExpect(jsonPath("$[1].recordedByEmployeeNo", is("ENG1001")));

        // 5. Pooja requests history -> MUST receive exactly 1 record
        mockMvc.perform(get("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + poojaToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].recordedByEmployeeNo", is("ENG1002")))
                .andExpect(jsonPath("$[0].beneficiaryEmployeeName", is("Vikram Singh")));
    }

    @Test
    @DisplayName("Should enforce Single Record Details security: Unauthorized engineer receives 403")
    void testSingleRecordDetailsSecurity() throws Exception {
        // Rahul creates a record
        AssetUsageRequestDTO req = new AssetUsageRequestDTO();
        req.setBeneficiaryEmployeeNo("EMP2001");
        req.setBeneficiaryEmployeeName("Anjali Varshney");
        req.setBeneficiaryDepartment("Finance");
        req.setBeneficiarySeatOrCabinNo("Cabin A-204");
        req.setBeneficiaryLocation("Head Office");
        req.setBeneficiaryEmail("anjali.varshney@iocl.co.in");
        req.setPrinterId(testAssetBW.getId().toString());
        req.setCartridgeId(testCartridgeBW.getId().toString());
        req.setQuantityUsed(1);
        req.setUsageDate(LocalDate.now());

        MvcResult createRes = mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        Long usageId = objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asLong();

        // 1. Rahul (owner) gets details -> 200 OK
        mockMvc.perform(get("/api/user/asset-usage/" + usageId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(usageId.intValue())))
                .andExpect(jsonPath("$.recordedByEmployeeNo", is("ENG1001")))
                .andExpect(jsonPath("$.beneficiaryEmail", is("anjali.varshney@iocl.co.in")));

        // 2. Pooja (other user) attempts to access Rahul's record -> 403 Forbidden
        User engineerPooja = new User();
        engineerPooja.setUsername("pooja.engineer2");
        engineerPooja.setFullName("Pooja Verma");
        engineerPooja.setEmail("pooja2@iocl.co.in");
        engineerPooja.setEmployeeId("ENG1002");
        engineerPooja.setDepartment("Maintenance");
        engineerPooja.setLocation("Refinery");
        engineerPooja.setPassword(passwordEncoder.encode("Password@123"));
        engineerPooja.setRole(Role.USER);
        engineerPooja.setStatus(UserStatus.ACTIVE);
        userRepository.save(engineerPooja);

        UserLoginRequest loginPooja = new UserLoginRequest("pooja.engineer2", "Password@123");
        MvcResult poojaLoginRes = mockMvc.perform(post("/api/auth/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginPooja)))
                .andExpect(status().isOk())
                .andReturn();
        String poojaToken = objectMapper.readTree(poojaLoginRes.getResponse().getContentAsString()).get("token").asText();

        mockMvc.perform(get("/api/user/asset-usage/" + usageId)
                        .header("Authorization", "Bearer " + poojaToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should search, filter, and paginate history records with metadata")
    void testSearchFilterAndPagination() throws Exception {
        // Create 3 usage records for Rahul
        AssetUsageRequestDTO r1 = new AssetUsageRequestDTO();
        r1.setBeneficiaryEmployeeNo("EMP2001");
        r1.setBeneficiaryEmployeeName("Anjali Varshney");
        r1.setBeneficiaryDepartment("Finance");
        r1.setBeneficiarySeatOrCabinNo("Cabin A-204");
        r1.setBeneficiaryLocation("Head Office");
        r1.setBeneficiaryEmail("anjali.varshney@iocl.co.in");
        r1.setPrinterId(testAssetBW.getId().toString());
        r1.setCartridgeId(testCartridgeBW.getId().toString());
        r1.setQuantityUsed(1);
        r1.setUsageDate(LocalDate.of(2026, 8, 10));
        mockMvc.perform(post("/api/user/asset-usage").header("Authorization", "Bearer " + userToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(r1))).andExpect(status().isCreated());

        AssetUsageRequestDTO r2 = new AssetUsageRequestDTO();
        r2.setBeneficiaryEmployeeNo("EMP2002");
        r2.setBeneficiaryEmployeeName("Sagar Varshney");
        r2.setBeneficiaryDepartment("Operations");
        r2.setBeneficiarySeatOrCabinNo("Cabin B-105");
        r2.setBeneficiaryLocation("Refinery");
        r2.setBeneficiaryEmail("sagar.varshney@iocl.co.in");
        r2.setPrinterId(testAssetBW.getId().toString());
        r2.setCartridgeId(testCartridgeBW.getId().toString());
        r2.setQuantityUsed(5);
        r2.setUsageDate(LocalDate.of(2026, 8, 15));
        mockMvc.perform(post("/api/user/asset-usage").header("Authorization", "Bearer " + userToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(r2))).andExpect(status().isCreated());

        AssetUsageRequestDTO r3 = new AssetUsageRequestDTO();
        r3.setBeneficiaryEmployeeNo("EMP2003");
        r3.setBeneficiaryEmployeeName("Ramesh Kumar");
        r3.setBeneficiaryDepartment("IT");
        r3.setBeneficiarySeatOrCabinNo("Cabin IT-01");
        r3.setBeneficiaryLocation("Head Office");
        r3.setBeneficiaryEmail("ramesh@iocl.co.in");
        r3.setPrinterId(testAssetBW.getId().toString());
        r3.setCartridgeId(testCartridgeBW.getId().toString());
        r3.setQuantityUsed(2);
        r3.setUsageDate(LocalDate.of(2026, 8, 20));
        mockMvc.perform(post("/api/user/asset-usage").header("Authorization", "Bearer " + userToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(r3))).andExpect(status().isCreated());

        // 1. Search by Keyword 'Anjali'
        mockMvc.perform(get("/api/user/asset-usage")
                        .param("search", "Anjali")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].beneficiaryEmployeeName", is("Anjali Varshney")));

        // 2. Date Range Filter: 2026-08-12 to 2026-08-18 -> matches only r2 (2026-08-15)
        mockMvc.perform(get("/api/user/asset-usage")
                        .param("fromDate", "2026-08-12")
                        .param("toDate", "2026-08-18")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].beneficiaryEmployeeName", is("Sagar Varshney")));

        // 3. Invalid Date Range: fromDate > toDate -> 400 Bad Request
        mockMvc.perform(get("/api/user/asset-usage")
                        .param("fromDate", "2026-08-25")
                        .param("toDate", "2026-08-10")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("cannot be after To date")));

        // 4. Pagination & Sorting: Page 0, Size 2, Sort by quantityUsed desc -> r2 (qty 5), r3 (qty 2)
        mockMvc.perform(get("/api/user/asset-usage/paged")
                        .param("page", "0")
                        .param("size", "2")
                        .param("sortBy", "quantityUsed")
                        .param("sortDir", "desc")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].quantityUsed", is(5)))
                .andExpect(jsonPath("$.content[1].quantityUsed", is(2)))
                .andExpect(jsonPath("$.totalElements", is(3)))
                .andExpect(jsonPath("$.totalPages", is(2)))
                .andExpect(jsonPath("$.first", is(true)))
                .andExpect(jsonPath("$.last", is(false)));

        // 5. Summary metrics
        mockMvc.perform(get("/api/user/asset-usage/summary")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRecords", is(3)))
                .andExpect(jsonPath("$.totalQuantityUsed", is(8)))
                .andExpect(jsonPath("$.thisMonthCount", is(3)))
                .andExpect(jsonPath("$.lastUsageDate", is("2026-08-20")));
    }

    @Test
    @DisplayName("Should reject Asset Usage when requested quantity exceeds available Store Stock")
    void testInsufficientStoreStockRejection() throws Exception {
        // Set store quantity = 3
        testCartridgeBW.setStoreQuantity(3);
        cartridgeRepository.save(testCartridgeBW);

        AssetUsageRequestDTO req = new AssetUsageRequestDTO();
        req.setBeneficiaryEmployeeNo("EMP2001");
        req.setBeneficiaryEmployeeName("Anjali Varshney");
        req.setBeneficiaryDepartment("Finance");
        req.setBeneficiarySeatOrCabinNo("Cabin A-204");
        req.setBeneficiaryLocation("Head Office");
        req.setBeneficiaryEmail("anjali.varshney@iocl.co.in");
        req.setPrinterId(testAssetBW.getId().toString());
        req.setPrinterType("Black & White");
        req.setCartridgeId(testCartridgeBW.getId().toString());
        req.setQuantityUsed(5); // Requested 5 > Available 3
        req.setUsageDate(LocalDate.now());

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Insufficient store stock. Available quantity: 3.")));

        // Verify no asset usage record created
        assertEquals(0, assetUsageRepository.count());

        // Verify store stock remains exactly 3
        Cartridge cart = cartridgeRepository.findById(testCartridgeBW.getId()).orElseThrow();
        assertEquals(3, cart.getStoreQuantity());

        // Verify Rate Contract remains untouched
        RateContract rc = rateContractRepository.findById(testRateContractBW.getId()).orElseThrow();
        assertEquals(100, rc.getNetAvailableQuantity());
    }

    @Test
    @DisplayName("End-to-End Test: Strict Separation of Rate Contract vs Store Inventory Quantity")
    void testRateContractAndStoreQuantitySeparationEndToEnd() throws Exception {
        // Setup 070-BLK Cartridge with Store = 100
        Cartridge canon070 = new Cartridge("Canon LBP246dw", 45, "Canon 070 Black", "070-BLK-TEST", 100);
        canon070 = cartridgeRepository.save(canon070);

        // Setup Rate Contract with Contract Qty = 500
        RateContract rc = new RateContract();
        rc.setContractDate(LocalDate.now());
        rc.setSupplierName("Canon India Pvt Ltd");
        rc.setCartridge(canon070);
        rc.setRatePerUnit(new BigDecimal("2500.00"));
        rc.setTaxPercentage(new BigDecimal("18.00"));
        rc.setTotalContractQuantity(500);
        rc.setQuantityAlreadyExecuted(0);
        rc.setQuantityTakenThroughWO(0);
        rc.recalculateNetAvailableQuantity();
        rc = rateContractRepository.save(rc);

        // Create Asset for 070-BLK
        Asset asset070 = new Asset("Canon LBP246dw", "CANON-070-001", "Administration", canon070, PrinterType.BLACK_AND_WHITE, AssetStatus.ACTIVE);
        asset070 = assetRepository.save(asset070);

        // Initial State Verification
        assertEquals(500, rc.getNetAvailableQuantity());
        assertEquals(100, canon070.getStoreQuantity());

        // STEP 1: Admin creates Call-Up PO #1 = 50
        com.iocl.procurement.dto.request.CallUpPORequest po1 = new com.iocl.procurement.dto.request.CallUpPORequest();
        po1.setPoNumber("PO-070-001");
        po1.setPoDate(LocalDate.now());
        po1.setSupplierName("Canon India Pvt Ltd");
        po1.setRateContractId(rc.getId());
        po1.setQuantity(50);

        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(po1)))
                .andExpect(status().isCreated());

        RateContract rcAfterPO1 = rateContractRepository.findById(rc.getId()).orElseThrow();
        assertEquals(450, rcAfterPO1.getNetAvailableQuantity());
        assertEquals(50, rcAfterPO1.getQuantityTakenThroughWO());

        Cartridge storeAfterPO1 = cartridgeRepository.findById(canon070.getId()).orElseThrow();
        assertEquals(150, storeAfterPO1.getStoreQuantity()); // Store: 100 + 50 = 150

        // Verify User Cartridge API reflects 150
        mockMvc.perform(get("/api/procurement/cartridges")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id==" + canon070.getId() + ")].storeQuantity", contains(150)));

        // Verify Admin Thresholds API reflects 150
        mockMvc.perform(get("/api/thresholds")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.cartridgeId==" + canon070.getId() + ")].storeQuantity", contains(150)));

        // Verify User Assets API reflects 150
        mockMvc.perform(get("/api/assets")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id==" + asset070.getId() + ")].storeQuantity", contains(150)));

        // STEP 2: Admin creates Call-Up PO #2 = 100
        com.iocl.procurement.dto.request.CallUpPORequest po2 = new com.iocl.procurement.dto.request.CallUpPORequest();
        po2.setPoNumber("PO-070-002");
        po2.setPoDate(LocalDate.now());
        po2.setSupplierName("Canon India Pvt Ltd");
        po2.setRateContractId(rc.getId());
        po2.setQuantity(100);

        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(po2)))
                .andExpect(status().isCreated());

        RateContract rcAfterPO2 = rateContractRepository.findById(rc.getId()).orElseThrow();
        assertEquals(350, rcAfterPO2.getNetAvailableQuantity());
        assertEquals(150, rcAfterPO2.getQuantityTakenThroughWO());

        Cartridge storeAfterPO2 = cartridgeRepository.findById(canon070.getId()).orElseThrow();
        assertEquals(250, storeAfterPO2.getStoreQuantity()); // Store: 150 + 100 = 250

        // Verify User Cartridge API reflects 250
        mockMvc.perform(get("/api/procurement/cartridges")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id==" + canon070.getId() + ")].storeQuantity", contains(250)));

        // Verify Admin Thresholds API reflects 250
        mockMvc.perform(get("/api/thresholds")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.cartridgeId==" + canon070.getId() + ")].storeQuantity", contains(250)));

        // STEP 3: Engineer records Asset Usage = 20
        AssetUsageRequestDTO usage1 = new AssetUsageRequestDTO();
        usage1.setBeneficiaryEmployeeNo("EMP2001");
        usage1.setBeneficiaryEmployeeName("Anjali Varshney");
        usage1.setBeneficiaryDepartment("Administration");
        usage1.setBeneficiarySeatOrCabinNo("Cabin A-101");
        usage1.setBeneficiaryLocation("Head Office");
        usage1.setBeneficiaryEmail("anjali.varshney@iocl.co.in");
        usage1.setPrinterId(asset070.getId().toString());
        usage1.setPrinterType("Black & White");
        usage1.setCartridgeId(canon070.getId().toString());
        usage1.setQuantityUsed(20);
        usage1.setUsageDate(LocalDate.now());

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(usage1)))
                .andExpect(status().isCreated());

        RateContract rcAfterUsage1 = rateContractRepository.findById(rc.getId()).orElseThrow();
        assertEquals(350, rcAfterUsage1.getNetAvailableQuantity()); // RC remains 350!

        Cartridge storeAfterUsage1 = cartridgeRepository.findById(canon070.getId()).orElseThrow();
        assertEquals(230, storeAfterUsage1.getStoreQuantity()); // Store: 250 - 20 = 230

        // Verify User Cartridge API reflects 230
        mockMvc.perform(get("/api/procurement/cartridges")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id==" + canon070.getId() + ")].storeQuantity", contains(230)));

        // Verify Admin Thresholds API reflects 230
        mockMvc.perform(get("/api/thresholds")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.cartridgeId==" + canon070.getId() + ")].storeQuantity", contains(230)));

        // STEP 4: Engineer records Asset Usage = 30
        AssetUsageRequestDTO usage2 = new AssetUsageRequestDTO();
        usage2.setBeneficiaryEmployeeNo("EMP2002");
        usage2.setBeneficiaryEmployeeName("Sagar Varshney");
        usage2.setBeneficiaryDepartment("Administration");
        usage2.setBeneficiarySeatOrCabinNo("Cabin A-102");
        usage2.setBeneficiaryLocation("Head Office");
        usage2.setBeneficiaryEmail("sagar.varshney@iocl.co.in");
        usage2.setPrinterId(asset070.getId().toString());
        usage2.setPrinterType("Black & White");
        usage2.setCartridgeId(canon070.getId().toString());
        usage2.setQuantityUsed(30);
        usage2.setUsageDate(LocalDate.now());

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(usage2)))
                .andExpect(status().isCreated());

        RateContract rcAfterUsage2 = rateContractRepository.findById(rc.getId()).orElseThrow();
        assertEquals(350, rcAfterUsage2.getNetAvailableQuantity()); // RC remains 350!

        Cartridge storeAfterUsage2 = cartridgeRepository.findById(canon070.getId()).orElseThrow();
        assertEquals(200, storeAfterUsage2.getStoreQuantity()); // Store: 230 - 30 = 200

        // Verify User Cartridge API reflects 200
        mockMvc.perform(get("/api/procurement/cartridges")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id==" + canon070.getId() + ")].storeQuantity", contains(200)));

        // Verify Admin Thresholds API reflects 200
        mockMvc.perform(get("/api/thresholds")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.cartridgeId==" + canon070.getId() + ")].storeQuantity", contains(200)));

        // STEP 5: Engineer attempts Asset Usage = 250 (when store is 200) -> REJECTED
        AssetUsageRequestDTO usage3 = new AssetUsageRequestDTO();
        usage3.setBeneficiaryEmployeeNo("EMP2003");
        usage3.setBeneficiaryEmployeeName("Vikram Singh");
        usage3.setBeneficiaryDepartment("Administration");
        usage3.setBeneficiarySeatOrCabinNo("Cabin A-103");
        usage3.setBeneficiaryLocation("Head Office");
        usage3.setBeneficiaryEmail("vikram@iocl.co.in");
        usage3.setPrinterId(asset070.getId().toString());
        usage3.setPrinterType("Black & White");
        usage3.setCartridgeId(canon070.getId().toString());
        usage3.setQuantityUsed(250);
        usage3.setUsageDate(LocalDate.now());

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(usage3)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Insufficient store stock. Available quantity: 200.")));

        RateContract rcAfterRejection = rateContractRepository.findById(rc.getId()).orElseThrow();
        assertEquals(350, rcAfterRejection.getNetAvailableQuantity());

        Cartridge storeAfterRejection = cartridgeRepository.findById(canon070.getId()).orElseThrow();
        assertEquals(200, storeAfterRejection.getStoreQuantity());

        // STEP 6: Admin attempts Call-Up PO = 400 (when RC remaining is 350) -> REJECTED
        com.iocl.procurement.dto.request.CallUpPORequest poExcess = new com.iocl.procurement.dto.request.CallUpPORequest();
        poExcess.setPoNumber("PO-070-EXCESS");
        poExcess.setPoDate(LocalDate.now());
        poExcess.setSupplierName("Canon India Pvt Ltd");
        poExcess.setRateContractId(rc.getId());
        poExcess.setQuantity(400);

        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(poExcess)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("exceeds the available quantity (350)")));

        RateContract rcFinal = rateContractRepository.findById(rc.getId()).orElseThrow();
        assertEquals(350, rcFinal.getNetAvailableQuantity());
        assertEquals(150, rcFinal.getQuantityTakenThroughWO());

        Cartridge storeFinal = cartridgeRepository.findById(canon070.getId()).orElseThrow();
        assertEquals(200, storeFinal.getStoreQuantity());
    }

    @Test
    @DisplayName("Should isolate quantity transactions by asset / part number independently")
    void testMultiAssetIsolation() throws Exception {
        // Asset 1: 070-BLK (Contract = 500, Store = 100)
        Cartridge cart070 = cartridgeRepository.save(new Cartridge("Canon LBP246dw", 45, "Canon 070 Black", "070-BLK-ISO", 100));
        RateContract rc070 = new RateContract();
        rc070.setContractDate(LocalDate.now());
        rc070.setSupplierName("Canon India");
        rc070.setCartridge(cart070);
        rc070.setRatePerUnit(new BigDecimal("2500.00"));
        rc070.setTaxPercentage(new BigDecimal("18.00"));
        rc070.setTotalContractQuantity(500);
        rc070.setQuantityAlreadyExecuted(0);
        rc070.setQuantityTakenThroughWO(0);
        rc070.recalculateNetAvailableQuantity(); // 500
        rc070 = rateContractRepository.save(rc070);

        // Asset 2: CF277X (Contract = 1000, Store = 200)
        Cartridge cart277 = cartridgeRepository.save(new Cartridge("HP LaserJet Enterprise M507", 18, "HP 77X High Yield Black", "CF277X-ISO", 200));
        RateContract rc277 = new RateContract();
        rc277.setContractDate(LocalDate.now());
        rc277.setSupplierName("HP India");
        rc277.setCartridge(cart277);
        rc277.setRatePerUnit(new BigDecimal("4500.00"));
        rc277.setTaxPercentage(new BigDecimal("18.00"));
        rc277.setTotalContractQuantity(1000);
        rc277.setQuantityAlreadyExecuted(0);
        rc277.setQuantityTakenThroughWO(0);
        rc277.recalculateNetAvailableQuantity(); // 1000
        rc277 = rateContractRepository.save(rc277);

        Asset asset277 = assetRepository.save(new Asset("HP LaserJet Enterprise M507", "HP-507-001", "Finance", cart277, PrinterType.BLACK_AND_WHITE, AssetStatus.ACTIVE));

        // Create PO on CF277X = 100
        com.iocl.procurement.dto.request.CallUpPORequest po277 = new com.iocl.procurement.dto.request.CallUpPORequest();
        po277.setPoNumber("PO-CF277X-001");
        po277.setPoDate(LocalDate.now());
        po277.setSupplierName("HP India");
        po277.setRateContractId(rc277.getId());
        po277.setQuantity(100);

        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(po277)))
                .andExpect(status().isCreated());

        // CF277X Engineer Usage = 20
        AssetUsageRequestDTO usage277 = new AssetUsageRequestDTO();
        usage277.setBeneficiaryEmployeeNo("EMP2001");
        usage277.setBeneficiaryEmployeeName("Anjali Varshney");
        usage277.setBeneficiaryDepartment("Finance");
        usage277.setBeneficiarySeatOrCabinNo("Cabin A-204");
        usage277.setBeneficiaryLocation("Head Office");
        usage277.setBeneficiaryEmail("anjali.varshney@iocl.co.in");
        usage277.setPrinterId(asset277.getId().toString());
        usage277.setPrinterType("Black & White");
        usage277.setCartridgeId(cart277.getId().toString());
        usage277.setQuantityUsed(20);
        usage277.setUsageDate(LocalDate.now());

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(usage277)))
                .andExpect(status().isCreated());

        // Verify CF277X values: RC = 900, Store: 200 + 100 - 20 = 280
        RateContract updatedRC277 = rateContractRepository.findById(rc277.getId()).orElseThrow();
        assertEquals(900, updatedRC277.getNetAvailableQuantity());
        Cartridge updatedCart277 = cartridgeRepository.findById(cart277.getId()).orElseThrow();
        assertEquals(280, updatedCart277.getStoreQuantity());

        // Verify 070-BLK values remain COMPLETELY UNCHANGED: RC = 500, Store = 100
        RateContract updatedRC070 = rateContractRepository.findById(rc070.getId()).orElseThrow();
        assertEquals(500, updatedRC070.getNetAvailableQuantity());
        assertEquals(0, updatedRC070.getQuantityTakenThroughWO());
        Cartridge updatedCart070 = cartridgeRepository.findById(cart070.getId()).orElseThrow();
        assertEquals(100, updatedCart070.getStoreQuantity());
    }
}
