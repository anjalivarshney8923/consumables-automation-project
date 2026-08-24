package com.iocl.procurement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iocl.procurement.dto.request.LoginRequest;
import com.iocl.procurement.dto.request.UpdateThresholdRequest;
import com.iocl.procurement.entity.Admin;
import com.iocl.procurement.entity.Cartridge;
import com.iocl.procurement.entity.CartridgeThreshold;
import com.iocl.procurement.entity.Role;
import com.iocl.procurement.repository.AdminRepository;
import com.iocl.procurement.repository.CartridgeRepository;
import com.iocl.procurement.repository.CartridgeThresholdRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ThresholdControllerTest {

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
    private com.iocl.procurement.repository.ProcurementAlertRepository alertRepository;

    @Autowired
    private com.iocl.procurement.repository.RateContractRepository rateContractRepository;

    @Autowired
    private com.iocl.procurement.repository.CallUpPurchaseOrderRepository callUpPORepository;

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

        // 3. Create test cartridge & threshold
        testCartridge = new Cartridge("Canon LBP246dw", 45, "Canon 070 Black", "070-BLK");
        testCartridge = cartridgeRepository.save(testCartridge);

        CartridgeThreshold threshold = new CartridgeThreshold(testCartridge, 15);
        thresholdRepository.save(threshold);
    }

    @Test
    @DisplayName("GET /api/thresholds - should return all cartridge thresholds when authenticated")
    void testGetAllThresholds() throws Exception {
        mockMvc.perform(get("/api/thresholds")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].partNumber", is("070-BLK")))
                .andExpect(jsonPath("$[0].poThreshold", is(15)));
    }

    @Test
    @DisplayName("GET /api/thresholds/{id} - should return single threshold")
    void testGetThresholdById() throws Exception {
        mockMvc.perform(get("/api/thresholds/" + testCartridge.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.partNumber", is("070-BLK")))
                .andExpect(jsonPath("$.poThreshold", is(15)));
    }

    @Test
    @DisplayName("PUT /api/thresholds/{id} - should update threshold and persist")
    void testUpdateThreshold() throws Exception {
        UpdateThresholdRequest request = new UpdateThresholdRequest(20);

        mockMvc.perform(put("/api/thresholds/" + testCartridge.getId())
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.poThreshold", is(20)));

        // Verify updated in DB
        CartridgeThreshold updated = thresholdRepository.findByCartridgeId(testCartridge.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(20, updated.getPoThreshold());
    }

    @Test
    @DisplayName("PUT /api/thresholds/{id} - should reject negative threshold")
    void testUpdateThresholdNegative() throws Exception {
        UpdateThresholdRequest request = new UpdateThresholdRequest(-5);

        mockMvc.perform(put("/api/thresholds/" + testCartridge.getId())
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/thresholds - should return 401 when unauthorized")
    void testGetThresholdsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/thresholds"))
                .andExpect(status().isUnauthorized());
    }
}
