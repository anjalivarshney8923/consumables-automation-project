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
    @DisplayName("1. One Rate Contract with multiple Call-Up POs aggregates WO Quantity and persists history in PostgreSQL")
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
}
