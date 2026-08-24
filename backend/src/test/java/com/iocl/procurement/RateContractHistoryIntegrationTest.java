package com.iocl.procurement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iocl.procurement.dto.request.CallUpPORequest;
import com.iocl.procurement.dto.request.LoginRequest;
import com.iocl.procurement.dto.request.RateContractRequest;
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

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RateContractHistoryIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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
    private PasswordEncoder passwordEncoder;

    private String jwtToken;
    private Cartridge testCartridgeA;
    private Cartridge testCartridgeB;

    @BeforeEach
    void setUp() throws Exception {
        assetRepository.deleteAll();
        alertRepository.deleteAll();
        callUpPORepository.deleteAll();
        rateContractRepository.deleteAll();
        thresholdRepository.deleteAll();
        cartridgeRepository.deleteAll();
        adminRepository.deleteAll();

        // 1. Create admin
        Admin admin = new Admin("IOCL Admin", "admin@iocl.co.in", passwordEncoder.encode("Test@12345"), Role.ADMIN);
        adminRepository.save(admin);

        // 2. Login to get JWT
        LoginRequest loginRequest = new LoginRequest("admin@iocl.co.in", "Test@12345");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        jwtToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();

        // 3. Create test cartridge master records
        testCartridgeA = new Cartridge("HP LaserJet Enterprise M507", 50, "HP 89A Black Toner", "CF289A");
        testCartridgeA = cartridgeRepository.save(testCartridgeA);

        testCartridgeB = new Cartridge("Canon imageCLASS LBP246dw", 20, "Canon 070 Black", "070-BLK");
        testCartridgeB = cartridgeRepository.save(testCartridgeB);
    }

    @Test
    @DisplayName("1. One Rate Contract with multiple Call-Up POs aggregates WO Quantity and persists history.")
    void testMultipleCallUpPOsForOneRateContract() throws Exception {
        // Step 1: Create Rate Contract (Contract Qty = 1000)
        RateContractRequest rcRequest = new RateContractRequest(
                LocalDate.of(2026, 8, 17),
                "Raghav Enterprises",
                testCartridgeA.getId(),
                new BigDecimal("4500.00"),
                new BigDecimal("18.00"),
                1000
        );

        MvcResult rcResult = mockMvc.perform(post("/api/procurement/rate-contracts")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rcRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.totalContractQuantity", is(1000)))
                .andExpect(jsonPath("$.quantityTakenThroughWO", is(0)))
                .andExpect(jsonPath("$.netAvailableQuantity", is(1000)))
                .andReturn();

        Long rcId = objectMapper.readTree(rcResult.getResponse().getContentAsString()).get("id").asLong();

        // Step 2: Create Call-Up PO #1 (Qty = 50)
        CallUpPORequest po1 = new CallUpPORequest(
                "PO-2026-001",
                LocalDate.of(2026, 8, 17),
                "Raghav Enterprises",
                rcId,
                50,
                "First dispatch batch"
        );
        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(po1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.poNumber", is("PO-2026-001")))
                .andExpect(jsonPath("$.quantity", is(50)))
                .andExpect(jsonPath("$.remainingAvailableQuantity", is(950)));

        // Step 3: Create Call-Up PO #2 (Qty = 50)
        CallUpPORequest po2 = new CallUpPORequest(
                "PO-2026-002",
                LocalDate.of(2026, 9, 17),
                "Raghav Enterprises",
                rcId,
                50,
                "Second dispatch batch"
        );
        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(po2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.poNumber", is("PO-2026-002")))
                .andExpect(jsonPath("$.quantity", is(50)))
                .andExpect(jsonPath("$.remainingAvailableQuantity", is(900)));

        // Step 4: Create Call-Up PO #3 (Qty = 100)
        CallUpPORequest po3 = new CallUpPORequest(
                "PO-2026-003",
                LocalDate.of(2026, 10, 20),
                "Raghav Enterprises",
                rcId,
                100,
                "Third dispatch batch"
        );
        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(po3)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.poNumber", is("PO-2026-003")))
                .andExpect(jsonPath("$.quantity", is(100)))
                .andExpect(jsonPath("$.remainingAvailableQuantity", is(800)));

        // Step 5: Verify Procurement Register (GET /api/procurement/rate-contracts) shows EXACTLY ONE Rate Contract row with aggregated WO = 200
        mockMvc.perform(get("/api/procurement/rate-contracts")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(rcId.intValue())))
                .andExpect(jsonPath("$[0].totalContractQuantity", is(1000)))
                .andExpect(jsonPath("$[0].quantityTakenThroughWO", is(200)))
                .andExpect(jsonPath("$[0].netAvailableQuantity", is(800)));

        // Step 6: View Details (GET /api/procurement/rate-contracts/{id}) returns complete Call-Up PO history
        mockMvc.perform(get("/api/procurement/rate-contracts/" + rcId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(rcId.intValue())))
                .andExpect(jsonPath("$.supplierName", is("Raghav Enterprises")))
                .andExpect(jsonPath("$.totalContractQuantity", is(1000)))
                .andExpect(jsonPath("$.totalWOQuantity", is(200)))
                .andExpect(jsonPath("$.remainingContractQuantity", is(800)))
                .andExpect(jsonPath("$.callUpPOs", hasSize(3)))
                .andExpect(jsonPath("$.callUpPOs[*].poNumber", containsInAnyOrder("PO-2026-001", "PO-2026-002", "PO-2026-003")))
                .andExpect(jsonPath("$.callUpPOs[*].quantity", containsInAnyOrder(50, 50, 100)));

        // Step 7: Direct PostgreSQL assertions
        assertEquals(1, rateContractRepository.count());
        assertEquals(3, callUpPORepository.count());
        assertEquals(3, callUpPORepository.findByRateContractIdOrderByCreatedAtDesc(rcId).size());
    }

    @Test
    @DisplayName("2. Multiple Rate Contracts have completely isolated PO histories")
    void testMultipleRateContractsIsolation() throws Exception {
        // Contract A (Qty = 1000)
        RateContract rcA = new RateContract();
        rcA.setContractDate(LocalDate.of(2026, 8, 1));
        rcA.setSupplierName("Supplier Alpha");
        rcA.setCartridge(testCartridgeA);
        rcA.setRatePerUnit(new BigDecimal("3000.00"));
        rcA.setTaxPercentage(new BigDecimal("18.00"));
        rcA.setTotalContractQuantity(1000);
        rcA = rateContractRepository.save(rcA);

        // Contract B (Qty = 500)
        RateContract rcB = new RateContract();
        rcB.setContractDate(LocalDate.of(2026, 8, 5));
        rcB.setSupplierName("Supplier Beta");
        rcB.setCartridge(testCartridgeB);
        rcB.setRatePerUnit(new BigDecimal("2500.00"));
        rcB.setTaxPercentage(new BigDecimal("18.00"));
        rcB.setTotalContractQuantity(500);
        rcB = rateContractRepository.save(rcB);

        // Create POs for Contract A (50, 100)
        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CallUpPORequest("PO-A-1", LocalDate.now(), "Supplier Alpha", rcA.getId(), 50, "A1"))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CallUpPORequest("PO-A-2", LocalDate.now(), "Supplier Alpha", rcA.getId(), 100, "A2"))))
                .andExpect(status().isCreated());

        // Create PO for Contract B (25)
        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CallUpPORequest("PO-B-1", LocalDate.now(), "Supplier Beta", rcB.getId(), 25, "B1"))))
                .andExpect(status().isCreated());

        // Verify Contract A details contain ONLY PO-A-1 and PO-A-2
        mockMvc.perform(get("/api/procurement/rate-contracts/" + rcA.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.callUpPOs", hasSize(2)))
                .andExpect(jsonPath("$.totalWOQuantity", is(150)))
                .andExpect(jsonPath("$.remainingContractQuantity", is(850)))
                .andExpect(jsonPath("$.callUpPOs[*].poNumber", containsInAnyOrder("PO-A-1", "PO-A-2")));

        // Verify Contract B details contain ONLY PO-B-1
        mockMvc.perform(get("/api/procurement/rate-contracts/" + rcB.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.callUpPOs", hasSize(1)))
                .andExpect(jsonPath("$.totalWOQuantity", is(25)))
                .andExpect(jsonPath("$.remainingContractQuantity", is(475)))
                .andExpect(jsonPath("$.callUpPOs[0].poNumber", is("PO-B-1")));
    }

    @Test
    @DisplayName("3. Rate Contract with zero Call-Up POs returns empty history and 0 total WO quantity")
    void testRateContractWithZeroPOs() throws Exception {
        RateContract rc = new RateContract();
        rc.setContractDate(LocalDate.of(2026, 8, 1));
        rc.setSupplierName("New Vendor");
        rc.setCartridge(testCartridgeA);
        rc.setRatePerUnit(new BigDecimal("1000.00"));
        rc.setTaxPercentage(new BigDecimal("18.00"));
        rc.setTotalContractQuantity(500);
        rc = rateContractRepository.save(rc);

        mockMvc.perform(get("/api/procurement/rate-contracts/" + rc.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.callUpPOs", hasSize(0)))
                .andExpect(jsonPath("$.totalWOQuantity", is(0)))
                .andExpect(jsonPath("$.remainingContractQuantity", is(500)));

        mockMvc.perform(get("/api/procurement/rate-contracts/" + rc.getId() + "/call-up-pos")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("4. Non-existent Rate Contract returns 404")
    void testRateContractNotFound() throws Exception {
        mockMvc.perform(get("/api/procurement/rate-contracts/999999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("5. Unauthenticated request without JWT returns 401")
    void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/procurement/rate-contracts/1"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/procurement/rate-contracts/1/call-up-pos"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("6. Cartridge PO History Endpoint returns comprehensive history for part number")
    void testCartridgeProcurementHistoryEndpoint() throws Exception {
        // Contract 1: CF289A (1000 qty)
        RateContract rc1 = new RateContract();
        rc1.setContractDate(LocalDate.of(2026, 8, 1));
        rc1.setSupplierName("Raghav Enterprises");
        rc1.setCartridge(testCartridgeA);
        rc1.setRatePerUnit(new BigDecimal("4500.00"));
        rc1.setTaxPercentage(new BigDecimal("18.00"));
        rc1.setTotalContractQuantity(1000);
        rc1.setQuantityTakenThroughWO(150);
        rc1.recalculateNetAvailableQuantity();
        rc1 = rateContractRepository.save(rc1);

        // PO 1 for Contract 1 (100 qty)
        CallUpPurchaseOrder po1 = new CallUpPurchaseOrder();
        po1.setPoNumber("PO-2026-001");
        po1.setPoDate(LocalDate.of(2026, 8, 10));
        po1.setSupplierName("Raghav Enterprises");
        po1.setRateContract(rc1);
        po1.setQuantity(100);
        po1.setRemarks("Batch 1");
        callUpPORepository.save(po1);

        // PO 2 for Contract 1 (50 qty)
        CallUpPurchaseOrder po2 = new CallUpPurchaseOrder();
        po2.setPoNumber("PO-2026-002");
        po2.setPoDate(LocalDate.of(2026, 8, 15));
        po2.setSupplierName("Raghav Enterprises");
        po2.setRateContract(rc1);
        po2.setQuantity(50);
        po2.setRemarks("Batch 2");
        callUpPORepository.save(po2);

        // Test GET /api/procurement/history/cartridge/{id}
        mockMvc.perform(get("/api/procurement/history/cartridge/" + testCartridgeA.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartridgeId", is(testCartridgeA.getId().intValue())))
                .andExpect(jsonPath("$.partNumber", is("CF289A")))
                .andExpect(jsonPath("$.currentNetAvailable", is(850)))
                .andExpect(jsonPath("$.totalContractQuantity", is(1000)))
                .andExpect(jsonPath("$.totalTakenThroughWO", is(150)))
                .andExpect(jsonPath("$.totalRateContracts", is(1)))
                .andExpect(jsonPath("$.totalCallUpPOs", is(2)))
                .andExpect(jsonPath("$.history", hasSize(3))) // 1 RC + 2 POs
                .andExpect(jsonPath("$.history[*].recordType", containsInAnyOrder("RATE_CONTRACT", "CALL_UP_PO", "CALL_UP_PO")))
                .andExpect(jsonPath("$.history[*].poNumber", containsInAnyOrder("RC-" + rc1.getId(), "PO-2026-001", "PO-2026-002")));

        // Test GET /api/procurement/history/part-number/{partNumber}
        mockMvc.perform(get("/api/procurement/history/part-number/CF289A")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.partNumber", is("CF289A")))
                .andExpect(jsonPath("$.currentNetAvailable", is(850)))
                .andExpect(jsonPath("$.history", hasSize(3)));

        // Test GET /api/procurement/history/rate-contract/{id}
        mockMvc.perform(get("/api/procurement/history/rate-contract/" + rc1.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentNetAvailable", is(850)))
                .andExpect(jsonPath("$.supplierName", is("Raghav Enterprises")))
                .andExpect(jsonPath("$.rateContractId", is(rc1.getId().intValue())))
                .andExpect(jsonPath("$.totalTakenThroughWO", is(150)))
                .andExpect(jsonPath("$.history", hasSize(3)));

        // Test GET /api/procurement/rate-contracts/{id}/history alias
        mockMvc.perform(get("/api/procurement/rate-contracts/" + rc1.getId() + "/history")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.supplierName", is("Raghav Enterprises")))
                .andExpect(jsonPath("$.history", hasSize(3)));
    }

    @Test
    @DisplayName("7. Multi-Supplier isolation: Expanding a specific Rate Contract returns ONLY that supplier's POs")
    void testMultiSupplierHistoryIsolation() throws Exception {
        // Create Contract 1 for Sagar Varshney on testCartridgeA (070-BLK / CF289A)
        RateContract rcSagar = new RateContract();
        rcSagar.setContractDate(LocalDate.of(2026, 8, 1));
        rcSagar.setSupplierName("Sagar Varshney");
        rcSagar.setCartridge(testCartridgeA);
        rcSagar.setRatePerUnit(new BigDecimal("4000.00"));
        rcSagar.setTaxPercentage(new BigDecimal("18.00"));
        rcSagar.setTotalContractQuantity(500);
        rcSagar.setQuantityTakenThroughWO(60);
        rcSagar.recalculateNetAvailableQuantity();
        rcSagar = rateContractRepository.save(rcSagar);

        // Sagar PO 1 (50 qty)
        CallUpPurchaseOrder poSagar1 = new CallUpPurchaseOrder();
        poSagar1.setPoNumber("PO-SAGAR-001");
        poSagar1.setPoDate(LocalDate.of(2026, 8, 5));
        poSagar1.setSupplierName("Sagar Varshney");
        poSagar1.setRateContract(rcSagar);
        poSagar1.setQuantity(50);
        callUpPORepository.save(poSagar1);

        // Sagar PO 2 (10 qty)
        CallUpPurchaseOrder poSagar2 = new CallUpPurchaseOrder();
        poSagar2.setPoNumber("PO-SAGAR-002");
        poSagar2.setPoDate(LocalDate.of(2026, 8, 12));
        poSagar2.setSupplierName("Sagar Varshney");
        poSagar2.setRateContract(rcSagar);
        poSagar2.setQuantity(10);
        callUpPORepository.save(poSagar2);

        // Create Contract 2 for Rajesh on the SAME cartridge
        RateContract rcRajesh = new RateContract();
        rcRajesh.setContractDate(LocalDate.of(2026, 8, 2));
        rcRajesh.setSupplierName("Rajesh");
        rcRajesh.setCartridge(testCartridgeA);
        rcRajesh.setRatePerUnit(new BigDecimal("4100.00"));
        rcRajesh.setTaxPercentage(new BigDecimal("18.00"));
        rcRajesh.setTotalContractQuantity(300);
        rcRajesh.setQuantityTakenThroughWO(80);
        rcRajesh.recalculateNetAvailableQuantity();
        rcRajesh = rateContractRepository.save(rcRajesh);

        // Rajesh PO 1 (80 qty)
        CallUpPurchaseOrder poRajesh1 = new CallUpPurchaseOrder();
        poRajesh1.setPoNumber("PO-RAJESH-001");
        poRajesh1.setPoDate(LocalDate.of(2026, 8, 14));
        poRajesh1.setSupplierName("Rajesh");
        poRajesh1.setRateContract(rcRajesh);
        poRajesh1.setQuantity(80);
        callUpPORepository.save(poRajesh1);

        // Query Sagar's Rate Contract History -> MUST CONTAIN ONLY SAGAR'S RECORDS (1 RC + 2 POs)
        mockMvc.perform(get("/api/procurement/rate-contracts/" + rcSagar.getId() + "/history")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.supplierName", is("Sagar Varshney")))
                .andExpect(jsonPath("$.rateContractId", is(rcSagar.getId().intValue())))
                .andExpect(jsonPath("$.history", hasSize(3)))
                .andExpect(jsonPath("$.history[*].supplierName", everyItem(is("Sagar Varshney"))))
                .andExpect(jsonPath("$.history[*].poNumber", containsInAnyOrder("RC-" + rcSagar.getId(), "PO-SAGAR-001", "PO-SAGAR-002")))
                .andExpect(jsonPath("$.history[*].poNumber", not(hasItem("PO-RAJESH-001"))));

        // Query Rajesh's Rate Contract History -> MUST CONTAIN ONLY RAJESH'S RECORDS (1 RC + 1 PO)
        mockMvc.perform(get("/api/procurement/rate-contracts/" + rcRajesh.getId() + "/history")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.supplierName", is("Rajesh")))
                .andExpect(jsonPath("$.rateContractId", is(rcRajesh.getId().intValue())))
                .andExpect(jsonPath("$.history", hasSize(2)))
                .andExpect(jsonPath("$.history[*].supplierName", everyItem(is("Rajesh"))))
                .andExpect(jsonPath("$.history[*].poNumber", containsInAnyOrder("RC-" + rcRajesh.getId(), "PO-RAJESH-001")))
                .andExpect(jsonPath("$.history[*].poNumber", not(hasItem("PO-SAGAR-001"))))
                .andExpect(jsonPath("$.history[*].poNumber", not(hasItem("PO-SAGAR-002"))));
    }

    @Test
    @DisplayName("8. Chronological Running Balance: Contract 193 - 20 - 100 - 10 - 3 = 60, historical rows show 60, 63, 73, 173, 193")
    void testChronologicalRunningBalanceCalculation() throws Exception {
        // Create Rate Contract with 193 Contract Qty for Anjali Varshney
        RateContract rc = new RateContract();
        rc.setContractDate(LocalDate.of(2026, 8, 10));
        rc.setSupplierName("Anjali Varshney");
        rc.setCartridge(testCartridgeA);
        rc.setRatePerUnit(new BigDecimal("4200.00"));
        rc.setTaxPercentage(new BigDecimal("18.00"));
        rc.setTotalContractQuantity(193);
        rc.setQuantityTakenThroughWO(133);
        rc.recalculateNetAvailableQuantity(); // 193 - 133 = 60
        rc = rateContractRepository.save(rc);

        // Transaction 1: 13-Aug, 20 taken -> remaining 173
        CallUpPurchaseOrder po1 = new CallUpPurchaseOrder();
        po1.setPoNumber("WO/2026");
        po1.setPoDate(LocalDate.of(2026, 8, 13));
        po1.setSupplierName("Anjali Varshney");
        po1.setRateContract(rc);
        po1.setQuantity(20);
        callUpPORepository.save(po1);

        // Transaction 2: 17-Aug, 100 taken -> remaining 73
        CallUpPurchaseOrder po2 = new CallUpPurchaseOrder();
        po2.setPoNumber("092nwjsn");
        po2.setPoDate(LocalDate.of(2026, 8, 17));
        po2.setSupplierName("Anjali Varshney");
        po2.setRateContract(rc);
        po2.setQuantity(100);
        callUpPORepository.save(po2);

        // Transaction 3: 18-Aug, 10 taken -> remaining 63
        CallUpPurchaseOrder po3 = new CallUpPurchaseOrder();
        po3.setPoNumber("76t7zgu");
        po3.setPoDate(LocalDate.of(2026, 8, 18));
        po3.setSupplierName("Anjali Varshney");
        po3.setRateContract(rc);
        po3.setQuantity(10);
        callUpPORepository.save(po3);

        // Transaction 4: 18-Aug, 3 taken -> remaining 60
        CallUpPurchaseOrder po4 = new CallUpPurchaseOrder();
        po4.setPoNumber("987897jkjb");
        po4.setPoDate(LocalDate.of(2026, 8, 18));
        po4.setSupplierName("Anjali Varshney");
        po4.setRateContract(rc);
        po4.setQuantity(3);
        callUpPORepository.save(po4);

        // Query Rate Contract History
        mockMvc.perform(get("/api/procurement/rate-contracts/" + rc.getId() + "/history")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentNetAvailable", is(60)))
                .andExpect(jsonPath("$.totalContractQuantity", is(193)))
                .andExpect(jsonPath("$.totalTakenThroughWO", is(133)))
                .andExpect(jsonPath("$.history", hasSize(5)))
                // Verify newest-first order and exact running balances after each transaction:
                // Index 0: 987897jkjb (3 taken) -> running balance = 60
                .andExpect(jsonPath("$.history[0].poNumber", is("987897jkjb")))
                .andExpect(jsonPath("$.history[0].quantityTakenThroughWO", is(3)))
                .andExpect(jsonPath("$.history[0].netAvailableQuantity", is(60)))
                // Index 1: 76t7zgu (10 taken) -> running balance = 63
                .andExpect(jsonPath("$.history[1].poNumber", is("76t7zgu")))
                .andExpect(jsonPath("$.history[1].quantityTakenThroughWO", is(10)))
                .andExpect(jsonPath("$.history[1].netAvailableQuantity", is(63)))
                // Index 2: 092nwjsn (100 taken) -> running balance = 73
                .andExpect(jsonPath("$.history[2].poNumber", is("092nwjsn")))
                .andExpect(jsonPath("$.history[2].quantityTakenThroughWO", is(100)))
                .andExpect(jsonPath("$.history[2].netAvailableQuantity", is(73)))
                // Index 3: WO/2026 (20 taken) -> running balance = 173
                .andExpect(jsonPath("$.history[3].poNumber", is("WO/2026")))
                .andExpect(jsonPath("$.history[3].quantityTakenThroughWO", is(20)))
                .andExpect(jsonPath("$.history[3].netAvailableQuantity", is(173)))
                // Index 4: RC-x (Rate Contract starting balance) -> 193
                .andExpect(jsonPath("$.history[4].poNumber", is("RC-" + rc.getId())))
                .andExpect(jsonPath("$.history[4].contractQuantity", is(193)))
                .andExpect(jsonPath("$.history[4].netAvailableQuantity", is(193)));
    }
}
