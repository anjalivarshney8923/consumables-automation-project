package com.iocl.procurement;

import com.iocl.procurement.dto.request.CallUpPORequest;
import com.iocl.procurement.dto.response.CartridgeThresholdResponse;
import com.iocl.procurement.dto.response.RateContractResponse;
import com.iocl.procurement.dto.response.TenderingAlertResponse;
import com.iocl.procurement.entity.Cartridge;
import com.iocl.procurement.entity.CartridgeThreshold;
import com.iocl.procurement.entity.RateContract;
import com.iocl.procurement.entity.Role;
import com.iocl.procurement.entity.User;
import com.iocl.procurement.repository.*;
import com.iocl.procurement.service.AlertService;
import com.iocl.procurement.service.CallUpPOService;
import com.iocl.procurement.service.RateContractService;
import com.iocl.procurement.service.ThresholdService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class QuantityCalculationsTest {

    @Autowired
    private CartridgeRepository cartridgeRepository;

    @Autowired
    private RateContractRepository rateContractRepository;

    @Autowired
    private CallUpPurchaseOrderRepository callUpPORepository;

    @Autowired
    private AssetUsageRepository assetUsageRepository;

    @Autowired
    private CartridgeThresholdRepository thresholdRepository;

    @Autowired
    private ProcurementAlertRepository alertRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private RateContractService rateContractService;

    @Autowired
    private CallUpPOService callUpPOService;

    @Autowired
    private ThresholdService thresholdService;

    @Autowired
    private AlertService alertService;

    @BeforeEach
    void setUp() {
        cleanAll();
    }

    @AfterEach
    void tearDown() {
        cleanAll();
    }

    private void cleanAll() {
        alertRepository.deleteAll();
        if (assetUsageRepository != null) {
            assetUsageRepository.deleteAll();
        }
        callUpPORepository.deleteAll();
        rateContractRepository.deleteAll();
        thresholdRepository.deleteAll();
        if (assetRepository != null) {
            assetRepository.deleteAll();
        }
        cartridgeRepository.deleteAll();
        if (userRepository != null) {
            userRepository.deleteAll();
        }
    }

    @Test
    @DisplayName("Test Case 1: Sequential Call-Up POs and Asset Usage on Rate Contract")
    void testCase1_SequentialPOsAndAssetUsage() {
        // Setup Cartridge
        Cartridge cart = new Cartridge("Canon LBP246dw", 20, "Canon 070 Black", "070-BLK");
        cart = cartridgeRepository.save(cart);

        // 1. Create Rate Contract with Contract Qty = 500
        RateContract rc = new RateContract();
        rc.setContractDate(LocalDate.now());
        rc.setSupplierName("Raghav Enterprises");
        rc.setCartridge(cart);
        rc.setRatePerUnit(new BigDecimal("2500.00"));
        rc.setTaxPercentage(new BigDecimal("18.00"));
        rc.setTotalContractQuantity(500);
        rc = rateContractRepository.save(rc);

        // Initial assertion
        RateContractResponse rcResp = rateContractService.getRateContractById(rc.getId());
        assertEquals(500, rcResp.getTotalContractQuantity(), "Total RC must be 500");
        assertEquals(0, rcResp.getQuantityTakenThroughWO(), "Qty Taken Vide WO must be 0");
        assertEquals(500, rcResp.getNetAvailableQuantity(), "Net Available RC must be 500");

        // 2. Create Call-Up PO 1: 50 units
        CallUpPORequest poReq1 = new CallUpPORequest("PO-101", LocalDate.now(), "Raghav Enterprises", rc.getId(), 50, "First Delivery");
        callUpPOService.createCallUpPO(poReq1);

        rcResp = rateContractService.getRateContractById(rc.getId());
        assertEquals(500, rcResp.getTotalContractQuantity(), "Total RC must remain 500");
        assertEquals(50, rcResp.getQuantityTakenThroughWO(), "Qty Taken Vide WO must be 50");
        assertEquals(450, rcResp.getNetAvailableQuantity(), "Net Available RC must be 450 (500 - 50)");

        // 3. Create Call-Up PO 2: 100 units
        CallUpPORequest poReq2 = new CallUpPORequest("PO-102", LocalDate.now(), "Raghav Enterprises", rc.getId(), 100, "Second Delivery");
        callUpPOService.createCallUpPO(poReq2);

        rcResp = rateContractService.getRateContractById(rc.getId());
        assertEquals(500, rcResp.getTotalContractQuantity(), "Total RC must remain 500");
        assertEquals(150, rcResp.getQuantityTakenThroughWO(), "Qty Taken Vide WO must be 150 (50 + 100)");
        assertEquals(350, rcResp.getNetAvailableQuantity(), "Net Available RC must be 350 (500 - 150)");

        // 4. Record Asset Usage: 20 units
        User user = new User();
        user.setUsername("engineer.test");
        user.setEmail("engineer.test@iocl.co.in");
        user.setPassword("Password@123");
        user.setFullName("Test Engineer");
        user.setEmployeeId("EMP999");
        user.setDepartment("Operations");
        user.setLocation("Refinery");
        user.setRole(Role.USER);
        user = userRepository.save(user);

        com.iocl.procurement.entity.AssetUsage usage = new com.iocl.procurement.entity.AssetUsage();
        usage.setUser(user);
        usage.setCartridge(cart);
        usage.setQuantityUsed(20);
        usage.setUsageDate(LocalDate.now());
        usage.setRecordedByEmployeeName("Test Engineer");
        usage.setRecordedByEmployeeNo("EMP999");
        usage.setBeneficiaryEmployeeName("Beneficiary User");
        usage.setBeneficiaryEmployeeNo("EMP888");
        usage.setBeneficiaryDepartment("Operations");
        usage.setBeneficiarySeatOrCabinNo("Cabin-101");
        usage.setBeneficiaryLocation("Refinery");
        assetUsageRepository.save(usage);

        // Rate Contract must remain EXACTLY unchanged by Asset Usage
        rcResp = rateContractService.getRateContractById(rc.getId());
        assertEquals(500, rcResp.getTotalContractQuantity(), "Total RC must remain 500");
        assertEquals(150, rcResp.getQuantityTakenThroughWO(), "Qty Taken Vide WO must remain 150");
        assertEquals(350, rcResp.getNetAvailableQuantity(), "Net Available RC must remain 350 (NOT 330)");
        assertEquals(20, rcResp.getExecutedQuantity(), "Executed quantity must be 20 from Asset Usages");
    }

    @Test
    @DisplayName("Test Case 2: Combined Net Quantity Calculation in Tendering Alerts")
    void testCase2_CombinedNetQuantityCalculation() {
        // Setup Cartridge with Store Net Qty = 200
        Cartridge cart = new Cartridge("HP M454dn", 10, "HP 416X Black", "W2040X", 200);
        cart = cartridgeRepository.save(cart);

        // Setup Rate Contract: Contract Qty = 1000
        RateContract rc = new RateContract();
        rc.setContractDate(LocalDate.now());
        rc.setSupplierName("Alpha Supplies");
        rc.setCartridge(cart);
        rc.setRatePerUnit(new BigDecimal("4000.00"));
        rc.setTaxPercentage(new BigDecimal("18.00"));
        rc.setTotalContractQuantity(1000);
        rc = rateContractRepository.save(rc);

        // Setup Threshold: Tendering Threshold = 850
        CartridgeThreshold thresh = new CartridgeThreshold(cart, 50, 850);
        thresholdRepository.save(thresh);

        // Issue Call-Up PO = 300
        CallUpPORequest poReq = new CallUpPORequest("PO-201", LocalDate.now(), "Alpha Supplies", rc.getId(), 300, "PO 300 units");
        callUpPOService.createCallUpPO(poReq);

        // Record User Asset Usage = 100
        User user = new User();
        user.setUsername("user.eng");
        user.setEmail("user.eng@iocl.co.in");
        user.setPassword("Pass@123");
        user.setFullName("User Eng");
        user.setEmployeeId("ENG001");
        user.setDepartment("IT");
        user.setLocation("HQ");
        user.setRole(Role.USER);
        user = userRepository.save(user);

        com.iocl.procurement.entity.AssetUsage usage = new com.iocl.procurement.entity.AssetUsage();
        usage.setUser(user);
        usage.setCartridge(cart);
        usage.setQuantityUsed(100);
        usage.setUsageDate(LocalDate.now());
        usage.setRecordedByEmployeeName("User Eng");
        usage.setRecordedByEmployeeNo("ENG001");
        usage.setBeneficiaryEmployeeName("Officer 1");
        usage.setBeneficiaryEmployeeNo("OFF001");
        usage.setBeneficiaryDepartment("IT");
        usage.setBeneficiarySeatOrCabinNo("Cabin-2");
        usage.setBeneficiaryLocation("HQ");
        assetUsageRepository.save(usage);

        // Store quantity explicitly set to 200 to test exact user scenario:
        cart.setStoreQuantity(200);
        cartridgeRepository.save(cart);

        // Evaluate Tendering Alerts
        List<TenderingAlertResponse> alerts = alertService.getTenderingAlerts();
        assertEquals(1, alerts.size());
        TenderingAlertResponse alert = alerts.get(0);

        assertEquals("W2040X", alert.getPartNumber());
        assertEquals(1000, alert.getTotalRCQuantity(), "Total RC must be 1000");
        assertEquals(300, alert.getQuantityTakenThroughWO(), "Qty Taken Vide WO must be 300");
        assertEquals(700, alert.getRateContractNetAvailableQuantity(), "Net Available RC must be 700 (1000 - 300)");
        assertEquals(200, alert.getStoreNetAvailableQuantity(), "Store Net Qty must be 200");
        assertEquals(900, alert.getCombinedNetAvailableQuantity(), "Combined Net Qty must be 200 + 700 = 900");
        assertEquals(850, alert.getTenderingThreshold());
        assertEquals(50, alert.getDifference(), "Difference must be 900 - 850 = +50");
        assertFalse(alert.getIsUrgent(), "900 >= 850 so status is ADEQUATE");
    }

    @Test
    @DisplayName("Test Case 3: Multiple Independent Rate Contracts for the Same Cartridge")
    void testCase3_MultipleIndependentRateContracts() {
        Cartridge cart = new Cartridge("Canon MF654Cdw", 15, "Canon 069 Black", "069-BLK", 130);
        cart = cartridgeRepository.save(cart);

        // RC-001: Contract Qty = 500
        RateContract rc1 = new RateContract();
        rc1.setContractDate(LocalDate.now());
        rc1.setSupplierName("Vendor One");
        rc1.setCartridge(cart);
        rc1.setRatePerUnit(new BigDecimal("3000.00"));
        rc1.setTaxPercentage(new BigDecimal("18.00"));
        rc1.setTotalContractQuantity(500);
        rc1 = rateContractRepository.save(rc1);

        // RC-002: Contract Qty = 300
        RateContract rc2 = new RateContract();
        rc2.setContractDate(LocalDate.now());
        rc2.setSupplierName("Vendor Two");
        rc2.setCartridge(cart);
        rc2.setRatePerUnit(new BigDecimal("3100.00"));
        rc2.setTaxPercentage(new BigDecimal("18.00"));
        rc2.setTotalContractQuantity(300);
        rc2 = rateContractRepository.save(rc2);

        // Create PO on RC-001: 100 units
        CallUpPORequest poReq1 = new CallUpPORequest("PO-301", LocalDate.now(), "Vendor One", rc1.getId(), 100, "PO RC1");
        callUpPOService.createCallUpPO(poReq1);

        // Create PO on RC-002: 50 units
        CallUpPORequest poReq2 = new CallUpPORequest("PO-302", LocalDate.now(), "Vendor Two", rc2.getId(), 50, "PO RC2");
        callUpPOService.createCallUpPO(poReq2);

        // Verify RC-001 independently
        RateContractResponse resp1 = rateContractService.getRateContractById(rc1.getId());
        assertEquals(500, resp1.getTotalContractQuantity(), "RC-001 Total RC must be 500");
        assertEquals(100, resp1.getQuantityTakenThroughWO(), "RC-001 Qty Taken Vide WO must be 100");
        assertEquals(400, resp1.getNetAvailableQuantity(), "RC-001 Net Available RC must be 400 (500 - 100)");

        // Verify RC-002 independently
        RateContractResponse resp2 = rateContractService.getRateContractById(rc2.getId());
        assertEquals(300, resp2.getTotalContractQuantity(), "RC-002 Total RC must be 300");
        assertEquals(50, resp2.getQuantityTakenThroughWO(), "RC-002 Qty Taken Vide WO must be 50");
        assertEquals(250, resp2.getNetAvailableQuantity(), "RC-002 Net Available RC must be 250 (300 - 50)");

        // Verify Setting Threshold Limits page aggregated view for this cartridge
        CartridgeThreshold thresh = new CartridgeThreshold(cart, 100, 500);
        thresholdRepository.save(thresh);

        List<CartridgeThresholdResponse> thresholdList = thresholdService.getAllThresholds();
        assertEquals(1, thresholdList.size());
        CartridgeThresholdResponse threshResp = thresholdList.get(0);

        assertEquals(800, threshResp.getRateContractQuantity(), "Aggregated Total RC must be 500 + 300 = 800");
        assertEquals(650, threshResp.getNetAvailableQuantity(), "Aggregated Net Available in RC must be 400 + 250 = 650");
    }
}
