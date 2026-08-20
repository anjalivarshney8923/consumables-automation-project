package com.iocl.procurement;

import com.iocl.procurement.dto.DailyPOThresholdReportItem;
import com.iocl.procurement.entity.*;
import com.iocl.procurement.repository.*;
import com.iocl.procurement.scheduler.DailyPOThresholdScheduler;
import com.iocl.procurement.service.DailyPOThresholdReportService;
import com.iocl.procurement.service.EmailNotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
public class DailyPOThresholdReportTest {

    @Autowired
    private DailyPOThresholdReportService dailyReportService;

    @Autowired
    private DailyPOThresholdScheduler dailyScheduler;

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
    private AdminRepository adminRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private EmailNotificationService emailNotificationService;

    @BeforeEach
    void setUp() {
        assetRepository.deleteAll();
        alertRepository.deleteAll();
        callUpPORepository.deleteAll();
        rateContractRepository.deleteAll();
        thresholdRepository.deleteAll();
        cartridgeRepository.deleteAll();
        adminRepository.deleteAll();

        // Seed admin user
        Admin admin = new Admin("IOCL Admin", "admin@iocl.co.in", passwordEncoder.encode("Test@12345"), Role.ADMIN);
        adminRepository.save(admin);

        reset(emailNotificationService);
    }

    @Test
    @DisplayName("1. Single low-availability item (Net Available < PO Threshold) is included with correct shortfall")
    void testSingleLowAvailabilityItem() {
        // Cartridge A: Total RC = 10, PO Threshold = 15 -> Shortfall = 5
        Cartridge cartridge = new Cartridge("Canon LBP246dw", 50, "Canon 070 Black", "070-BLK");
        cartridge = cartridgeRepository.save(cartridge);

        CartridgeThreshold threshold = new CartridgeThreshold(cartridge, 15, 10);
        thresholdRepository.save(threshold);

        RateContract rc = new RateContract();
        rc.setContractDate(LocalDate.of(2026, 8, 1));
        rc.setSupplierName("Raghav Enterprises");
        rc.setCartridge(cartridge);
        rc.setRatePerUnit(new BigDecimal("2500.00"));
        rc.setTaxPercentage(new BigDecimal("18.00"));
        rc.setTotalContractQuantity(10);
        rc.setQuantityAlreadyExecuted(0);
        rc.setQuantityTakenThroughWO(0);
        rateContractRepository.save(rc);

        List<DailyPOThresholdReportItem> reportItems = dailyReportService.generateAndSendDailyReport();

        assertEquals(1, reportItems.size());
        DailyPOThresholdReportItem item = reportItems.get(0);
        assertEquals("070-BLK", item.getPartNumber());
        assertEquals(10, item.getNetAvailableQuantity());
        assertEquals(15, item.getPoThreshold());
        assertEquals(5, item.getShortfall());
        assertEquals("Raghav Enterprises", item.getSupplierNames());

        verify(emailNotificationService, times(1)).sendDailyPOThresholdReportEmail(anyList());
    }

    @Test
    @DisplayName("2. Normal item (Net Available >= PO Threshold) is excluded from report")
    void testNormalItemExcluded() {
        // Cartridge B: Total RC = 20, PO Threshold = 15 -> Healthy
        Cartridge cartridge = new Cartridge("HP M454dn", 30, "HP 416X Black", "W2040X");
        cartridge = cartridgeRepository.save(cartridge);

        CartridgeThreshold threshold = new CartridgeThreshold(cartridge, 15, 10);
        thresholdRepository.save(threshold);

        RateContract rc = new RateContract();
        rc.setContractDate(LocalDate.of(2026, 8, 1));
        rc.setSupplierName("Alpha Supplies");
        rc.setCartridge(cartridge);
        rc.setRatePerUnit(new BigDecimal("4000.00"));
        rc.setTaxPercentage(new BigDecimal("18.00"));
        rc.setTotalContractQuantity(20);
        rateContractRepository.save(rc);

        List<DailyPOThresholdReportItem> reportItems = dailyReportService.generateAndSendDailyReport();

        assertTrue(reportItems.isEmpty());
        verify(emailNotificationService, never()).sendDailyPOThresholdReportEmail(anyList());
    }

    @Test
    @DisplayName("3. Zero availability (Net Available = 0, Threshold = 5) is included with shortfall = 5")
    void testZeroAvailabilityItem() {
        Cartridge cartridge = new Cartridge("HP Enterprise M507", 10, "HP 89A Black", "CF289A");
        cartridge = cartridgeRepository.save(cartridge);

        CartridgeThreshold threshold = new CartridgeThreshold(cartridge, 5, 2);
        thresholdRepository.save(threshold);

        RateContract rc = new RateContract();
        rc.setContractDate(LocalDate.of(2026, 8, 1));
        rc.setSupplierName("Beta Corp");
        rc.setCartridge(cartridge);
        rc.setRatePerUnit(new BigDecimal("3500.00"));
        rc.setTaxPercentage(new BigDecimal("18.00"));
        rc.setTotalContractQuantity(10);
        rc.setQuantityAlreadyExecuted(0);
        rc.setQuantityTakenThroughWO(10); // Net Available = 10 - 10 = 0
        rateContractRepository.save(rc);

        List<DailyPOThresholdReportItem> reportItems = dailyReportService.generateAndSendDailyReport();

        assertEquals(1, reportItems.size());
        DailyPOThresholdReportItem item = reportItems.get(0);
        assertEquals(0, item.getNetAvailableQuantity());
        assertEquals(5, item.getPoThreshold());
        assertEquals(5, item.getShortfall());
        verify(emailNotificationService, times(1)).sendDailyPOThresholdReportEmail(anyList());
    }

