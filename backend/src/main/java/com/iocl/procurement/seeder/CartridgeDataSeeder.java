package com.iocl.procurement.seeder;

import com.iocl.procurement.entity.Cartridge;
import com.iocl.procurement.repository.CartridgeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Order(2)
public class CartridgeDataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(CartridgeDataSeeder.class);

    private final CartridgeRepository cartridgeRepository;

    public CartridgeDataSeeder(CartridgeRepository cartridgeRepository) {
        this.cartridgeRepository = cartridgeRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedCartridges();
    }

    private void seedCartridges() {
        List<Cartridge> seedList = List.of(
                new Cartridge("Canon LBP246dw", 45, "Canon 070 Black", "070-BLK"),
                new Cartridge("Canon LBP674Cx", 30, "Canon Cartridge 069 Black", "069-BLK"),
                new Cartridge("Canon LBP674Cx", 30, "Canon Cartridge 069 Cyan", "069-CYN"),
                new Cartridge("Canon LBP674Cx", 30, "Canon Cartridge 069 Magenta", "069-MAG"),
                new Cartridge("Canon LBP674Cx", 30, "Canon Cartridge 069 Yellow", "069-YEL"),
                new Cartridge("HP Color LaserJet Pro M454dn", 25, "HP 416X High Yield Black", "W2040X"),
                new Cartridge("HP Color LaserJet Pro M454dn", 25, "HP 416X High Yield Cyan", "W2041X"),
                new Cartridge("HP Color LaserJet Pro M454dn", 25, "HP 416X High Yield Magenta", "W2042X"),
                new Cartridge("HP Color LaserJet Pro M454dn", 25, "HP 416X High Yield Yellow", "W2043X"),
                new Cartridge("HP Color LaserJet Enterprise M553", 15, "HP 508X High Yield Black", "CF360X"),
                new Cartridge("HP Color LaserJet Enterprise M553", 15, "HP 508X High Yield Cyan", "CF361X"),
                new Cartridge("HP Color LaserJet Enterprise M553", 15, "HP 508X High Yield Yellow", "CF362X"),
                new Cartridge("HP Color LaserJet Enterprise M553", 15, "HP 508X High Yield Magenta", "CF363X"),
                new Cartridge("HP LaserJet Pro 400", 20, "HP 410X High Yield Black", "CE410X"),
                new Cartridge("HP LaserJet Pro 400", 20, "HP 410X High Yield Cyan", "CF411X"),
                new Cartridge("HP LaserJet Pro 400", 20, "HP 410X High Yield Yellow", "CF412X"),
                new Cartridge("HP LaserJet Pro 400", 20, "HP 410X High Yield Magenta", "CF413X"),
                new Cartridge("HP LaserJet Enterprise M507", 18, "HP 77X High Yield Black", "CF277X")
        );

        int count = 0;
        for (Cartridge item : seedList) {
            if (!cartridgeRepository.existsByPartNumberIgnoreCase(item.getPartNumber())) {
                cartridgeRepository.save(item);
                count++;
            }
        }

        if (count > 0) {
            logger.info(">>> Seeded {} cartridge master reference records into database. <<<", count);
        } else {
            logger.info("Cartridge master records already present in database. Skipping seeding.");
        }
    }
}
