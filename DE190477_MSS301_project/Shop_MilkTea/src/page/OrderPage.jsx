import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import useOrder from '../hook/useOrder';
import useCart from '../hook/useCart';
import OrderFilterTabs from '../component/order/OrderFilterTabs';
import OrderCard from '../component/order/OrderCard';
import OrderDetailModal from '../component/order/OrderDetailModal';
import CancelOrderModal from '../component/order/CancelOrderModal';

/**
 * OrderPage - Trang Quản lý Lịch sử Đơn hàng
 * Hiển thị danh sách các đơn hàng người dùng đã đặt, theo dõi trạng thái,
 * xem chi tiết, hủy đơn (nếu PENDING) và mua lại (Re-order).
 */
export function OrderPage() {
  const navigate = useNavigate();
  const { totalQuantity } = useCart();
  const {
    orders,
    filteredOrders,
    loading,
    error,
    searchKeyword,
    setSearchKeyword,
    setStatusFilter,
    fetchMyOrders,
    reorder,
    clearError,
  } = useOrder();

  // Luôn làm mới danh sách đơn hàng khi vào trang để đảm bảo dữ liệu mới nhất
  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  // State cho Modal chi tiết & Modal hủy đơn
  const [detailOrder, setDetailOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [cancelOrderTarget, setCancelOrderTarget] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // State thông báo mua lại thành công
  const [reorderNotification, setReorderNotification] = useState(null);

  const handleViewDetail = (order) => {
    setDetailOrder(order);
    setShowDetailModal(true);
  };

  const handleOpenCancelModal = (order) => {
    setCancelOrderTarget(order);
    setShowCancelModal(true);
  };

  const handleReorder = (order) => {
    const res = reorder(order);
    if (res.success) {
      setReorderNotification(`Đã thêm ${res.count} món từ đơn hàng #${order.orderCode} vào giỏ hàng!`);
      setTimeout(() => {
        setReorderNotification(null);
      }, 6000);
    }
  };

  return (
    <MainLayout cartCount={totalQuantity}>
      <div className="order-page-wrapper py-4 py-md-5" style={{ minHeight: '80vh' }}>
        <Container fluid="xl" className="px-3 px-xl-4">
          {/* Breadcrumb điều hướng */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb small">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none text-muted">
                  Trang Chủ
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/menu" className="text-decoration-none text-muted">
                  Thực Đơn
                </Link>
              </li>
              <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">
                Lịch Sử Đơn Hàng
              </li>
            </ol>
          </nav>

          {/* Tiêu đề trang & Thanh tìm kiếm / Làm mới */}
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <span className="p-2 rounded-3 bg-warning bg-opacity-10 text-warning d-inline-flex align-items-center justify-content-center">
                  <i className="bi bi-clock-history"></i>
                </span>
                <span>Đơn Hàng Của Bạn</span>
                {orders.length > 0 && (
                  <span className="badge bg-warning text-dark rounded-pill fs-6 px-3 py-1 ms-2">
                    {orders.length} đơn
                  </span>
                )}
              </h2>
              <p className="text-muted small mb-0">
                Theo dõi tiến độ pha chế, lộ trình giao hàng và quản lý toàn bộ đơn hàng của bạn
              </p>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              {/* Ô tìm kiếm đơn hàng */}
              <InputGroup style={{ maxWidth: '320px' }}>
                <InputGroup.Text className="bg-white border-end-0 rounded-start-pill text-muted">
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm mã đơn hoặc tên món..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="border-start-0 rounded-end-pill small shadow-none"
                />
                {searchKeyword && (
                  <Button
                    variant="link"
                    className="position-absolute end-0 top-50 translate-middle-y text-muted text-decoration-none z-3 pe-3"
                    onClick={() => setSearchKeyword('')}
                  >
                    <i className="bi bi-x"></i>
                  </Button>
                )}
              </InputGroup>

              {/* Nút Làm mới danh sách */}
              <Button
                variant="outline-secondary"
                size="sm"
                className="rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 shadow-sm"
                onClick={fetchMyOrders}
                disabled={loading}
                title="Cập nhật trạng thái đơn hàng mới nhất"
              >
                <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
                <span className="d-none d-sm-inline">Làm Mới</span>
              </Button>
            </div>
          </div>

          {/* Thông báo mua lại thành công */}
          {reorderNotification && (
            <Alert
              variant="success"
              dismissible
              onClose={() => setReorderNotification(null)}
              className="rounded-4 p-3 mb-4 shadow-sm border-0 d-flex align-items-center justify-content-between flex-wrap gap-2"
            >
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill fs-5 text-success"></i>
                <span className="fw-medium text-dark small">{reorderNotification}</span>
              </div>
              <Button
                size="sm"
                className="btn-tea-primary rounded-pill px-3 fw-semibold py-1 small"
                onClick={() => navigate('/cart')}
              >
                <i className="bi bi-bag-check me-1"></i> Xem Giỏ Hàng Ngay
              </Button>
            </Alert>
          )}

          {/* Thông báo lỗi khi tải dữ liệu */}
          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={clearError}
              className="rounded-4 p-3 mb-4 shadow-sm border-0 d-flex align-items-center justify-content-between flex-wrap gap-2"
            >
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill fs-5 text-danger"></i>
                <span className="small">{error}</span>
              </div>
              <Button
                variant="outline-danger"
                size="sm"
                className="rounded-pill px-3 py-1 small"
                onClick={fetchMyOrders}
              >
                Thử Lại
              </Button>
            </Alert>
          )}

          {/* Thanh lọc trạng thái đơn hàng */}
          <OrderFilterTabs />

          {/* Thân trang: Loading / Trống / Danh sách đơn hàng */}
          {loading && orders.length === 0 ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="warning" role="status">
                <span className="visually-hidden">Đang tải danh sách đơn hàng...</span>
              </Spinner>
              <p className="mt-3 text-muted small">Đang lấy lịch sử đơn hàng của bạn...</p>
            </div>
          ) : orders.length === 0 ? (
            /* TRƯỜNG HỢP CHƯA ĐẶT ĐƠN NÀO */
            <div className="text-center py-5 px-3 bg-white rounded-5 shadow-sm border my-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-sm"
                style={{
                  width: '110px',
                  height: '110px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  color: '#d97706',
                  fontSize: '3rem',
                }}
              >
                <i className="bi bi-cup-straw"></i>
              </div>
              <h3 className="fw-bold text-dark mb-2">Bạn Chưa Đặt Đơn Hàng Nào</h3>
              <p className="text-muted mx-auto mb-4" style={{ maxWidth: '480px' }}>
                Khám phá thực đơn trà sữa thơm béo, đậm vị cùng hàng chục loại topping hấp dẫn đang chờ bạn thưởng thức ngay hôm nay!
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Button
                  className="btn-tea-primary rounded-pill px-4 py-2.5 fw-bold d-inline-flex align-items-center gap-2 shadow"
                  onClick={() => navigate('/menu')}
                >
                  <i className="bi bi-compass"></i>
                  <span>Khám Phá Thực Đơn Ngay</span>
                </Button>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            /* TRƯỜNG HỢP BỘ LỌC KHÔNG CÓ KẾT QUẢ */
            <div className="text-center py-5 px-3 bg-white rounded-5 shadow-sm border my-4">
              <div className="fs-1 text-muted mb-2">
                <i className="bi bi-search"></i>
              </div>
              <h4 className="fw-bold text-dark mb-1">Không Tìm Thấy Đơn Hàng Phù Hợp</h4>
              <p className="text-muted small mb-3">
                Không có đơn hàng nào khớp với từ khóa tìm kiếm hoặc tab trạng thái hiện tại.
              </p>
              <Button
                variant="outline-secondary"
                size="sm"
                className="rounded-pill px-3"
                onClick={() => {
                  setSearchKeyword('');
                  setStatusFilter('ALL');
                }}
              >
                Đặt Lại Bộ Lọc
              </Button>
            </div>
          ) : (
            /* DANH SÁCH CÁC ORDER CARD */
            <div className="order-cards-container">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.orderCode || order.id}
                  order={order}
                  onViewDetail={handleViewDetail}
                  onCancelOrder={handleOpenCancelModal}
                  onReorder={handleReorder}
                />
              ))}
            </div>
          )}
        </Container>
      </div>

      {/* Modal Xem chi tiết đơn hàng */}
      <OrderDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        order={detailOrder}
        onCancelOrder={handleOpenCancelModal}
        onReorder={handleReorder}
      />

      {/* Modal Xác nhận hủy đơn hàng */}
      <CancelOrderModal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        order={cancelOrderTarget}
      />
    </MainLayout>
  );
}

export default OrderPage;
