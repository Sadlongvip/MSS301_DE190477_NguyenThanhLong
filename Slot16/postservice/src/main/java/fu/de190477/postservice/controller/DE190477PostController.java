package fu.de190477.postservice.controller;

import fu.de190477.postservice.dto.ApiResponse;
import fu.de190477.postservice.dto.PostDTO;
import fu.de190477.postservice.service.PostService;
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
@RequestMapping("/api/posts")
public class DE190477PostController {

    private final PostService postService;

    public DE190477PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createPost(@Valid @RequestBody PostDTO dto) {
        ApiResponse res = postService.createPost(dto);
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

    @PutMapping("/{postId}")
    public ResponseEntity<ApiResponse> updatePost(@PathVariable("postId") Long postId,
                                                  @RequestBody PostDTO dto) {
        ApiResponse res = postService.updatePost(postId, dto);
        if (res.getStatus() == 4) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res); // 404
        }
        if (res.getStatus() == 2) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(res); // 406
        }
        return ResponseEntity.ok(res); // 200
    }

    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponse> getPostById(@PathVariable("postId") Long postId) {
        ApiResponse res = postService.getPostById(postId);
        if (res.getStatus() == 4) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res); // 404
        }
        return ResponseEntity.ok(res); // 200
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<ApiResponse> cancelPost(@PathVariable("postId") Long postId) {
        ApiResponse res = postService.cancelPost(postId);
        if (res.getStatus() == 4) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res); // 404
        }
        return ResponseEntity.ok(res); // 200
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getPostList(
            @RequestParam(name = "page", defaultValue = "0") Integer page,
            @RequestParam(name = "size", defaultValue = "10") Integer size,
            @RequestParam(name = "advertiserName", required = false) String advertiserName,
            @RequestParam(name = "status", required = false) String status) {

        if (size > 100 || size < 1 || page < 0) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE)
                    .body(ApiResponse.error(2, "Validation failed: size must be between 1 and 100, and page must be >= 0"));
        }

        Pageable pageable = PageRequest.of(page, size);
        ApiResponse res = postService.getPostList(advertiserName, status, pageable);
        return ResponseEntity.ok(res); // 200
    }
}

