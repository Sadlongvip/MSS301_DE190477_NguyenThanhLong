package fu.de190477.reservationservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import fu.de190477.reservationservice.entity.Reservation;
import fu.de190477.reservationservice.entity.ReservationStatus;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("""
            SELECT p FROM Post p
            WHERE (:advertiserName IS NULL OR LOWER(p.advertiserName) LIKE LOWER(CONCAT('%', :advertiserName, '%')))
              AND (:status IS NULL OR p.status = :status)
            """)
    Page<Reservation> search(@Param("advertiserName") String advertiserName,
                      @Param("status") ReservationStatus status,
                      Pageable pageable);
}

