import React, { useContext } from 'react';
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import { AuthContext } from '../../context/AuthContext';

/**
 * StaffRoute - Tuyến đường dành cho Nhân viên (STAFF) và Quản trị viên (ADMIN) thao tác tại quầy (POS)
 */
export function StaffRoute({ children }) {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Đang kiểm tra quyền truy cập...</span>
        </div>
      </Container>
    );
  }

  // Chưa đăng nhập hoặc vai trò không phải ADMIN hoặc STAFF
  if (!isAuthenticated || !user || !['ADMIN', 'STAFF'].includes(user.role)) {
    return (
      <Container className="py-5" style={{ maxWidth: '600px' }}>
        <Alert variant="danger" className="rounded-4 p-4 shadow-sm text-center">
          <div className="mb-3 text-danger" style={{ fontSize: '3rem' }}>
            <i className="bi bi-shield-lock-fill"></i>
          </div>
          <Alert.Heading className="fw-bold fs-4">Truy Cập Bị Từ Chối</Alert.Heading>
          <p className="text-muted small mb-4">
            Trang này chỉ dành cho Nhân viên hoặc Quản trị viên (STAFF/ADMIN). Bạn đang đăng nhập với quyền:{' '}
            <strong className="text-dark">{user?.role || 'Khách (Chưa đăng nhập)'}</strong>.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Button variant="outline-secondary" href="/" className="rounded-pill px-4">
              Về Trang Chủ
            </Button>
            <Button variant="warning" href="/menu" className="rounded-pill px-4 fw-bold">
              Xem Thực Đơn
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return children;
}

export default StaffRoute;

