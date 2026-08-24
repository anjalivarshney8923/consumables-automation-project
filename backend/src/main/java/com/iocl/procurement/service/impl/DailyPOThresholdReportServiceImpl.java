package com.iocl.procurement.service.impl;

import com.iocl.procurement.dto.DailyPOThresholdReportItem;
import com.iocl.procurement.entity.Cartridge;
import com.iocl.procurement.entity.CartridgeThreshold;
import com.iocl.procurement.entity.RateContract;
import com.iocl.procurement.repository.CartridgeRepository;
import com.iocl.procurement.repository.CartridgeThresholdRepository;
import com.iocl.procurement.repository.RateContractRepository;
import com.iocl.procurement.service.DailyPOThresholdReportService;
import com.iocl.procurement.service.EmailNotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DailyPOThresholdReportServiceImpl implements DailyPOThresholdReportService {

    private static final Logger logger = LoggerFactory.getLogger(DailyPOThresholdReportServiceImpl.class);

    private final CartridgeRepository cartridgeRepository;
    private final CartridgeThresholdRepository thresholdRepository;
    private final RateContractRepository rateContractRepository;
    private final EmailNotificationService emailNotificationService;
    private final com.iocl.procurement.repository.AssetUsageRepository assetUsageRepository;

    public DailyPOThresholdReportServiceImpl(
            CartridgeRepository cartridgeRepository,
            CartridgeThresholdRepository thresholdRepository,
            RateContractRepository rateContractRepository,
            EmailNotificationService emailNotificationService,
            com.iocl.procurement.repository.AssetUsageRepository assetUsageRepository
    ) {
        this.cartridgeRepository = cartridgeRepository;
        this.thresholdRepository = thresholdRepository;
        this.rateContractRepository = rateContractRepository;
        this.emailNotificationService = emailNotificationService;
        this.assetUsageRepository = assetUsageRepository;
    }

    @Override
    public List<DailyPOThresholdReportItem> generateAndSendDailyReport() {
        logger.info("Daily PO threshold report evaluation started. Checking records...");

        List<Cartridge> activeCartridges = cartridgeRepository.findAllByActiveTrueOrderByPrinterNameAsc();
        List<DailyPOThresholdReportItem> lowItems = new ArrayList<>();

        int totalChecked = 0;

        for (Cartridge cartridge : activeCartridges) {
            if (cartridge == null || cartridge.getId() == null) continue;

            CartridgeThreshold threshold = thresholdRepository.findByCartridgeId(cartridge.getId())
                    .orElse(null);

            if (threshold == null) {
                logger.debug("No PO threshold configured for cartridge [{}]. Skipping in daily report.", cartridge.getPartNumber());
                continue;
            }

            totalChecked++;

            List<RateContract> rateContracts = rateContractRepository.findByCartridgeId(cartridge.getId());

            int totalRCQuantity = rateContracts.stream()
                    .mapToInt(rc -> rc.getTotalContractQuantity() != null ? rc.getTotalContractQuantity() : 0)
                    .sum();
            int executedQuantity = (cartridge.getId() != null)
                    ? assetUsageRepository.getTotalQuantityUsedByCartridgeId(cartridge.getId()).intValue()
                    : 0;
            int callUpPOQuantity = rateContracts.stream()
                    .mapToInt(rc -> rc.getQuantityTakenThroughWO() != null ? rc.getQuantityTakenThroughWO() : 0)
                    .sum();

            int netAvailable = Math.max(0, totalRCQuantity - callUpPOQuantity);

            int poThreshold = threshold.getPoThreshold();

            // Daily Report PO threshold condition: Net Available < PO Threshold
            if (netAvailable < poThreshold) {
                String supplierNames = rateContracts.stream()
                        .map(RateContract::getSupplierName)
                        .filter(name -> name != null && !name.isBlank())
                        .distinct()
                        .collect(Collectors.joining(", "));

                if (supplierNames.isBlank()) {
                    supplierNames = "No Active Supplier";
                }

                DailyPOThresholdReportItem item = new DailyPOThresholdReportItem(
                        cartridge.getId(),
                        cartridge.getPartNumber(),
                        cartridge.getCartridgeName(),
                        cartridge.getPrinterName(),
                        supplierNames,
                        totalRCQuantity,
                        executedQuantity,
                        callUpPOQuantity,
                        netAvailable,
                        poThreshold
                );

                lowItems.add(item);
                logger.warn("Low availability item detected for daily report: Part [{}], Net Available [{}], PO Threshold [{}], Shortfall [{}]",
                        cartridge.getPartNumber(), netAvailable, poThreshold, item.getShortfall());
            }
        }

        logger.info("Daily PO threshold check completed. Total checked: {}, Low availability items found: {}",
                totalChecked, lowItems.size());

        if (lowItems.isEmpty()) {
            logger.info("No PO threshold violations found for daily report. Skipping email dispatch.");
            return lowItems;
        }

        // Send ONE consolidated daily summary email
        emailNotificationService.sendDailyPOThresholdReportEmail(lowItems);

        return lowItems;
    }
}
