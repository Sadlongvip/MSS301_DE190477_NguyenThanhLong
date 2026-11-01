package fu.de190477.reservationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import fu.de190477.reservationservice.dto.ApiResponse;

@FeignClient(name = "room-service", url = "${room.service.url}")
public interface RoomClient {

    @GetMapping("/api/rooms/{roomId}")
    ApiResponse getRoomById(@PathVariable("roomId") Long roomId);
}

