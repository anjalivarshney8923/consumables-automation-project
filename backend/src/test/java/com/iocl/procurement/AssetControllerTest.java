package com.iocl.procurement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iocl.procurement.dto.request.AssetRequest;
import com.iocl.procurement.dto.request.LoginRequest;
import com.iocl.procurement.entity.*;
import com.iocl.procurement.repository.AdminRepository;
import com.iocl.procurement.repository.AssetRepository;
import com.iocl.procurement.repository.CartridgeRepository;
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

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AssetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private CartridgeRepository cartridgeRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String jwtToken;
    private Cartridge canonCartridge;
    private Cartridge hpCartridge;

    @BeforeEach
    void setUp() throws Exception {
        assetRepository.deleteAll();
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
        canonCartridge = new Cartridge("Canon LBP246dw", 45, "Canon 070 Black", "070-BLK");
        canonCartridge = cartridgeRepository.save(canonCartridge);

        hpCartridge = new Cartridge("HP Color LaserJet Pro M454dn", 12, "HP 416X High Yield Black", "W2040X");
        hpCartridge = cartridgeRepository.save(hpCartridge);
    }

    @Test
    @DisplayName("1. Successfully create a new Asset with valid details in PostgreSQL")
    void testCreateAssetSuccess() throws Exception {
        AssetRequest request = new AssetRequest(
                "HP Color LaserJet Pro M454dn",
                "VNB3K12345",
                "IT Department",
                "W2040X",
                "COLOR",
                "ACTIVE"
        );

        mockMvc.perform(post("/api/assets")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.modelName", is("HP Color LaserJet Pro M454dn")))
                .andExpect(jsonPath("$.serialNumber", is("VNB3K12345")))
                .andExpect(jsonPath("$.department", is("IT Department")))
                .andExpect(jsonPath("$.cartridgePartNumber", is("W2040X")))
                .andExpect(jsonPath("$.cartridgeName", is("HP 416X High Yield Black")))
                .andExpect(jsonPath("$.printerType", is("COLOR")))
                .andExpect(jsonPath("$.status", is("ACTIVE")))
                .andExpect(jsonPath("$.createdAt", notNullValue()));

        // Verify direct PostgreSQL persistence
        List<Asset> assets = assetRepository.findAll();
        assertEquals(1, assets.size());
        assertEquals("VNB3K12345", assets.get(0).getSerialNumber());
        assertEquals(hpCartridge.getId(), assets.get(0).getCartridge().getId());
    }

    @Test
    @DisplayName("2. Missing model name returns 400 Bad Request")
    void testCreateAssetMissingModelName() throws Exception {
        AssetRequest request = new AssetRequest(
                "",
                "VNB3K99999",
                "Finance Wing",
                "070-BLK",
                "BLACK_AND_WHITE",
                "ACTIVE"
        );

        mockMvc.perform(post("/api/assets")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("3. Missing serial number returns 400 Bad Request")
    void testCreateAssetMissingSerialNumber() throws Exception {
        AssetRequest request = new AssetRequest(
                "Canon LBP246dw",
                "   ",
                "Finance Wing",
                "070-BLK",
                "BLACK_AND_WHITE",
                "ACTIVE"
        );

        mockMvc.perform(post("/api/assets")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("4. Duplicate serial number returns 409 Conflict")
    void testCreateAssetDuplicateSerialNumber() throws Exception {
        // Pre-create asset with serial number VNB3K12345
        Asset existingAsset = new Asset(
                "Canon LBP246dw",
                "VNB3K12345",
                "Operations Wing",
                canonCartridge,
                PrinterType.BLACK_AND_WHITE,
                AssetStatus.ACTIVE
        );
        assetRepository.save(existingAsset);

        AssetRequest duplicateRequest = new AssetRequest(
                "HP Color LaserJet Pro M454dn",
                "vnb3k12345", // case-insensitive duplicate check
                "IT Department",
                "W2040X",
                "COLOR",
                "ACTIVE"
        );

        mockMvc.perform(post("/api/assets")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    @Test
    @DisplayName("5. Invalid/non-existent cartridge returns 400 Bad Request")
    void testCreateAssetInvalidCartridge() throws Exception {
        AssetRequest request = new AssetRequest(
                "Canon LBP246dw",
                "VNB3K88888",
                "Procurement Cell",
                "NON-EXISTENT-CARTRIDGE-XYZ",
                "BLACK_AND_WHITE",
                "ACTIVE"
        );

        mockMvc.perform(post("/api/assets")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("not found in cartridge master records")));
    }

    @Test
    @DisplayName("6. Invalid printer type returns 400 Bad Request")
    void testCreateAssetInvalidPrinterType() throws Exception {
        AssetRequest request = new AssetRequest(
                "Canon LBP246dw",
                "VNB3K77777",
                "Procurement Cell",
                "070-BLK",
                "3D_PRINTER_INVALID",
                "ACTIVE"
        );

        mockMvc.perform(post("/api/assets")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid printer type")));
    }

    @Test
    @DisplayName("7. Invalid status returns 400 Bad Request")
    void testCreateAssetInvalidStatus() throws Exception {
        AssetRequest request = new AssetRequest(
                "Canon LBP246dw",
                "VNB3K66666",
                "Procurement Cell",
                "070-BLK",
                "BLACK_AND_WHITE",
                "DISCARDED_INVALID_STATUS"
        );

        mockMvc.perform(post("/api/assets")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid asset status")));
    }

    @Test
    @DisplayName("8. Successfully retrieve all registered assets via GET /api/assets")
    void testGetAllAssets() throws Exception {
        Asset a1 = new Asset("Canon LBP246dw", "SER-001", "IT Department", canonCartridge, PrinterType.BLACK_AND_WHITE, AssetStatus.ACTIVE);
        Asset a2 = new Asset("HP Color LaserJet", "SER-002", "Finance Wing", hpCartridge, PrinterType.COLOR, AssetStatus.UNDER_MAINTENANCE);
        assetRepository.saveAll(List.of(a1, a2));

        mockMvc.perform(get("/api/assets")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].serialNumber", containsInAnyOrder("SER-001", "SER-002")));
    }

    @Test
    @DisplayName("9. Successfully retrieve single asset by ID via GET /api/assets/{id}")
    void testGetAssetById() throws Exception {
        Asset asset = new Asset("Canon LBP246dw", "SER-SINGLE", "Legal Wing", canonCartridge, PrinterType.BLACK_AND_WHITE, AssetStatus.ACTIVE);
        asset = assetRepository.save(asset);

        mockMvc.perform(get("/api/assets/" + asset.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(asset.getId().intValue())))
                .andExpect(jsonPath("$.serialNumber", is("SER-SINGLE")))
                .andExpect(jsonPath("$.department", is("Legal Wing")));

        // Non-existent ID returns 404
        mockMvc.perform(get("/api/assets/999999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("10. Filter assets by search query and status")
    void testSearchAndFilterAssets() throws Exception {
        Asset a1 = new Asset("Canon LBP246dw", "SER-ALPHA", "CAD Section", canonCartridge, PrinterType.BLACK_AND_WHITE, AssetStatus.ACTIVE);
        Asset a2 = new Asset("HP M454dn", "SER-BETA", "Marketing", hpCartridge, PrinterType.COLOR, AssetStatus.INACTIVE);
        assetRepository.saveAll(List.of(a1, a2));

        // Search by query "CAD"
        mockMvc.perform(get("/api/assets?search=CAD")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].serialNumber", is("SER-ALPHA")));

        // Filter by status "INACTIVE"
        mockMvc.perform(get("/api/assets?status=INACTIVE")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].serialNumber", is("SER-BETA")));
    }

    @Test
    @DisplayName("11. Unauthorized access without JWT token returns 401")
    void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/assets"))
                .andExpect(status().isUnauthorized());

        AssetRequest request = new AssetRequest("Canon LBP", "NO-AUTH-1", "IT", "070-BLK", "BLACK_AND_WHITE", "ACTIVE");
        mockMvc.perform(post("/api/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
