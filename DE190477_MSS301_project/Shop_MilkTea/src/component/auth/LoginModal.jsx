import React, { useState, useContext, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Nav } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import {
  validateUsername,
  validatePassword,
  validateEmail,
  validateConfirmPassword,
  validatePhoneNumber,
  validateBirthday,
  validateLoginForm,
  validateRegisterForm,
} from '../../validation/authValidation';

/**
 * Modal Đăng Nhập & Đăng Ký Tài Khoản (Ánh xạ chuẩn theo Entity Account)
 * - Tích hợp cơ chế Validation UX:
 *   + onBlur: Hiện lỗi khi người dùng rời khỏi ô nhập
 *   + onFocus: Tắt lỗi ngay khi người dùng bắt đầu focus
 *   + onSubmit: Kiểm tra toàn diện mọi ô trước khi gửi request
 * - Chỉ giao tiếp API duy nhất qua AuthContext
 */
export function LoginModal({ show, onHide, initialTab = 'login' }) {
  const { login, register, loading, error, clearError } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register'

  // State Form
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phoneNumber: '',
    address: '',
    birthday: '',
  });

  // State Lưu trữ lỗi riêng cho từng trường
  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});

  const [formFeedback, setFormFeedback] = useState({ success: '', error: '' });

  // Reset form và lỗi khi mở modal
  useEffect(() => {
    if (show) {
      setActiveTab(initialTab);
      clearError();
      setFormFeedback({ success: '', error: '' });
      setLoginErrors({});
      setRegisterErrors({});
    }
  }, [show, initialTab, clearError]);

  /* =====================================================================
   * XỬ LÝ SỰ KIỆN FOCUS / BLUR CHO FORM LOGIN
   * ===================================================================== */
  const handleLoginFocus = (field) => {
    setLoginErrors((prev) => ({ ...prev, [field]: '' }));
    setFormFeedback((prev) => ({ ...prev, error: '' }));
  };

  const handleLoginBlur = (field) => {
    let fieldError = '';
    if (field === 'username') {
      fieldError = validateUsername(loginForm.username);
    } else if (field === 'password') {
      fieldError = validatePassword(loginForm.password);
    }

    if (fieldError) {
      setLoginErrors((prev) => ({ ...prev, [field]: fieldError }));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormFeedback({ success: '', error: '' });

    // Validate 100% các ô trước khi gửi dữ liệu
    const validation = validateLoginForm(loginForm);
    if (!validation.isValid) {
      setLoginErrors(validation.errors);
      return;
    }

    const res = await login({
      username: loginForm.username.trim(),
      password: loginForm.password,
    });

    if (res.success) {
      setFormFeedback({ success: 'Đăng nhập thành công! Chào mừng bạn quay trở lại.', error: '' });
      setTimeout(() => {
        onHide();
      }, 900);
    }
  };

  /* =====================================================================
   * XỬ LÝ SỰ KIỆN FOCUS / BLUR CHO FORM REGISTER
   * ===================================================================== */
  const handleRegisterFocus = (field) => {
    setRegisterErrors((prev) => ({ ...prev, [field]: '' }));
    setFormFeedback((prev) => ({ ...prev, error: '' }));
  };

  const handleRegisterBlur = (field) => {
    let fieldError = '';
    if (field === 'username') {
      fieldError = validateUsername(registerForm.username);
    } else if (field === 'email') {
      fieldError = validateEmail(registerForm.email);
    } else if (field === 'password') {
      fieldError = validatePassword(registerForm.password);
    } else if (field === 'confirmPassword') {
      fieldError = validateConfirmPassword(registerForm.confirmPassword, registerForm.password);
    } else if (field === 'phoneNumber') {
      fieldError = validatePhoneNumber(registerForm.phoneNumber);
    } else if (field === 'birthday') {
      fieldError = validateBirthday(registerForm.birthday);
    }

    if (fieldError) {
      setRegisterErrors((prev) => ({ ...prev, [field]: fieldError }));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormFeedback({ success: '', error: '' });

    // Validate 100% các ô trước khi gửi dữ liệu
    const validation = validateRegisterForm(registerForm);
    if (!validation.isValid) {
      setRegisterErrors(validation.errors);
      return;
    }

    // Payload chuẩn theo AccountRequest của Backend
    const accountPayload = {
      username: registerForm.username.trim(),
      password: registerForm.password,
      email: registerForm.email.trim(),
      phoneNumber: registerForm.phoneNumber ? registerForm.phoneNumber.trim() : null,
      address: registerForm.address ? registerForm.address.trim() : null,
      birthday: registerForm.birthday || null,
      role: 'CUSTOMER',
    };

    const res = await register(accountPayload);

    if (res.success) {
      setFormFeedback({
        success: 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.',
        error: '',
      });
      setActiveTab('login');
      setLoginForm((prev) => ({ ...prev, username: registerForm.username }));
      setRegisterErrors({});
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" className="rounded-4">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2">
          <i className="bi bi-cup-straw text-warning fs-4"></i>
          <span>Chào mừng đến với Shop MilkTea</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-2 px-4 pb-4">
        {/* Tab chuyển đổi Đăng Nhập / Đăng Ký */}
        <Nav variant="pills" className="nav-justified bg-light p-1 rounded-pill mb-4 border">
          <Nav.Item>
            <Nav.Link
              active={activeTab === 'login'}
              onClick={() => {
                setActiveTab('login');
                clearError();
                setFormFeedback({ success: '', error: '' });
                setLoginErrors({});
              }}
              className={`rounded-pill fw-bold py-2 ${
                activeTab === 'login' ? 'bg-white text-dark shadow-sm' : 'text-muted'
              }`}
            >
              <i className="bi bi-box-arrow-in-right me-1"></i>
              Đăng Nhập
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === 'register'}
              onClick={() => {
                setActiveTab('register');
                clearError();
                setFormFeedback({ success: '', error: '' });
                setRegisterErrors({});
              }}
              className={`rounded-pill fw-bold py-2 ${
                activeTab === 'register' ? 'bg-white text-dark shadow-sm' : 'text-muted'
              }`}
            >
              <i className="bi bi-person-plus-fill me-1"></i>
              Tạo Tài Khoản
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Thông báo lỗi / thành công chung */}
        {(error || formFeedback.error) && (
          <Alert variant="danger" className="py-2 px-3 rounded-3 small mb-3">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {formFeedback.error || error}
          </Alert>
        )}
        {formFeedback.success && (
          <Alert variant="success" className="py-2 px-3 rounded-3 small mb-3">
            <i className="bi bi-check-circle-fill me-2"></i>
            {formFeedback.success}
          </Alert>
        )}

        {/* Tab 1: Đăng Nhập */}
        {activeTab === 'login' ? (
          <Form onSubmit={handleLoginSubmit} noValidate>
            <Form.Group className="mb-3" controlId="loginUsername">
              <Form.Label className="small fw-semibold text-secondary">Tên đăng nhập hoặc Email *</Form.Label>
              <div className="input-group has-validation">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-person text-muted"></i>
                </span>
                <Form.Control
                  type="text"
                  placeholder="Nhập username hoặc email"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  onFocus={() => handleLoginFocus('username')}
                  onBlur={() => handleLoginBlur('username')}
                  isInvalid={Boolean(loginErrors.username)}
                  className="border-start-0 ps-0"
                />
                <Form.Control.Feedback type="invalid" className="d-block small">
                  {loginErrors.username}
                </Form.Control.Feedback>
              </div>
            </Form.Group>

            <Form.Group className="mb-4" controlId="loginPassword">
              <Form.Label className="small fw-semibold text-secondary">Mật khẩu *</Form.Label>
              <div className="input-group has-validation">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock text-muted"></i>
                </span>
                <Form.Control
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  onFocus={() => handleLoginFocus('password')}
                  onBlur={() => handleLoginBlur('password')}
                  isInvalid={Boolean(loginErrors.password)}
                  className="border-start-0 ps-0"
                />
                <Form.Control.Feedback type="invalid" className="d-block small">
                  {loginErrors.password}
                </Form.Control.Feedback>
              </div>
            </Form.Group>

            <Button
              type="submit"
              disabled={loading}
              className="w-100 btn-tea-primary py-2 d-flex align-items-center justify-content-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" /> Đang xác thực...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i> Đăng Nhập Ngay
                </>
              )}
            </Button>

            {/* Nút Tạo Tài Khoản trong Modal Login */}
            <div className="text-center mt-3 pt-3 border-top">
              <span className="small text-muted me-1">Bạn chưa có tài khoản?</span>
              <Button
                variant="link"
                className="p-0 small fw-bold text-decoration-none"
                style={{ color: '#d97706' }}
                onClick={() => {
                  setActiveTab('register');
                  clearError();
                  setFormFeedback({ success: '', error: '' });
                  setRegisterErrors({});
                }}
              >
                <i className="bi bi-person-plus-fill me-1"></i>
                Tạo tài khoản mới
              </Button>
            </div>
          </Form>
        ) : (
          /* Tab 2: Đăng Ký (Theo cấu trúc Account) */
          <Form onSubmit={handleRegisterSubmit} noValidate>
            <div className="row g-2 mb-2">
              <div className="col-12 col-md-6">
                <Form.Group controlId="regUsername">
                  <Form.Label className="small fw-semibold text-secondary">Tên đăng nhập *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="linh_tra_sua"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    onFocus={() => handleRegisterFocus('username')}
                    onBlur={() => handleRegisterBlur('username')}
                    isInvalid={Boolean(registerErrors.username)}
                  />
                  <Form.Control.Feedback type="invalid" className="small">
                    {registerErrors.username}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <div className="col-12 col-md-6">
                <Form.Group controlId="regEmail">
                  <Form.Label className="small fw-semibold text-secondary">Email *</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="name@example.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    onFocus={() => handleRegisterFocus('email')}
                    onBlur={() => handleRegisterBlur('email')}
                    isInvalid={Boolean(registerErrors.email)}
                  />
                  <Form.Control.Feedback type="invalid" className="small">
                    {registerErrors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <div className="row g-2 mb-2">
              <div className="col-12 col-md-6">
                <Form.Group controlId="regPhone">
                  <Form.Label className="small fw-semibold text-secondary">Số điện thoại</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="0901234567"
                    value={registerForm.phoneNumber}
                    onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                    onFocus={() => handleRegisterFocus('phoneNumber')}
                    onBlur={() => handleRegisterBlur('phoneNumber')}
                    isInvalid={Boolean(registerErrors.phoneNumber)}
                  />
                  <Form.Control.Feedback type="invalid" className="small">
                    {registerErrors.phoneNumber}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <div className="col-12 col-md-6">
                <Form.Group controlId="regBirthday">
                  <Form.Label className="small fw-semibold text-secondary">Ngày sinh</Form.Label>
                  <Form.Control
                    type="date"
                    value={registerForm.birthday}
                    onChange={(e) => setRegisterForm({ ...registerForm, birthday: e.target.value })}
                    onFocus={() => handleRegisterFocus('birthday')}
                    onBlur={() => handleRegisterBlur('birthday')}
                    isInvalid={Boolean(registerErrors.birthday)}
                  />
                  <Form.Control.Feedback type="invalid" className="small">
                    {registerErrors.birthday}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-2" controlId="regAddress">
              <Form.Label className="small fw-semibold text-secondary">Địa chỉ giao hàng</Form.Label>
              <Form.Control
                type="text"
                placeholder="123 Đường Nguyễn Huệ, Quận 1, TP.HCM"
                value={registerForm.address}
                onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                onFocus={() => handleRegisterFocus('address')}
              />
            </Form.Group>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <Form.Label className="small fw-semibold text-secondary">Mật khẩu *</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="••••••••"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  onFocus={() => handleRegisterFocus('password')}
                  onBlur={() => handleRegisterBlur('password')}
                  isInvalid={Boolean(registerErrors.password)}
                />
                <Form.Control.Feedback type="invalid" className="small">
                  {registerErrors.password}
                </Form.Control.Feedback>
              </div>
              <div className="col-6">
                <Form.Label className="small fw-semibold text-secondary">Nhập lại mật khẩu *</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="••••••••"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  onFocus={() => handleRegisterFocus('confirmPassword')}
                  onBlur={() => handleRegisterBlur('confirmPassword')}
                  isInvalid={Boolean(registerErrors.confirmPassword)}
                />
                <Form.Control.Feedback type="invalid" className="small">
                  {registerErrors.confirmPassword}
                </Form.Control.Feedback>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-100 btn-tea-primary py-2 d-flex align-items-center justify-content-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" /> Đang tạo tài khoản...
                </>
              ) : (
                <>
                  <i className="bi bi-person-check-fill"></i> Hoàn Tất Đăng Ký
                </>
              )}
            </Button>

            {/* Chuyển nhanh sang tab Đăng Nhập */}
            <div className="text-center mt-3 pt-2 border-top">
              <span className="small text-muted me-1">Đã có tài khoản?</span>
              <Button
                variant="link"
                className="p-0 small fw-bold text-decoration-none"
                style={{ color: '#854d0e' }}
                onClick={() => {
                  setActiveTab('login');
                  clearError();
                  setFormFeedback({ success: '', error: '' });
                  setLoginErrors({});
                }}
              >
                <i className="bi bi-box-arrow-in-right me-1"></i>
                Đăng nhập ngay
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default LoginModal;
