package fu.de190477.reservationservice.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import fu.de190477.reservationservice.client.RoomClient;
import fu.de190477.reservationservice.common.PostConstants;
import fu.de190477.reservationservice.dto.ApiResponse;
import fu.de190477.reservationservice.dto.PageDTO;
import fu.de190477.reservationservice.dto.ReservationDTO;
import fu.de190477.reservationservice.dto.PostDetailDTO;
import fu.de190477.reservationservice.dto.RoomDTO;
import fu.de190477.reservationservice.entity.Post;
import fu.de190477.reservationservice.entity.PostStatus;
import fu.de190477.reservationservice.repository.PostRepository;
import fu.de190477.reservationservice.service.PostService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

@Service
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final RoomClient roomClient;
    private final ObjectMapper objectMapper;

    public PostServiceImpl(PostRepository postRepository, RoomClient roomClient, ObjectMapper objectMapper) {
        this.postRepository = postRepository;
        this.roomClient = roomClient;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public ApiResponse createPost(ReservationDTO dto) {
        // Date validation (status 2 -> 406)
        if (!dto.getEndDate().after(dto.getStartDate())) {
            return ApiResponse.error(2, "endDate must be after startDate");
        }

        // Fetch room from RoomService via OpenFeign
        RoomDTO room = fetchRoom(dto.getRoomId());
        if (room == null) {
            return ApiResponse.error(4, "Room ID is not found"); // 404
        }

        if (!PostConstants.ROOM_AVAILABLE.equals(room.getStatus())) {
            return ApiResponse.error(5, "Room is not AVAILABLE for posting"); // 400
        }

        if (dto.getNumberOfPosts() > room.getCapacity()) {
            return ApiResponse.error(2, "numberOfPosts must not exceed room's capacity"); // 406
        }

        Post p = new Post();
        p.setAdvertiserName(dto.getAdvertiserName());
        p.setAdvertiserEmail(dto.getAdvertiserEmail());
        p.setAdvertiserPhone(dto.getAdvertiserPhone());
        p.setStartDate(dto.getStartDate());
        p.setEndDate(dto.getEndDate());
        p.setNumberOfPosts(dto.getNumberOfPosts());
        p.setRoomId(dto.getRoomId());
        p.setTotalCost(computeTotal(room.getPricePerNight(), dto.getStartDate(), dto.getEndDate()));
        p.setStatus(PostStatus.SCHEDULED); // Default status is SCHEDULED

        Post saved = postRepository.save(p);
        return ApiResponse.of(1, "Post campaign created successfully", toDTO(saved));
    }

    @Override
    @Transactional
    public ApiResponse updatePost(Long postId, ReservationDTO dto) {
        Post p = postRepository.findById(postId).orElse(null);
        if (p == null) {
            return ApiResponse.error(4, "Post Id is not found");
        }

        // Validate effective dates before altering entity
        Date effectiveStart = dto.getStartDate() != null ? dto.getStartDate() : p.getStartDate();
        Date effectiveEnd = dto.getEndDate() != null ? dto.getEndDate() : p.getEndDate();
        if (!effectiveEnd.after(effectiveStart)) {
            return ApiResponse.error(2, "endDate must be after startDate");
        }

        // Partial update
        if (dto.getAdvertiserName() != null) {
            p.setAdvertiserName(dto.getAdvertiserName());
        }
        if (dto.getAdvertiserEmail() != null) {
            p.setAdvertiserEmail(dto.getAdvertiserEmail());
        }
        if (dto.getAdvertiserPhone() != null) {
            p.setAdvertiserPhone(dto.getAdvertiserPhone());
        }
        p.setStartDate(effectiveStart);
        p.setEndDate(effectiveEnd);
        if (dto.getNumberOfPosts() != null) {
            p.setNumberOfPosts(dto.getNumberOfPosts());
        }
        if (dto.getStatus() != null) {
            p.setStatus(PostStatus.valueOf(dto.getStatus()));
        }

        // Recompute total cost based on the current room rate
        RoomDTO room = fetchRoom(p.getRoomId());
        if (room != null) {
            p.setTotalCost(computeTotal(room.getPricePerNight(), p.getStartDate(), p.getEndDate()));
        }

        Post saved = postRepository.save(p);
        return ApiResponse.ok("Post campaign updated successfully", toDTO(saved));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse getPostById(Long postId) {
        Post p = postRepository.findById(postId).orElse(null);
        if (p == null) {
            return ApiResponse.error(4, "Post is not found");
        }
        return ApiResponse.ok("Successful", toDetailDTO(p));
    }

    @Override
    @Transactional
    public ApiResponse cancelPost(Long postId) {
        Post p = postRepository.findById(postId).orElse(null);
        if (p == null) {
            return ApiResponse.error(4, "Post is not found");
        }
        p.setStatus(PostStatus.CANCELLED);
        postRepository.save(p);
        return ApiResponse.ok("Post campaign is cancelled successfully", null);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse getPostList(String advertiserName, String status, Pageable pageable) {
        Page<Post> page = postRepository.search(emptyToNull(advertiserName), parsePostStatus(status), pageable);
        List<PostDetailDTO> content = page.getContent().stream().map(this::toDetailDTO).toList();
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

    private BigDecimal computeTotal(BigDecimal ratePerPost, Date start, Date end) {
        long days = ChronoUnit.DAYS.between(toLocalDate(start), toLocalDate(end));
        if (days < 1) {
            days = 1;
        }
        return ratePerPost.multiply(BigDecimal.valueOf(days));
    }

    private LocalDate toLocalDate(Date date) {
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
    }

    private ReservationDTO toDTO(Post p) {
        ReservationDTO d = new ReservationDTO();
        d.setPostId(p.getPostId());
        d.setAdvertiserName(p.getAdvertiserName());
        d.setAdvertiserEmail(p.getAdvertiserEmail());
        d.setAdvertiserPhone(p.getAdvertiserPhone());
        d.setStartDate(p.getStartDate());
        d.setEndDate(p.getEndDate());
        d.setNumberOfPosts(p.getNumberOfPosts());
        d.setTotalCost(p.getTotalCost());
        d.setStatus(p.getStatus().name());
        d.setRoomId(p.getRoomId());
        return d;
    }

    private PostDetailDTO toDetailDTO(Post p) {
        PostDetailDTO d = new PostDetailDTO();
        d.setPostId(p.getPostId());
        d.setAdvertiserName(p.getAdvertiserName());
        d.setAdvertiserEmail(p.getAdvertiserEmail());
        d.setAdvertiserPhone(p.getAdvertiserPhone());
        d.setStartDate(p.getStartDate());
        d.setEndDate(p.getEndDate());
        d.setNumberOfPosts(p.getNumberOfPosts());
        d.setTotalCost(p.getTotalCost());
        d.setStatus(p.getStatus().name());
        d.setRoom(fetchRoom(p.getRoomId()));
        return d;
    }

    private String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    private PostStatus parsePostStatus(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        try {
            return PostStatus.valueOf(s);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}

