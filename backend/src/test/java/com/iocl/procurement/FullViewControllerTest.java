package com.iocl.procurement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iocl.procurement.dto.request.LoginRequest;
import com.iocl.procurement.dto.response.LoginResponse;
import com.iocl.procurement.entity.Admin;
import com.iocl.procurement.entity.Cartridge;
import com.iocl.procurement.entity.RateContract;
import com.iocl.procurement.entity.Role;
import com.iocl.procurement.repository.AdminRepository;
import com.iocl.procurement.repository.CartridgeRepository;
import com.iocl.procurement.repository.RateContractRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class FullViewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private CartridgeRepository cartridgeRepository;

    @Autowired
    private RateContractRepository rateContractRepository;

    @Autowired
    private com.iocl.procurement.repository.CallUpPurchaseOrderRepository callUpPORepository;

    @Autowired
    private com.iocl.procurement.repository.CartridgeThresholdRepository thresholdRepository;

    @Autowired
    private com.iocl.procurement.repository.ProcurementAlertRepository alertRepository;

    @Autowired
    private com.iocl.procurement.repository.AssetUsageRepository assetUsageRepository;

    @Autowired
    private com.iocl.procurement.repository.UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String TEST_EMAIL = "admin@iocl.co.in";
    private static final String TEST_PASSWORD = "Password@123";
    private String jwtToken;
    private Long sampleContractId;

    @BeforeEach
    void setUp() throws Exception {
        alertRepository.deleteAll();
        if (assetUsageRepository != null) {
            assetUsageRepository.deleteAll();
        }
        if (userRepository != null) {
            userRepository.deleteAll();
        }
        callUpPORepository.deleteAll();
        rateContractRepository.deleteAll();
        thresholdRepository.deleteAll();
        cartridgeRepository.deleteAll();
        adminRepository.deleteAll();

        // 1. Create Admin
        Admin admin = new Admin();
        admin.setName("IOCL Administrator");
        admin.setEmail(TEST_EMAIL);
        admin.setPassword(passwordEncoder.encode(TEST_PASSWORD));
        admin.setRole(Role.ADMIN);
        adminRepository.save(admin);

        // 2. Create Cartridge
        Cartridge cartridge = new Cartridge("Canon LBP246dw", 45, "Canon 070 Black", "070-BLK");
        cartridgeRepository.save(cartridge);

        // 3. Create Engineer User and Real Asset Usage of 10 units
        com.iocl.procurement.entity.User testUser = new com.iocl.procurement.entity.User();
        testUser.setUsername("rahul.engineer");
        testUser.setEmail("rahul.engineer@iocl.co.in");
        testUser.setPassword(passwordEncoder.encode(TEST_PASSWORD));
        testUser.setFullName("Rahul Sharma");
        testUser.setEmployeeId("EMP101");
        testUser.setDepartment("Information Systems");
        testUser.setLocation("Head Office");
        testUser.setRole(Role.USER);
        testUser = userRepository.save(testUser);

        com.iocl.procurement.entity.AssetUsage usage = new com.iocl.procurement.entity.AssetUsage();
        usage.setUser(testUser);
        usage.setCartridge(cartridge);
        usage.setQuantityUsed(10);
        usage.setUsageDate(LocalDate.now());
        usage.setRecordedByEmployeeName("Rahul Sharma");
        usage.setRecordedByEmployeeNo("EMP101");
        usage.setBeneficiaryEmployeeName("Anjali Varshney");
        usage.setBeneficiaryEmployeeNo("EMP2001");
        usage.setBeneficiaryDepartment("Finance");
        usage.setBeneficiarySeatOrCabinNo("Cabin A-204");
        usage.setBeneficiaryLocation("Head Office");
        assetUsageRepository.save(usage);

        // 4. Create Rate Contract
        RateContract rc = new RateContract();
        rc.setContractDate(LocalDate.of(2026, 8, 13));
        rc.setSupplierName("M/s Canon India Pvt Ltd");
        rc.setCartridge(cartridge);
        rc.setRatePerUnit(new BigDecimal("4500.00"));
        rc.setTaxPercentage(new BigDecimal("18.00"));
        rc.setTotalContractQuantity(100);
        rc.setQuantityAlreadyExecuted(0);
        rc.setQuantityTakenThroughWO(20);
        rc.recalculateNetAvailableQuantity();
        RateContract savedRc = rateContractRepository.save(rc);
        this.sampleContractId = savedRc.getId();

        // 5. Obtain JWT token via login
        LoginRequest loginRequest = new LoginRequest(TEST_EMAIL, TEST_PASSWORD);
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        LoginResponse loginResponse = objectMapper.readValue(
                loginResult.getResponse().getContentAsString(),
                LoginResponse.class
        );
        this.jwtToken = loginResponse.getToken();
    }

    @Test
    void test1_GetFullViewRecords_WithoutToken_Returns401() throws Exception {
        mockMvc.perform(get("/api/procurement/full-view")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void test2_GetFullViewRecords_WithValidJwt_Returns200AndPaginatedData() throws Exception {
        mockMvc.perform(get("/api/procurement/full-view")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].supplierName", is("M/s Canon India Pvt Ltd")))
                .andExpect(jsonPath("$.content[0].cartridgeName", is("Canon 070 Black")))
                .andExpect(jsonPath("$.content[0].contractQuantity", is(100)))
                .andExpect(jsonPath("$.content[0].executedQuantity", is(10)))
                .andExpect(jsonPath("$.content[0].callUpPoQuantity", is(20)))
                .andExpect(jsonPath("$.content[0].netAvailableQuantity", is(80)))
                .andExpect(jsonPath("$.content[0].status", is("PARTIALLY_USED")))
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.totalPages", is(1)));
    }

    @Test
    void test3_GetFullViewRecords_WithSearchFilter_ReturnsMatchingData() throws Exception {
        mockMvc.perform(get("/api/procurement/full-view?search=Canon")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].supplierName", is("M/s Canon India Pvt Ltd")));

        mockMvc.perform(get("/api/procurement/full-view?search=NonExistentSupplier")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.totalElements", is(0)));
    }

    @Test
    void test4_GetFullViewRecordById_Success() throws Exception {
        mockMvc.perform(get("/api/procurement/full-view/" + sampleContractId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(sampleContractId.intValue())))
                .andExpect(jsonPath("$.supplierName", is("M/s Canon India Pvt Ltd")))
                .andExpect(jsonPath("$.cartridgePartNumber", is("070-BLK")))
                .andExpect(jsonPath("$.netAvailableQuantity", is(80)));
    }

    @Test
    void test5_GetFullViewRecordById_InvalidId_Returns404() throws Exception {
        mockMvc.perform(get("/api/procurement/full-view/999999")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", containsString("Procurement record not found")));
    }

    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        alertRepository.deleteAll();
        if (assetUsageRepository != null) {
            assetUsageRepository.deleteAll();
        }
        callUpPORepository.deleteAll();
        rateContractRepository.deleteAll();
        thresholdRepository.deleteAll();
        cartridgeRepository.deleteAll();
        if (userRepository != null) {
            userRepository.deleteAll();
        }
        adminRepository.deleteAll();
    }
}
