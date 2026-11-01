package fu.de190477.roomservice.service;

import fu.de190477.roomservice.dto.ApiResponse;
import fu.de190477.roomservice.dto.RoomDTO;
import org.springframework.data.domain.Pageable;

public interface RoomService {

    ApiResponse createRoom(RoomDTO dto);

    ApiResponse updateRoom(Long roomId, RoomDTO dto);

    ApiResponse getRoomById(Long roomId);

    ApiResponse deactivateRoom(Long roomId);

    ApiResponse getRoomList(String roomType, String status, Pageable pageable);
}
