package fu.de190477.userservice.controller;

import fu.de190477.userservice.dto.ApiResponse;
import fu.de190477.userservice.dto.UserDTO;
import fu.de190477.userservice.service.UserService;
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
@RequestMapping("/api/users")
public class DE190477UserController {

    private final UserService userService;

    public DE190477UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createUser(@Valid @RequestBody UserDTO dto) {
        ApiResponse res = userService.createUser(dto);
        if (res.getStatus() == 3) {
            return ResponseEntity.status(HttpStatus.IM_USED).body(res); // 226
        }
        if (res.getStatus() == 2) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(res); // 406
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(res); // 201
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse> updateUser(@PathVariable("userId") Long userId,
                                                  @RequestBody UserDTO dto) {
        ApiResponse res = userService.updateUser(userId, dto);
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

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse> getUserById(@PathVariable("userId") Long userId) {
        ApiResponse res = userService.getUserById(userId);
        if (res.getStatus() == 4) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res); // 404
        }
        return ResponseEntity.ok(res); // 200
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse> deactivateUser(@PathVariable("userId") Long userId) {
        ApiResponse res = userService.deactivateUser(userId);
        if (res.getStatus() == 4) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res); // 404
        }
        return ResponseEntity.ok(res); // 200
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getUserList(
            @RequestParam(name = "page", defaultValue = "0") Integer page,
            @RequestParam(name = "size", defaultValue = "10") Integer size,
            @RequestParam(name = "role", required = false) String role,
            @RequestParam(name = "status", required = false) String status) {

        if (size > 100 || size < 1 || page < 0) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE)
                    .body(ApiResponse.error(2, "Validation failed: size must be between 1 and 100, and page must be >= 0"));
        }

        Pageable pageable = PageRequest.of(page, size);
        ApiResponse res = userService.getUserList(role, status, pageable);
        return ResponseEntity.ok(res); // 200
    }
}

