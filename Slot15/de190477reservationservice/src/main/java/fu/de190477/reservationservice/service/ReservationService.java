package fu.de190477.reservationservice.service;

import org.springframework.data.domain.Pageable;

import fu.de190477.reservationservice.dto.ApiResponse;
import fu.de190477.reservationservice.dto.ReservationDTO;

public interface ReservationService {

    ApiResponse createReservation(ReservationDTO dto);

    ApiResponse updateReservation(Long reservationId, ReservationDTO dto);

    ApiResponse getReservationById(Long reservationId);

    ApiResponse cancelReservation(Long reservationId);

    ApiResponse getReservationList(String guestName, String status, Pageable pageable);
}
