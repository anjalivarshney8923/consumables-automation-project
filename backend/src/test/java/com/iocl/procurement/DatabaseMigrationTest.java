package com.iocl.procurement;

import com.iocl.procurement.config.DatabaseMigrationPostProcessor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.*;

public class DatabaseMigrationTest {

    private static final String URL = "jdbc:postgresql://localhost:5432/iocl_procurement";
    private static final String USER = "postgres";
    private static final String PASS = "system";

    private DataSource getPostgresDataSource() {
        DriverManagerDataSource ds = new DriverManagerDataSource();
        ds.setDriverClassName("org.postgresql.Driver");
        ds.setUrl(URL);
        ds.setUsername(USER);
        ds.setPassword(PASS);
        return ds;
    }

    @Test
    @DisplayName("Execute Safe Migration and Validate Columns, Types, and Zero NULL Values")
    public void testSafeMigrationExecution() throws Exception {
        DataSource ds = getPostgresDataSource();

        // 1. Run migration
        DatabaseMigrationPostProcessor.performSafeMigration(ds);

        // 2. Validate columns and constraints via JDBC
        try (Connection conn = ds.getConnection();
             Statement st = conn.createStatement()) {

            // Check cartridges.store_quantity
            try (ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM cartridges WHERE store_quantity IS NULL;")) {
                assertTrue(rs.next());
                assertEquals(0, rs.getInt(1), "cartridges.store_quantity must not contain any NULLs");
            }

            // Check cartridge_thresholds.tendering_threshold
            try (ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM cartridge_thresholds WHERE tendering_threshold IS NULL;")) {
                assertTrue(rs.next());
                assertEquals(0, rs.getInt(1), "cartridge_thresholds.tendering_threshold must not contain any NULLs");
            }

            // Check procurement_alerts.severity
            try (ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM procurement_alerts WHERE severity IS NULL;")) {
                assertTrue(rs.next());
                assertEquals(0, rs.getInt(1), "procurement_alerts.severity must not contain any NULLs");
            }

            // Verify Alert 1 alerts have severity = 'NORMAL'
            try (ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM procurement_alerts WHERE alert_type = 'PROCUREMENT_THRESHOLD' AND severity != 'NORMAL';")) {
                assertTrue(rs.next());
                assertEquals(0, rs.getInt(1), "All Alert 1 alerts must have severity = NORMAL");
            }

            // Check that existing cartridge rows exist and are intact
            try (ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM cartridges;")) {
                assertTrue(rs.next());
                int cartridgeCount = rs.getInt(1);
                assertTrue(cartridgeCount > 0, "Existing cartridges must remain intact");
                System.out.println("Validated " + cartridgeCount + " existing cartridges intact.");
            }

            // Check that existing threshold rows exist and are intact
            try (ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM cartridge_thresholds;")) {
                assertTrue(rs.next());
                int thresholdCount = rs.getInt(1);
                assertTrue(thresholdCount > 0, "Existing thresholds must remain intact");
                System.out.println("Validated " + thresholdCount + " existing thresholds intact.");
            }

            // Check that existing alerts exist and are intact
            try (ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM procurement_alerts;")) {
                assertTrue(rs.next());
                int alertCount = rs.getInt(1);
                System.out.println("Validated " + alertCount + " existing alerts intact.");
            }

            // Verify that TENDERING_REQUIRED alert_type and URGENT severity are accepted by check constraints
            try (ResultSet rsCart = st.executeQuery("SELECT id FROM cartridges LIMIT 1;")) {
                if (rsCart.next()) {
                    long cartId = rsCart.getLong(1);
                    st.execute("INSERT INTO procurement_alerts (cartridge_id, alert_type, severity, message, net_available_quantity, threshold, status, created_at, email_sent) " +
                            "VALUES (" + cartId + ", 'TENDERING_REQUIRED', 'URGENT', 'Test tendering alert constraint check', 10, 20, 'UNREAD', NOW(), false);");
                    
                    // Clean up test row
                    st.execute("DELETE FROM procurement_alerts WHERE message = 'Test tendering alert constraint check';");
                    System.out.println("Validated: procurement_alerts_alert_type_check successfully allows 'TENDERING_REQUIRED' and 'URGENT'!");
                }
            }
        }
    }
}
