package com.iocl.procurement.seeder;

import com.iocl.procurement.entity.Admin;
import com.iocl.procurement.entity.Role;
import com.iocl.procurement.repository.AdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Component
public class AdminDataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminDataSeeder.class);

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.initial-admin.name:IOCL Administrator}")
    private String initialAdminName;

    @Value("${app.initial-admin.email:admin@iocl.co.in}")
    private String initialAdminEmail;

    @Value("${app.initial-admin.password:Admin@12345}")
    private String initialAdminPassword;

    public AdminDataSeeder(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedInitialAdmin();
    }

    private void seedInitialAdmin() {
        if (!StringUtils.hasText(initialAdminEmail) || !StringUtils.hasText(initialAdminPassword)) {
            logger.warn("Initial admin email or password is blank. Skipping admin data seeding.");
            return;
        }

        String normalizedEmail = initialAdminEmail.trim().toLowerCase();

        if (adminRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            logger.info("Admin account [{}] already exists. Skipping initialization.", normalizedEmail);
            return;
        }

        logger.info("No existing admin found with email [{}]. Seeding initial administrator account...", normalizedEmail);

        Admin admin = new Admin();
        admin.setName(StringUtils.hasText(initialAdminName) ? initialAdminName.trim() : "IOCL Administrator");
        admin.setEmail(normalizedEmail);
        admin.setPassword(passwordEncoder.encode(initialAdminPassword.trim()));
        admin.setRole(Role.ADMIN);

        adminRepository.save(admin);

        logger.info(">>> Initial Administrator account [{}] seeded successfully with ROLE_ADMIN. <<<", normalizedEmail);
    }
}
