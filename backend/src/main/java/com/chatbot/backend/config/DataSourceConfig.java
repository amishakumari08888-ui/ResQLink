package com.chatbot.backend.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
@Slf4j
public class DataSourceConfig {

    @Value("${spring.datasource.url:}")
    private String springUrl;

    @Value("${spring.datasource.username:}")
    private String springUser;

    @Value("${spring.datasource.password:}")
    private String springPassword;

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");

        String effectiveUrl = springUrl != null ? springUrl.trim() : "";
        String effectiveUser = springUser != null ? springUser.trim() : "";
        String effectivePassword = springPassword != null ? springPassword.trim() : "";

        // Check if DATABASE_URL (Railway standard format) is available
        String rawDbUrl = databaseUrl != null ? databaseUrl.trim() : "";

        if (!rawDbUrl.isEmpty() && (effectiveUrl.isEmpty() || !effectiveUrl.contains("railway.internal"))) {
            try {
                if (rawDbUrl.startsWith("postgres://") || rawDbUrl.startsWith("postgresql://")) {
                    String httpAdapted = rawDbUrl.replaceFirst("^postgres(ql)?://", "http://");
                    URI uri = URI.create(httpAdapted);

                    String host = uri.getHost();
                    int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                    String path = uri.getPath();
                    String dbName = (path != null && path.length() > 1) ? path.substring(1) : "railway";

                    effectiveUrl = "jdbc:postgresql://" + host + ":" + port + "/" + dbName;

                    if (uri.getUserInfo() != null) {
                        String[] creds = uri.getUserInfo().split(":", 2);
                        effectiveUser = creds[0];
                        if (creds.length > 1) {
                            effectivePassword = creds[1];
                        }
                    }
                    log.info("Auto-configured DataSource from Railway DATABASE_URL -> {} (user: {})", effectiveUrl, effectiveUser);
                } else {
                    effectiveUrl = rawDbUrl.startsWith("jdbc:") ? rawDbUrl : "jdbc:" + rawDbUrl;
                }
            } catch (Exception e) {
                log.warn("Failed to parse DATABASE_URL URI, using as raw string: {}", e.getMessage());
                effectiveUrl = rawDbUrl.startsWith("jdbc:") ? rawDbUrl : "jdbc:" + rawDbUrl;
            }
        }

        // Ensure proper JDBC prefix
        if (!effectiveUrl.isEmpty() && !effectiveUrl.startsWith("jdbc:")) {
            effectiveUrl = "jdbc:" + effectiveUrl;
        }

        log.info("Final Database JDBC URL: {} | User: {}", effectiveUrl, effectiveUser);

        config.setJdbcUrl(effectiveUrl);
        if (!effectiveUser.isEmpty()) {
            config.setUsername(effectiveUser);
        }
        if (!effectivePassword.isEmpty()) {
            config.setPassword(effectivePassword);
        }

        config.setInitializationFailTimeout(0);
        config.setConnectionTimeout(20000);
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);

        return new HikariDataSource(config);
    }
}
