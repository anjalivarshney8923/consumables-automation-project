package com.iocl.procurement.seeder;

import com.iocl.procurement.entity.Asset;
import com.iocl.procurement.entity.Cartridge;
import com.iocl.procurement.entity.CartridgeColor;
import com.iocl.procurement.entity.PrinterType;
import com.iocl.procurement.repository.AssetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Migration runner to safely and deterministically assign colours to existing legacy assets in PostgreSQL
 * where the colour field was previously null.
 */
@Component
@Order(4)
public class AssetColourMigrationRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AssetColourMigrationRunner.class);

    private final AssetRepository assetRepository;

    public AssetColourMigrationRunner(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        migrateLegacyAssetColours();
    }

    private void migrateLegacyAssetColours() {
        List<Asset> allAssets = assetRepository.findAll();
        int clearedBwCount = 0;
        int migratedColorCount = 0;
        int ambiguousCount = 0;

        for (Asset asset : allAssets) {
            // Rule 1: Black & White printers MUST have colour = NULL
            if (asset.getPrinterType() == PrinterType.BLACK_AND_WHITE) {
                if (asset.getColour() != null) {
                    asset.setColour(null);
                    assetRepository.save(asset);
                    clearedBwCount++;
                    logger.info("Cleared colour for Black & White asset ID [{}] (Serial: {}) -> set to NULL.",
                            asset.getId(), asset.getSerialNumber());
                }
            } else if (asset.getPrinterType() == PrinterType.COLOR) {
                // Rule 2: Color printers should have valid colour
                if (asset.getColour() == null) {
                    CartridgeColor derivedColor = deriveColorForColorAsset(asset);
                    if (derivedColor != null) {
                        asset.setColour(derivedColor);
                        assetRepository.save(asset);
                        migratedColorCount++;
                        logger.info("Migrated legacy Color asset ID [{}] (Serial: {}) with derived colour: [{}]",
                                asset.getId(), asset.getSerialNumber(), derivedColor);
                    } else {
                        ambiguousCount++;
                        logger.warn("Legacy Color asset ID [{}] (Serial: {}) colour could not be safely derived; left as NULL.",
                                asset.getId(), asset.getSerialNumber());
                    }
                }
            }
        }

        if (clearedBwCount > 0) {
            logger.info(">>> Corrected {} Black & White asset(s) to have NULL colour. <<<", clearedBwCount);
        }
        if (migratedColorCount > 0) {
            logger.info(">>> Successfully migrated {} legacy Color asset(s) with deterministic colours. <<<", migratedColorCount);
        }
        if (ambiguousCount > 0) {
            logger.info(">>> {} legacy Color asset(s) remain with NULL colour due to ambiguity. <<<", ambiguousCount);
        }
    }

    private CartridgeColor deriveColorForColorAsset(Asset asset) {
        if (asset == null || asset.getPrinterType() != PrinterType.COLOR) return null;

        Cartridge cartridge = asset.getCartridge();
        if (cartridge == null) return null;

        String partNumber = cartridge.getPartNumber() != null ? cartridge.getPartNumber().toUpperCase() : "";
        String cartridgeName = cartridge.getCartridgeName() != null ? cartridge.getCartridgeName().toUpperCase() : "";

        // Suffix / name matching
        if (partNumber.endsWith("-BLK") || partNumber.endsWith("BLK") || partNumber.contains("BLACK") || cartridgeName.contains("BLACK") || partNumber.equals("W2040X") || partNumber.equals("CF360X") || partNumber.equals("CE410X") || partNumber.equals("CF277X")) {
            return CartridgeColor.BLACK;
        }
        if (partNumber.endsWith("-CYN") || partNumber.endsWith("CYN") || partNumber.contains("CYAN") || cartridgeName.contains("CYAN") || partNumber.equals("W2041X") || partNumber.equals("CF361X") || partNumber.equals("CF411X")) {
            return CartridgeColor.CYAN;
        }
        if (partNumber.endsWith("-MAG") || partNumber.endsWith("MAG") || partNumber.contains("MAGENTA") || cartridgeName.contains("MAGENTA") || partNumber.equals("W2042X") || partNumber.equals("CF363X") || partNumber.equals("CF413X")) {
            return CartridgeColor.MAGENTA;
        }
        if (partNumber.endsWith("-YEL") || partNumber.endsWith("YEL") || partNumber.contains("YELLOW") || cartridgeName.contains("YELLOW") || partNumber.equals("W2043X") || partNumber.equals("CF362X") || partNumber.equals("CF412X")) {
            return CartridgeColor.YELLOW;
        }

        return null;
    }
}
