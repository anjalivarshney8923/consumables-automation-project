package com.iocl.procurement.seeder;

import com.iocl.procurement.entity.Role;
import com.iocl.procurement.entity.User;
import com.iocl.procurement.entity.UserStatus;
import com.iocl.procurement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Seeds baseline IOCL employees into the Employee Master / User directory.
 * These employees can be searched and selected as beneficiaries in the Asset Usage workflow,
 * or enter credentials to record usage as engineers.
 */
@Component
@Order(3)
public class EmployeeDataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeDataSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeDataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedInitialEmployees();
    }

    private void seedInitialEmployees() {
        List<EmployeeSeedItem> baselineEmployees = List.of(
                new EmployeeSeedItem("Anjali Varshney", "anjali.varshney", "anjali.varshney@iocl.co.in", "EMP201", "IT", "Head Office"),
                new EmployeeSeedItem("Vikram Singh", "vikram.singh", "vikram.singh@iocl.co.in", "EMP202", "Operations", "Refinery"),
                new EmployeeSeedItem("Priya Sharma", "priya.sharma", "priya.sharma@iocl.co.in", "EMP203", "Finance", "Head Office"),
                new EmployeeSeedItem("Rajesh Patel", "rajesh.patel", "rajesh.patel@iocl.co.in", "EMP204", "Maintenance", "Terminal"),
                new EmployeeSeedItem("Amit Kumar", "amit.kumar", "amit.kumar@iocl.co.in", "EMP205", "Procurement", "Head Office"),
                new EmployeeSeedItem("Sunita Rao", "sunita.rao", "sunita.rao@iocl.co.in", "EMP206", "Stores", "Depot"),
                new EmployeeSeedItem("Manoj Tiwari", "manoj.tiwari", "manoj.tiwari@iocl.co.in", "EMP207", "Engineering", "Refinery"),
                new EmployeeSeedItem("Kavita Nair", "kavita.nair", "kavita.nair@iocl.co.in", "EMP208", "Human Resources", "Regional Office")
        );

        int seededCount = 0;
        for (EmployeeSeedItem item : baselineEmployees) {
            if (!userRepository.existsByEmployeeIdIgnoreCase(item.employeeId)
                    && !userRepository.existsByEmailIgnoreCase(item.email)
                    && !userRepository.existsByUsernameIgnoreCase(item.username)) {
                User user = new User();
                user.setFullName(item.fullName);
                user.setUsername(item.username);
                user.setEmail(item.email);
                user.setPassword(passwordEncoder.encode("Password@123"));
                user.setEmployeeId(item.employeeId);
                user.setDepartment(item.department);
                user.setLocation(item.location);
                user.setRole(Role.USER);
                user.setStatus(UserStatus.ACTIVE);

                userRepository.save(user);
                seededCount++;
            }
        }

        if (seededCount > 0) {
            logger.info(">>> Seeded {} baseline employee(s) into Employee Master <<<", seededCount);
        } else {
            logger.info("Baseline employee records already present in Employee Master.");
        }
    }

    private record EmployeeSeedItem(
            String fullName,
            String username,
            String email,
            String employeeId,
            String department,
            String location
    ) {}
}
