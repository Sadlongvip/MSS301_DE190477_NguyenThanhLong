import React, { useContext } from 'react';
import { Navbar, Container, Nav, Button, Badge, Dropdown } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import useCart from '../../hook/useCart';

/**
 * Header Navigation Bar - Thanh điều hướng phong cách Glassmorphism
 * Thiết kế tinh gọn, font chữ chuẩn, chống ngắt dòng (text-nowrap)
 */
export function Header({ cartCount, onOpenCart, onOpenAuth }) {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { totalQuantity } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isMenu = location.pathname === '/menu';
  const isCart = location.pathname === '/cart';
  const isOrders = location.pathname === '/orders';

  const displayCartCount = cartCount !== undefined ? cartCount : totalQuantity;

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Navbar expand="lg" sticky="top" className="glass-nav py-2">
      <Container fluid="xl" className="px-3 px-xl-4">
        {/* Brand Logo */}
        <Navbar.Brand
          onClick={() => handleNavigate('/')}
          className="d-flex align-items-center gap-2 text-decoration-none me-3"
          style={{ cursor: 'pointer' }}
        >
          <div
            className="d-flex align-items-center justify-content-center text-white rounded-circle shadow-sm"
            style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #854d0e 0%, #d97706 100%)',
              fontSize: '1.05rem',
              flexShrink: 0,
            }}
          >
            <i className="bi bi-cup-hot-fill"></i>
          </div>
          <div>
            <span className="fw-bold fs-5 text-dark d-block lh-1 text-nowrap" style={{ letterSpacing: '-0.3px' }}>
              Shop <span style={{ color: '#d97706' }}>MilkTea</span>
            </span>
            <small className="text-muted d-block text-nowrap" style={{ fontSize: '0.65rem', letterSpacing: '0.04em' }}>
              TRÀ SỮA ĐẬM VỊ CHUẨN GU
            </small>
          </div>
        </Navbar.Brand>

        {/* Toggle button on Mobile */}
        <Navbar.Toggle aria-controls="main-navbar-nav" className="border-0 shadow-none p-1">
          <i className="bi bi-list fs-3 text-dark"></i>
        </Navbar.Toggle>

        <Navbar.Collapse id="main-navbar-nav">
          {/* Navigation Links: Chức năng chính của hệ thống */}
          <Nav className="mx-auto my-2 my-lg-0 gap-lg-1 gap-xl-2 fw-semibold align-items-center">
            {/* 1. Trang Chủ */}
            <Nav.Link
              onClick={() => handleNavigate('/')}
              className={`px-3 py-1.5 rounded-pill hover-link text-nowrap d-flex align-items-center ${
                isHome ? 'fw-bold text-warning active-nav' : 'text-dark'
              }`}
              style={{ fontSize: '0.88rem', cursor: 'pointer' }}
            >
              <i className="bi bi-house-door me-2 fs-6"></i>
              <span>Trang Chủ</span>
            </Nav.Link>

            {/* 2. Thực Đơn */}
            <Nav.Link
              onClick={() => handleNavigate('/menu')}
              className={`px-3 py-1.5 rounded-pill hover-link text-nowrap d-flex align-items-center ${
                isMenu ? 'fw-bold text-warning active-nav' : 'text-dark'
              }`}
              style={{ fontSize: '0.88rem', cursor: 'pointer' }}
            >
              <i className="bi bi-cup-hot me-2 fs-6"></i>
              <span>Thực Đơn</span>
            </Nav.Link>

            {/* 3. Giỏ Hàng */}
            <Nav.Link
              onClick={() => handleNavigate('/cart')}
              className={`px-3 py-1.5 rounded-pill hover-link text-nowrap d-flex align-items-center ${
                isCart ? 'fw-bold text-warning active-nav' : 'text-dark'
              }`}
              style={{ fontSize: '0.88rem', cursor: 'pointer' }}
            >
              <i className="bi bi-bag-heart me-2 fs-6"></i>
              <span>Giỏ Hàng</span>
              {displayCartCount > 0 && (
                <Badge
                  pill
                  bg="danger"
                  className="ms-2 px-1.5 py-0.5"
                  style={{ fontSize: '0.68rem' }}
                >
                  {displayCartCount}
                </Badge>
              )}
            </Nav.Link>

            {/* 4. Đơn Hàng (Lịch sử đặt món) */}
            <Nav.Link
              onClick={() => handleNavigate('/orders')}
              className={`px-3 py-1.5 rounded-pill hover-link text-nowrap d-flex align-items-center ${
                isOrders ? 'fw-bold text-warning active-nav' : 'text-dark'
              }`}
              style={{ fontSize: '0.88rem', cursor: 'pointer' }}
            >
              <i className="bi bi-receipt me-2 fs-6"></i>
              <span>Đơn Hàng</span>
            </Nav.Link>

            {/* 5. Gọi Món Tại Quầy (POS) cho STAFF và ADMIN */}
            {['ADMIN', 'STAFF'].includes(user?.role) && (
              <Nav.Link
                onClick={() => handleNavigate('/staff/pos')}
                className={`px-3 py-1.5 rounded-pill hover-link text-nowrap d-flex align-items-center ${
                  location.pathname === '/staff/pos' ? 'fw-bold text-success active-nav' : 'text-success fw-bold'
                }`}
                style={{ fontSize: '0.88rem', cursor: 'pointer' }}
              >
                <i className="bi bi-shop me-2 fs-6"></i>
                <span>Gọi Món (POS)</span>
              </Nav.Link>
            )}

            {/* 6. Quản Trị (Hiển thị riêng cho ADMIN) */}
            {user?.role === 'ADMIN' && (
              <Nav.Link
                onClick={() => handleNavigate('/admin/dashboard')}
                className={`px-3 py-1.5 rounded-pill hover-link text-nowrap d-flex align-items-center ${
                  location.pathname.startsWith('/admin') ? 'fw-bold text-danger active-nav' : 'text-danger fw-semibold'
                }`}
                style={{ fontSize: '0.88rem', cursor: 'pointer' }}
              >
                <i className="bi bi-shield-lock-fill me-2 fs-6"></i>
                <span>Quản Trị</span>
              </Nav.Link>
            )}
          </Nav>

          {/* Action Buttons: Auth - Bám về sát bên phải */}
          <div
            className="d-flex align-items-center gap-3 mt-2 mt-lg-0 flex-nowrap ms-auto justify-content-end"
            style={{ gap: '12px' }}
          >
            {/* Tài Khoản / Đăng Nhập / Tạo Tài Khoản */}
            {isAuthenticated && user ? (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  id="dropdown-user"
                  className="rounded-pill d-flex align-items-center py-1.5 px-3 border shadow-sm text-nowrap"
                  style={{ backgroundColor: '#fef3c7', borderColor: '#fcd34d', color: '#92400e', fontSize: '0.82rem' }}
                >
                  <i className="bi bi-person-circle fs-6 me-2"></i>
                  <span className="fw-bold me-1">{user.username || 'Thành viên'}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-lg border-0 rounded-4 mt-2 p-2">
                  <div className="px-3 py-2 border-bottom mb-2">
                    <p className="fw-bold mb-0 text-dark small">{user.username}</p>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>{user.email || 'Khách hàng thân thiết'}</small>
                  </div>
                  {['ADMIN', 'STAFF'].includes(user?.role) && (
                    <Dropdown.Item onClick={() => handleNavigate('/staff/pos')} className="rounded-3 py-1.5 small text-success fw-bold">
                      <i className="bi bi-shop me-2"></i> Gọi Món Tại Quầy (POS)
                    </Dropdown.Item>
                  )}
                  {user?.role === 'ADMIN' && (
                    <>
                      <Dropdown.Item onClick={() => handleNavigate('/admin/dashboard')} className="rounded-3 py-1.5 small text-danger fw-bold">
                        <i className="bi bi-speedometer2 me-2"></i> Báo Cáo & Quản Trị
                      </Dropdown.Item>
                      <Dropdown.Divider />
                    </>
                  )}
                  <Dropdown.Item onClick={() => handleNavigate('/cart')} className="rounded-3 py-1.5 small">
                    <i className="bi bi-cart3 me-2 text-warning"></i> Giỏ hàng ({displayCartCount})
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleNavigate('/orders')} className="rounded-3 py-1.5 small">
                    <i className="bi bi-receipt me-2 text-primary"></i> Đơn hàng của tôi
                  </Dropdown.Item>
                  <Dropdown.Item href="#favorites" className="rounded-3 py-1.5 small">
                    <i className="bi bi-heart me-2 text-danger"></i> Món yêu thích
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout} className="rounded-3 py-1.5 small text-danger">
                    <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

            ) : (
              <div className="d-flex align-items-center gap-2 flex-nowrap" style={{ gap: '8px' }}>
                {/* Nút Tạo tài khoản */}
                <Button
                  variant="outline-secondary"
                  onClick={() => onOpenAuth && onOpenAuth('register')}
                  className="rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center border shadow-sm text-nowrap"
                  style={{ fontSize: '0.82rem', borderColor: '#d1d5db', backgroundColor: '#fff', color: '#4b5563' }}
                  title="Tạo tài khoản thành viên mới"
                >
                  <i className="bi bi-person-plus text-warning fs-6 me-2"></i>
                  <span>Tạo tài khoản</span>
                </Button>

                {/* Nút Đăng nhập */}
                <Button
                  onClick={() => onOpenAuth && onOpenAuth('login')}
                  className="btn-tea-primary d-flex align-items-center text-nowrap px-3 py-1.5"
                  style={{ fontSize: '0.82rem' }}
                >
                  <i className="bi bi-person-fill fs-6 me-2"></i>
                  <span>Đăng Nhập</span>
                </Button>
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
