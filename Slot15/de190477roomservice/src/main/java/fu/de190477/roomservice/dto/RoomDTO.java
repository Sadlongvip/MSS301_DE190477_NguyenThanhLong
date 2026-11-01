package fu.de190477.roomservice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class RoomDTO {

    private Long roomId;

    @NotBlank(message = "roomNumber is required")
    @Size(max = 30, message = "roomNumber must not exceed 30 characters")
    private String roomNumber;

    @NotBlank(message = "roomType is required")
    @Pattern(regexp = "SINGLE|DOUBLE|SUITE|DELUXE", message = "roomType must be SINGLE, DOUBLE, SUITE, or DELUXE")
    private String roomType;

    @NotNull(message = "pricePerNight is required")
    @DecimalMin(value = "0.01", message = "pricePerNight must be > 0")
    private BigDecimal pricePerNight;

    @NotNull(message = "capacity is required")
    @Min(value = 1, message = "capacity must be >= 1")
    @Max(value = 10, message = "capacity must be <= 10")
    private int capacity;

    @NotNull(message = "floor is required")
    @Min(value = 1, message = "floor must be >= 1")
    private int floor;

    @Pattern(regexp = "AVAILABLE|OCCUPIED|MAINTAINANCE", message = "status must be AVAILABLE, OCCUPIED, or MAINTAINANCE")
    private String status;

    public RoomDTO() {
    }

    public RoomDTO(Long roomId, String roomNumber, String roomType, BigDecimal pricePerNight,
            int capacity, int floor, String status) {
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.pricePerNight = pricePerNight;
        this.capacity = capacity;
        this.floor = floor;
        this.status = status;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public int getFloor() {
        return floor;
    }

    public void setFloor(int floor) {
        this.floor = floor;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    
}
