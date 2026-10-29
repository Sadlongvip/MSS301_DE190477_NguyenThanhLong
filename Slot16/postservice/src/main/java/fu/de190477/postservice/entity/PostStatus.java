package fu.de190477.postservice.entity;

/**
 * Enum đại diện cho trạng thái chiến dịch bài đăng (Post campaign).
 * Ràng buộc DB: CHECK ([status] IN ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'CANCELLED'))
 */
public enum PostStatus {
    DRAFT,
    SCHEDULED,
    PUBLISHED,
    CANCELLED
}

