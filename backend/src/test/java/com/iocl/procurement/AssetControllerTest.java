package com.iocl.procurement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iocl.procurement.dto.request.AssetRequest;
import com.iocl.procurement.dto.request.LoginRequest;
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
    private Cartridge canonCartridge;
    private Cartridge hpCartridge;

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
        canonCartridge = new Cartridge("Canon LBP246dw", 45, "Canon 070 Black", "070-BLK");
        canonCartridge = cartridgeRepository.save(canonCartridge);

        hpCartridge = new Cartridge("HP Color LaserJet Pro M454dn", 12, "HP 416X High Yield Black", "W2040X");
        hpCartridge = cartridgeRepository.save(hpCartridge);
    }

    @Test
    @DisplayName("1. Successfully create a new COLOR Asset with valid colour in PostgreSQL")
    void testCreateColorAssetSuccess() throws Exception {
        AssetRequest request = new AssetRequest(
                "HP Color LaserJet Pro M454dn",
                "VNB3K12345",
                "IT Department",
                "W2040X",
                "COLOR",
                "CYAN",
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
                .andExpect(jsonPath("$.colour", is("CYAN")))
                .andExpect(jsonPath("$.status", is("ACTIVE")))
                .andExpect(jsonPath("$.createdAt", notNullValue()));

        // Verify direct PostgreSQL persistence
        List<Asset> assets = assetRepository.findAll();
        assertEquals(1, assets.size());
        assertEquals("VNB3K12345", assets.get(0).getSerialNumber());
        assertEquals(CartridgeColor.CYAN, assets.get(0).getColour());
        assertEquals(hpCartridge.getId(), assets.get(0).getCartridge().getId());
    }

    @Test
    @DisplayName("2. Successfully create a new BLACK_AND_WHITE Asset with null colour in PostgreSQL")
    void testCreateBlackAndWhiteAssetSuccess() throws Exception {
        AssetRequest request = new AssetRequest(
                "Canon LBP246dw",
                "BW-12345",
                "Finance Wing",
                "070-BLK",
                "BLACK_AND_WHITE",
                null,
                "ACTIVE"
        );

        mockMvc.perform(post("/api/assets")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.modelName", is("Canon LBP246dw")))
                .andExpect(jsonPath("$.printerType", is("BLACK_AND_WHITE")))
                .andExpect(jsonPath("$.colour").doesNotExist());

        // Verify direct PostgreSQL persistence has NULL colour
        List<Asset> assets = assetRepository.findAll();
        assertEquals(1, assets.size());
        assertNull(assets.get(0).getColour());
    }

    @Test
    @DisplayName("3. Reject Black & White printer with non-null colour (400 Bad Request)")
    void testRejectBlackAndWhiteWithColour() throws Exception {
        AssetRequest request = new AssetRequest(
                "Canon LBP246dw",
                "BW-REJECT-1",
                "Finance Wing",
                "070-BLK",
                "BLACK_AND_WHITE",
                "MAGENTA",
                "ACTIVE"
        );

        mockMvc.perform(post("/api/assets")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Colour is not applicable for Black & White printers")));
    }

    @Test
    @DisplayName("4. Reject COLOR printer with missing/null colour (400 Bad Request)")
    void testRejectColorPrinterWithoutColour() throws Exception {
        AssetRequest request = new AssetRequest(
                "HP Color LaserJet Pro M454dn",
                "COL-REJECT-1",
                "IT Department",
                "W2040X",
                "COLOR",
                null,
                "ACTIVE"
        );

        mockMvc.perform(post("/api/assets")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Colour is required for Color printers")));
    }

    @Test
    @DisplayName("5. Missing model name returns 400 Bad Request")
    void testCreateAssetMissingModelName() throws Exception {
        AssetRequest request = new AssetRequest(
                "",
                "VNB3K99999",
                "Finance Wing",
                "070-BLK",
                "BLACK_AND_WHITE",
                null,
                "ACTIVE"
        );

        mockMvc.perform(post("/api/assets")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("6. Missing serial number returns 400 Bad Request")
    void testCreateAssetMissingSerialNumber() throws Exception {
        AssetRequest request = new AssetRequest(
                "Canon LBP246dw",
                "   ",
                "Finance Wing",
                "070-BLK",
                "BLACK_AND_WHITE",
                null,
                "ACTIVE"
        );

        mockMvc.perform(post("/api/assets")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("7. Duplicate serial number returns 409 Conflict")
    void testCreateAssetDuplicateSerialNumber() throws Exception {
        Asset existingAsset = new Asset(
                "Canon LBP246dw",
                "VNB3K12345",
                "Operations Wing",
                canonCartridge,
                PrinterType.BLACK_AND_WHITE,
                null,
                AssetStatus.ACTIVE
        );
        assetRepository.save(existingAsset);

        AssetRequest duplicateRequest = new AssetRequest(
                "HP Color LaserJet Pro M454dn",
                "vnb3k12345", // case-insensitive duplicate check
                "IT Department",
                "W2040X",
                "COLOR",
                "BLACK",
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
    @DisplayName("8. Invalid/non-existent cartridge returns 400 Bad Request")
    void testCreateAssetInvalidCartridge() throws Exception {
        AssetRequest request = new AssetRequest(
                "Canon LBP246dw",
                "VNB3K88888",
                "Procurement Cell",
                "NON-EXISTENT-CARTRIDGE-XYZ",
                "BLACK_AND_WHITE",
                null,
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
    @DisplayName("9. Invalid printer type returns 400 Bad Request")
    void testCreateAssetInvalidPrinterType() throws Exception {
        AssetRequest request = new AssetRequest(
                "Canon LBP246dw",
                "VNB3K77777",
                "Procurement Cell",
                "070-BLK",
                "3D_PRINTER_INVALID",
                null,
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
    @DisplayName("10. Invalid colour on Color printer returns 400 Bad Request")
    void testCreateAssetInvalidColour() throws Exception {
        AssetRequest request = new AssetRequest(
                "Canon LBP246dw",
                "VNB3K77777",
                "Procurement Cell",
                "070-BLK",
                "COLOR",
                "PINK_INVALID",
                "ACTIVE"
        );

        mockMvc.perform(post("/api/assets")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid colour")));
    }

    @Test
    @DisplayName("11. Test all 4 valid colours for COLOR printers (BLACK, CYAN, MAGENTA, YELLOW)")
    void testCreateAssetAllFourColours() throws Exception {
        String[] colors = {"BLACK", "CYAN", "MAGENTA", "YELLOW"};
        for (int i = 0; i < colors.length; i++) {
            AssetRequest req = new AssetRequest(
                    "HP Printer Model " + i,
                    "SN-COLOR-" + i,
                    "IT Department",
                    "070-BLK",
                    "COLOR",
                    colors[i],
                    "ACTIVE"
            );

            mockMvc.perform(post("/api/assets")
                            .header("Authorization", "Bearer " + jwtToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.colour", is(colors[i])));
        }
    }

    @Test
    @DisplayName("12. Successfully retrieve all registered assets via GET /api/assets")
    void testGetAllAssets() throws Exception {
        Asset a1 = new Asset("Canon LBP246dw", "SER-001", "IT Department", canonCartridge, PrinterType.BLACK_AND_WHITE, null, AssetStatus.ACTIVE);
        Asset a2 = new Asset("HP Color LaserJet", "SER-002", "Finance Wing", hpCartridge, PrinterType.COLOR, CartridgeColor.CYAN, AssetStatus.UNDER_MAINTENANCE);
        assetRepository.saveAll(List.of(a1, a2));

        mockMvc.perform(get("/api/assets")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].serialNumber", containsInAnyOrder("SER-001", "SER-002")));
    }

    @Test
    @DisplayName("13. Successfully retrieve single asset by ID via GET /api/assets/{id}")
    void testGetAssetById() throws Exception {
        Asset asset = new Asset("Canon LBP246dw", "SER-SINGLE", "Legal Wing", canonCartridge, PrinterType.BLACK_AND_WHITE, null, AssetStatus.ACTIVE);
        asset = assetRepository.save(asset);

        mockMvc.perform(get("/api/assets/" + asset.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(asset.getId().intValue())))
                .andExpect(jsonPath("$.serialNumber", is("SER-SINGLE")))
                .andExpect(jsonPath("$.colour").doesNotExist())
                .andExpect(jsonPath("$.department", is("Legal Wing")));

        // Non-existent ID returns 404
        mockMvc.perform(get("/api/assets/999999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("14. Updating Color Asset -> Black & White clears colour in PostgreSQL")
    void testUpdateColorAssetToBlackAndWhiteClearsColour() throws Exception {
        Asset asset = new Asset("HP M404n", "VNB3K12345", "IT Department", hpCartridge, PrinterType.COLOR, CartridgeColor.MAGENTA, AssetStatus.ACTIVE);
        asset = assetRepository.save(asset);
        Long assetId = asset.getId();

        AssetRequest updateRequest = new AssetRequest(
                "HP M404n",
                "VNB3K12345",
                "Finance Wing",
                "W2040X",
                "BLACK_AND_WHITE",
                null,
                "ACTIVE"
        );

        mockMvc.perform(put("/api/assets/" + assetId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.printerType", is("BLACK_AND_WHITE")))
                .andExpect(jsonPath("$.colour").doesNotExist());

        // Verify PostgreSQL persistence has NULL colour
        Asset updatedInDb = assetRepository.findById(assetId).orElseThrow();
        assertEquals(PrinterType.BLACK_AND_WHITE, updatedInDb.getPrinterType());
        assertNull(updatedInDb.getColour());
    }

    @Test
    @DisplayName("15. Updating Black & White Asset -> Color with CYAN persists in PostgreSQL")
    void testUpdateBlackAndWhiteAssetToColor() throws Exception {
        Asset asset = new Asset("HP M404n", "VNB-BW-1", "IT Department", hpCartridge, PrinterType.BLACK_AND_WHITE, null, AssetStatus.ACTIVE);
        asset = assetRepository.save(asset);
        Long assetId = asset.getId();

        AssetRequest updateRequest = new AssetRequest(
                "HP Color LaserJet Pro M454dn",
                "VNB-BW-1",
                "Finance Wing",
                "W2040X",
                "COLOR",
                "CYAN",
                "ACTIVE"
        );

        mockMvc.perform(put("/api/assets/" + assetId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.printerType", is("COLOR")))
                .andExpect(jsonPath("$.colour", is("CYAN")));

        // Verify PostgreSQL persistence has CYAN colour
        Asset updatedInDb = assetRepository.findById(assetId).orElseThrow();
        assertEquals(PrinterType.COLOR, updatedInDb.getPrinterType());
        assertEquals(CartridgeColor.CYAN, updatedInDb.getColour());
    }

    @Test
    @DisplayName("16. Updating asset while keeping its existing serial number is allowed (no self-collision)")
    void testUpdateAssetSameSerialAllowed() throws Exception {
        Asset asset = new Asset("Canon LBP246dw", "SER-SAME-001", "Procurement", canonCartridge, PrinterType.BLACK_AND_WHITE, null, AssetStatus.ACTIVE);
        asset = assetRepository.save(asset);

        AssetRequest updateRequest = new AssetRequest(
                "Canon LBP246dw Advanced",
                "SER-SAME-001",
                "Accounts Wing",
                "070-BLK",
                "BLACK_AND_WHITE",
                null,
                "ACTIVE"
        );

        mockMvc.perform(put("/api/assets/" + asset.getId())
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.department", is("Accounts Wing")));
    }

    @Test
    @DisplayName("17. Updating asset serial to one already used by ANOTHER asset returns 409 Conflict")
    void testUpdateAssetDuplicateSerialReturns409() throws Exception {
        Asset a1 = new Asset("Canon LBP246dw", "SER-A", "IT", canonCartridge, PrinterType.BLACK_AND_WHITE, null, AssetStatus.ACTIVE);
        Asset a2 = new Asset("HP LaserJet", "SER-B", "Finance", hpCartridge, PrinterType.COLOR, CartridgeColor.YELLOW, AssetStatus.ACTIVE);
        assetRepository.saveAll(List.of(a1, a2));

        // Attempt to update a1's serial to SER-B (which belongs to a2)
        AssetRequest updateRequest = new AssetRequest(
                "Canon LBP246dw",
                "ser-b", // case-insensitive duplicate check
                "IT",
                "070-BLK",
                "BLACK_AND_WHITE",
                null,
                "ACTIVE"
        );

        mockMvc.perform(put("/api/assets/" + a1.getId())
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("already exists")));

        // Verify a1 remains unchanged in PostgreSQL
        Asset unchangedA1 = assetRepository.findById(a1.getId()).orElseThrow();
        assertEquals("SER-A", unchangedA1.getSerialNumber());
    }

    @Test
    @DisplayName("18. Updating non-existent asset ID returns 404 Not Found")
    void testUpdateAssetNotFoundReturns404() throws Exception {
        AssetRequest updateRequest = new AssetRequest(
                "HP M404n",
                "VNB-NOT-FOUND",
                "IT",
                "070-BLK",
                "BLACK_AND_WHITE",
                null,
                "ACTIVE"
        );

        mockMvc.perform(put("/api/assets/999999")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("19. Unauthorized access without JWT token returns 401")
    void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/assets"))
                .andExpect(status().isUnauthorized());

        AssetRequest request = new AssetRequest("Canon LBP", "NO-AUTH-1", "IT", "070-BLK", "BLACK_AND_WHITE", null, "ACTIVE");
        mockMvc.perform(post("/api/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
