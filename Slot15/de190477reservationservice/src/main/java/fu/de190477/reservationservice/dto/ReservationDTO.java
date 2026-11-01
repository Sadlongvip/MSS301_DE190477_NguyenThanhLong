package fu.de190477.reservationservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import fu.de190477.reservationservice.common.PostConstants;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.Date;

public class ReservationDTO {

    private Long reservationId;

    @NotBlank(message = "advertiserName is required")
    @Size(max = 100, message = "advertiserName must not exceed 100 characters")
    private String advertiserName;

    @NotBlank(message = "advertiserEmail is required")
    @Email(message = "advertiserEmail is invalid")
    @Size(max = 100, message = "advertiserEmail must not exceed 100 characters")
    private String advertiserEmail;

    @NotBlank(message = "advertiserPhone is required")
    @Size(max = 20, message = "advertiserPhone must not exceed 20 characters")
    private String advertiserPhone;

    @NotNull(message = "startDate is required")
    @JsonFormat(pattern = "dd/MM/yyyy")
    private Date startDate;

    @NotNull(message = "endDate is required")
    @JsonFormat(pattern = "dd/MM/yyyy")
    private Date endDate;

    @NotNull(message = "numberOfPosts is required")
    @Min(value = 1, message = "numberOfPosts must be >= 1")
    private Integer numberOfPosts;

    private BigDecimal totalCost;

    @Pattern(regexp = PostConstants.STATUS_REGEX,
            message = "status must be DRAFT, SCHEDULED, PUBLISHED or CANCELLED")
    private String status;

    @NotNull(message = "roomId is required")
    private Long roomId;

    public ReservationDTO() {
    }

   
}

