import React, { useContext } from 'react';
import { Container, Navbar, Nav, Button, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * AdminLayout - Bố cục chuyên biệt dành riêng cho phân hệ Quản Trị Viên (Admin Portal)
 * Bao gồm Sidebar điều hướng, Topbar với nút Xem Báo Cáo Nhanh và khu vực nội dung chính.
 */
export function AdminLayout({ children, pageTitle = 'Trang Quản Trị' }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      path: '/admin/dashboard',
      label: 'Tổng Quan Hệ Thống',
      icon: 'bi-speedometer2',
    },
    {
      path: '/staff/pos',
      label: 'Bán Hàng Tại Quầy',
      icon: 'bi-shop',
      badge: 'POS',
      badgeBg: 'success',
    },
    {
      path: '/admin/report',
      label: 'Báo Cáo & Thống Kê',
      icon: 'bi-pie-chart-fill',
      badge: 'Biểu đồ',
      badgeBg: 'warning',
    },
    {
      path: '/admin/menu',
      label: 'Quản Lý Thực Đơn',
      icon: 'bi-cup-hot-fill',
    },
    {
      path: '/admin/orders',
      label: 'Quản Lý Đơn Hàng',
      icon: 'bi-receipt-cutoff',
    },
    {
      path: '/admin/accounts',
      label: 'Quản Lý Tài Khoản',
      icon: 'bi-people-fill',
    },
  ];


  return (
    <div className="d-flex min-vh-100 bg-light" style={{ overflowX: 'hidden' }}>
      {/* 1. SIDEBAR BÊN TRÁI */}
      <aside
        className="text-white d-flex flex-column flex-shrink-0 p-3 shadow"
        style={{
          width: '280px',
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          height: '100vh',
          zIndex: 1020,
          overflowY: 'auto',
        }}
      >
        {/* Brand */}
        <div
          className="d-flex align-items-center gap-3 pb-3 mb-3 border-bottom border-secondary border-opacity-25"
          onClick={() => navigate('/admin/dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-sm"
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #d97706, #b45309)',
            }}
          >
            <i className="bi bi-shield-check fs-5"></i>
          </div>
          <div>
            <span className="fw-bold fs-6 text-white d-block lh-1">MilkTea Admin</span>
            <small className="text-warning fw-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>
              PORTAL QUẢN TRỊ VIÊN
            </small>
          </div>
        </div>

        {/* Danh sách điều hướng */}
        <Nav className="nav-pills flex-column mb-auto gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Nav.Item key={item.path}>
                <Nav.Link
                  onClick={() => navigate(item.path)}
                  className={`d-flex align-items-center justify-content-between px-3 py-2 rounded-3 text-nowrap ${
                    isActive
                      ? 'bg-warning text-dark fw-bold shadow-sm'
                      : 'text-light opacity-75 hover-opacity-100'
                  }`}
                  style={{
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className={`rounded-2 d-flex align-items-center justify-content-center me-3 flex-shrink-0 ${
                        isActive ? 'bg-dark bg-opacity-10' : 'bg-white bg-opacity-10'
                      }`}
                      style={{ width: '32px', height: '32px' }}
                    >
                      <i className={`bi ${item.icon} fs-6`}></i>
                    </div>
                    <span className="fw-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge bg={item.badgeBg || 'secondary'} pill style={{ fontSize: '0.68rem', padding: '4px 8px' }}>
                      {item.badge}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
            );
          })}
        </Nav>

        {/* Bottom Actions */}
        <div className="pt-3 mt-auto border-top border-secondary border-opacity-25 d-flex flex-column gap-2">
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => navigate('/')}
            className="d-flex align-items-center justify-content-center gap-2 rounded-3 text-start py-2.5 border-opacity-25"
            style={{ fontSize: '0.84rem' }}
          >
            <i className="bi bi-shop fs-6"></i>
            <span>Về Cửa Hàng Khách</span>
          </Button>
        </div>
      </aside>

      {/* 2. KHU VỰC NỘI DUNG CHÍNH (MAIN CONTENT) */}
      <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0, marginLeft: '280px' }}>
        {/* TOPBAR */}
        <Navbar
          bg="white"
          className="border-bottom px-4 py-2.5 d-flex align-items-center justify-content-between shadow-sm sticky-top"
          style={{ zIndex: 1010 }}
        >
          <div className="d-flex align-items-center gap-3">
            <h5 className="mb-0 fw-bold text-dark">{pageTitle}</h5>
          </div>

          <div className="d-flex align-items-center gap-3">


            {/* Thông tin Quản trị viên */}
            <div className="d-flex align-items-center gap-2 border-start ps-3">
              <div
                className="rounded-circle bg-warning text-dark fw-bold d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: '34px', height: '34px', fontSize: '0.85rem' }}
              >
                {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="d-none d-sm-block text-start lh-1">
                <span className="fw-bold text-dark d-block" style={{ fontSize: '0.85rem' }}>
                  {user?.username || 'Admin'}
                </span>
                <Badge bg="danger" style={{ fontSize: '0.65rem' }}>
                  ADMIN
                </Badge>
              </div>
            </div>
          </div>
        </Navbar>

        {/* PAGE CONTENT */}
        <main className="flex-grow-1 p-3 p-lg-4" style={{ backgroundColor: '#f8fafc' }}>
          <Container fluid className="px-0">
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
