package com.iocl.procurement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iocl.procurement.dto.request.CallUpPORequest;
import com.iocl.procurement.dto.request.LoginRequest;
import com.iocl.procurement.dto.request.RateContractRequest;
import com.iocl.procurement.dto.request.UpdateThresholdRequest;
import com.iocl.procurement.entity.*;
import com.iocl.procurement.repository.*;
import com.iocl.procurement.service.AlertEvaluationService;
import com.iocl.procurement.service.EmailNotificationService;
import com.iocl.procurement.service.ThresholdService;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Properties;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {"app.mail.enabled=true", "app.mail.admin-recipient=admin@iocl.co.in"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class Alert2TenderingServiceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AlertEvaluationService alertEvaluationService;

    @Autowired
    private ThresholdService thresholdService;

    @Autowired
    private EmailNotificationService emailNotificationService;

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

    @MockBean
    private JavaMailSender mailSender;

    private String jwtToken;
    private Cartridge testCartridge;
    private CartridgeThreshold testThreshold;

    @BeforeEach
    void setUp() throws Exception {
        alertRepository.deleteAll();
        callUpPORepository.deleteAll();
        rateContractRepository.deleteAll();
        thresholdRepository.deleteAll();
        cartridgeRepository.deleteAll();
        adminRepository.deleteAll();

        // Configure mock JavaMailSender
        when(mailSender.createMimeMessage()).thenReturn(new MimeMessage(Session.getInstance(new Properties())));
        doNothing().when(mailSender).send(any(MimeMessage.class));

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

        // 3. Create test cartridge (Store Quantity = 5)
        testCartridge = new Cartridge("Canon LBP674Cx", 30, "Canon Cartridge 069 Black", "069-BLK", 5);
        testCartridge = cartridgeRepository.save(testCartridge);

        // 4. Create threshold (PO Threshold = 6, Tendering Threshold = 20)
        testThreshold = new CartridgeThreshold(testCartridge, 6, 20);
        testThreshold = thresholdRepository.save(testThreshold);
    }

    @Test
    @DisplayName("TEST 1: Store = 5, Rate Contract = 10, Combined = 15 < Tender = 20 -> Alert 2 created with URGENT severity and email sent")
    void testAlert2TriggeredWhenCombinedLessThanTenderingThreshold() {
        // Create Rate Contract with 10 units net available
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

        // Store (5) + RC (10) = Combined (15) < Tender Threshold (20)
        alertEvaluationService.evaluateTenderingThreshold(testCartridge);

        // Verify Alert 2 in database
        List<ProcurementAlert> alerts = alertRepository.findByStatusWithCartridgeOrderByCreatedAtDesc(AlertStatus.UNREAD);
        assertEquals(1, alerts.size());

        ProcurementAlert alert2 = alerts.get(0);
        assertEquals(AlertType.TENDERING_REQUIRED, alert2.getAlertType());
        assertEquals(AlertSeverity.URGENT, alert2.getSeverity());
        assertEquals(5, alert2.getStoreNetAvailableQuantity());
        assertEquals(10, alert2.getRateContractNetAvailableQuantity());
        assertEquals(15, alert2.getCombinedNetAvailableQuantity());
        assertEquals(20, alert2.getTenderingThreshold());
        assertTrue(alert2.getMessage().contains("URGENT: Tendering required"));
        assertTrue(alert2.getMessage().contains("069-BLK"));
        assertTrue(alert2.getEmailSent());
        assertNotNull(alert2.getEmailSentAt());

        // Verify email was dispatched
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("TEST 2: Store = 10, Rate Contract = 10, Combined = 20 == Tender = 20 -> NO Alert 2 (verifies strict < inequality)")
    void testNoAlert2WhenCombinedEqualsTenderingThreshold() {
        // Set store quantity = 10
        testCartridge.setStoreQuantity(10);
        cartridgeRepository.save(testCartridge);

        // Rate Contract = 10
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

        // Store (10) + RC (10) = Combined (20) == Tender Threshold (20) -> NOT strictly less than 20
        alertEvaluationService.evaluateTenderingThreshold(testCartridge);

        // Must NOT create any Alert 2
        long count = alertRepository.count();
        assertEquals(0, count, "No Alert 2 should be created when Combined == Tendering Threshold");
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("TEST 3: Store = 25, Rate Contract = 10, Combined = 35 > Tender = 20 -> NO Alert 2")
    void testNoAlert2WhenCombinedGreaterThanTenderingThreshold() {
        // Store = 25
        testCartridge.setStoreQuantity(25);
        cartridgeRepository.save(testCartridge);

        // Rate Contract = 10
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

        // Store (25) + RC (10) = 35 > 20
        alertEvaluationService.evaluateTenderingThreshold(testCartridge);

        assertEquals(0, alertRepository.count());
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("TEST 4: Existing unread Alert 2 exists -> Evaluation updates alert in-place without creating duplicate")
    void testAlert2IdempotencyNoDuplicates() {
        // 1st evaluation: Combined = 5 + 0 = 5 < 20 -> Creates Alert 2
        alertEvaluationService.evaluateTenderingThreshold(testCartridge);
        assertEquals(1, alertRepository.countByStatus(AlertStatus.UNREAD));
        verify(mailSender, times(1)).send(any(MimeMessage.class));

        // 2nd evaluation on same cartridge: Combined = 5 < 20
        alertEvaluationService.evaluateTenderingThreshold(testCartridge);

        // Must STILL have exactly 1 unread alert and 1 email sent
        assertEquals(1, alertRepository.countByStatus(AlertStatus.UNREAD));
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("TEST 5 & 6: Email success and failure handling for Alert 2")
    void testAlert2EmailFailureHandling() {
        // Mock mail sender to throw an error
        doThrow(new MailSendException("SMTP server connection timeout")).when(mailSender).send(any(MimeMessage.class));

        // Trigger Alert 2 evaluation
        alertEvaluationService.evaluateTenderingThreshold(testCartridge);

        // Alert is still persisted in DB with emailSent = false
        List<ProcurementAlert> alerts = alertRepository.findByStatusWithCartridgeOrderByCreatedAtDesc(AlertStatus.UNREAD);
        assertEquals(1, alerts.size());
        ProcurementAlert alert = alerts.get(0);
        assertFalse(alert.getEmailSent());
        assertNotNull(alert.getEmailFailureReason());
        assertTrue(alert.getEmailFailureReason().contains("SMTP server connection timeout"));
    }

    @Test
    @DisplayName("TEST 7: Alert 1 non-regression -> Alert 1 and Alert 2 can co-exist independently with appropriate severity")
    void testAlert1AndAlert2Coexistence() throws Exception {
        // Create Rate Contract with 10 units <= PO Threshold (15 for 070-BLK, but for this cartridge PO Threshold = 6)
        // Here PO Threshold = 6, Tender Threshold = 20. Store = 5.
        // Let's create RC of 5 units:
        // Alert 1: RC Net Available (5) <= PO Threshold (6) -> TRIGGER ALERT 1 (Severity NORMAL)
        // Alert 2: Combined (5 Store + 5 RC = 10) < Tender Threshold (20) -> TRIGGER ALERT 2 (Severity URGENT)

        RateContractRequest rcRequest = new RateContractRequest(
                LocalDate.now(),
                "M/s Canon India Pvt Ltd",
                testCartridge.getId(),
                new BigDecimal("4500.00"),
                new BigDecimal("18.00"),
                5
        );

        mockMvc.perform(post("/api/procurement/rate-contracts")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rcRequest)))
                .andExpect(status().isCreated());

        // Verify that both Alert 1 (PROCUREMENT_THRESHOLD, NORMAL) and Alert 2 (TENDERING_REQUIRED, URGENT) are generated
        List<ProcurementAlert> allAlerts = alertRepository.findByStatusWithCartridgeOrderByCreatedAtDesc(AlertStatus.UNREAD);
        assertEquals(2, allAlerts.size());

        boolean hasAlert1 = allAlerts.stream().anyMatch(a -> a.getAlertType() == AlertType.PROCUREMENT_THRESHOLD && a.getSeverity() == AlertSeverity.NORMAL);
        boolean hasAlert2 = allAlerts.stream().anyMatch(a -> a.getAlertType() == AlertType.TENDERING_REQUIRED && a.getSeverity() == AlertSeverity.URGENT);

        assertTrue(hasAlert1, "Alert 1 must be present with NORMAL severity");
        assertTrue(hasAlert2, "Alert 2 must be present with URGENT severity");

        // Verify GET /api/alerts returns both alerts with all tendering fields
        mockMvc.perform(get("/api/alerts")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }
}
