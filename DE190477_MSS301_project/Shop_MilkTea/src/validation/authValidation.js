/**
 * Module kiểm tra hợp lệ dữ liệu (Validation) dựa trên DTO AccountRequest của Backend
 */

// Regex kiểm tra email chuẩn RFC
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Regex kiểm tra số điện thoại Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09)
const PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})$/;

// Regex username: chỉ gồm chữ cái, số và dấu gạch dưới
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

/**
 * Kiểm tra tên đăng nhập
 */
export function validateUsername(username) {
  if (!username || !username.trim()) {
    return 'Tên đăng nhập không được để trống';
  }
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 50) {
    return 'Tên đăng nhập phải từ 3 đến 50 ký tự';
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    return 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới (_)';
  }
  return '';
}

/**
 * Kiểm tra mật khẩu
 */
export function validatePassword(password) {
  if (!password) {
    return 'Mật khẩu không được để trống';
  }
  if (password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự';
  }
  return '';
}

/**
 * Kiểm tra email
 */
export function validateEmail(email) {
  if (!email || !email.trim()) {
    return 'Email không được để trống';
  }
  const trimmed = email.trim();
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Định dạng email không hợp lệ (ví dụ: user@example.com)';
  }
  return '';
}

/**
 * Kiểm tra xác nhận mật khẩu
 */
export function validateConfirmPassword(confirmPassword, password) {
  if (!confirmPassword) {
    return 'Vui lòng nhập lại mật khẩu';
  }
  if (confirmPassword !== password) {
    return 'Mật khẩu xác nhận không trùng khớp';
  }
  return '';
}

/**
 * Kiểm tra số điện thoại (tùy chọn)
 */
export function validatePhoneNumber(phone) {
  if (!phone || !phone.trim()) {
    return ''; // Không bắt buộc
  }
  const trimmed = phone.trim();
  if (!PHONE_REGEX.test(trimmed)) {
    return 'Số điện thoại không hợp lệ (gồm 10 số, ví dụ: 0901234567)';
  }
  return '';
}

/**
 * Kiểm tra ngày sinh (tùy chọn)
 */
export function validateBirthday(birthday) {
  if (!birthday) {
    return ''; // Không bắt buộc
  }
  const selectedDate = new Date(birthday);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(selectedDate.getTime())) {
    return 'Ngày sinh không hợp lệ';
  }
  if (selectedDate > today) {
    return 'Ngày sinh không được lớn hơn ngày hiện tại';
  }
  return '';
}

/**
 * Validate toàn bộ form Đăng nhập
 */
export function validateLoginForm(form) {
  const errors = {};
  const usernameError = validateUsername(form.username);
  if (usernameError) errors.username = usernameError;

  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

/**
 * Validate toàn bộ form Đăng ký
 */
export function validateRegisterForm(form) {
  const errors = {};

  const usernameError = validateUsername(form.username);
  if (usernameError) errors.username = usernameError;

  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;

  const confirmPasswordError = validateConfirmPassword(form.confirmPassword, form.password);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  const phoneError = validatePhoneNumber(form.phoneNumber);
  if (phoneError) errors.phoneNumber = phoneError;

  const birthdayError = validateBirthday(form.birthday);
  if (birthdayError) errors.birthday = birthdayError;

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
