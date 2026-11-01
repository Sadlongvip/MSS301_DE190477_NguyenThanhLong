package fu.de190477.roomservice.controller;

import fu.de190477.roomservice.dto.ApiResponse;
import fu.de190477.roomservice.dto.RoomDTO;
import fu.de190477.roomservice.service.RoomService;
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

@RestController
@RequestMapping("/api/rooms")
public class DE190477RoomController {

    private final RoomService roomService;

    public DE190477RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createRoom(@Valid @RequestBody RoomDTO dto) {
        ApiResponse res = roomService.createRoom(dto);
        if (res.getStatus() == 3) {
            return ResponseEntity.status(HttpStatus.IM_USED).body(res); // 226
        }
        if (res.getStatus() == 2) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(res); // 406
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(res); // 201
    }

    @PutMapping("/{roomId}")
    public ResponseEntity<ApiResponse> updateRoom(@PathVariable("roomId") Long roomId,
                                                  @RequestBody RoomDTO dto) {
        ApiResponse res = roomService.updateRoom(roomId, dto);
        if (res.getStatus() == 4) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res); // 404
        }
        if (res.getStatus() == 3) {
            return ResponseEntity.status(HttpStatus.IM_USED).body(res); // 226
        }
        if (res.getStatus() == 2) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(res); // 406
        }
        return ResponseEntity.ok(res); // 200
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<ApiResponse> getRoomById(@PathVariable("roomId") Long roomId) {
        ApiResponse res = roomService.getRoomById(roomId);
        if (res.getStatus() == 4) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res); // 404
        }
        return ResponseEntity.ok(res); // 200
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<ApiResponse> deactivateRoom(@PathVariable("roomId") Long roomId) {
        ApiResponse res = roomService.deactivateRoom(roomId);
        if (res.getStatus() == 4) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res); // 404
        }
        return ResponseEntity.ok(res); // 200
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getRoomList(
            @RequestParam(name = "page", defaultValue = "0") Integer page,
            @RequestParam(name = "size", defaultValue = "10") Integer size,
            @RequestParam(name = "roomType", required = false) String roomType,
            @RequestParam(name = "status", required = false) String status) {

        if (size > 100 || size < 1 || page < 0) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE)
                    .body(ApiResponse.error(2, "Validation failed: size must be between 1 and 100, and page must be >= 0"));
        }

        Pageable pageable = PageRequest.of(page, size);
        ApiResponse res = roomService.getRoomList(roomType, status, pageable);
        return ResponseEntity.ok(res); // 200
    }
}

