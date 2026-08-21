package com.iocl.procurement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iocl.procurement.dto.request.AssetUsageRequestDTO;
import com.iocl.procurement.dto.request.CallUpPORequest;
import com.iocl.procurement.dto.request.LoginRequest;
import com.iocl.procurement.dto.request.RateContractRequest;
import com.iocl.procurement.dto.response.CartridgeResponse;
import com.iocl.procurement.dto.response.RateContractResponse;
import com.iocl.procurement.dto.response.TenderingAlertResponse;
import com.iocl.procurement.entity.*;
import com.iocl.procurement.repository.*;
import com.iocl.procurement.service.AlertService;
import com.iocl.procurement.service.CartridgeService;
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
public class MultipleRateContractsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartridgeRepository cartridgeRepository;

    @Autowired
    private CartridgeThresholdRepository thresholdRepository;

    @Autowired
    private RateContractRepository rateContractRepository;

    @Autowired
    private CallUpPurchaseOrderRepository callUpPORepository;

    @Autowired
    private AssetUsageRepository assetUsageRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private ProcurementAlertRepository alertRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CartridgeService cartridgeService;

    @Autowired
    private AlertService alertService;

    private String adminJwtToken;
    private String userJwtToken;
    private Cartridge cartridge070Blk;
    private Cartridge cartridgeCF277X;
    private User testEngineer;

    @BeforeEach
    void setUp() throws Exception {
        assetUsageRepository.deleteAll();
        alertRepository.deleteAll();
        callUpPORepository.deleteAll();
        rateContractRepository.deleteAll();
        thresholdRepository.deleteAll();
        assetRepository.deleteAll();
        cartridgeRepository.deleteAll();
        userRepository.deleteAll();
        adminRepository.deleteAll();

        // 1. Create and authenticate Admin
        Admin admin = new Admin("IOCL Administrator", "admin@iocl.co.in", passwordEncoder.encode("Admin@12345"), Role.ADMIN);
        adminRepository.save(admin);

        LoginRequest adminLogin = new LoginRequest("admin@iocl.co.in", "Admin@12345");
        MvcResult adminLoginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        adminJwtToken = objectMapper.readTree(adminLoginResult.getResponse().getContentAsString()).get("token").asText();

        // 2. Create and authenticate User/Engineer
        testEngineer = new User();
        testEngineer.setUsername("engineer.iocl");
        testEngineer.setEmail("engineer@iocl.co.in");
        testEngineer.setPassword(passwordEncoder.encode("Engineer@123"));
        testEngineer.setFullName("IOCL Maintenance Engineer");
        testEngineer.setEmployeeId("EMP1001");
        testEngineer.setDepartment("Refinery Maintenance");
        testEngineer.setLocation("Mathura Refinery");
        testEngineer.setRole(Role.USER);
        testEngineer.setStatus(UserStatus.ACTIVE);
        testEngineer = userRepository.save(testEngineer);

        LoginRequest userLogin = new LoginRequest("engineer.iocl", "Engineer@123");
        MvcResult userLoginResult = mockMvc.perform(post("/api/auth/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userLogin)))
                .andExpect(status().isOk())
                .andReturn();
        userJwtToken = objectMapper.readTree(userLoginResult.getResponse().getContentAsString()).get("token").asText();

        // 3. Create Part Number Master Records (Single Master per Part Number)
        cartridge070Blk = new Cartridge("Canon LBP246dw", 45, "Canon 070 Black", "070-BLK", 0);
        cartridge070Blk = cartridgeRepository.save(cartridge070Blk);

        cartridgeCF277X = new Cartridge("HP LaserJet Enterprise M507", 18, "HP 77X High Yield Black", "CF277X", 0);
        cartridgeCF277X = cartridgeRepository.save(cartridgeCF277X);

        // 4. Create Physical Asset Printer associated with cartridge070Blk
        Asset printerAsset = new Asset("Canon LBP246dw", "PRN-070-9999", "Refinery Maintenance", cartridge070Blk, PrinterType.BLACK_AND_WHITE, AssetStatus.ACTIVE);
        assetRepository.save(printerAsset);
    }

    @Test
    @DisplayName("Complete Critical Scenario (Section 14): Multiple RCs for 070-BLK, Call-Up POs, Shared Store, Asset Usage")
    void testCriticalMultipleRateContractsScenario() throws Exception {
        Long cartId = cartridge070Blk.getId();

        // -------------------------------------------------------------
        // STEP 1: Verify Part Number Master is available in Cartridge dropdown
        // -------------------------------------------------------------
        List<CartridgeResponse> availableCartridges = cartridgeService.getAllActiveCartridges();
        assertTrue(availableCartridges.stream().anyMatch(c -> c.getPartNumber().equalsIgnoreCase("070-BLK")));

        // -------------------------------------------------------------
        // STEP 2: Create Rate Contract A (RC-A) for 070-BLK -> Qty = 2000
        // -------------------------------------------------------------
        RateContractRequest rcAReq = new RateContractRequest(
                LocalDate.of(2026, 8, 1),
                "Supplier Alpha",
                cartId,
                new BigDecimal("2500.00"),
                new BigDecimal("18.00"),
                2000
        );

        MvcResult rcAResult = mockMvc.perform(post("/api/procurement/rate-contracts")
                        .header("Authorization", "Bearer " + adminJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rcAReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.totalContractQuantity", is(2000)))
                .andExpect(jsonPath("$.quantityTakenThroughWO", is(0)))
                .andExpect(jsonPath("$.netAvailableQuantity", is(2000)))
                .andReturn();

        Long rcAId = objectMapper.readTree(rcAResult.getResponse().getContentAsString()).get("id").asLong();

        // Verify 070-BLK is STILL available in master dropdown after RC-A is created
        availableCartridges = cartridgeService.getAllActiveCartridges();
        assertTrue(availableCartridges.stream().anyMatch(c -> c.getPartNumber().equalsIgnoreCase("070-BLK")));

        // -------------------------------------------------------------
        // STEP 3: Create Rate Contract B (RC-B) for the SAME Part Number 070-BLK -> Qty = 1000
        // -------------------------------------------------------------
        RateContractRequest rcBReq = new RateContractRequest(
                LocalDate.of(2026, 8, 5),
                "Supplier Beta",
                cartId,
                new BigDecimal("2450.00"),
                new BigDecimal("18.00"),
                1000
        );

        MvcResult rcBResult = mockMvc.perform(post("/api/procurement/rate-contracts")
                        .header("Authorization", "Bearer " + adminJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rcBReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.totalContractQuantity", is(1000)))
                .andExpect(jsonPath("$.quantityTakenThroughWO", is(0)))
                .andExpect(jsonPath("$.netAvailableQuantity", is(1000)))
                .andReturn();

        Long rcBId = objectMapper.readTree(rcBResult.getResponse().getContentAsString()).get("id").asLong();

        // -------------------------------------------------------------
        // STEP 4: Verify Procurement Register shows TWO distinct rows
        // -------------------------------------------------------------
        mockMvc.perform(get("/api/procurement/rate-contracts")
                        .header("Authorization", "Bearer " + adminJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].id", containsInAnyOrder(rcAId.intValue(), rcBId.intValue())))
                .andExpect(jsonPath("$[*].totalContractQuantity", containsInAnyOrder(2000, 1000)))
                .andExpect(jsonPath("$[*].netAvailableQuantity", containsInAnyOrder(2000, 1000)));

        // Store quantity is still 0 (contracts alone do NOT add stock)
        Cartridge cartAfterContracts = cartridgeRepository.findById(cartId).orElseThrow();
        assertEquals(0, cartAfterContracts.getStoreQuantity(), "Contracts alone must not add physical stock to Store");

        // -------------------------------------------------------------
        // STEP 5: Admin creates Call-Up PO on RC-A -> PO = 500
        // -------------------------------------------------------------
        CallUpPORequest poAReq = new CallUpPORequest(
                "PO-RCA-001",
                LocalDate.of(2026, 8, 10),
                "Supplier Alpha",
                rcAId,
                500,
                "First PO against RC-A"
        );

        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + adminJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(poAReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.poNumber", is("PO-RCA-001")))
                .andExpect(jsonPath("$.quantity", is(500)))
                .andExpect(jsonPath("$.remainingAvailableQuantity", is(1500)));

        // Verify RC-A: Total = 2000, WO = 500, Net Available = 1500
        RateContract rcAEntity = rateContractRepository.findById(rcAId).orElseThrow();
        assertEquals(2000, rcAEntity.getTotalContractQuantity());
        assertEquals(500, rcAEntity.getQuantityTakenThroughWO());
        assertEquals(1500, rcAEntity.getNetAvailableQuantity());

        // Verify RC-B remains UNCHANGED: Total = 1000, WO = 0, Net Available = 1000
        RateContract rcBEntity = rateContractRepository.findById(rcBId).orElseThrow();
        assertEquals(1000, rcBEntity.getTotalContractQuantity());
        assertEquals(0, rcBEntity.getQuantityTakenThroughWO());
        assertEquals(1000, rcBEntity.getNetAvailableQuantity());

        // Verify Store for 070-BLK increased by 500 -> Store = 500
        Cartridge cartAfterPOA = cartridgeRepository.findById(cartId).orElseThrow();
        assertEquals(500, cartAfterPOA.getStoreQuantity());

        // -------------------------------------------------------------
        // STEP 6: Admin creates Call-Up PO on RC-B -> PO = 300
        // -------------------------------------------------------------
        CallUpPORequest poBReq = new CallUpPORequest(
                "PO-RCB-001",
                LocalDate.of(2026, 8, 12),
                "Supplier Beta",
                rcBId,
                300,
                "First PO against RC-B"
        );

        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + adminJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(poBReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.poNumber", is("PO-RCB-001")))
                .andExpect(jsonPath("$.quantity", is(300)))
                .andExpect(jsonPath("$.remainingAvailableQuantity", is(700)));

        // Verify RC-A remains UNCHANGED by RC-B's PO: Total = 2000, WO = 500, Net = 1500
        rcAEntity = rateContractRepository.findById(rcAId).orElseThrow();
        assertEquals(2000, rcAEntity.getTotalContractQuantity());
        assertEquals(500, rcAEntity.getQuantityTakenThroughWO());
        assertEquals(1500, rcAEntity.getNetAvailableQuantity());

        // Verify RC-B: Total = 1000, WO = 300, Net = 700
        rcBEntity = rateContractRepository.findById(rcBId).orElseThrow();
        assertEquals(1000, rcBEntity.getTotalContractQuantity());
        assertEquals(300, rcBEntity.getQuantityTakenThroughWO());
        assertEquals(700, rcBEntity.getNetAvailableQuantity());

        // Verify Store for 070-BLK accumulated both POs: 500 + 300 = 800
        Cartridge cartAfterPOB = cartridgeRepository.findById(cartId).orElseThrow();
        assertEquals(800, cartAfterPOB.getStoreQuantity(), "Store must be 500 + 300 = 800");

        // -------------------------------------------------------------
        // STEP 7: Engineer logs Asset Usage for 070-BLK -> Usage = 500
        // -------------------------------------------------------------
        AssetUsageRequestDTO usageReq = new AssetUsageRequestDTO();
        usageReq.setCartridgeId(String.valueOf(cartId));
        usageReq.setPrinterId("Canon LBP246dw");
        usageReq.setQuantityUsed(500);
        usageReq.setUsageDate(LocalDate.now());
        usageReq.setBeneficiaryEmployeeNo("EMP2002");
        usageReq.setBeneficiaryEmployeeName("Officer Sharma");
        usageReq.setBeneficiaryDepartment("Refinery Operations");
        usageReq.setBeneficiarySeatOrCabinNo("Cabin-105");
        usageReq.setBeneficiaryLocation("Mathura Refinery");
        usageReq.setBeneficiaryEmail("sharma@iocl.co.in");

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(usageReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.quantityUsed", is(500)));

        // -------------------------------------------------------------
        // STEP 8: Verify Final Quantities
        // -------------------------------------------------------------
        // 1. Store Net Quantity = 800 - 500 = 300
        Cartridge finalCartridge = cartridgeRepository.findById(cartId).orElseThrow();
        assertEquals(300, finalCartridge.getStoreQuantity(), "Final store quantity must be 300");

        // 2. Executed Quantity in PostgreSQL Asset Usages = 500
        Long totalExecuted = assetUsageRepository.getTotalQuantityUsedByCartridgeId(cartId);
        assertEquals(500L, totalExecuted);

        // 3. RC-A must be UNCHANGED by Asset Usage: Total = 2000, WO = 500, Net Available = 1500
        rcAEntity = rateContractRepository.findById(rcAId).orElseThrow();
        assertEquals(2000, rcAEntity.getTotalContractQuantity());
        assertEquals(500, rcAEntity.getQuantityTakenThroughWO());
        assertEquals(1500, rcAEntity.getNetAvailableQuantity());

        // 4. RC-B must be UNCHANGED by Asset Usage: Total = 1000, WO = 300, Net Available = 700
        rcBEntity = rateContractRepository.findById(rcBId).orElseThrow();
        assertEquals(1000, rcBEntity.getTotalContractQuantity());
        assertEquals(300, rcBEntity.getQuantityTakenThroughWO());
        assertEquals(700, rcBEntity.getNetAvailableQuantity());

        // 5. Full View API check (GET /api/procurement/full-view)
        mockMvc.perform(get("/api/procurement/full-view")
                        .header("Authorization", "Bearer " + adminJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(2)))
                .andExpect(jsonPath("$.content[*].contractQuantity", containsInAnyOrder(2000, 1000)))
                .andExpect(jsonPath("$.content[*].callUpPoQuantity", containsInAnyOrder(500, 300)))
                .andExpect(jsonPath("$.content[*].netAvailableQuantity", containsInAnyOrder(1500, 700)))
                .andExpect(jsonPath("$.content[*].executedQuantity", everyItem(is(500))));

        // 6. User and Admin see the SAME Store Quantity (300)
        mockMvc.perform(get("/api/procurement/cartridges/" + cartId)
                        .header("Authorization", "Bearer " + userJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.storeQuantity", is(300)));

        mockMvc.perform(get("/api/procurement/cartridges/" + cartId)
                        .header("Authorization", "Bearer " + adminJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.storeQuantity", is(300)));
    }

    @Test
    @DisplayName("Multiple Part Number Independence (Section 40): PO on 070-BLK does not affect CF277X")
    void testMultiplePartNumberIndependence() throws Exception {
        // Contract A for 070-BLK (Qty = 2000)
        RateContract rcA = new RateContract();
        rcA.setContractDate(LocalDate.of(2026, 8, 1));
        rcA.setSupplierName("Vendor A");
        rcA.setCartridge(cartridge070Blk);
        rcA.setRatePerUnit(new BigDecimal("2000.00"));
        rcA.setTaxPercentage(new BigDecimal("18.00"));
        rcA.setTotalContractQuantity(2000);
        rcA = rateContractRepository.save(rcA);

        // Contract C for CF277X (Qty = 1000)
        RateContract rcC = new RateContract();
        rcC.setContractDate(LocalDate.of(2026, 8, 2));
        rcC.setSupplierName("Vendor C");
        rcC.setCartridge(cartridgeCF277X);
        rcC.setRatePerUnit(new BigDecimal("3500.00"));
        rcC.setTaxPercentage(new BigDecimal("18.00"));
        rcC.setTotalContractQuantity(1000);
        rcC = rateContractRepository.save(rcC);

        // Create PO on 070-BLK for 400 units
        CallUpPORequest poReq = new CallUpPORequest("PO-070-1", LocalDate.now(), "Vendor A", rcA.getId(), 400, "PO 070-BLK");
        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + adminJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(poReq)))
                .andExpect(status().isCreated());

        // 070-BLK store becomes 400
        Cartridge updated070 = cartridgeRepository.findById(cartridge070Blk.getId()).orElseThrow();
        assertEquals(400, updated070.getStoreQuantity());

        // CF277X store MUST remain 0 and its Rate Contract Net Available MUST remain 1000
        Cartridge updatedCF277X = cartridgeRepository.findById(cartridgeCF277X.getId()).orElseThrow();
        assertEquals(0, updatedCF277X.getStoreQuantity());

        RateContract updatedRCC = rateContractRepository.findById(rcC.getId()).orElseThrow();
        assertEquals(1000, updatedRCC.getTotalContractQuantity());
        assertEquals(0, updatedRCC.getQuantityTakenThroughWO());
        assertEquals(1000, updatedRCC.getNetAvailableQuantity());
    }

    @Test
    @DisplayName("Validation Rules: Rejection of excessive PO and excessive Asset Usage")
    void testExcessiveQuantityRejection() throws Exception {
        // Create Rate Contract with Contract Qty = 500
        RateContract rc = new RateContract();
        rc.setContractDate(LocalDate.of(2026, 8, 1));
        rc.setSupplierName("Supplier Test");
        rc.setCartridge(cartridge070Blk);
        rc.setRatePerUnit(new BigDecimal("2000.00"));
        rc.setTaxPercentage(new BigDecimal("18.00"));
        rc.setTotalContractQuantity(500);
        rc = rateContractRepository.save(rc);

        // 1. Attempt Call-Up PO with 600 units (exceeds Net Available 500) -> MUST BE REJECTED
        CallUpPORequest excessivePO = new CallUpPORequest("PO-EXCESS", LocalDate.now(), "Supplier Test", rc.getId(), 600, "Excessive PO");
        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + adminJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(excessivePO)))
                .andExpect(status().isBadRequest());

        // Verify nothing changed
        RateContract rcUnchanged = rateContractRepository.findById(rc.getId()).orElseThrow();
        assertEquals(500, rcUnchanged.getNetAvailableQuantity());
        assertEquals(0, rcUnchanged.getQuantityTakenThroughWO());
        assertEquals(0, callUpPORepository.count());

        // 2. Create valid PO of 200 units -> Store becomes 200
        CallUpPORequest validPO = new CallUpPORequest("PO-VALID", LocalDate.now(), "Supplier Test", rc.getId(), 200, "Valid PO");
        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + adminJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validPO)))
                .andExpect(status().isCreated());

        Cartridge cartWithStock = cartridgeRepository.findById(cartridge070Blk.getId()).orElseThrow();
        assertEquals(200, cartWithStock.getStoreQuantity());

        // 3. Attempt Asset Usage with 300 units (exceeds Store stock 200) -> MUST BE REJECTED
        AssetUsageRequestDTO excessiveUsage = new AssetUsageRequestDTO();
        excessiveUsage.setCartridgeId(String.valueOf(cartridge070Blk.getId()));
        excessiveUsage.setPrinterId("Canon LBP246dw");
        excessiveUsage.setQuantityUsed(300);
        excessiveUsage.setUsageDate(LocalDate.now());
        excessiveUsage.setBeneficiaryEmployeeNo("EMP999");
        excessiveUsage.setBeneficiaryEmployeeName("Emp Test");
        excessiveUsage.setBeneficiaryDepartment("IT");
        excessiveUsage.setBeneficiarySeatOrCabinNo("Cabin-1");
        excessiveUsage.setBeneficiaryLocation("HQ");
        excessiveUsage.setBeneficiaryEmail("emp.test@iocl.co.in");

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(excessiveUsage)))
                .andExpect(status().isBadRequest());

        // Store remains 200, no usage record created
        Cartridge cartStockUnchanged = cartridgeRepository.findById(cartridge070Blk.getId()).orElseThrow();
        assertEquals(200, cartStockUnchanged.getStoreQuantity());
        assertEquals(0, assetUsageRepository.count());
    }

    @Test
    @DisplayName("PO History Isolation (Sections 17-19): History is filtered by Rate Contract ID")
    void testRateContractHistoryIsolation() throws Exception {
        // RC-A (Total = 2000)
        RateContract rcA = new RateContract();
        rcA.setContractDate(LocalDate.of(2026, 8, 1));
        rcA.setSupplierName("Supplier Alpha");
        rcA.setCartridge(cartridge070Blk);
        rcA.setRatePerUnit(new BigDecimal("2000.00"));
        rcA.setTaxPercentage(new BigDecimal("18.00"));
        rcA.setTotalContractQuantity(2000);
        rcA = rateContractRepository.save(rcA);

        // RC-B (Total = 1000)
        RateContract rcB = new RateContract();
        rcB.setContractDate(LocalDate.of(2026, 8, 2));
        rcB.setSupplierName("Supplier Beta");
        rcB.setCartridge(cartridge070Blk);
        rcB.setRatePerUnit(new BigDecimal("2100.00"));
        rcB.setTaxPercentage(new BigDecimal("18.00"));
        rcB.setTotalContractQuantity(1000);
        rcB = rateContractRepository.save(rcB);

        // Create PO-A on RC-A (500)
        CallUpPORequest poA = new CallUpPORequest("PO-A-100", LocalDate.now(), "Supplier Alpha", rcA.getId(), 500, "PO A");
        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + adminJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(poA)))
                .andExpect(status().isCreated());

        // Create PO-B on RC-B (300)
        CallUpPORequest poB = new CallUpPORequest("PO-B-200", LocalDate.now(), "Supplier Beta", rcB.getId(), 300, "PO B");
        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + adminJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(poB)))
                .andExpect(status().isCreated());

        // RC-A History: MUST contain PO-A-100 and MUST NOT contain PO-B-200
        mockMvc.perform(get("/api/procurement/rate-contracts/" + rcA.getId() + "/history")
                        .header("Authorization", "Bearer " + adminJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rateContractId", is(rcA.getId().intValue())))
                .andExpect(jsonPath("$.totalContractQuantity", is(2000)))
                .andExpect(jsonPath("$.totalTakenThroughWO", is(500)))
                .andExpect(jsonPath("$.currentNetAvailable", is(1500)))
                .andExpect(jsonPath("$.history[*].poNumber", hasItem("PO-A-100")))
                .andExpect(jsonPath("$.history[*].poNumber", not(hasItem("PO-B-200"))));

        // RC-B History: MUST contain PO-B-200 and MUST NOT contain PO-A-100
        mockMvc.perform(get("/api/procurement/rate-contracts/" + rcB.getId() + "/history")
                        .header("Authorization", "Bearer " + adminJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rateContractId", is(rcB.getId().intValue())))
                .andExpect(jsonPath("$.totalContractQuantity", is(1000)))
                .andExpect(jsonPath("$.totalTakenThroughWO", is(300)))
                .andExpect(jsonPath("$.currentNetAvailable", is(700)))
                .andExpect(jsonPath("$.history[*].poNumber", hasItem("PO-B-200")))
                .andExpect(jsonPath("$.history[*].poNumber", not(hasItem("PO-A-100"))));
    }
}
