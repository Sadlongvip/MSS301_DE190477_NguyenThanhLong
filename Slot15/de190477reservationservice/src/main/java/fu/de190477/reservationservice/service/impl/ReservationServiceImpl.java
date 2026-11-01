package fu.de190477.reservationservice.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import fu.de190477.reservationservice.client.RoomClient;
import fu.de190477.reservationservice.dto.ApiResponse;
import fu.de190477.reservationservice.dto.PageDTO;
import fu.de190477.reservationservice.dto.ReservationDTO;
import fu.de190477.reservationservice.dto.ReservationDetailDTO;
import fu.de190477.reservationservice.dto.RoomDTO;
import fu.de190477.reservationservice.entity.Reservation;
import fu.de190477.reservationservice.entity.ReservationStatus;
import fu.de190477.reservationservice.repository.ReservationRepository;
import fu.de190477.reservationservice.service.ReservationService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReservationServiceImpl implements ReservationService {

    private static final String ROOM_AVAILABLE = "AVAILABLE";

    private final ReservationRepository reservationRepository;
    private final RoomClient roomClient;
    private final ObjectMapper objectMapper;

    public ReservationServiceImpl(ReservationRepository reservationRepository, RoomClient roomClient,
                                  ObjectMapper objectMapper) {
        this.reservationRepository = reservationRepository;
        this.roomClient = roomClient;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public ApiResponse createReservation(ReservationDTO dto) {
        if (dto == null) {
            return ApiResponse.error(2, "Reservation data is required");
        }

        // Date validation (status 2 -> 406)
        if (!isCheckOutAfterCheckIn(dto.getCheckInDate(), dto.getCheckOutDate())) {
            return ApiResponse.error(2, "checkOutDate must be after checkInDate");
        }

        if (dto.getNumberOfGuest() == null) {
            return ApiResponse.error(2, "numberOfGuest is required");
        }

        if (dto.getRoomId() == null) {
            return ApiResponse.error(2, "roomId is required");
        }

        // Fetch room from RoomService via OpenFeign
        RoomDTO room = fetchRoom(dto.getRoomId());
        if (room == null) {
            return ApiResponse.error(4, "Room ID is not found"); // 404
        }

        if (!ROOM_AVAILABLE.equalsIgnoreCase(room.getStatus())) {
            return ApiResponse.error(5, "Room is not AVAILABLE for reservation"); // 400
        }

        if (room.getCapacity() != null && dto.getNumberOfGuest() > room.getCapacity()) {
            return ApiResponse.error(2, "numberOfGuest must not exceed room's capacity"); // 406
        }

        Reservation reservation = new Reservation();
        reservation.setGuestName(dto.getGuestName());
        reservation.setGuestEmail(dto.getGuestEmail());
        reservation.setGuestPhone(dto.getGuestPhone());
        reservation.setCheckInDate(dto.getCheckInDate());
        reservation.setCheckOutDate(dto.getCheckOutDate());
        reservation.setNumberOfGuest(dto.getNumberOfGuest());
        reservation.setRoomId(dto.getRoomId());
        reservation.setTotalAmount(computeTotal(room.getPricePerNight(), dto.getCheckInDate(), dto.getCheckOutDate()));
        reservation.setStatus(dto.getStatus() == null
                ? ReservationStatus.CONFIRMED
                : ReservationStatus.valueOf(dto.getStatus()));

        Reservation saved = reservationRepository.save(reservation);
        return ApiResponse.of(1, "Reservation created successfully", toDTO(saved));
    }

    @Override
    @Transactional
    public ApiResponse updateReservation(Long reservationId, ReservationDTO dto) {
        Reservation reservation = reservationRepository.findById(reservationId).orElse(null);
        if (reservation == null) {
            return ApiResponse.error(4, "Reservation is not found");
        }

        if (dto == null) {
            return ApiResponse.error(2, "Reservation data is required");
        }

        // Validate effective dates before altering the entity
        LocalDate effectiveCheckIn = dto.getCheckInDate() != null
                ? dto.getCheckInDate()
                : reservation.getCheckInDate();
        LocalDate effectiveCheckOut = dto.getCheckOutDate() != null
                ? dto.getCheckOutDate()
                : reservation.getCheckOutDate();
        if (!isCheckOutAfterCheckIn(effectiveCheckIn, effectiveCheckOut)) {
            return ApiResponse.error(2, "checkOutDate must be after checkInDate");
        }

        int effectiveNumberOfGuest = dto.getNumberOfGuest() != null
                ? dto.getNumberOfGuest()
                : reservation.getNumberOfGuest();
        if (effectiveNumberOfGuest < 1) {
            return ApiResponse.error(2, "numberOfGuest must be >= 1");
        }

        Long effectiveRoomId = dto.getRoomId() != null ? dto.getRoomId() : reservation.getRoomId();
        RoomDTO room = fetchRoom(effectiveRoomId);
        if (room == null) {
            return ApiResponse.error(4, "Room ID is not found");
        }

        // Only a newly selected room must be available; the current room may have
        // changed status after the reservation was created.
        boolean roomChanged = !effectiveRoomId.equals(reservation.getRoomId());
        if (roomChanged && !ROOM_AVAILABLE.equalsIgnoreCase(room.getStatus())) {
            return ApiResponse.error(5, "Room is not AVAILABLE for reservation");
        }

        if (room.getCapacity() != null && effectiveNumberOfGuest > room.getCapacity()) {
            return ApiResponse.error(2, "numberOfGuest must not exceed room's capacity");
        }

        // Partial update: only non-null fields are applied
        if (dto.getGuestName() != null) {
            reservation.setGuestName(dto.getGuestName());
        }
        if (dto.getGuestEmail() != null) {
            reservation.setGuestEmail(dto.getGuestEmail());
        }
        if (dto.getGuestPhone() != null) {
            reservation.setGuestPhone(dto.getGuestPhone());
        }
        reservation.setCheckInDate(effectiveCheckIn);
        reservation.setCheckOutDate(effectiveCheckOut);
        reservation.setNumberOfGuest(effectiveNumberOfGuest);
        reservation.setRoomId(effectiveRoomId);
        if (dto.getStatus() != null) {
            reservation.setStatus(ReservationStatus.valueOf(dto.getStatus()));
        }

        // Recompute total amount based on the current room rate
        reservation.setTotalAmount(computeTotal(room.getPricePerNight(), effectiveCheckIn, effectiveCheckOut));

        Reservation saved = reservationRepository.save(reservation);
        return ApiResponse.ok("Reservation updated successfully", toDTO(saved));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse getReservationById(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId).orElse(null);
        if (reservation == null) {
            return ApiResponse.error(4, "Reservation is not found");
        }
        return ApiResponse.ok("Successful", toDetailDTO(reservation));
    }

    @Override
    @Transactional
    public ApiResponse cancelReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId).orElse(null);
        if (reservation == null) {
            return ApiResponse.error(4, "Reservation is not found");
        }
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
        return ApiResponse.ok("Reservation cancelled successfully", null);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse getReservationList(String guestName, String status, Pageable pageable) {
        Page<Reservation> page = reservationRepository.search(
                emptyToNull(guestName), parseReservationStatus(status), pageable);
        List<ReservationDetailDTO> content = page.getContent().stream()
                .map(this::toDetailDTO)
                .toList();
        PageDTO pageDTO = new PageDTO(
                page.getSize(),
                page.getNumber(),
                page.getTotalPages(),
                page.getTotalElements(),
                page.isFirst(),
                page.isLast(),
                content
        );
        return ApiResponse.ok("Successful", pageDTO);
    }

    /**
     * Gọi RoomService qua OpenFeign; trả null khi room không tồn tại (HTTP 404).
     */
    private RoomDTO fetchRoom(Long roomId) {
        try {
            ApiResponse res = roomClient.getRoomById(roomId);
            if (res == null || res.getStatus() != 1 || res.getData() == null) {
                return null;
            }
            return objectMapper.convertValue(res.getData(), RoomDTO.class);
        } catch (FeignException.NotFound ex) {
            // 404 từ RoomService -> coi như không tìm thấy room (status 4)
            return null;
        }
    }

    /**
     * Tổng tiền = giá phòng mỗi đêm x số đêm. Số đêm tối thiểu là 1.
     */
    private BigDecimal computeTotal(BigDecimal pricePerNight, LocalDate checkInDate, LocalDate checkOutDate) {
        if (pricePerNight == null || checkInDate == null || checkOutDate == null) {
            return BigDecimal.ZERO;
        }
        long nights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        if (nights < 1) {
            nights = 1;
        }
        return pricePerNight.multiply(BigDecimal.valueOf(nights));
    }

    private boolean isCheckOutAfterCheckIn(LocalDate checkInDate, LocalDate checkOutDate) {
        return checkInDate != null && checkOutDate != null && checkOutDate.isAfter(checkInDate);
    }

    private ReservationDTO toDTO(Reservation reservation) {
        ReservationDTO d = new ReservationDTO();
        d.setReservationId(reservation.getReservationId());
        d.setGuestName(reservation.getGuestName());
        d.setGuestEmail(reservation.getGuestEmail());
        d.setGuestPhone(reservation.getGuestPhone());
        d.setCheckInDate(reservation.getCheckInDate());
        d.setCheckOutDate(reservation.getCheckOutDate());
        d.setNumberOfGuest(reservation.getNumberOfGuest());
        d.setTotalAmount(reservation.getTotalAmount());
        d.setStatus(reservation.getStatus().name());
        d.setRoomId(reservation.getRoomId());
        return d;
    }

    private ReservationDetailDTO toDetailDTO(Reservation reservation) {
        ReservationDetailDTO d = new ReservationDetailDTO();
        d.setReservationId(reservation.getReservationId());
        d.setGuestName(reservation.getGuestName());
        d.setGuestEmail(reservation.getGuestEmail());
        d.setGuestPhone(reservation.getGuestPhone());
        d.setCheckInDate(reservation.getCheckInDate());
        d.setCheckOutDate(reservation.getCheckOutDate());
        d.setNumberOfGuest(reservation.getNumberOfGuest());
        d.setTotalAmount(reservation.getTotalAmount());
        d.setStatus(reservation.getStatus().name());
        d.setRoomId(reservation.getRoomId());
        d.setRoom(fetchRoom(reservation.getRoomId()));
        return d;
    }

    private String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    private ReservationStatus parseReservationStatus(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        try {
            return ReservationStatus.valueOf(s);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
