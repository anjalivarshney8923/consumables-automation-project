package com.iocl.procurement.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

/**
 * EnvironmentPostProcessor to automatically load the root .env file
 * into Spring Boot's ConfigurableEnvironment during local development.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> dotenvProperties = new HashMap<>();

        // Candidate directories to search for .env
        String[] candidateDirs = {"../", "./", ""};

        for (String dirPath : candidateDirs) {
            File envFile = dirPath.isEmpty() ? new File(".env") : new File(dirPath, ".env");
            if (envFile.exists() && envFile.isFile()) {
                try {
                    Dotenv dotenv = Dotenv.configure()
                            .directory(dirPath)
                            .filename(".env")
                            .ignoreIfMalformed()
                            .ignoreIfMissing()
                            .load();

                    for (DotenvEntry entry : dotenv.entries()) {
                        String key = entry.getKey();
                        String value = entry.getValue();

                        // Add to property map
                        dotenvProperties.putIfAbsent(key, value);

                        // Also set as System property if not present for early bootstrap compatibility
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                } catch (Exception ignored) {
                    // Ignore parsing errors and continue
                }
            }
        }

        if (!dotenvProperties.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource("dotenvProperties", dotenvProperties));
        }
    }

    @Override
    public int getOrder() {
        // High precedence so properties are available when application.properties placeholders resolve
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }
}
