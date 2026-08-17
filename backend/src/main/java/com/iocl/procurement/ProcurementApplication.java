package com.iocl.procurement;

import io.github.cdimascio.dotenv.Dotenv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class ProcurementApplication {

    private static final Logger logger = LoggerFactory.getLogger(ProcurementApplication.class);

    public static void main(String[] args) {
        loadEnvironmentVariables();
        SpringApplication.run(ProcurementApplication.class, args);
    }

    private static void loadEnvironmentVariables() {
        try {
            // Check if .env is in current directory or parent directory
            File envFile = new File(".env");
            File parentEnvFile = new File("../.env");

            Dotenv dotenv = null;
            if (envFile.exists()) {
                dotenv = Dotenv.configure().filename(".env").ignoreIfMissing().load();
            } else if (parentEnvFile.exists()) {
                dotenv = Dotenv.configure().directory("..").filename(".env").ignoreIfMissing().load();
            } else {
                dotenv = Dotenv.configure().ignoreIfMissing().load();
            }

            if (dotenv != null) {
                dotenv.entries().forEach(entry -> {
                    if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                        System.setProperty(entry.getKey(), entry.getValue());
                    }
                });
                logger.info("Environment variables loaded from .env successfully.");
            }
        } catch (Exception e) {
            logger.warn("Could not load .env file (using system environment variables): {}", e.getMessage());
        }
    }
}
