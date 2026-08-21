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
    private final com.iocl.procurement.repository.EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeDataSeeder(
            UserRepository userRepository,
            com.iocl.procurement.repository.EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedInitialEmployees();
    }

    private void seedInitialEmployees() {
        List<EmployeeSeedItem> baselineEmployees = List.of(
                new EmployeeSeedItem("Anjali Varshney", "anjali.varshney", "anjali.varshney@iocl.co.in", "EMP201", "Information Systems", "Head Office", "Chief Manager (IS)", "Grade F", "Cabin-401", "Canon LBP246dw", "CN-SER-40101"),
                new EmployeeSeedItem("Vikram Singh", "vikram.singh", "vikram.singh@iocl.co.in", "EMP202", "Operations", "Refinery Complex", "Senior Manager", "Grade E", "Room-204", "HP LaserJet Pro M454dn", "HP-M454-204"),
                new EmployeeSeedItem("Priya Sharma", "priya.sharma", "priya.sharma@iocl.co.in", "EMP203", "Finance & Accounts", "Head Office", "Manager (Finance)", "Grade D", "Admin-102", "Canon LBP246dw", "CN-SER-10203"),
                new EmployeeSeedItem("Rajesh Patel", "rajesh.patel", "rajesh.patel@iocl.co.in", "EMP204", "Maintenance", "Refinery", "Deputy Manager", "Grade D", "Plant-110", "HP Color LaserJet M479fdw", "HP-MFP-1104"),
                new EmployeeSeedItem("Amit Kumar", "amit.kumar", "amit.kumar@iocl.co.in", "EMP205", "Procurement", "Head Office", "Senior Officer", "Grade C", "Proc-305", "Canon imageCLASS MF445dw", "CN-MFP-305"),
                new EmployeeSeedItem("Sunita Rao", "sunita.rao", "sunita.rao@iocl.co.in", "EMP206", "Stores & Inventory", "Refinery", "Officer (Stores)", "Grade B", "Store-01", "HP LaserJet Pro M404n", "HP-M404-01"),
                new EmployeeSeedItem("Manoj Tiwari", "manoj.tiwari", "manoj.tiwari@iocl.co.in", "EMP207", "Engineering Services", "Refinery", "Senior Engineer", "Grade C", "Eng-502", "Canon LBP246dw", "CN-SER-502"),
                new EmployeeSeedItem("Kavita Nair", "kavita.nair", "kavita.nair@iocl.co.in", "EMP208", "Human Resources", "Regional Office", "Manager (HR)", "Grade D", "HR-201", "HP LaserJet Enterprise M507x", "HP-M507-201")
        );

        int seededUserCount = 0;
        int seededEmployeeCount = 0;

        for (EmployeeSeedItem item : baselineEmployees) {
            // 1. Seed User authentication record
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
                seededUserCount++;
            }

            // 2. Seed Employee Master record
            if (!employeeRepository.existsByEmployeeNumberIgnoreCase(item.employeeId)) {
                com.iocl.procurement.entity.Employee emp = new com.iocl.procurement.entity.Employee();
                emp.setEmployeeNumber(item.employeeId);
                emp.setFullName(item.fullName);
                emp.setEmail(item.email);
                emp.setDepartment(item.department);
                emp.setDesignation(item.designation);
                emp.setGd(item.gd);
                emp.setCabinNumber(item.cabinNumber);
                emp.setLocation(item.location);
                emp.setPrinterName(item.printerName);
                emp.setPrinterSerialNumber(item.printerSerialNumber);
                emp.setPrinterType("Black & White");
                emp.setStatus(com.iocl.procurement.entity.EmployeeStatus.ACTIVE);

                employeeRepository.save(emp);
                seededEmployeeCount++;
            }
        }

        if (seededEmployeeCount > 0) {
            logger.info(">>> Seeded {} baseline employee(s) into Employee Master <<<", seededEmployeeCount);
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
            String location,
            String designation,
            String gd,
            String cabinNumber,
            String printerName,
            String printerSerialNumber
    ) {}
}
