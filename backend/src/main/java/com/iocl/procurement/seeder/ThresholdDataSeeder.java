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

    // Initial PO threshold values (Alert 1)
    private static final Map<String, Integer> INITIAL_PO_THRESHOLDS = new HashMap<>();

    // Initial Tendering threshold values (Alert 2 - URGENT)
    private static final Map<String, Integer> INITIAL_TENDERING_THRESHOLDS = new HashMap<>();

    static {
        // Canon Cartridges
        INITIAL_PO_THRESHOLDS.put("070-BLK", 15);
        INITIAL_PO_THRESHOLDS.put("069-BLK", 6);
        INITIAL_PO_THRESHOLDS.put("069-CYN", 6);
        INITIAL_PO_THRESHOLDS.put("069-MAG", 6);
        INITIAL_PO_THRESHOLDS.put("069-YEL", 6);

        INITIAL_TENDERING_THRESHOLDS.put("070-BLK", 25);
        INITIAL_TENDERING_THRESHOLDS.put("069-BLK", 15);
        INITIAL_TENDERING_THRESHOLDS.put("069-CYN", 12);
        INITIAL_TENDERING_THRESHOLDS.put("069-MAG", 12);
        INITIAL_TENDERING_THRESHOLDS.put("069-YEL", 12);

        // HP 416X Series
        INITIAL_PO_THRESHOLDS.put("W2040X", 1);
        INITIAL_PO_THRESHOLDS.put("W2041X", 1);
        INITIAL_PO_THRESHOLDS.put("W2042X", 1);
        INITIAL_PO_THRESHOLDS.put("W2043X", 1);

        INITIAL_TENDERING_THRESHOLDS.put("W2040X", 8);
        INITIAL_TENDERING_THRESHOLDS.put("W2041X", 6);
        INITIAL_TENDERING_THRESHOLDS.put("W2042X", 6);
        INITIAL_TENDERING_THRESHOLDS.put("W2043X", 6);

        // HP 508X Series
        INITIAL_PO_THRESHOLDS.put("CF360X", 1);
        INITIAL_PO_THRESHOLDS.put("CF361X", 1);
        INITIAL_PO_THRESHOLDS.put("CF362X", 1);
        INITIAL_PO_THRESHOLDS.put("CF363X", 1);

        INITIAL_TENDERING_THRESHOLDS.put("CF360X", 5);
        INITIAL_TENDERING_THRESHOLDS.put("CF361X", 4);
        INITIAL_TENDERING_THRESHOLDS.put("CF362X", 4);
        INITIAL_TENDERING_THRESHOLDS.put("CF363X", 4);

        // HP 410X Series
        INITIAL_PO_THRESHOLDS.put("CE410X", 4);
        INITIAL_PO_THRESHOLDS.put("CF411X", 4);
        INITIAL_PO_THRESHOLDS.put("CF412X", 4);
        INITIAL_PO_THRESHOLDS.put("CF413X", 4);

        INITIAL_TENDERING_THRESHOLDS.put("CE410X", 10);
        INITIAL_TENDERING_THRESHOLDS.put("CF411X", 8);
        INITIAL_TENDERING_THRESHOLDS.put("CF412X", 8);
        INITIAL_TENDERING_THRESHOLDS.put("CF413X", 8);

        // HP 77X
        INITIAL_PO_THRESHOLDS.put("CF277X", 10);
        INITIAL_TENDERING_THRESHOLDS.put("CF277X", 18);

        // Additional business cartridges if present
        INITIAL_PO_THRESHOLDS.put("W9085MC", 5);
        INITIAL_PO_THRESHOLDS.put("B7035", 5);
        INITIAL_PO_THRESHOLDS.put("KIP-800", 1);

        INITIAL_TENDERING_THRESHOLDS.put("W9085MC", 10);
        INITIAL_TENDERING_THRESHOLDS.put("B7035", 10);
        INITIAL_TENDERING_THRESHOLDS.put("KIP-800", 3);
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
        int updatedCount = 0;

        for (Cartridge cartridge : cartridges) {
            String partNo = cartridge.getPartNumber() != null ? cartridge.getPartNumber().trim().toUpperCase() : "";
            int initialPoThreshold = INITIAL_PO_THRESHOLDS.getOrDefault(partNo, 5);
            int initialTenderThreshold = INITIAL_TENDERING_THRESHOLDS.getOrDefault(partNo, Math.max(5, initialPoThreshold * 2));

            CartridgeThreshold threshold = thresholdRepository.findByCartridgeId(cartridge.getId())
                    .orElse(null);

            if (threshold == null) {
                CartridgeThreshold newThreshold = new CartridgeThreshold(cartridge, initialPoThreshold, initialTenderThreshold);
                thresholdRepository.save(newThreshold);
                createdCount++;
            } else if (threshold.getTenderingThreshold() == null) {
                threshold.setTenderingThreshold(initialTenderThreshold);
                thresholdRepository.save(threshold);
                updatedCount++;
            }
        }

        if (createdCount > 0 || updatedCount > 0) {
            logger.info(">>> Seeded {} and updated {} cartridge threshold baseline records. <<<", createdCount, updatedCount);
        } else {
            logger.info("Cartridge threshold baseline records already present in database.");
        }
    }
}
