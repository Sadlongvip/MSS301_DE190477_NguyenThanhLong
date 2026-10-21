import React, { useState } from 'react';
import { Container, Row, Col, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import useCart from '../hook/useCart';
import useAuth from '../hook/useAuth';
import useOrder from '../hook/useOrder';
import CartItemRow from '../component/cart/CartItemRow';
import CartSummaryCard from '../component/cart/CartSummaryCard';
import LoginModal from '../component/auth/LoginModal';

/**
 * Trang Giỏ Hàng Chi Tiết (Cart Page)
 * Dành riêng cho User/Khách Hàng quản lý danh sách món, tùy chỉnh số lượng,
 * áp dụng mã giảm giá và hoàn tất đơn hàng.
 * Toàn bộ tương tác dữ liệu và API đơn hàng được điều phối thông qua useCart().
 */
export function CartPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    loading: cartLoading,
    totalQuantity,
    subTotal,
    shippingFee,
    isFreeShipping,
    freeShippingRemaining,
    freeShippingProgress,
    appliedVoucher,
    discountAmount,
    voucherError,
    finalTotal,
    updateQuantity,
    removeItem,
    clearCart,
    applyVoucher,
    removeVoucher,
    checkout,
  } = useCart();


  const { user, isAuthenticated } = useAuth();
  const { addNewOrder } = useOrder();

  // State quản lý Checkout & Modal
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  // Form đặt hàng
  const [customerName, setCustomerName] = useState(user?.username || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const handleOpenAuth = (tab = 'login') => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  // Mở modal đặt hàng
  const handleProceedCheckout = () => {
    if (!isAuthenticated) {
      handleOpenAuth('login');
      return;
    }
    setCustomerName(user?.username || '');
    setOrderError('');
    setShowCheckoutModal(true);
  };

  // Xử lý gửi đơn hàng (thông qua hàm checkout từ useCart, không gọi axios trực tiếp)
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setOrderError('Vui lòng nhập họ tên người nhận');
      return;
    }
    if (!phoneNumber.trim()) {
      setOrderError('Vui lòng nhập số điện thoại liên hệ');
      return;
    }
    if (!shippingAddress.trim()) {
      setOrderError('Vui lòng nhập địa chỉ nhận hàng chi tiết');
      return;
    }

    try {
      setSubmittingOrder(true);
      setOrderError('');

      const result = await checkout({
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        shippingAddress: shippingAddress.trim(),
        note: orderNote.trim(),
        paymentMethod,
      });

      if (result.success) {
        if (result.order) {
          // Cập nhật tức thì đơn mới vào Order state (0ms latency, không cần chờ reload)
          addNewOrder(result.order);
        }
        setOrderSuccess(result.order);
        setShowCheckoutModal(false);
      } else {
        setOrderError(result.error || 'Không thể tạo đơn hàng, vui lòng thử lại sau.');
      }
    } catch (err) {
      setOrderError(err.message || 'Không thể tạo đơn hàng, vui lòng thử lại sau.');
    } finally {
      setSubmittingOrder(false);
    }
  };


  return (
    <MainLayout
      cartCount={totalQuantity}
      onOpenCart={() => {}}
      onOpenAuth={handleOpenAuth}
    >
      <div className="cart-page-wrapper py-4 py-md-5">
        <Container fluid="xl" className="px-3 px-xl-4">
          {/* Breadcrumb */}
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
                Giỏ Hàng
              </li>
            </ol>
          </nav>

          {/* Tiêu đề trang */}
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <span className="p-2 rounded-3 bg-warning bg-opacity-10 text-warning d-inline-flex align-items-center justify-content-center">
                  <i className="bi bi-cart3"></i>
                </span>
                <span>Giỏ Hàng Của Bạn</span>
                {totalQuantity > 0 && (
                  <span className="badge bg-warning text-dark rounded-pill fs-6 px-3 py-1 ms-2">
                    {totalQuantity} món
                  </span>
                )}
              </h2>
              <p className="text-muted small mb-0">
                Xem lại danh sách món trà sữa yêu thích của bạn trước khi thanh toán
              </p>
            </div>

            {cartItems.length > 0 && (
              <Button
                variant="outline-danger"
                size="sm"
                className="rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm"
                onClick={() => setShowClearConfirm(true)}
              >
                <i className="bi bi-trash"></i>
                <span>Xóa toàn bộ giỏ</span>
              </Button>
            )}
          </div>

          {/* Thông báo đặt hàng thành công */}
          {orderSuccess && (
            <Alert variant="success" className="rounded-4 p-4 mb-4 shadow-sm border-0 bg-success bg-opacity-10">
              <div className="d-flex align-items-start gap-3">
                <div className="fs-1 text-success lh-1">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <div>
                  <h4 className="fw-bold text-success mb-1">Đặt Hàng Thành Công!</h4>
                  <p className="mb-2 text-dark">
                    Mã đơn hàng của bạn là:{' '}
                    <strong className="badge bg-success fs-6 ms-1">{orderSuccess.orderCode || 'ORD-SUCCESS'}</strong>
                  </p>
                  <p className="text-muted small mb-3">
                    Cảm ơn bạn đã lựa chọn Shop MilkTea! Nhân viên quầy pha chế đang chuẩn bị đơn và sẽ giao tới địa chỉ
                    của bạn trong vòng 30 phút.
                  </p>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button
                      variant="success"
                      className="rounded-pill px-4 fw-semibold d-inline-flex align-items-center gap-1.5"
                      onClick={() => {
                        setOrderSuccess(null);
                        navigate('/orders');
                      }}
                    >
                      <i className="bi bi-receipt"></i>
                      <span>Xem Đơn Hàng Của Bạn</span>
                    </Button>
                    <Button
                      variant="outline-success"
                      className="rounded-pill px-4"
                      onClick={() => {
                        setOrderSuccess(null);
                        navigate('/menu');
                      }}
                    >
                      Tiếp Tục Mua Hàng
                    </Button>
                  </div>
                </div>
              </div>
            </Alert>
          )}

          {/* Thân trang: Giỏ trống vs Giỏ có hàng */}
          {cartItems.length === 0 && !orderSuccess ? (
            /* TRẠNG THÁI GIỎ HÀNG TRỐNG */
            <div className="text-center py-5 px-3 bg-white rounded-5 shadow-sm border empty-cart-box my-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-sm"
                style={{
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  color: '#d97706',
                  fontSize: '3.5rem',
                }}
              >
                <i className="bi bi-cup-straw"></i>
              </div>
              <h3 className="fw-bold text-dark mb-2">Giỏ Hàng Của Bạn Đang Trống</h3>
              <p className="text-muted mx-auto mb-4" style={{ maxWidth: '460px' }}>
                Có vẻ như bạn chưa chọn ly trà sữa nào. Hãy ghé xem thực đơn phong phú với hàng chục hương vị đậm đà và
                topping giòn dai đang chờ bạn nhé!
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
          ) : (
            /* DANH SÁCH MÓN & TỔNG KẾT */
            <Row className="g-4">
              {/* Cột trái: Danh sách các món trong giỏ */}
              <Col lg={8}>
                <div className="cart-items-container">
                  {cartItems.map((item, idx) => (
                    <CartItemRow
                      key={item.cartItemId || idx}
                      item={item}
                      index={idx}
                      onUpdateQuantity={updateQuantity}
                      onRemoveItem={removeItem}
                    />
                  ))}
                </div>

                {/* Thanh điều hướng tiếp tục mua hàng */}
                <div className="d-flex justify-content-between align-items-center p-3 rounded-4 bg-white border mt-3 flex-wrap gap-2 shadow-sm">
                  <Button
                    variant="link"
                    className="text-decoration-none text-dark fw-bold d-inline-flex align-items-center gap-2 p-0"
                    onClick={() => navigate('/menu')}
                  >
                    <i className="bi bi-arrow-left"></i>
                    <span>Tiếp tục chọn thêm món khác</span>
                  </Button>
                  <span className="small text-muted">
                    Tổng cộng: <strong>{totalQuantity}</strong> món đồ uống
                  </span>
                </div>
              </Col>

              {/* Cột phải: Khối tóm tắt đơn hàng & thanh toán */}
              <Col lg={4}>
                <CartSummaryCard
                  totalQuantity={totalQuantity}
                  subTotal={subTotal}
                  shippingFee={shippingFee}
                  isFreeShipping={isFreeShipping}
                  freeShippingRemaining={freeShippingRemaining}
                  freeShippingProgress={freeShippingProgress}
                  appliedVoucher={appliedVoucher}
                  discountAmount={discountAmount}
                  voucherError={voucherError}
                  finalTotal={finalTotal}
                  onApplyVoucher={applyVoucher}
                  onRemoveVoucher={removeVoucher}
                  onCheckout={handleProceedCheckout}
                />
              </Col>
            </Row>
          )}
        </Container>
      </div>

      {/* Modal xác nhận xóa sạch giỏ hàng */}
      <Modal show={showClearConfirm} onHide={() => setShowClearConfirm(false)} centered className="rounded-4">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold fs-5 text-danger d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>Xác nhận xóa giỏ hàng</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-2 text-muted">
          Bạn có chắc chắn muốn xóa toàn bộ món đồ uống trong giỏ hàng không? Thao tác này không thể hoàn tác.
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" className="rounded-pill px-4" onClick={() => setShowClearConfirm(false)}>
            Hủy Bỏ
          </Button>
          <Button
            variant="danger"
            className="rounded-pill px-4 fw-bold"
            onClick={() => {
              clearCart();
              setShowClearConfirm(false);
            }}
          >
            Đồng Ý Xóa
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Đặt Hàng Nhanh (Checkout Modal) */}
      <Modal
        show={showCheckoutModal}
        onHide={() => !submittingOrder && setShowCheckoutModal(false)}
        centered
        size="lg"
        className="rounded-4"
      >
        <Modal.Header closeButton={!submittingOrder} className="border-bottom">
          <Modal.Title className="fw-bold fs-5 text-dark d-flex align-items-center gap-2">
            <i className="bi bi-bag-check-fill text-warning"></i>
            <span>Thông Tin Giao Hàng & Đặt Đơn</span>
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmitOrder}>
          <Modal.Body className="p-4">
            {orderError && (
              <Alert variant="danger" className="rounded-3 py-2 small mb-3">
                <i className="bi bi-exclamation-circle-fill me-2"></i>
                {orderError}
              </Alert>
            )}

            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group controlId="orderCustomerName">
                  <Form.Label className="small fw-bold">Họ và tên người nhận *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="rounded-3"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="orderPhoneNumber">
                  <Form.Label className="small fw-bold">Số điện thoại liên hệ *</Form.Label>
                  <Form.Control
                    type="tel"
                    required
                    placeholder="Ví dụ: 0912345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-3"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="orderShippingAddress" className="mb-3">
              <Form.Label className="small fw-bold">Địa chỉ giao hàng chi tiết *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, TP..."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="rounded-3"
              />
            </Form.Group>

            <Form.Group controlId="orderNote" className="mb-3">
              <Form.Label className="small fw-bold">Ghi chú giao hàng (nếu có)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Ví dụ: Giao trước 12h, gọi điện trước khi tới..."
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                className="rounded-3"
              />
            </Form.Group>

            {/* Phương thức thanh toán */}
            <div className="mb-3">
              <label className="small fw-bold mb-2 d-block">Hình thức thanh toán</label>
              <div className="d-flex flex-column gap-2">
                <label className="p-3 border rounded-3 d-flex align-items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <strong className="d-block text-dark small">Thanh toán khi nhận hàng (COD)</strong>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng
                    </small>
                  </div>
                </label>

                <label className="p-3 border rounded-3 d-flex align-items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={paymentMethod === 'VNPAY'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <strong className="d-block text-dark small">Thanh toán điện tử VNPay</strong>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Quét mã QR qua ứng dụng ngân hàng hoặc ví điện tử VNPay
                    </small>
                  </div>
                </label>
              </div>
            </div>

            {/* Tóm tắt tổng tiền */}
            <div className="p-3 rounded-3 bg-light border d-flex justify-content-between align-items-center">
              <div>
                <span className="small text-muted d-block">Tổng số tiền cần thanh toán:</span>
                <span className="small text-muted">
                  {cartItems.length} món • Phí ship: {shippingFee === 0 ? '0đ' : `${shippingFee.toLocaleString('vi-VN')}đ`}
                </span>
              </div>
              <span className="fw-bold fs-4 text-danger">{finalTotal.toLocaleString('vi-VN')} đ</span>
            </div>
          </Modal.Body>

          <Modal.Footer className="border-top">
            <Button
              variant="light"
              className="rounded-pill px-4"
              onClick={() => setShowCheckoutModal(false)}
              disabled={submittingOrder}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="btn-tea-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
              disabled={submittingOrder}
            >
              {submittingOrder ? (
                <>
                  <Spinner size="sm" animation="border" />
                  <span>Đang tạo đơn...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Xác Nhận Đặt Hàng</span>
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Đăng nhập / Đăng ký nếu khách chưa login */}
      <LoginModal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        initialTab={authTab}
      />
    </MainLayout>
  );
}

export default CartPage;
