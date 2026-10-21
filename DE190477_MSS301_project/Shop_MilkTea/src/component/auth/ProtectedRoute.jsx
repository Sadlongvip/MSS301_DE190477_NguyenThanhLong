import React, { useState } from 'react';
import { Container, Alert, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useAuth from '../../hook/useAuth';
import LoginModal from './LoginModal';

/**
 * ProtectedRoute - Bảo vệ các trang yêu cầu người dùng phải đăng nhập mới được xem
 * (Ví dụ: Trang Lịch sử Đơn hàng /orders)
 * Nếu chưa đăng nhập, hiển thị thông báo thân thiện và nút mở Modal đăng nhập ngay tại chỗ.
 */
export function ProtectedRoute({ children, title = 'Vui Lòng Đăng Nhập Để Tiếp Tục' }) {
  const { isAuthenticated, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="warning" role="status">
          <span className="visually-hidden">Đang kiểm tra thông tin tài khoản...</span>
        </Spinner>
        <p className="mt-3 text-muted small">Đang xác thực thông tin đăng nhập...</p>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-5" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center' }}>
        <Container style={{ maxWidth: '580px' }}>
          <div className="bg-white rounded-5 p-4 p-md-5 shadow-sm border text-center">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 shadow-sm"
              style={{
                width: '90px',
                height: '90px',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                color: '#d97706',
                fontSize: '2.5rem',
              }}
            >
              <i className="bi bi-shield-lock-fill"></i>
            </div>

            <h3 className="fw-bold text-dark mb-2">{title}</h3>
            <p className="text-muted small mb-4 px-md-3">
              Tính năng xem và theo dõi đơn hàng chỉ dành cho khách hàng đã đăng nhập. Vui lòng đăng nhập hoặc đăng ký tài khoản thành viên để xem lịch sử mua sắm của bạn.
            </p>

            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Button
                variant="light"
                as={Link}
                to="/"
                className="rounded-pill px-4 py-2 border fw-semibold text-secondary"
              >
                <i className="bi bi-arrow-left me-1"></i> Về Trang Chủ
              </Button>
              <Button
                className="btn-tea-primary rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2 shadow"
                onClick={() => setShowLoginModal(true)}
              >
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Đăng Nhập Ngay</span>
              </Button>
            </div>
          </div>

          {/* Modal Đăng Nhập / Đăng Ký */}
          <LoginModal
            show={showLoginModal}
            onHide={() => setShowLoginModal(false)}
            initialTab="login"
          />
        </Container>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
