package com.fudn.productservice.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.fudn.productservice.model.Product;

public interface IProductRepository extends MongoRepository<Product, String> {
    // Spring Data MongoDB sẽ tự động cung cấp các phương thức như save(), findAll(), findById(),...trong interface này, vì nó kế thừa từ MongoRepository.
    // Bạn có thể thêm các phương thức tùy chỉnh nếu cần thiết.

}
