package com.iocl.procurement;

import com.iocl.procurement.entity.Admin;
import com.iocl.procurement.repository.AdminRepository;
import com.iocl.procurement.seeder.AdminDataSeeder;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AdminDataSeederTest {

    @Autowired
    private AdminDataSeeder adminDataSeeder;

    @Autowired
    private AdminRepository adminRepository;

    @Test
    void testAdminSeedingIdempotency() {
        // Run seeder first time
        adminDataSeeder.run();
        long initialCount = adminRepository.count();
        assertTrue(initialCount >= 1, "At least one admin should be in the database");

        // Run seeder second time (simulating application restart)
        adminDataSeeder.run();
        long countAfterSecondRun = adminRepository.count();

        assertEquals(initialCount, countAfterSecondRun, "Admin count must not increase on subsequent runs");

        List<Admin> admins = adminRepository.findAll();
        long distinctEmails = admins.stream().map(a -> a.getEmail().toLowerCase()).distinct().count();
        assertEquals(admins.size(), distinctEmails, "There should be no duplicate admin emails");
    }
}
