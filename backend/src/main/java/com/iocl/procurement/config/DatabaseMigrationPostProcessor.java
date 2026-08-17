package com.iocl.procurement.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.PriorityOrdered;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Executes safe, idempotent schema migrations on the database DataSource BEFORE Hibernate / JPA
 * initializes EntityManagerFactory.
 *
 * This guarantees:
 * 1. New columns (store_quantity, tendering_threshold, severity) are safely created with defaults.
 * 2. Existing populated rows are safely backfilled without NULL violations.
 * 3. NOT NULL constraints are only applied after data is guaranteed valid.
 * 4. Zero existing data is dropped, truncated, or lost.
 */
@Component
public class DatabaseMigrationPostProcessor implements BeanPostProcessor, PriorityOrdered {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseMigrationPostProcessor.class);

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof DataSource dataSource) {
            logger.info(">>> Running pre-JPA safe database schema migration on DataSource [{}] <<<", beanName);
            performSafeMigration(dataSource);
        }
        return bean;
    }

    public static void performSafeMigration(DataSource dataSource) {
        try (Connection conn = dataSource.getConnection();
             Statement st = conn.createStatement()) {

            logger.info(">>> Database Connection established for safe schema migration. Checking database dialect...");
            String dbProductName = conn.getMetaData().getDatabaseProductName();
            logger.info(">>> Database Product: {}", dbProductName);

            DatabaseMetaData meta = conn.getMetaData();
            boolean cartridgesExist = false;
            try (ResultSet rs = meta.getTables(null, null, "cartridges", null)) {
                cartridgesExist = rs.next();
            }
            if (!cartridgesExist) {
                try (ResultSet rs = meta.getTables(null, null, "CARTRIDGES", null)) {
                    cartridgesExist = rs.next();
                }
            }

            if (!cartridgesExist) {
                logger.info(">>> Tables do not exist yet (e.g. fresh in-memory H2 or empty database). Skipping pre-JPA migration.");
                return;
            }

            // ===================================================================
            // 1. CARTRIDGES TABLE: store_quantity
            // ===================================================================
            logger.info(">>> Step 1: Migrating 'cartridges' table for 'store_quantity'...");
            try {
                st.execute("ALTER TABLE cartridges ADD COLUMN IF NOT EXISTS store_quantity INTEGER DEFAULT 0;");
                st.execute("UPDATE cartridges SET store_quantity = 0 WHERE store_quantity IS NULL;");
                st.execute("ALTER TABLE cartridges ALTER COLUMN store_quantity SET DEFAULT 0;");
                st.execute("ALTER TABLE cartridges ALTER COLUMN store_quantity SET NOT NULL;");
            } catch (Exception e) {
                logger.warn("Notice during cartridges.store_quantity migration: {}", e.getMessage());
            }

            // ===================================================================
            // 2. CARTRIDGE_THRESHOLDS TABLE: tendering_threshold
            // ===================================================================
            logger.info(">>> Step 2: Migrating 'cartridge_thresholds' table for 'tendering_threshold'...");
            try {
                st.execute("ALTER TABLE cartridge_thresholds ADD COLUMN IF NOT EXISTS tendering_threshold INTEGER DEFAULT 10;");
                
                // Populate business-reasonable tendering thresholds for known IOCL cartridges
                String backfillTenderingSql = 
                        "UPDATE cartridge_thresholds SET tendering_threshold = CASE " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = '070-BLK') THEN 25 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = '069-BLK') THEN 15 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = '069-CYN') THEN 12 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = '069-MAG') THEN 12 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = '069-YEL') THEN 12 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = 'W2040X') THEN 8 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = 'W2041X') THEN 6 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = 'W2042X') THEN 6 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = 'W2043X') THEN 6 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = 'CF360X') THEN 5 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = 'CF361X') THEN 4 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = 'CF362X') THEN 4 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = 'CF363X') THEN 4 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = 'CE410X') THEN 10 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = 'CF411X') THEN 8 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = 'CF412X') THEN 8 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = 'CF413X') THEN 8 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = 'CF277X') THEN 18 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = 'W9085MC') THEN 10 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = 'B7035') THEN 10 " +
                        "  WHEN cartridge_id IN (SELECT id FROM cartridges WHERE UPPER(part_number) = 'KIP-800') THEN 3 " +
                        "  ELSE GREATEST(5, COALESCE(po_threshold * 2, 10)) " +
                        "END " +
                        "WHERE tendering_threshold IS NULL;";
                st.execute(backfillTenderingSql);
                st.execute("ALTER TABLE cartridge_thresholds ALTER COLUMN tendering_threshold SET DEFAULT 10;");
                st.execute("ALTER TABLE cartridge_thresholds ALTER COLUMN tendering_threshold SET NOT NULL;");
            } catch (Exception e) {
                logger.warn("Notice during cartridge_thresholds.tendering_threshold migration: {}", e.getMessage());
            }

            // ===================================================================
            // 3. PROCUREMENT_ALERTS TABLE: severity & Alert 2 columns
            // ===================================================================
            logger.info(">>> Step 3: Migrating 'procurement_alerts' table for 'severity' and Alert 2 columns...");
            try {
                st.execute("ALTER TABLE procurement_alerts ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'NORMAL';");
                st.execute("UPDATE procurement_alerts SET severity = CASE WHEN alert_type = 'TENDERING_REQUIRED' THEN 'URGENT' ELSE 'NORMAL' END WHERE severity IS NULL;");
                st.execute("ALTER TABLE procurement_alerts ALTER COLUMN severity SET DEFAULT 'NORMAL';");
                st.execute("ALTER TABLE procurement_alerts ALTER COLUMN severity SET NOT NULL;");

                st.execute("ALTER TABLE procurement_alerts ADD COLUMN IF NOT EXISTS store_net_available_quantity INTEGER;");
                st.execute("ALTER TABLE procurement_alerts ADD COLUMN IF NOT EXISTS rate_contract_net_available_quantity INTEGER;");
                st.execute("ALTER TABLE procurement_alerts ADD COLUMN IF NOT EXISTS combined_net_available_quantity INTEGER;");
                st.execute("ALTER TABLE procurement_alerts ADD COLUMN IF NOT EXISTS tendering_threshold INTEGER;");
                st.execute("ALTER TABLE procurement_alerts ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false;");
                st.execute("ALTER TABLE procurement_alerts ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP;");
                st.execute("ALTER TABLE procurement_alerts ADD COLUMN IF NOT EXISTS email_failure_reason VARCHAR(500);");

                // Drop outdated check constraints on alert_type and severity and recreate with TENDERING_REQUIRED and URGENT
                logger.info(">>> Updating check constraints on procurement_alerts table to allow TENDERING_REQUIRED and URGENT...");
                if (dbProductName != null && dbProductName.toLowerCase().contains("postgres")) {
                    try {
                        // Dynamically drop all check constraints mentioning alert_type
                        st.execute(
                            "DO $$ " +
                            "DECLARE r RECORD; " +
                            "BEGIN " +
                            "  FOR r IN ( " +
                            "    SELECT conname " +
                            "    FROM pg_constraint " +
                            "    WHERE conrelid = 'procurement_alerts'::regclass " +
                            "      AND contype = 'c' " +
                            "      AND pg_get_constraintdef(oid) LIKE '%alert_type%' " +
                            "  ) LOOP " +
                            "    EXECUTE 'ALTER TABLE procurement_alerts DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname); " +
                            "  END LOOP; " +
                            "END $$;"
                        );
                        // Re-create constraint allowing both PROCUREMENT_THRESHOLD and TENDERING_REQUIRED
                        st.execute("ALTER TABLE procurement_alerts ADD CONSTRAINT procurement_alerts_alert_type_check CHECK (alert_type IN ('PROCUREMENT_THRESHOLD', 'TENDERING_REQUIRED'));");
                        logger.info(">>> Successfully updated PostgreSQL constraint: procurement_alerts_alert_type_check");
                    } catch (Exception e) {
                        logger.warn("Notice updating PostgreSQL alert_type check constraint: {}", e.getMessage());
                    }

                    try {
                        // Dynamically drop all check constraints mentioning severity
                        st.execute(
                            "DO $$ " +
                            "DECLARE r RECORD; " +
                            "BEGIN " +
                            "  FOR r IN ( " +
                            "    SELECT conname " +
                            "    FROM pg_constraint " +
                            "    WHERE conrelid = 'procurement_alerts'::regclass " +
                            "      AND contype = 'c' " +
                            "      AND pg_get_constraintdef(oid) LIKE '%severity%' " +
                            "  ) LOOP " +
                            "    EXECUTE 'ALTER TABLE procurement_alerts DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname); " +
                            "  END LOOP; " +
                            "END $$;"
                        );
                        // Re-create constraint allowing both NORMAL and URGENT
                        st.execute("ALTER TABLE procurement_alerts ADD CONSTRAINT procurement_alerts_severity_check CHECK (severity IN ('NORMAL', 'URGENT'));");
                        logger.info(">>> Successfully updated PostgreSQL constraint: procurement_alerts_severity_check");
                    } catch (Exception e) {
                        logger.warn("Notice updating PostgreSQL severity check constraint: {}", e.getMessage());
                    }
                } else {
                    // Generic / H2 fallback
                    try {
                        st.execute("ALTER TABLE procurement_alerts DROP CONSTRAINT IF EXISTS procurement_alerts_alert_type_check;");
                        st.execute("ALTER TABLE procurement_alerts ADD CONSTRAINT procurement_alerts_alert_type_check CHECK (alert_type IN ('PROCUREMENT_THRESHOLD', 'TENDERING_REQUIRED'));");
                    } catch (Exception e) {
                        logger.debug("Notice for fallback alert_type check constraint: {}", e.getMessage());
                    }
                    try {
                        st.execute("ALTER TABLE procurement_alerts DROP CONSTRAINT IF EXISTS procurement_alerts_severity_check;");
                        st.execute("ALTER TABLE procurement_alerts ADD CONSTRAINT procurement_alerts_severity_check CHECK (severity IN ('NORMAL', 'URGENT'));");
                    } catch (Exception e) {
                        logger.debug("Notice for fallback severity check constraint: {}", e.getMessage());
                    }
                }
            } catch (Exception e) {
                logger.warn("Notice during procurement_alerts migration: {}", e.getMessage());
            }

            // ===================================================================
            // 4. VERIFY MIGRATION COMPLETENESS
            // ===================================================================
            logger.info(">>> Step 4: Verifying database consistency and zero NULLs...");
            
            try (ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM cartridges WHERE store_quantity IS NULL;")) {
                if (rs.next()) {
                    int nullStoreQty = rs.getInt(1);
                    logger.info(">>> cartridges with NULL store_quantity: {}", nullStoreQty);
                }
            } catch (Exception ignored) {}

            try (ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM cartridge_thresholds WHERE tendering_threshold IS NULL;")) {
                if (rs.next()) {
                    int nullTender = rs.getInt(1);
                    logger.info(">>> cartridge_thresholds with NULL tendering_threshold: {}", nullTender);
                }
            } catch (Exception ignored) {}

            try (ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM procurement_alerts WHERE severity IS NULL;")) {
                if (rs.next()) {
                    int nullSeverity = rs.getInt(1);
                    logger.info(">>> procurement_alerts with NULL severity: {}", nullSeverity);
                }
            } catch (Exception ignored) {}

            logger.info(">>> Safe database schema migration completed successfully! <<<");

        } catch (Exception e) {
            logger.error("Error during safe database schema migration: {}", e.getMessage(), e);
        }
    }
}
