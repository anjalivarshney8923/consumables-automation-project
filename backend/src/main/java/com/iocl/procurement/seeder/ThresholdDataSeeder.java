package com.iocl.procurement.seeder;

import com.iocl.procurement.entity.Cartridge;
import com.iocl.procurement.entity.CartridgeThreshold;
import com.iocl.procurement.repository.CartridgeRepository;
import com.iocl.procurement.repository.CartridgeThresholdRepository;
import com.iocl.procurement.service.AlertEvaluationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Order(3)
public class ThresholdDataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(ThresholdDataSeeder.class);

    private final CartridgeRepository cartridgeRepository;
    private final CartridgeThresholdRepository thresholdRepository;
    private final AlertEvaluationService alertEvaluationService;

    // Initial business threshold values from the IOCL spreadsheet
    private static final Map<String, Integer> INITIAL_THRESHOLDS = new HashMap<>();

    static {
        // Canon Cartridges
        INITIAL_THRESHOLDS.put("070-BLK", 15);
        INITIAL_THRESHOLDS.put("069-BLK", 6);
        INITIAL_THRESHOLDS.put("069-CYN", 6);
        INITIAL_THRESHOLDS.put("069-MAG", 6);
        INITIAL_THRESHOLDS.put("069-YEL", 6);

        // HP 416X Series
        INITIAL_THRESHOLDS.put("W2040X", 1);
        INITIAL_THRESHOLDS.put("W2041X", 1);
        INITIAL_THRESHOLDS.put("W2042X", 1);
        INITIAL_THRESHOLDS.put("W2043X", 1);

        // HP 508X Series
        INITIAL_THRESHOLDS.put("CF360X", 1);
        INITIAL_THRESHOLDS.put("CF361X", 1);
        INITIAL_THRESHOLDS.put("CF362X", 1);
        INITIAL_THRESHOLDS.put("CF363X", 1);

        // HP 410X Series
        INITIAL_THRESHOLDS.put("CE410X", 4);
        INITIAL_THRESHOLDS.put("CF411X", 4);
        INITIAL_THRESHOLDS.put("CF412X", 4);
        INITIAL_THRESHOLDS.put("CF413X", 4);

        // HP 77X
        INITIAL_THRESHOLDS.put("CF277X", 10);

        // Additional business cartridges if present
        INITIAL_THRESHOLDS.put("W9085MC", 5);
        INITIAL_THRESHOLDS.put("B7035", 5);
        INITIAL_THRESHOLDS.put("KIP-800", 1);
    }

    public ThresholdDataSeeder(
            CartridgeRepository cartridgeRepository,
            CartridgeThresholdRepository thresholdRepository,
            AlertEvaluationService alertEvaluationService
    ) {
        this.cartridgeRepository = cartridgeRepository;
        this.thresholdRepository = thresholdRepository;
        this.alertEvaluationService = alertEvaluationService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedThresholds();
    }

    private void seedThresholds() {
        List<Cartridge> cartridges = cartridgeRepository.findAll();
        int createdCount = 0;

        for (Cartridge cartridge : cartridges) {
            if (!thresholdRepository.existsByCartridgeId(cartridge.getId())) {
                String partNo = cartridge.getPartNumber() != null ? cartridge.getPartNumber().trim().toUpperCase() : "";
                int initialThreshold = INITIAL_THRESHOLDS.getOrDefault(partNo, 5);

                CartridgeThreshold threshold = new CartridgeThreshold(cartridge, initialThreshold);
                thresholdRepository.save(threshold);
                createdCount++;
            }
        }

        if (createdCount > 0) {
            logger.info(">>> Seeded {} cartridge threshold baseline records into database. <<<", createdCount);
        } else {
            logger.info("Cartridge threshold baseline records already present in database.");
        }

        // Run initial evaluation to ensure consistent state
        alertEvaluationService.evaluateAllProcurementThresholds();
    }
}
