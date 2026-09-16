package com.fudn.product_service;

import java.math.BigDecimal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.fudn.product_service.model.Product;
import com.fudn.product_service.repository.IProductRepository;

@SpringBootApplication
public class ProductServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProductServiceApplication.class, args);
	}

	@Bean
	public CommandLineRunner loadData(IProductRepository productRepository) {
		return args -> {
			if (productRepository.count() == 0) {
				Product product1 = Product.builder()
						.name("Iphone 15")
						.description("Apple Smartphone")
						.price(BigDecimal.valueOf(1000))
						.build();

				Product product2 = Product.builder()
						.name("Samsung Galaxy S24")
						.description("Samsung Smartphone")
						.price(BigDecimal.valueOf(900))
						.build();

				productRepository.save(product1);
				productRepository.save(product2);

				System.out.println("Đã thêm dữ liệu mẫu vào MongoDB!");
			} else {
				System.out.println("Dữ liệu đã tồn tại trong MongoDB!");
			}
		};
	}
}
