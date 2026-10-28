package fu.de190477.userservice.entity;

/**
 * Enum đại diện cho trạng thái của người dùng (User / Creator).
 * Được lưu vào database dưới dạng chuỗi (NVARCHAR(15)) thông qua @Enumerated(EnumType.STRING).
 * Ràng buộc DB: CHECK ([status] IN ('ACTIVE', 'SUSPENDED', 'DEACTIVATED'))
 */
public enum UserStatus {

    /**
     * Trạng thái đang hoạt động bình thường.
     * - Là giá trị mặc định khi tạo mới User (POST /api/users).
     * - Chỉ người dùng có trạng thái ACTIVE mới được phép nhận chiến dịch quảng cáo từ PostService.
     */
    ACTIVE,

    /**
     * Trạng thái tạm ngưng / khóa tài khoản.
     * - Không thể nhận chiến dịch quảng cáo mới (PostService sẽ trả mã HTTP 400, status = 5).
     */
    SUSPENDED,

    /**
     * Trạng thái bị vô hiệu hóa (xóa mềm).
     * - Được thiết lập khi gọi API xóa người dùng (DELETE /api/users/{userId}).
     * - Người dùng bị vô hiệu hóa sẽ không nhận chiến dịch và bị loại trừ khỏi danh sách Creator hoạt động.
     */
    DEACTIVATED
}
