package com.iocl.procurement.service.impl;

import com.iocl.procurement.entity.Admin;
import com.iocl.procurement.entity.Cartridge;
import com.iocl.procurement.entity.ProcurementAlert;
import com.iocl.procurement.entity.RateContract;
import com.iocl.procurement.repository.AdminRepository;
import com.iocl.procurement.repository.ProcurementAlertRepository;
import com.iocl.procurement.repository.RateContractRepository;
import com.iocl.procurement.service.EmailNotificationService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmailNotificationServiceImpl implements EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationServiceImpl.class);

    private final JavaMailSender mailSender;
    private final RateContractRepository rateContractRepository;
    private final AdminRepository adminRepository;
    private final ProcurementAlertRepository alertRepository;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${app.mail.from:no-reply@iocl.in}")
    private String mailFrom;

    @Value("${app.mail.admin-recipient:admin@example.com}")
    private String adminRecipientConfig;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    public EmailNotificationServiceImpl(
            JavaMailSender mailSender,
            RateContractRepository rateContractRepository,
            AdminRepository adminRepository,
            ProcurementAlertRepository alertRepository
    ) {
        this.mailSender = mailSender;
        this.rateContractRepository = rateContractRepository;
        this.adminRepository = adminRepository;
        this.alertRepository = alertRepository;
    }

    @Override
    public void sendProcurementAlertEmail(ProcurementAlert alert, Cartridge cartridge, Integer netAvailable, Integer poThreshold) {
        if (alert == null || cartridge == null) {
            logger.warn("Cannot send procurement alert email: Alert or Cartridge is null");
            return;
        }

        // Check if email sending is disabled via configuration
        if (!mailEnabled) {
            logger.info("Email notification is disabled via app.mail.enabled=false. Skipping email for alert ID: {}", alert.getId());
            return;
        }

        // Determine destination recipient
        String recipientEmail = resolveAdminEmail();
        if (recipientEmail == null || recipientEmail.isBlank()) {
            logger.warn("No administrator email configured. Skipping procurement alert email for alert ID: {}", alert.getId());
            recordEmailStatus(alert, false, "No valid recipient email address found", null);
            return;
        }

        // Retrieve Rate Contract details for accurate email values
        List<RateContract> rateContracts = rateContractRepository.findByCartridgeId(cartridge.getId());
        int totalRCQuantity = rateContracts.stream()
                .mapToInt(rc -> rc.getTotalContractQuantity() != null ? rc.getTotalContractQuantity() : 0)
                .sum();
        int executedQuantity = rateContracts.stream()
                .mapToInt(rc -> rc.getQuantityAlreadyExecuted() != null ? rc.getQuantityAlreadyExecuted() : 0)
                .sum();
        int callUpPOQuantity = rateContracts.stream()
                .mapToInt(rc -> rc.getQuantityTakenThroughWO() != null ? rc.getQuantityTakenThroughWO() : 0)
                .sum();

        String supplierNames = rateContracts.stream()
                .map(RateContract::getSupplierName)
                .filter(name -> name != null && !name.isBlank())
                .distinct()
                .collect(Collectors.joining(", "));
        if (supplierNames.isBlank()) {
            supplierNames = "Rate Contract Supplier";
        }

        int finalNetAvailable = (netAvailable != null) ? netAvailable : (totalRCQuantity - executedQuantity - callUpPOQuantity);
        int finalThreshold = (poThreshold != null) ? poThreshold : alert.getThreshold();

        String subject = String.format("IOCL Procurement Alert - Rate Contract Threshold Reached [%s]", cartridge.getPartNumber());
        String htmlContent = buildHtmlEmail(cartridge, supplierNames, totalRCQuantity, executedQuantity, callUpPOQuantity, finalNetAvailable, finalThreshold);
        String plainTextContent = buildPlainTextEmail(cartridge, supplierNames, totalRCQuantity, executedQuantity, callUpPOQuantity, finalNetAvailable, finalThreshold);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(mailFrom.isBlank() ? "no-reply@iocl.in" : mailFrom);
            helper.setTo(recipientEmail);
            helper.setSubject(subject);
            helper.setText(plainTextContent, htmlContent);

            mailSender.send(mimeMessage);

            logger.info("Procurement alert email sent successfully for alert ID: {} to recipient: {}", alert.getId(), recipientEmail);
            recordEmailStatus(alert, true, null, LocalDateTime.now());

        } catch (MailException | MessagingException ex) {
            String errorMsg = "Mail delivery failed: " + ex.getMessage();
            logger.error("Failed to send procurement alert email for alert ID: {}. Error: {}", alert.getId(), ex.getMessage());
            recordEmailStatus(alert, false, errorMsg, null);
        } catch (Exception ex) {
            String errorMsg = "Unexpected error sending alert email: " + ex.getMessage();
            logger.error("Failed to send procurement alert email for alert ID: {}. Error: {}", alert.getId(), ex.getMessage());
            recordEmailStatus(alert, false, errorMsg, null);
        }
    }

    private void recordEmailStatus(ProcurementAlert alert, boolean success, String failureReason, LocalDateTime sentAt) {
        try {
            alert.setEmailSent(success);
            alert.setEmailSentAt(sentAt);
            if (failureReason != null && failureReason.length() > 490) {
                alert.setEmailFailureReason(failureReason.substring(0, 490) + "...");
            } else {
                alert.setEmailFailureReason(failureReason);
            }
            alertRepository.save(alert);
        } catch (Exception ex) {
            logger.error("Failed to persist email status for alert ID: {}. Error: {}", alert.getId(), ex.getMessage());
        }
    }

    private String resolveAdminEmail() {
        if (adminRecipientConfig != null && !adminRecipientConfig.isBlank() && !adminRecipientConfig.equalsIgnoreCase("admin@example.com")) {
            return adminRecipientConfig.trim();
        }
        // Fallback to active Admin in the database
        return adminRepository.findAll().stream()
                .findFirst()
                .map(Admin::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .orElse(adminRecipientConfig != null ? adminRecipientConfig.trim() : "admin@example.com");
    }

    private String buildHtmlEmail(Cartridge cartridge, String supplier, int totalRC, int executed, int callUpPO, int netAvailable, int threshold) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm:ss"));

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<style>" +
                "  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #F8FAFC; color: #1E293B; }" +
                "  .container { max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border-radius: 10px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }" +
                "  .header { background: linear-gradient(135deg, #003366 0%, #001F3F 100%); padding: 24px 30px; text-align: left; color: #FFFFFF; }" +
                "  .header h1 { margin: 0 0 6px 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }" +
                "  .header p { margin: 0; font-size: 12px; color: #CBD5E1; text-transform: uppercase; letter-spacing: 1px; }" +
                "  .alert-banner { background-color: #FEF2F2; border-left: 5px solid #DC2626; padding: 14px 20px; margin: 20px 30px; border-radius: 4px; }" +
                "  .alert-banner strong { color: #991B1B; font-size: 14px; text-transform: uppercase; display: block; margin-bottom: 2px; }" +
                "  .alert-banner p { margin: 0; color: #B91C1C; font-size: 13px; }" +
                "  .content { padding: 0 30px 24px 30px; }" +
                "  .content p { font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 16px; }" +
                "  table { width: 100%; border-collapse: collapse; margin: 16px 0 24px 0; background-color: #FFFFFF; border-radius: 6px; overflow: hidden; border: 1px solid #E2E8F0; }" +
                "  th { background-color: #003366; color: #FFFFFF; font-weight: 600; text-align: left; padding: 10px 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }" +
                "  td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #F1F5F9; color: #1E293B; }" +
                "  tr:last-child td { border-bottom: none; }" +
                "  tr:nth-child(even) { background-color: #F8FAFC; }" +
                "  .field-name { font-weight: 600; color: #475569; width: 45%; }" +
                "  .badge-danger { background-color: #FEE2E2; color: #DC2626; font-weight: 700; padding: 2px 8px; border-radius: 4px; display: inline-block; }" +
                "  .badge-part { font-family: monospace; font-weight: 700; background-color: #E2E8F0; padding: 2px 6px; border-radius: 4px; }" +
                "  .footer { background-color: #F1F5F9; padding: 18px 30px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0; }" +
                "  .footer p { margin: 4px 0; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "  <div class='header'>" +
                "    <h1>Indian Oil Corporation Limited</h1>" +
                "    <p>Consumables & Procurement Management System</p>" +
                "  </div>" +
                "  <div class='alert-banner'>" +
                "    <strong>Procurement Threshold Alert</strong>" +
                "    <p>Net Available Rate Contract quantity has reached or fallen below the configured PO threshold.</p>" +
                "  </div>" +
                "  <div class='content'>" +
                "    <p>Dear Administrator,</p>" +
                "    <p>A procurement threshold alert has been triggered for the following consumable item:</p>" +
                "    <table>" +
                "      <thead>" +
                "        <tr>" +
                "          <th>Field</th>" +
                "          <th>Value</th>" +
                "        </tr>" +
                "      </thead>" +
                "      <tbody>" +
                "        <tr><td class='field-name'>Part Number</td><td><span class='badge-part'>" + escapeHtml(cartridge.getPartNumber()) + "</span></td></tr>" +
                "        <tr><td class='field-name'>Cartridge Name</td><td><strong>" + escapeHtml(cartridge.getCartridgeName()) + "</strong></td></tr>" +
                "        <tr><td class='field-name'>Printer Model</td><td>" + escapeHtml(cartridge.getPrinterName()) + "</td></tr>" +
                "        <tr><td class='field-name'>Supplier</td><td>" + escapeHtml(supplier) + "</td></tr>" +
                "        <tr><td class='field-name'>Rate Contract Quantity</td><td>" + totalRC + "</td></tr>" +
                "        <tr><td class='field-name'>Already Executed Quantity</td><td>" + executed + "</td></tr>" +
                "        <tr><td class='field-name'>Call-Up PO / WO Quantity</td><td>" + callUpPO + "</td></tr>" +
                "        <tr><td class='field-name'>Net Available Quantity</td><td><span class='badge-danger'>" + netAvailable + " units</span></td></tr>" +
                "        <tr><td class='field-name'>Configured PO Threshold</td><td><strong>" + threshold + " units</strong></td></tr>" +
                "      </tbody>" +
                "    </table>" +
                "    <p><strong>Reason:</strong> The Net Available Rate Contract Quantity (" + netAvailable + ") has reached or fallen below the configured PO threshold (" + threshold + ").</p>" +
                "    <p>Please review the procurement requirement and initiate a new Rate Contract or take necessary procurement actions.</p>" +
                "  </div>" +
                "  <div class='footer'>" +
                "    <p><strong>IOCL Consumables / Procurement Management System</strong></p>" +
                "    <p>Triggered on: " + timestamp + " | Automated System Notification</p>" +
                "    <p style='color:#94A3B8;'>Please do not reply directly to this automated email.</p>" +
                "  </div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String buildPlainTextEmail(Cartridge cartridge, String supplier, int totalRC, int executed, int callUpPO, int netAvailable, int threshold) {
        return "Dear Administrator,\n\n" +
                "A procurement threshold alert has been triggered for the following consumable:\n\n" +
                "============================================================\n" +
                "PROCUREMENT THRESHOLD ALERT\n" +
                "============================================================\n" +
                "Part Number: " + cartridge.getPartNumber() + "\n" +
                "Cartridge: " + cartridge.getCartridgeName() + "\n" +
                "Printer Model: " + cartridge.getPrinterName() + "\n" +
                "Supplier: " + supplier + "\n" +
                "Rate Contract Quantity: " + totalRC + "\n" +
                "Already Executed Quantity: " + executed + "\n" +
                "Call-Up PO / WO Quantity: " + callUpPO + "\n" +
                "Net Available Quantity: " + netAvailable + "\n" +
                "Configured PO Threshold: " + threshold + "\n\n" +
                "Reason:\n" +
                "The Net Available Rate Contract Quantity has reached or fallen below the configured PO threshold.\n\n" +
                "Please review the procurement requirement.\n\n" +
                "This is an automated notification from the IOCL Consumables / Procurement Management System.\n";
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
