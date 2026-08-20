package com.iocl.procurement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iocl.procurement.dto.request.AssetUsageRequestDTO;
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
    private PasswordEncoder passwordEncoder;

    private String userToken;
    private User testUser;
    private Cartridge testCartridgeBW;
    private Cartridge testCartridgeColor;
    private Asset testAssetBW;
    private Asset testAssetColor;
    private RateContract testRateContractBW;

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

        // 1. Create Normal Test User
        testUser = new User();
        testUser.setUsername("rahul.sharma");
        testUser.setFullName("Rahul Sharma");
        testUser.setEmail("rahul.sharma@iocl.co.in");
        testUser.setEmployeeId("EMP1001");
        testUser.setDepartment("IT");
        testUser.setLocation("Head Office");
        testUser.setPassword(passwordEncoder.encode("Password@123"));
        testUser.setStatus(UserStatus.ACTIVE);
        testUser.setRole(Role.USER);
        testUser = userRepository.save(testUser);

        // 2. Login User to get JWT Bearer token
        UserLoginRequest loginReq = new UserLoginRequest("rahul.sharma", "Password@123");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        userToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();

        // 3. Create Cartridges
        testCartridgeBW = new Cartridge("HP LaserJet Pro M404n", 10, "HP 76A Black Toner", "CF276A", 15);
        testCartridgeBW = cartridgeRepository.save(testCartridgeBW);

        testCartridgeColor = new Cartridge("Canon Color imageCLASS LBP622Cdw", 5, "Canon 054 Cyan Toner", "054-CYN", 8);
        testCartridgeColor = cartridgeRepository.save(testCartridgeColor);

        // 4. Configure Thresholds (PO threshold = 20, Tendering threshold = 30)
        CartridgeThreshold thresholdBW = new CartridgeThreshold(testCartridgeBW, 20, 30);
        thresholdRepository.save(thresholdBW);

        // 5. Create Rate Contract for BW Cartridge (Total = 100, Executed = 20, Taken WO = 0, Net Available = 80)
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

        // 6. Create Assets
        testAssetBW = new Asset();
        testAssetBW.setModelName("HP LaserJet Pro M404n");
        testAssetBW.setSerialNumber("HP-PRN-001");
        testAssetBW.setDepartment("IT");
        testAssetBW.setCartridge(testCartridgeBW);
        testAssetBW.setPrinterType(PrinterType.BLACK_AND_WHITE);
        testAssetBW.setStatus(AssetStatus.ACTIVE);
        testAssetBW = assetRepository.save(testAssetBW);

        testAssetColor = new Asset();
        testAssetColor.setModelName("Canon Color imageCLASS LBP622Cdw");
        testAssetColor.setSerialNumber("CANON-PRN-002");
        testAssetColor.setDepartment("IT");
        testAssetColor.setCartridge(testCartridgeColor);
        testAssetColor.setPrinterType(PrinterType.COLOR);
        testAssetColor.setStatus(AssetStatus.ACTIVE);
        testAssetColor = assetRepository.save(testAssetColor);
    }

    @Test
    @DisplayName("Should successfully record Asset Usage and update PostgreSQL and Rate Contract authoritative consumption")
    void testSuccessfulAssetUsageSubmission() throws Exception {
        AssetUsageRequestDTO req = new AssetUsageRequestDTO();
        req.setSeatOrCabinNo("Cabin-402");
        req.setLocation("Head Office");
        req.setPrinterId(testAssetBW.getId().toString());
        req.setPrinterType("Black & White");
        req.setCartridgeId(testCartridgeBW.getId().toString());
        req.setQuantityUsed(2);
        req.setUsageDate(LocalDate.now());
        req.setRemarks("Replacement of empty cartridge");
        req.setWorkOrderReference("WO-2026-AUG-01");

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.employeeNo", is("EMP1001")))
                .andExpect(jsonPath("$.employeeName", is("Rahul Sharma")))
                .andExpect(jsonPath("$.department", is("IT")))
                .andExpect(jsonPath("$.seatOrCabinNo", is("Cabin-402")))
                .andExpect(jsonPath("$.location", is("Head Office")))
                .andExpect(jsonPath("$.quantityUsed", is(2)))
                .andExpect(jsonPath("$.partNumber", is("CF276A")));

        // Verify PostgreSQL AssetUsage row count
        List<AssetUsage> usages = assetUsageRepository.findAll();
        assertEquals(1, usages.size());
        AssetUsage saved = usages.get(0);
        assertEquals(testUser.getId(), saved.getUser().getId());
        assertEquals("CF276A", saved.getPartNumber());
        assertEquals(2, saved.getQuantityUsed());
        assertEquals(PrinterType.BLACK_AND_WHITE, saved.getPrinterType());
        assertNull(saved.getColour());

        // Verify RateContract authoritative consumption: was 20, now must be 22; net available was 80, now 78
        RateContract updatedRC = rateContractRepository.findById(testRateContractBW.getId()).orElseThrow();
        assertEquals(22, updatedRC.getQuantityAlreadyExecuted());
        assertEquals(78, updatedRC.getNetAvailableQuantity());

        // Verify Store Inventory decreased from 15 to 13
        Cartridge updatedCartridge = cartridgeRepository.findById(testCartridgeBW.getId()).orElseThrow();
        assertEquals(13, updatedCartridge.getStoreQuantity());
    }

    @Test
    @DisplayName("Should validate Color requirement for Color printers")
    void testColorPrinterValidation() throws Exception {
        // Missing colour on Color printer -> 400
        AssetUsageRequestDTO reqNoColor = new AssetUsageRequestDTO();
        reqNoColor.setSeatOrCabinNo("Cabin-101");
        reqNoColor.setLocation("Head Office");
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
        req.setSeatOrCabinNo("Cabin-101");
        req.setLocation("Head Office");
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
    @DisplayName("Should fetch authenticated user's usage history")
    void testGetUserUsageHistory() throws Exception {
        // Record 2 usages
        AssetUsage u1 = new AssetUsage();
        u1.setUser(testUser);
        u1.setEmployeeId("EMP1001");
        u1.setEmployeeName("Rahul Sharma");
        u1.setDepartment("IT");
        u1.setSeatOrCabinNo("Seat-1");
        u1.setLocation("Head Office");
        u1.setAsset(testAssetBW);
        u1.setCartridge(testCartridgeBW);
        u1.setPrinterType(PrinterType.BLACK_AND_WHITE);
        u1.setQuantityUsed(1);
        u1.setUsageDate(LocalDate.now());
        assetUsageRepository.save(u1);

        AssetUsage u2 = new AssetUsage();
        u2.setUser(testUser);
        u2.setEmployeeId("EMP1001");
        u2.setEmployeeName("Rahul Sharma");
        u2.setDepartment("IT");
        u2.setSeatOrCabinNo("Seat-2");
        u2.setLocation("Head Office");
        u2.setAsset(testAssetBW);
        u2.setCartridge(testCartridgeBW);
        u2.setPrinterType(PrinterType.BLACK_AND_WHITE);
        u2.setQuantityUsed(3);
        u2.setUsageDate(LocalDate.now());
        assetUsageRepository.save(u2);

        mockMvc.perform(get("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].quantityUsed", is(3)))
                .andExpect(jsonPath("$[1].quantityUsed", is(1)));
    }

    @Test
    @DisplayName("Should evaluate Alert 1 when usage causes Rate Contract net available to drop below threshold")
    void testAlert1EvaluationOnUsage() throws Exception {
        // Baseline: Rate contract total=100, executed=20, net available=80. PO Threshold=20.
        // User records usage of 65 units -> executed=85, net available=15 (which is <= 20 threshold)
        AssetUsageRequestDTO req = new AssetUsageRequestDTO();
        req.setSeatOrCabinNo("Cabin-402");
        req.setLocation("Head Office");
        req.setPrinterId(testAssetBW.getId().toString());
        req.setPrinterType("Black & White");
        req.setCartridgeId(testCartridgeBW.getId().toString());
        req.setQuantityUsed(65);
        req.setUsageDate(LocalDate.now());

        mockMvc.perform(post("/api/user/asset-usage")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // Verify unread Alert 1 created in PostgreSQL
        List<ProcurementAlert> alerts = alertRepository.findAll();
        assertFalse(alerts.isEmpty());
        ProcurementAlert alert = alerts.stream()
                .filter(a -> a.getAlertType() == AlertType.PROCUREMENT_THRESHOLD)
                .findFirst()
                .orElse(null);
        assertNotNull(alert);
        assertEquals(15, alert.getNetAvailableQuantity());
        assertEquals(20, alert.getThreshold());
        assertEquals(AlertStatus.UNREAD, alert.getStatus());
    }
}
