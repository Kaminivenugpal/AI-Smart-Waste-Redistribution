package com.wasteredistribution.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration for the Waste Redistribution Platform.
 *
 * Spring Security is included solely to provide BCryptPasswordEncoder for
 * transparent password migration and hashing. All HTTP-level access control
 * is handled by SessionAuthFilter (registered via FilterRegistrationBean in
 * WebConfig) — not by Spring Security's filter chain — so every request is
 * permitted here.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * BCryptPasswordEncoder bean used by AuthService for password hashing
     * and transparent plaintext → BCrypt migration on first login.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Disables CSRF (REST API) and permits all requests.
     * Real authentication/authorization is enforced by SessionAuthFilter.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
