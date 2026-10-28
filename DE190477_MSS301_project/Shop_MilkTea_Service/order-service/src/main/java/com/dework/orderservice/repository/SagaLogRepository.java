package com.dework.orderservice.repository;

import com.dework.orderservice.model.SagaLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SagaLogRepository extends JpaRepository<SagaLog, Long> {

    List<SagaLog> findByOrderCodeOrderByIdAsc(String orderCode);
}
