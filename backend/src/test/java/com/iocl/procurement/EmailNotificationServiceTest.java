package com.iocl.procurement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iocl.procurement.dto.request.CallUpPORequest;
import com.iocl.procurement.dto.request.LoginRequest;
import com.iocl.procurement.dto.request.RateContractRequest;
import com.iocl.procurement.entity.*;
import com.iocl.procurement.repository.*;
import com.iocl.procurement.service.EmailNotificationService;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {"app.mail.enabled=true", "app.mail.admin-recipient=admin@iocl.co.in"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EmailNotificationServiceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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
        Admin admin = new Admin("IOCL Procurement Admin", "admin@iocl.co.in", passwordEncoder.encode("Test@12345"), Role.ADMIN);
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

        // 3. Create test cartridge & threshold (PO Threshold = 15)
        testCartridge = new Cartridge("Canon LBP246dw", 45, "Canon 070 Black", "070-BLK");
        testCartridge = cartridgeRepository.save(testCartridge);

        CartridgeThreshold threshold = new CartridgeThreshold(testCartridge, 15, 5);
        thresholdRepository.save(threshold);
    }

    @Test
    @DisplayName("ALERT 1 Flow + Email: Creating PO reaching threshold triggers In-App Alert and Admin Email")
    void testAlertAndEmailGenerationOnLowAvailability() throws Exception {
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

        // Initial 100 > 15 -> No email sent, no unread alert
        verify(mailSender, never()).send(any(MimeMessage.class));
        assertEquals(0, alertRepository.countByStatus(AlertStatus.UNREAD));

        // Step 2: Create Call-Up PO of 85 units -> Net Available = 15 <= 15 (Threshold)
        CallUpPORequest poRequest = new CallUpPORequest(
                "PO/2026/MAIL-01",
                LocalDate.now(),
                "M/s Canon India Pvt Ltd",
                rcId,
                85,
                "Urgent requirement"
        );

        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(poRequest)))
                .andExpect(status().isCreated());

        // Step 3: Verify Alert 1 row in database has emailSent = true
        List<ProcurementAlert> unreadAlerts = alertRepository.findByStatusWithCartridgeOrderByCreatedAtDesc(AlertStatus.UNREAD);
        assertEquals(1, unreadAlerts.size());
        ProcurementAlert alert = unreadAlerts.get(0);
        assertEquals(15, alert.getNetAvailableQuantity());
        assertEquals(15, alert.getThreshold());
        assertTrue(alert.getEmailSent());
        assertNotNull(alert.getEmailSentAt());
        assertNull(alert.getEmailFailureReason());

        // Step 4: Verify email sending was attempted exactly once
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Email Duplicate Prevention: Further POs on existing unread alert do NOT send duplicate emails")
    void testDuplicateEmailPrevention() throws Exception {
        // Step 1: Create Rate Contract with 20 qty
        RateContractRequest rcRequest = new RateContractRequest(
                LocalDate.now(),
                "M/s Canon India Pvt Ltd",
                testCartridge.getId(),
                new BigDecimal("4500.00"),
                new BigDecimal("18.00"),
                20
        );

        MvcResult rcResult = mockMvc.perform(post("/api/procurement/rate-contracts")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rcRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Long rcId = objectMapper.readTree(rcResult.getResponse().getContentAsString()).get("id").asLong();

        // Step 2: Create Call-Up PO of 5 units -> Net Available = 15 <= 15 -> Triggers 1st Alert & Email
        CallUpPORequest po1 = new CallUpPORequest(
                "PO/2026/DUP-01",
                LocalDate.now(),
                "M/s Canon India Pvt Ltd",
                rcId,
                5,
                "First batch"
        );
        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(po1)))
                .andExpect(status().isCreated());

        verify(mailSender, times(1)).send(any(MimeMessage.class));

        // Step 3: Create another Call-Up PO of 2 units -> Net Available = 13 <= 15 (Already low / unread)
        CallUpPORequest po2 = new CallUpPORequest(
                "PO/2026/DUP-02",
                LocalDate.now(),
                "M/s Canon India Pvt Ltd",
                rcId,
                2,
                "Second batch"
        );
        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(po2)))
                .andExpect(status().isCreated());

        // Still exactly 1 unread alert and still exactly 1 email sent (no duplicate email spam)
        assertEquals(1, alertRepository.countByStatus(AlertStatus.UNREAD));
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Email Re-arming: Replenishment resolves alert; subsequent threshold breach triggers a NEW email")
    void testEmailReArmingAfterReplenishment() throws Exception {
        // Step 1: Create initial RC of 15 qty -> Triggers Alert & Email
        RateContractRequest rcRequest1 = new RateContractRequest(
                LocalDate.now(),
                "M/s Canon India Pvt Ltd",
                testCartridge.getId(),
                new BigDecimal("4500.00"),
                new BigDecimal("18.00"),
                15
        );
        mockMvc.perform(post("/api/procurement/rate-contracts")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rcRequest1)))
                .andExpect(status().isCreated());

        verify(mailSender, times(1)).send(any(MimeMessage.class));
        assertEquals(1, alertRepository.countByStatus(AlertStatus.UNREAD));

        // Step 2: Replenish quantity with a 2nd Rate Contract (50 units) -> Total Net Available = 65 > 15
        RateContractRequest rcRequest2 = new RateContractRequest(
                LocalDate.now(),
                "M/s Canon India Pvt Ltd",
                testCartridge.getId(),
                new BigDecimal("4500.00"),
                new BigDecimal("18.00"),
                50
        );
        MvcResult rc2Result = mockMvc.perform(post("/api/procurement/rate-contracts")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rcRequest2)))
                .andExpect(status().isCreated())
                .andReturn();
        Long rc2Id = objectMapper.readTree(rc2Result.getResponse().getContentAsString()).get("id").asLong();

        // Alert is resolved (0 unread alerts)
        assertEquals(0, alertRepository.countByStatus(AlertStatus.UNREAD));

        // Step 3: Draw down 50 units from RC2 -> Total Net Available = 65 - 50 = 15 <= 15
        CallUpPORequest poDrawDown = new CallUpPORequest(
                "PO/2026/REARM-01",
                LocalDate.now(),
                "M/s Canon India Pvt Ltd",
                rc2Id,
                50,
                "Drawdown to threshold"
        );
        mockMvc.perform(post("/api/procurement/call-up-pos")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(poDrawDown)))
                .andExpect(status().isCreated());

        // Step 4: Verify a NEW unread alert is created and a 2nd email was sent
        assertEquals(1, alertRepository.countByStatus(AlertStatus.UNREAD));
        verify(mailSender, times(2)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Transaction Safety: Email failure (SMTP down) does not break procurement transaction")
    void testEmailFailureDoesNotRollbackProcurement() throws Exception {
        // Configure mailSender to throw an exception when sending
        doThrow(new MailSendException("SMTP connection refused: connection timed out"))
                .when(mailSender).send(any(MimeMessage.class));

        RateContractRequest rcRequest = new RateContractRequest(
                LocalDate.now(),
                "M/s Canon India Pvt Ltd",
                testCartridge.getId(),
                new BigDecimal("4500.00"),
                new BigDecimal("18.00"),
                10 // <= 15 triggers alert
        );

        // Procurement transaction must succeed (HTTP 201 Created)
        mockMvc.perform(post("/api/procurement/rate-contracts")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rcRequest)))
                .andExpect(status().isCreated());

        // Rate contract is saved in DB
        List<RateContract> contracts = rateContractRepository.findByCartridgeId(testCartridge.getId());
        assertEquals(1, contracts.size());

        // Alert is still persisted in DB, with emailSent = false and failure reason recorded
        List<ProcurementAlert> alerts = alertRepository.findByStatusWithCartridgeOrderByCreatedAtDesc(AlertStatus.UNREAD);
        assertEquals(1, alerts.size());
        ProcurementAlert alert = alerts.get(0);
        assertFalse(alert.getEmailSent());
        assertNotNull(alert.getEmailFailureReason());
        assertTrue(alert.getEmailFailureReason().contains("SMTP connection refused"));
    }

    @Test
    @DisplayName("Beneficiary Email: Sends notification email with correct details to beneficiary")
    void testSendBeneficiaryUsageNotificationEmail() {
        AssetUsage usage = new AssetUsage();
        usage.setRecordedByEmployeeNo("ENG101");
        usage.setRecordedByEmployeeName("Rahul Sharma");
        usage.setBeneficiaryEmployeeNo("EMP205");
        usage.setBeneficiaryEmployeeName("Anjali Varshney");
        usage.setBeneficiaryDepartment("IT");
        usage.setBeneficiaryLocation("Head Office");
        usage.setBeneficiarySeatOrCabinNo("A-204");
        usage.setBeneficiaryEmail("anjali.varshney@iocl.co.in");
        usage.setPartNumber("070-BLK");
        usage.setCartridgeName("Canon 070 Black Toner");
        usage.setColour(CartridgeColor.BLACK);
        usage.setQuantityUsed(1);
        usage.setUsageDate(LocalDate.of(2026, 8, 20));

        boolean result = emailNotificationService.sendBeneficiaryUsageNotificationEmail(usage);
        assertTrue(result);
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }
}
