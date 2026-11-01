package fu.de190477.reservationservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ReservationDetailDTO {

    private Long reservationId;

    @NotBlank(message = "guestName is required")
    @Size(max = 100, message = "guestName must not exceed 100 characters")
    private String guestName;

    @NotBlank(message = "guestEmail is required")
    @Email(message = "guestEmail is invalid")
    @Size(max = 100, message = "guestEmail must not exceed 100 characters")
    private String guestEmail;

    @NotBlank(message = "guestPhone is required")
    @Size(max = 20, message = "guestPhone must not exceed 20 characters")
    private String guestPhone;

    @NotNull(message = "checkInDate is required")
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate checkInDate;

    @NotNull(message = "checkOutDate is required")
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate checkOutDate;

    @NotNull(message = "numberOfGuest is required")
    @Min(value = 1, message = "numberOfGuest must be >= 1")
    private Integer numberOfGuest;

    private BigDecimal totalAmount;

    @Pattern(regexp = "^(CONFIRMED|CHECKED_IN|CHECKED_OUT|CANCELLED)$",
            message = "status must be CONFIRMED, CHECKED_IN, CHECKED_OUT or CANCELLED")
    private String status;

    private Long roomId;

    // Full room detail fetched from RoomService
    @NotNull(message = "room is required")
    @Valid
    private RoomDTO room;

    public ReservationDetailDTO() {
    }

    public ReservationDetailDTO(Long reservationId, String guestName, String guestEmail, String guestPhone,
                                LocalDate checkInDate, LocalDate checkOutDate, Integer numberOfGuest,
                                BigDecimal totalAmount, String status, RoomDTO room) {
        this.reservationId = reservationId;
        this.guestName = guestName;
        this.guestEmail = guestEmail;
        this.guestPhone = guestPhone;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.numberOfGuest = numberOfGuest;
        this.totalAmount = totalAmount;
        this.status = status;
        this.room = room;
        if (room != null) {
            this.roomId = room.getRoomId();
        }
    }

    public ReservationDetailDTO(Long reservationId, String guestName, String guestEmail, String guestPhone,
                                LocalDate checkInDate, LocalDate checkOutDate, Integer numberOfGuest,
                                BigDecimal totalAmount, String status, Long roomId, RoomDTO room) {
        this.reservationId = reservationId;
        this.guestName = guestName;
        this.guestEmail = guestEmail;
        this.guestPhone = guestPhone;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.numberOfGuest = numberOfGuest;
        this.totalAmount = totalAmount;
        this.status = status;
        this.roomId = roomId;
        this.room = room;
    }

    @JsonIgnore
    @AssertTrue(message = "checkOutDate must be after checkInDate")
    public boolean isCheckOutAfterCheckIn() {
        if (checkInDate == null || checkOutDate == null) {
            return true;
        }
        return checkOutDate.isAfter(checkInDate);
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public String getGuestName() {
        return guestName;
    }

    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }

    public String getGuestEmail() {
        return guestEmail;
    }

    public void setGuestEmail(String guestEmail) {
        this.guestEmail = guestEmail;
    }

    public String getGuestPhone() {
        return guestPhone;
    }

    public void setGuestPhone(String guestPhone) {
        this.guestPhone = guestPhone;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public Integer getNumberOfGuest() {
        return numberOfGuest;
    }

    public void setNumberOfGuest(Integer numberOfGuest) {
        this.numberOfGuest = numberOfGuest;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getRoomId() {
        if (roomId != null) {
            return roomId;
        }
        return room != null ? room.getRoomId() : null;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public RoomDTO getRoom() {
        return room;
    }

    public void setRoom(RoomDTO room) {
        this.room = room;
        if (room != null && room.getRoomId() != null) {
            this.roomId = room.getRoomId();
        }
    }
}
