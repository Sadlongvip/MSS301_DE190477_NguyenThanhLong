package com.dework.orderservice.repository;

import com.dework.orderservice.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    @Query("SELECT c FROM Cart c WHERE c.user.id = :userId")
    Optional<Cart> findByUserId(@Param("userId") Long userId);

    Optional<Cart> findByUser_Id(Long userId);

    Optional<Cart> findBySessionId(String sessionId);

    @Modifying
    @Query("DELETE FROM Cart c WHERE c.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    void deleteByUser_Id(Long userId);

    void deleteBySessionId(String sessionId);

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Cart c WHERE c.user.id = :userId")
    boolean existsByUserId(@Param("userId") Long userId);

    boolean existsByUser_Id(Long userId);
}
