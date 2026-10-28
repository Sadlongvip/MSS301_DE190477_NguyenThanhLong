package fu.de190477.userservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", length = 30, nullable = false, unique = true)
    private String username;

    @Column(name = "email", length = 100, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 15, nullable = false)
    private Role role;

    @Column(name = "rate_per_post", precision = 18, scale = 2, nullable = false)
    private BigDecimal ratePerPost;

    @Column(name = "max_daily_posts", nullable = false)
    private Integer maxDailyPosts;

    @Column(name = "level", nullable = false)
    private Integer level;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 15, nullable = false)
    private UserStatus status;

    public User() {
    }

    public User(Long userId, String username, String email, Role role, BigDecimal ratePerPost, Integer maxDailyPosts, Integer level, UserStatus status) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.ratePerPost = ratePerPost;
        this.maxDailyPosts = maxDailyPosts;
        this.level = level;
        this.status = status;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public BigDecimal getRatePerPost() {
        return ratePerPost;
    }

    public void setRatePerPost(BigDecimal ratePerPost) {
        this.ratePerPost = ratePerPost;
    }

    public Integer getMaxDailyPosts() {
        return maxDailyPosts;
    }

    public void setMaxDailyPosts(Integer maxDailyPosts) {
        this.maxDailyPosts = maxDailyPosts;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }
}

