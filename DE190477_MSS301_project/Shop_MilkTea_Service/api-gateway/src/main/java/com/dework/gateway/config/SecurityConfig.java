package com.dework.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ---------- Preflight CORS (OPTIONS) ----------
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ---------- Public Endpoints ----------
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/categories/**", "/api/milkteas/**", "/api/toppings/**", "/api/sizes/**").permitAll()
                        .requestMatchers("/api/carts", "/api/carts/**").permitAll()
                        .requestMatchers("/api/payments/vnpay-ipn").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/orders/*/saga-logs").permitAll()

                        // ---------- customer-service (Account Management) ----------
                        .requestMatchers("/api/accounts/me", "/api/accounts/me/**").hasRole("CUSTOMER")
                        .requestMatchers("/api/accounts/**").hasRole("ADMIN")

                        // ---------- payment-service ----------
                        .requestMatchers(HttpMethod.POST, "/api/payments/create").hasAnyRole("CUSTOMER", "ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/payments/*/status").hasAnyRole("CUSTOMER", "ADMIN", "STAFF")
                        .requestMatchers("/api/payments/**").hasAnyRole("ADMIN", "STAFF")

                        // ---------- order-service / inventory-service (Quản trị sản phẩm, đơn hàng) ----------
                        .requestMatchers(HttpMethod.POST, "/api/orders/**").hasAnyRole("CUSTOMER", "ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/orders/my", "/api/orders/my/**").hasAnyRole("CUSTOMER", "ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/orders/*").hasAnyRole("CUSTOMER", "ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/cancel").hasAnyRole("CUSTOMER", "ADMIN", "STAFF")
                        .requestMatchers("/api/orders/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/api/products/**", "/api/categories/**", "/api/milkteas/**", "/api/toppings/**", "/api/sizes/**").hasRole("ADMIN")

                        // ---------- report-service (Báo cáo Thống kê - Chỉ dành cho ADMIN) ----------
                        .requestMatchers("/api/reports/**").hasRole("ADMIN")

                        .anyRequest().denyAll())

                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt
                        .decoder(jwtDecoder())
                        .jwtAuthenticationConverter(jwtAuthenticationConverter())))
                .build();
    }

    /**
     * Cấu hình CORS cho phép Frontend kết nối tới API Gateway
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Verify chữ ký HS256 bằng CÙNG secret với customer-service; tự kiểm tra expiration (exp).
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKey key = new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
    }

    /** Claim "role": "ADMIN" -> authority "ROLE_ADMIN" để dùng hasRole("ADMIN"). */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authorities = new JwtGrantedAuthoritiesConverter();
        authorities.setAuthoritiesClaimName("role");
        authorities.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authorities);
        return converter;
    }
}
