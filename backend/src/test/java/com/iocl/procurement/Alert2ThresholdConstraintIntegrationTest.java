package com.iocl.procurement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iocl.procurement.dto.request.LoginRequest;
import com.iocl.procurement.dto.request.UpdateThresholdRequest;
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
public class Alert2ThresholdConstraintIntegrationTest {

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
    private PasswordEncoder passwordEncoder;

    private String jwtToken;
    private Cartridge cartridge;

    @BeforeEach
    void setUp() throws Exception {
        alertRepository.deleteAll();
        rateContractRepository.deleteAll();
        thresholdRepository.deleteAll();
        cartridgeRepository.deleteAll();
        adminRepository.deleteAll();

        Admin admin = new Admin("IOCL Admin", "admin@iocl.co.in", passwordEncoder.encode("Test@12345"), Role.ADMIN);
        adminRepository.save(admin);

        LoginRequest loginRequest = new LoginRequest("admin@iocl.co.in", "Test@12345");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        jwtToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();

        cartridge = new Cartridge("Canon LBP246dw", 45, "Canon 070 Black", "070-BLK");
        cartridge.setStoreQuantity(0);
        cartridge = cartridgeRepository.save(cartridge);

        CartridgeThreshold threshold = new CartridgeThreshold(cartridge, 15, 180);
        thresholdRepository.save(threshold);
    }

    private RateContract createRateContract(int totalQty) {
        RateContract rc = new RateContract();
        rc.setCartridge(cartridge);
        rc.setContractDate(LocalDate.now());
        rc.setSupplierName("M/s Canon India");
        rc.setRatePerUnit(new BigDecimal("4500.00"));
        rc.setTaxPercentage(new BigDecimal("18.00"));
        rc.setTotalContractQuantity(totalQty);
        rc.setQuantityAlreadyExecuted(0);
        rc.setQuantityTakenThroughWO(0);
        rc.recalculateNetAvailableQuantity();
        return rateContractRepository.save(rc);
    }

    @Test
    @DisplayName("CASE 1: Store=0, RC=173, Threshold=180 -> Combined=173, Diff=-7 -> URGENT TENDERING_REQUIRED")
    void testCase1_TenderingRequired() throws Exception {
        createRateContract(173);

        UpdateThresholdRequest req = new UpdateThresholdRequest(15, 180, 0);

        mockMvc.perform(put("/api/thresholds/" + cartridge.getId())
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.storeQuantity", is(0)))
                .andExpect(jsonPath("$.rateContractQuantity", is(173)))
                .andExpect(jsonPath("$.combinedNetAvailableQuantity", is(173)))
                .andExpect(jsonPath("$.tenderingThreshold", is(180)));

        // Verify database alert table
        List<ProcurementAlert> alerts = alertRepository.findAll();
        ProcurementAlert tenderingAlert = alerts.stream()
                .filter(a -> a.getAlertType() == AlertType.TENDERING_REQUIRED)
                .findFirst()
                .orElse(null);

        assertNotNull(tenderingAlert, "TENDERING_REQUIRED alert must be persisted in database");
        assertEquals(AlertSeverity.URGENT, tenderingAlert.getSeverity());
        assertEquals(AlertStatus.UNREAD, tenderingAlert.getStatus());
        assertEquals(173, tenderingAlert.getCombinedNetAvailableQuantity());
        assertEquals(180, tenderingAlert.getTenderingThreshold());
    }

    @Test
    @DisplayName("CASE 2: Store=0, RC=173, Threshold=150 -> Combined=173, Diff=+23 -> ADEQUATE / Resolved")
    void testCase2_Adequate() throws Exception {
        createRateContract(173);

        UpdateThresholdRequest req = new UpdateThresholdRequest(15, 150, 0);

        mockMvc.perform(put("/api/thresholds/" + cartridge.getId())
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.combinedNetAvailableQuantity", is(173)))
                .andExpect(jsonPath("$.tenderingThreshold", is(150)));

        // Verify no UNREAD tendering alert exists
        long unreadTendering = alertRepository.findAll().stream()
                .filter(a -> a.getAlertType() == AlertType.TENDERING_REQUIRED && a.getStatus() == AlertStatus.UNREAD)
                .count();
        assertEquals(0, unreadTendering);
    }

    @Test
    @DisplayName("CASE 3: Store=100, RC=100, Threshold=200 -> Combined=200, Diff=0 -> ADEQUATE (200 is NOT < 200)")
    void testCase3_EqualBoundary() throws Exception {
        createRateContract(100);

        UpdateThresholdRequest req = new UpdateThresholdRequest(15, 200, 100);

        mockMvc.perform(put("/api/thresholds/" + cartridge.getId())
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.storeQuantity", is(100)))
                .andExpect(jsonPath("$.rateContractQuantity", is(100)))
                .andExpect(jsonPath("$.combinedNetAvailableQuantity", is(200)))
                .andExpect(jsonPath("$.tenderingThreshold", is(200)));

        long unreadTendering = alertRepository.findAll().stream()
                .filter(a -> a.getAlertType() == AlertType.TENDERING_REQUIRED && a.getStatus() == AlertStatus.UNREAD)
                .count();
        assertEquals(0, unreadTendering);
    }

    @Test
    @DisplayName("CASE 4: Store=100, RC=99, Threshold=200 -> Combined=199, Diff=-1 -> URGENT TENDERING_REQUIRED")
    void testCase4_CriticalDeficit() throws Exception {
        createRateContract(99);

        UpdateThresholdRequest req = new UpdateThresholdRequest(15, 200, 100);

        mockMvc.perform(put("/api/thresholds/" + cartridge.getId())
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.storeQuantity", is(100)))
                .andExpect(jsonPath("$.rateContractQuantity", is(99)))
                .andExpect(jsonPath("$.combinedNetAvailableQuantity", is(199)))
                .andExpect(jsonPath("$.tenderingThreshold", is(200)));

        List<ProcurementAlert> alerts = alertRepository.findAll();
        ProcurementAlert tenderingAlert = alerts.stream()
                .filter(a -> a.getAlertType() == AlertType.TENDERING_REQUIRED)
                .findFirst()
                .orElse(null);

        assertNotNull(tenderingAlert);
        assertEquals(AlertSeverity.URGENT, tenderingAlert.getSeverity());
        assertEquals(AlertStatus.UNREAD, tenderingAlert.getStatus());
        assertEquals(199, tenderingAlert.getCombinedNetAvailableQuantity());
        assertEquals(200, tenderingAlert.getTenderingThreshold());
    }
}
