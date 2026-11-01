package fu.de190477.reservationservice.controller;

import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import fu.de190477.reservationservice.dto.ApiResponse;
import fu.de190477.reservationservice.dto.ReservationDTO;
import fu.de190477.reservationservice.service.ReservationService;

@RestController
@RequestMapping("/api/reservations")
public class DE190477ReservationController {

    private final ReservationService reservationService;

    public DE190477ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createReservation(@Valid @RequestBody ReservationDTO dto) {
        ApiResponse res = reservationService.createReservation(dto);
        if (res.getStatus() == 4) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res); // 404
        }
        if (res.getStatus() == 5) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res); // 400
        }
        if (res.getStatus() == 2) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(res); // 406
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(res); // 201
    }

    @PutMapping("/{reservationId}")
    public ResponseEntity<ApiResponse> updateReservation(
            @PathVariable("reservationId") Long reservationId,
            @RequestBody ReservationDTO dto) {
        ApiResponse res = reservationService.updateReservation(reservationId, dto);
        if (res.getStatus() == 4) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res); // 404
        }
        if (res.getStatus() == 5) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res); // 400
        }
        if (res.getStatus() == 2) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(res); // 406
        }
        return ResponseEntity.ok(res); // 200
    }

    @GetMapping("/{reservationId}")
    public ResponseEntity<ApiResponse> getReservationById(
            @PathVariable("reservationId") Long reservationId) {
        ApiResponse res = reservationService.getReservationById(reservationId);
        if (res.getStatus() == 4) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res); // 404
        }
        return ResponseEntity.ok(res); // 200
    }

    @DeleteMapping("/{reservationId}")
    public ResponseEntity<ApiResponse> cancelReservation(
            @PathVariable("reservationId") Long reservationId) {
        ApiResponse res = reservationService.cancelReservation(reservationId);
        if (res.getStatus() == 4) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res); // 404
        }
        return ResponseEntity.ok(res); // 200
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getReservationList(
            @RequestParam(name = "page", defaultValue = "0") Integer page,
            @RequestParam(name = "size", defaultValue = "10") Integer size,
            @RequestParam(name = "guestName", required = false) String guestName,
            @RequestParam(name = "status", required = false) String status) {

        if (size > 100 || size < 1 || page < 0) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE)
                    .body(ApiResponse.error(2, "Validation failed: size must be between 1 and 100, and page must be >= 0"));
        }

        Pageable pageable = PageRequest.of(page, size);
        ApiResponse res = reservationService.getReservationList(guestName, status, pageable);
        return ResponseEntity.ok(res); // 200
    }
}
