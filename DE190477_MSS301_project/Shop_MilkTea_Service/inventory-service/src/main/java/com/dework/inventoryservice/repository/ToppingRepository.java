package com.dework.inventoryservice.repository;

import com.dework.inventoryservice.model.Topping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ToppingRepository extends JpaRepository<Topping, Long> {

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    List<Topping> findByNameContainingIgnoreCase(String keyword);
}
