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
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AlertControllerTest {

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
    private CallUpPurchaseOrderRepository callUpPORepository;

    @Autowired
    private ProcurementAlertRepository alertRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String jwtToken;
    private Cartridge testCartridge;

    @BeforeEach
    void setUp() throws Exception {
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

        String responseBody = loginResult.getResponse().getContentAsString();
        jwtToken = objectMapper.readTree(responseBody).get("token").asText();

        testCartridge = new Cartridge("Canon LBP246dw", 45, "Canon 070 Black", "070-BLK");
        testCartridge = cartridgeRepository.save(testCartridge);

        CartridgeThreshold threshold = new CartridgeThreshold(testCartridge, 15, 5);
        thresholdRepository.save(threshold);
    }

    @Test
    @DisplayName("ALERT 1 Flow: RateContract created (100) -> PO (85) -> Net Available (15) <= Threshold (15) -> Trigger Alert")
    void testAlertGenerationOnLowAvailability() throws Exception {
        // Step 1: Create Rate Contract with 100 qty
        RateContractRequest rcRequest = new RateContractRequest(
                LocalDate.now(),
                "M/s Canon India Pvt Ltd",
                testCartridge.getId(),
                new BigDecimal("4500.00"),
                new BigDecimal("18.00"),
                100
        );

        MvcResult rcResult = mockMvc.perform(post("/api/procurement/rate-contracts")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rcRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Long rcId = objectMapper.readTree(rcResult.getResponse().getContentAsString()).get("id").asLong();

        // Initially 100 > 15 -> No unread alert
        List<ProcurementAlert> alertsBefore = alertRepository.findAll();
        long unreadBefore = alertRepository.countByStatus(AlertStatus.UNREAD);
        assertEquals(0, unreadBefore);

        // Step 2: Create Call-Up PO of 85 units -> Net Available = 100 - 85 = 15 <= 15
        CallUpPORequest poRequest = new CallUpPORequest(
                "PO/2026/001",
                LocalDate.now(),
                "M/s Canon India Pvt Ltd",
                rcId,
                85,
                "Regular monthly requirement"
        );

        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(poRequest)))
                .andExpect(status().isCreated());

        // Step 3: Verify Alert 1 is created in PostgreSQL
        List<ProcurementAlert> unreadAlerts = alertRepository.findByStatusWithCartridgeOrderByCreatedAtDesc(AlertStatus.UNREAD);
        assertEquals(1, unreadAlerts.size());
        ProcurementAlert alert = unreadAlerts.get(0);
        assertEquals(AlertType.PROCUREMENT_THRESHOLD, alert.getAlertType());
        assertEquals(15, alert.getNetAvailableQuantity());
        assertEquals(15, alert.getThreshold());
        assertTrue(alert.getMessage().contains("Canon 070 Black"));
        assertTrue(alert.getMessage().contains("15 units remaining"));

        // Step 4: Verify via GET /api/alerts/unread
        mockMvc.perform(get("/api/alerts/unread")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].partNumber", is("070-BLK")))
                .andExpect(jsonPath("$[0].netAvailableQuantity", is(15)))
                .andExpect(jsonPath("$[0].threshold", is(15)))
                .andExpect(jsonPath("$[0].status", is("UNREAD")));

        // Step 5: Verify GET /api/alerts/count
        mockMvc.perform(get("/api/alerts/count")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount", is(1)))
                .andExpect(jsonPath("$.totalCount", is(1)));

        // Step 6: Mark alert as read via PATCH /api/alerts/{id}/read
        mockMvc.perform(patch("/api/alerts/" + alert.getId() + "/read")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("READ")));

        // Step 7: Verify unread count becomes 0
        mockMvc.perform(get("/api/alerts/count")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount", is(0)));
    }

    @Test
    @DisplayName("ALERT 1: Idempotency - Repeated checks do not create duplicate unread alerts")
    void testAlertIdempotency() throws Exception {
        // Create Rate Contract with 10 qty <= threshold (15)
        RateContractRequest rcRequest = new RateContractRequest(
                LocalDate.now(),
                "M/s Canon India Pvt Ltd",
                testCartridge.getId(),
                new BigDecimal("4500.00"),
                new BigDecimal("18.00"),
                10
        );

        mockMvc.perform(post("/api/procurement/rate-contracts")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rcRequest)))
                .andExpect(status().isCreated());

        // Should have exactly 1 unread alert
        assertEquals(1, alertRepository.countByStatus(AlertStatus.UNREAD));

        // Create PO of 2 units -> Net Available becomes 8 <= 15
        RateContract rc = rateContractRepository.findByCartridgeId(testCartridge.getId()).get(0);
        CallUpPORequest poRequest = new CallUpPORequest(
                "PO/2026/IDEMP-01",
                LocalDate.now(),
                "M/s Canon India Pvt Ltd",
                rc.getId(),
                2,
                "Partial"
        );

        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(poRequest)))
                .andExpect(status().isCreated());

        // Unread alert count must STILL be 1 (updated in place, not duplicated)
        List<ProcurementAlert> unreadAlerts = alertRepository.findByStatusWithCartridgeOrderByCreatedAtDesc(AlertStatus.UNREAD);
        assertEquals(1, unreadAlerts.size());
        assertEquals(8, unreadAlerts.get(0).getNetAvailableQuantity());
    }

    @Test
    @DisplayName("ALERT 2 Endpoint: GET /api/alerts/tendering returns calculated Alert 2 fields")
    void testGetTenderingAlertsEndpoint() throws Exception {
        // Store = 20, RC = 10, Threshold = 50 -> Combined = 30 < 50 -> URGENT
        testCartridge.setStoreQuantity(20);
        cartridgeRepository.save(testCartridge);

        CartridgeThreshold threshold = thresholdRepository.findByCartridgeId(testCartridge.getId()).get();
        threshold.setTenderingThreshold(50);
        thresholdRepository.save(threshold);

        RateContract rc = new RateContract();
        rc.setCartridge(testCartridge);
        rc.setContractDate(LocalDate.now());
        rc.setSupplierName("M/s Canon India Pvt Ltd");
        rc.setRatePerUnit(new BigDecimal("3500.00"));
        rc.setTaxPercentage(new BigDecimal("18.00"));
        rc.setTotalContractQuantity(10);
        rc.setQuantityAlreadyExecuted(0);
        rc.setQuantityTakenThroughWO(0);
        rc.recalculateNetAvailableQuantity();
        rateContractRepository.save(rc);

        mockMvc.perform(get("/api/alerts/tendering")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].partNumber", is("070-BLK")))
                .andExpect(jsonPath("$[0].storeNetAvailableQuantity", is(20)))
                .andExpect(jsonPath("$[0].rateContractNetAvailableQuantity", is(10)))
                .andExpect(jsonPath("$[0].combinedNetAvailableQuantity", is(30)))
                .andExpect(jsonPath("$[0].tenderingThreshold", is(50)))
                .andExpect(jsonPath("$[0].difference", is(-20)))
                .andExpect(jsonPath("$[0].status", is("TENDERING_REQUIRED")))
                .andExpect(jsonPath("$[0].priority", is("URGENT")))
                .andExpect(jsonPath("$[0].isUrgent", is(true)));
    }
}
