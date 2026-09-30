package com.fudn.gateway.routers;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Routes {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Route cho Product Service
                .route("product-service", r -> r.path("/products/**")
                        .uri("http://localhost:8080"))

                // Route cho Order Service
                .route("order-service", r -> r.path("/orders/**")
                        .uri("http://localhost:8081"))

                // Route cho Inventory Service
                .route("inventory-service", r -> r.path("/inventories/**")
                        .uri("http://localhost:8082"))

                .build();
    }
}
