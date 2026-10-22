package com.mss301.order.config;

import com.mss301.order.client.InventoryApi;
import com.mss301.order.client.PaymentApi;
import com.mss301.order.client.ShippingApi;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient inventoryRestClient(RestClient.Builder builder,
                                          @Value("${services.inventory.url:http://localhost:8082}") String url) {
        return builder.baseUrl(url).build();
    }

    @Bean
    public RestClient paymentRestClient(RestClient.Builder builder,
                                        @Value("${services.payment.url:http://localhost:8083}") String url) {
        return builder.baseUrl(url).build();
    }

    @Bean
    public RestClient shippingRestClient(RestClient.Builder builder,
                                         @Value("${services.shipping.url:http://localhost:8084}") String url) {
        return builder.baseUrl(url).build();
    }

    @Bean
    public InventoryApi inventoryApi(@Qualifier("inventoryRestClient") RestClient inventoryRestClient) {
        return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(inventoryRestClient))
                .build()
                .createClient(InventoryApi.class);
    }

    @Bean
    public PaymentApi paymentApi(@Qualifier("paymentRestClient") RestClient paymentRestClient) {
        return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(paymentRestClient))
                .build()
                .createClient(PaymentApi.class);
    }

    @Bean
    public ShippingApi shippingApi(@Qualifier("shippingRestClient") RestClient shippingRestClient) {
        return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(shippingRestClient))
                .build()
                .createClient(ShippingApi.class);
    }
}