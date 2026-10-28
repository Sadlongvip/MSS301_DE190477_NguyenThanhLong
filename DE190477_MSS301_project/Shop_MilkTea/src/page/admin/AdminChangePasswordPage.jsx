import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Spinner,
  Alert,
  Toast,
  ToastContainer,
  Badge,
  InputGroup,
} from 'react-bootstrap';
import AdminLayout from '../../layout/AdminLayout';
import useAccount from '../../hook/useAccount';
import { validateNewPassword } from '../../validation/accountValidation';

/**
 * AdminChangePasswordPage - Trang Độc Lập Thay Đổi Mật Khẩu Cho Tài Khoản
 * Chỉ tập trung duy nhất vào việc cập nhật mật khẩu, không chỉnh sửa bất kỳ thông tin nào khác.
 */
export function AdminChangePasswordPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const accountId = Number(id);

  const {
    accounts,
    loading,
    submitting,
    fetchAccounts,
    changePassword,
  } = useAccount();

  // State thông tin form
  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // State hiển thị/ẩn mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State lỗi validation và server
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // State Toast thông báo thành công
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  // Tải danh sách tài khoản nếu chưa có
  useEffect(() => {
    if (accounts.length === 0) {
      fetchAccounts();
    }
  }, [accounts.length, fetchAccounts]);

  // Tìm tài khoản theo id
  const targetAccount = accounts.find((acc) => Number(acc.id) === accountId);

  // Xử lý thay đổi input
  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Submit cập nhật mật khẩu
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Kiểm tra validation
    const { isValid, errors: validationErrors } = validateNewPassword(
      form.newPassword,
      form.confirmPassword
    );

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    // Gọi API cập nhật mật khẩu
    const result = await changePassword(accountId, form.newPassword);

    if (result.success) {
      setToast({
        show: true,
        message: `Đổi mật khẩu cho tài khoản "${targetAccount?.username || accountId}" thành công!`,
        variant: 'success',
      });
      // Tự động điều hướng về trang quản lý tài khoản sau 1.5 giây
      setTimeout(() => {
        navigate('/admin/accounts');
      }, 1500);
    } else {
      setServerError(result.error || 'Có lỗi xảy ra khi cập nhật mật khẩu');
    }
  };

  return (
    <AdminLayout pageTitle="Đổi Mật Khẩu Tài Khoản">
      {/* Toast thông báo */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          delay={3000}
          autohide
          bg={toast.variant}
        >
          <Toast.Header>
            <strong className="me-auto">Hệ Thống Quản Trị</strong>
            <small>Vừa xong</small>
          </Toast.Header>
          <Toast.Body className="text-white fw-medium">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Nút quay lại */}
      <div className="mb-4">
        <Button
          variant="light"
          as={Link}
          to="/admin/accounts"
          className="border rounded-pill px-3 py-2 fw-semibold text-muted d-inline-flex align-items-center gap-2 shadow-sm"
        >
          <i className="bi bi-arrow-left"></i>
          <span>Quay lại Danh Sách Tài Khoản</span>
        </Button>
      </div>

      <Row className="justify-content-center">
        <Col xs={12} lg={8} xl={6}>
          {/* Card Thông Tin Tài Khoản */}
          {targetAccount && (
            <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                    style={{
                      width: '54px',
                      height: '54px',
                      background:
                        targetAccount.role === 'ADMIN'
                          ? '#ef4444'
                          : targetAccount.role === 'STAFF'
                          ? '#3b82f6'
                          : '#f59e0b',
                      fontSize: '1.25rem',
                    }}
                  >
                    {targetAccount.username ? targetAccount.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <h5 className="fw-bold mb-0 text-dark">{targetAccount.username}</h5>
                      <Badge
                        bg={
                          targetAccount.role === 'ADMIN'
                            ? 'danger'
                            : targetAccount.role === 'STAFF'
                            ? 'primary'
                            : 'warning'
                        }
                        className="rounded-pill px-2.5 py-1 text-uppercase"
                        style={{ fontSize: '0.72rem' }}
                      >
                        {targetAccount.role || 'CUSTOMER'}
                      </Badge>
                      <Badge
                        bg={targetAccount.status === 'ACTIVE' ? 'success' : 'secondary'}
                        className="rounded-pill px-2.5 py-1"
                        style={{ fontSize: '0.72rem' }}
                      >
                        {targetAccount.status === 'ACTIVE' ? 'Hoạt Động' : 'Đã Khóa'}
                      </Badge>
                    </div>
                    <div className="text-muted small mt-1">
                      <span>ID: #{targetAccount.id}</span>
                      {targetAccount.email && <span className="ms-3">• {targetAccount.email}</span>}
                      {targetAccount.phoneNumber && (
                        <span className="ms-3">• {targetAccount.phoneNumber}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Card Form Đổi Mật Khẩu (CHỈ MỖI MẬT KHẨU) */}
          <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            <Card.Header className="bg-white border-0 pt-4 px-4 pb-2">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning"
                  style={{ width: '40px', height: '40px' }}
                >
                  <i className="bi bi-shield-lock-fill fs-5"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-dark">Thiết Lập Mật Khẩu Mới</h5>
                  <p className="text-muted small mb-0">
                    Cập nhật mật khẩu đăng nhập trực tiếp cho tài khoản này.
                  </p>
                </div>
              </div>
            </Card.Header>

            <Card.Body className="p-4 pt-3">
              {/* Thông báo lỗi server */}
              {serverError && (
                <Alert
                  variant="danger"
                  className="rounded-3 py-2.5 small d-flex align-items-center gap-2 mb-4"
                >
                  <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                  <div>{serverError}</div>
                </Alert>
              )}

              <Form onSubmit={handleSubmit} noValidate>
                {/* 1. Mật khẩu mới */}
                <Form.Group className="mb-3.5" controlId="newPassword">
                  <Form.Label className="small fw-semibold text-dark">
                    Mật khẩu mới <span className="text-danger">*</span>
                  </Form.Label>
                  <div className={`unified-input-group ${errors.password ? 'is-invalid' : ''}`}>
                    <span className="unified-input-icon">
                      <i className="bi bi-key"></i>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      value={form.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      className="unified-input-control"
                    />
                    <button
                      type="button"
                      className="unified-input-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} fs-6`}></i>
                    </button>
                  </div>
                  {errors.password && (
                    <div className="text-danger small mt-1.5">
                      <i className="bi bi-exclamation-circle-fill me-1"></i>
                      {errors.password}
                    </div>
                  )}
                </Form.Group>

                {/* 2. Xác nhận mật khẩu mới */}
                <Form.Group className="mb-4" controlId="confirmPassword">
                  <Form.Label className="small fw-semibold text-dark">
                    Xác nhận mật khẩu mới <span className="text-danger">*</span>
                  </Form.Label>
                  <div className={`unified-input-group ${errors.confirmPassword ? 'is-invalid' : ''}`}>
                    <span className="unified-input-icon">
                      <i className="bi bi-shield-check"></i>
                    </span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu mới vừa nhập"
                      value={form.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="unified-input-control"
                    />
                    <button
                      type="button"
                      className="unified-input-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      <i
                        className={`bi ${
                          showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'
                        } fs-6`}
                      ></i>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="text-danger small mt-1.5">
                      <i className="bi bi-exclamation-circle-fill me-1"></i>
                      {errors.confirmPassword}
                    </div>
                  )}
                </Form.Group>

                {/* Các nút hành động */}
                <div className="d-flex align-items-center justify-content-end gap-2.5 pt-2 border-top">
                  <Button
                    variant="light"
                    as={Link}
                    to="/admin/accounts"
                    disabled={submitting}
                    className="border rounded-pill px-4 py-2 text-muted fw-semibold"
                  >
                    Hủy Bỏ
                  </Button>
                  <Button
                    type="submit"
                    variant="warning"
                    disabled={submitting}
                    className="rounded-pill px-4 py-2 fw-bold text-dark shadow-sm d-flex align-items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        <span>Đang Cập Nhật...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle-fill"></i>
                        <span>Cập Nhật Mật Khẩu</span>
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
}

export default AdminChangePasswordPage;
