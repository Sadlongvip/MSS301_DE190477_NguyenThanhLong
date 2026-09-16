package com.fudn.product_service.service;

import org.springframework.stereotype.Service;

import com.fudn.product_service.dto.ProductRequest;
import com.fudn.product_service.dto.ProductResponse;
import com.fudn.product_service.model.Product;
import com.fudn.product_service.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service 
@RequiredArgsConstructor 
@Slf4j 
public class ProductService {

    private final ProductRepository productRepository;

    // 1. Nhận tham số đầu vào là ProductRequest (một Java Record)
    public ProductResponse createProduct(ProductRequest productRequest) {
        // 2. Sử dụng Builder Pattern để tạo đối tượng Product từ dữ liệu của ProductRequest
        Product product = Product.builder()
                .name(productRequest.name())
                .description(productRequest.description())
                .price(productRequest.price())
                .build();

        // 3. Gọi productRepository.save(product) để lưu vào database
        Product savedProduct = productRepository.save(product);

        // 4. Ghi log thông báo sản phẩm đã được lưu
        log.info("Product {} is saved", savedProduct.getId());

        // 5. Trả về đối tượng ProductResponse chứa đầy đủ thông tin bao gồm cả ID vừa được tạo
        return new ProductResponse(
                savedProduct.getId(),
                savedProduct.getName(),
                savedProduct.getDescription(),
                savedProduct.getPrice()
        );
    }
}
