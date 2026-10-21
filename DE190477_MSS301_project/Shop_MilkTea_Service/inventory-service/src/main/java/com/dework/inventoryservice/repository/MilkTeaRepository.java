package com.dework.inventoryservice.repository;

import com.dework.inventoryservice.model.MilkTea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MilkTeaRepository extends JpaRepository<MilkTea, Long> {

    List<MilkTea> findByCategoryId(Long categoryId);

    List<MilkTea> findByNameContainingIgnoreCase(String keyword);

    List<MilkTea> findByCategoryIdAndNameContainingIgnoreCase(Long categoryId, String keyword);

    boolean existsByCategoryId(Long categoryId);
}
