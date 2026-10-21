package com.dework.gateway.routes;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static com.dework.gateway.filter.UserHeaderFilter.forwardUserInfo;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.web.servlet.function.RequestPredicates.path;

@Configuration(proxyBeanMethods = false)
public class Routes {

    @Value("${services.customer.url:http://localhost:8081}")
    private String customerServiceUrl;

    @Value("${services.inventory.url:http://localhost:8082}")
    private String inventoryServiceUrl;

    @Value("${services.order.url:http://localhost:8083}")
    private String orderServiceUrl;

    @Value("${services.payment.url:http://localhost:8084}")
    private String paymentServiceUrl;

    @Value("${services.report.url:http://localhost:8085}")
    private String reportServiceUrl;

    /**
     * Định tuyến các API liên quan đến Authentication và Quản lý tài khoản sang customer-service (port 8081)
     */
    @Bean
    public RouterFunction<ServerResponse> customerServiceRoute() {
        return route("customer_service")
                .route(path("/api/auth/**").or(path("/api/accounts/**")), http())
                .before(uri(customerServiceUrl))
                .before(forwardUserInfo())
                .build();
    }

    /**
     * Định tuyến các API liên quan đến Quản lý danh mục, trà sữa và topping sang inventory-service (port 8082)
     */
    @Bean
    public RouterFunction<ServerResponse> inventoryServiceRoute() {
        return route("inventory_service")
                .route(path("/api/categories/**")
                        .or(path("/api/milkteas/**"))
                        .or(path("/api/toppings/**"))
                        .or(path("/api/sizes/**")), http())
                .before(uri(inventoryServiceUrl))
                .before(forwardUserInfo())
                .build();
    }

    /**
     * Định tuyến các API liên quan đến Quản lý đơn hàng và giỏ hàng sang order-service (port 8083)
     */
    @Bean
    public RouterFunction<ServerResponse> orderServiceRoute() {
        return route("order_service")
                .route(path("/api/orders/**").or(path("/api/carts/**")), http())
                .before(uri(orderServiceUrl))
                .before(forwardUserInfo())
                .build();
    }

    /**
     * Định tuyến các API liên quan đến Thanh toán sang payment-service (port 8084)
     */
    @Bean
    public RouterFunction<ServerResponse> paymentServiceRoute() {
        return route("payment_service")
                .route(path("/api/payments/**"), http())
                .before(uri(paymentServiceUrl))
                .before(forwardUserInfo())
                .build();
    }

    /**
     * Định tuyến các API liên quan đến Báo cáo và Thống kê sang report-service (port 8085)
     */
    @Bean
    public RouterFunction<ServerResponse> reportServiceRoute() {
        return route("report_service")
                .route(path("/api/reports/**"), http())
                .before(uri(reportServiceUrl))
                .before(forwardUserInfo())
                .build();
    }
}