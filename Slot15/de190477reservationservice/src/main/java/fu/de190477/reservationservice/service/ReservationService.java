package fu.de190477.reservationservice.service;

import org.springframework.data.domain.Pageable;

import fu.de190477.reservationservice.dto.ApiResponse;
import fu.de190477.reservationservice.dto.ReservationDTO;

public interface ReservationService {

    ApiResponse createPost(ReservationDTO dto);

    ApiResponse updatePost(Long postId, ReservationDTO dto);

    ApiResponse getPostById(Long postId);

    ApiResponse cancelPost(Long postId);

    ApiResponse getPostList(String advertiserName, String status, Pageable pageable);
}

