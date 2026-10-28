/**
 * Module xác thực dữ liệu Tài khoản Quản trị & Khách hàng (Account Validation)
 * Không sử dụng alert hay browser native validation.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,50}$/;

/**
 * Kiểm tra tên đăng nhập
 */
export function validateAccountUsername(username) {
  if (!username || !username.trim()) {
    return 'Tên đăng nhập không được để trống';
  }
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 50) {
    return 'Tên đăng nhập phải từ 3 đến 50 ký tự';
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    return 'Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới (_)';
  }
  return '';
}

/**
 * Kiểm tra email
 */
export function validateAccountEmail(email) {
  if (!email || !email.trim()) {
    return 'Email không được để trống';
  }
  const trimmed = email.trim();
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Email không đúng định dạng (ví dụ: admin@example.com)';
  }
  return '';
}

/**
 * Kiểm tra mật khẩu (bắt buộc khi tạo mới, tùy chọn khi sửa)
 */
export function validateAccountPassword(password, isEdit = false) {
  if (!isEdit && (!password || !password.trim())) {
    return 'Mật khẩu không được để trống khi tạo mới';
  }
  if (password && password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự';
  }
  return '';
}

/**
 * Kiểm tra số điện thoại
 */
export function validateAccountPhone(phone) {
  if (!phone || !phone.trim()) {
    return ''; // Cho phép để trống
  }
  const trimmed = phone.trim();
  if (!PHONE_REGEX.test(trimmed)) {
    return 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)';
  }
  return '';
}

/**
 * Kiểm tra vai trò
 */
export function validateAccountRole(role) {
  if (!role || !['ADMIN', 'CUSTOMER', 'STAFF'].includes(role)) {
    return 'Vui lòng chọn vai trò hợp lệ (ADMIN, STAFF hoặc CUSTOMER)';
  }
  return '';
}

/**
 * Hàm kiểm tra toàn diện Form Tài khoản
 * @param {{ username?: string, email?: string, password?: string, phoneNumber?: string, role?: string }} form
 * @param {boolean} isEdit
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateAccountForm(form, isEdit = false) {
  const errors = {};

  const usernameErr = validateAccountUsername(form.username);
  if (usernameErr) errors.username = usernameErr;

  const emailErr = validateAccountEmail(form.email);
  if (emailErr) errors.email = emailErr;

  const passwordErr = validateAccountPassword(form.password, isEdit);
  if (passwordErr) errors.password = passwordErr;

  const phoneErr = validateAccountPhone(form.phoneNumber);
  if (phoneErr) errors.phoneNumber = phoneErr;

  const roleErr = validateAccountRole(form.role);
  if (roleErr) errors.role = roleErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Kiểm tra xác thực khi đổi mật khẩu tài khoản
 */
export function validateNewPassword(password, confirmPassword) {
  const errors = {};
  if (!password || !password.trim()) {
    errors.password = 'Mật khẩu mới không được để trống';
  } else if (password.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
  }

  if (!confirmPassword || !confirmPassword.trim()) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp với mật khẩu mới';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export default validateAccountForm;
