package com.dework.inventoryservice.repository;

import com.dework.inventoryservice.model.TeaSize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeaSizeRepository extends JpaRepository<TeaSize, Long> {

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);

    Optional<TeaSize> findByCodeIgnoreCase(String code);

    List<TeaSize> findByIsAvailableTrue();
}