    @Test
    @DisplayName("4. Item exactly equal to threshold (Net Available == PO Threshold) is NOT included")
    void testExactThresholdItemExcluded() {
        Cartridge cartridge = new Cartridge("Canon MF654Cdw", 15, "Canon 069 Black", "069-BLK");
        cartridge = cartridgeRepository.save(cartridge);

        CartridgeThreshold threshold = new CartridgeThreshold(cartridge, 5, 2);
        thresholdRepository.save(threshold);

        RateContract rc = new RateContract();
        rc.setContractDate(LocalDate.of(2026, 8, 1));
        rc.setSupplierName("Gamma Vendor");
        rc.setCartridge(cartridge);
        rc.setRatePerUnit(new BigDecimal("2800.00"));
        rc.setTaxPercentage(new BigDecimal("18.00"));
        rc.setTotalContractQuantity(5);
        rateContractRepository.save(rc);

        List<DailyPOThresholdReportItem> reportItems = dailyReportService.generateAndSendDailyReport();

        assertTrue(reportItems.isEmpty());
        verify(emailNotificationService, never()).sendDailyPOThresholdReportEmail(anyList());
    }

    @Test
    @DisplayName("5. Multiple low items are consolidated into ONE report and ONE email dispatch")
    void testMultipleLowItemsConsolidated() {
        // Item 1: 070-BLK (Net Available 860 < Threshold 861 -> Shortfall 1)
        Cartridge c1 = cartridgeRepository.save(new Cartridge("Canon LBP246dw", 40, "Canon 070 Black", "070-BLK"));
        thresholdRepository.save(new CartridgeThreshold(c1, 861, 100));
        RateContract rc1 = new RateContract();
        rc1.setContractDate(LocalDate.now());
        rc1.setSupplierName("ABC Ltd");
        rc1.setCartridge(c1);
        rc1.setRatePerUnit(new BigDecimal("2000"));
        rc1.setTaxPercentage(new BigDecimal("18"));
        rc1.setTotalContractQuantity(1000);
        rc1.setQuantityTakenThroughWO(140); // Net = 860
        rateContractRepository.save(rc1);

        // Item 2: W2040X (Net Available 173 < Threshold 176 -> Shortfall 3)
        Cartridge c2 = cartridgeRepository.save(new Cartridge("HP M454dn", 20, "HP 416X Black", "W2040X"));
        thresholdRepository.save(new CartridgeThreshold(c2, 176, 50));
        RateContract rc2 = new RateContract();
        rc2.setContractDate(LocalDate.now());
        rc2.setSupplierName("XYZ Ltd");
        rc2.setCartridge(c2);
        rc2.setRatePerUnit(new BigDecimal("3000"));
        rc2.setTaxPercentage(new BigDecimal("18"));
        rc2.setTotalContractQuantity(200);
        rc2.setQuantityTakenThroughWO(27); // Net = 173
        rateContractRepository.save(rc2);

        // Item 3: CF360X (Net Available 0 < Threshold 1 -> Shortfall 1)
        Cartridge c3 = cartridgeRepository.save(new Cartridge("HP M553", 10, "HP 508X Black", "CF360X"));
        thresholdRepository.save(new CartridgeThreshold(c3, 1, 0));
        RateContract rc3 = new RateContract();
        rc3.setContractDate(LocalDate.now());
        rc3.setSupplierName("ABC Ltd");
        rc3.setCartridge(c3);
        rc3.setRatePerUnit(new BigDecimal("5000"));
        rc3.setTaxPercentage(new BigDecimal("18"));
        rc3.setTotalContractQuantity(50);
        rc3.setQuantityTakenThroughWO(50); // Net = 0
        rateContractRepository.save(rc3);

        // Item 4: HEALTHY (Net Available 500 >= Threshold 50) -> Must be excluded
        Cartridge c4 = cartridgeRepository.save(new Cartridge("Canon MF445dw", 15, "Canon 057 Black", "057-BLK"));
        thresholdRepository.save(new CartridgeThreshold(c4, 50, 20));
        RateContract rc4 = new RateContract();
        rc4.setContractDate(LocalDate.now());
        rc4.setSupplierName("Healthy Vendor");
        rc4.setCartridge(c4);
        rc4.setRatePerUnit(new BigDecimal("1500"));
        rc4.setTaxPercentage(new BigDecimal("18"));
        rc4.setTotalContractQuantity(500); // Net = 500
        rateContractRepository.save(rc4);

        List<DailyPOThresholdReportItem> reportItems = dailyReportService.generateAndSendDailyReport();

        assertEquals(3, reportItems.size());
        assertEquals("070-BLK", reportItems.get(0).getPartNumber());
        assertEquals(1, reportItems.get(0).getShortfall());

        assertEquals("W2040X", reportItems.get(1).getPartNumber());
        assertEquals(3, reportItems.get(1).getShortfall());

        assertEquals("CF360X", reportItems.get(2).getPartNumber());
        assertEquals(1, reportItems.get(2).getShortfall());

        // Verify exactly ONE email invocation containing the 3 items
        verify(emailNotificationService, times(1)).sendDailyPOThresholdReportEmail(argThat(list -> list.size() == 3));
    }

    @Test
    @DisplayName("6. Scheduler component method executes safely")
    void testSchedulerExecution() {
        assertDoesNotThrow(() -> dailyScheduler.runDailyPOThresholdReport());
    }
}
