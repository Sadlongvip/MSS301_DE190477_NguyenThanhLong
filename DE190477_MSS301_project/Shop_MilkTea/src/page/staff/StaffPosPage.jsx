import React, { useState, useContext, useMemo, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  InputGroup,
  Modal,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { InventoryContext } from '../../context/InventoryContext';
import { AuthContext } from '../../context/AuthContext';
import ProductDetailModal from '../../component/landing/ProductDetailModal';
import orderService from '../../service/orderService';
import { formatPrice } from '../../util/formatPrice';

const DEFAULT_TEA_IMAGE =
  'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=600&q=80';

const QUICK_CASH_OPTIONS = [50000, 100000, 200000, 500000];

/**
 * Trang Gọi Món Tại Quầy (Point of Sale - POS) Toàn Màn Hình
 * Thiết kế chuyên dụng cho Nhân viên (STAFF) và Quản trị viên (ADMIN)
 * Đã tối ưu triệt để toàn bộ khoảng cách (padding/margin/gap) để không bị dính khung.
 */
export function StaffPosPage() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const {
    categories,
    milkTeas,
    loading: loadingMenu,
    fetchMilkTeas,
    fetchCategories,
  } = useContext(InventoryContext);

  // Đồng hồ hiển thị thời gian thực cho ca trực
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // State bộ lọc thực đơn tại quầy
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // State Modal tùy chỉnh ly trà sữa (Size, Đường, Đá, Topping)
  const [customizingProduct, setCustomizingProduct] = useState(null);

  // State Giỏ hàng POS
  const [posCart, setPosCart] = useState([]);

  // State thông tin đơn tại quầy
  const [customerName, setCustomerName] = useState('Khách tại quầy');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderType, setOrderType] = useState('DINE_IN'); // 'DINE_IN' hoặc 'TAKE_AWAY'
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' = Tiền mặt, 'VNPAY' = Quét QR VNPay
  const [orderNote, setOrderNote] = useState('');

  // State tính tiền mặt thối lại
  const [cashGiven, setCashGiven] = useState('');

  // State xử lý tạo đơn & Hóa đơn in ấn
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Làm mới thực đơn
  const handleRefreshMenu = async () => {
    setRefreshing(true);
    try {
      if (fetchMilkTeas) await fetchMilkTeas();
      if (fetchCategories) await fetchCategories();
    } catch (err) {
      console.error('Lỗi khi làm mới menu:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Đăng xuất và điều hướng
  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi ca làm việc không?')) {
      logout();
      navigate('/');
    }
  };

  // Lọc danh sách trà sữa theo Category và Keyword tìm kiếm
  const filteredMilkTeas = useMemo(() => {
    let list = milkTeas || [];
    if (selectedCategoryId !== 'ALL') {
      list = list.filter((item) => String(item.categoryId) === String(selectedCategoryId));
    }
    if (searchKeyword.trim()) {
      const q = searchKeyword.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.categoryName && item.categoryName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [milkTeas, selectedCategoryId, searchKeyword]);

  // Thêm món từ Modal tùy chỉnh vào giỏ POS
  const handleAddToCartFromModal = (customizedItem) => {
    const toppingKeys = (customizedItem.toppings || []).slice().sort().join('-');
    const cartItemId = `${customizedItem.id}_${customizedItem.size}_${customizedItem.sugar}_${customizedItem.ice}_${toppingKeys}`;

    setPosCart((prevCart) => {
      const existingIndex = prevCart.findIndex((it) => it.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const nextCart = [...prevCart];
        const current = nextCart[existingIndex];
        const newQty = current.quantity + customizedItem.quantity;
        nextCart[existingIndex] = {
          ...current,
          quantity: newQty,
          totalPrice: current.unitPrice * newQty,
        };
        return nextCart;
      }
      return [
        ...prevCart,
        {
          ...customizedItem,
          cartItemId,
        },
      ];
    });

    setCustomizingProduct(null);
  };

  // Cập nhật số lượng trong giỏ POS
  const handleUpdateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    setPosCart((prevCart) =>
      prevCart.map((it) =>
        it.cartItemId === cartItemId
          ? { ...it, quantity: newQty, totalPrice: it.unitPrice * newQty }
          : it
      )
    );
  };

  // Xóa món khỏi giỏ POS
  const handleRemoveItem = (cartItemId) => {
    setPosCart((prevCart) => prevCart.filter((it) => it.cartItemId !== cartItemId));
  };

  // Reset giỏ POS về đơn mới
  const handleClearCart = () => {
    setPosCart([]);
    setCustomerName('Khách tại quầy');
    setPhoneNumber('');
    setOrderType('DINE_IN');
    setPaymentMethod('COD');
    setOrderNote('');
    setCashGiven('');
    setErrorMessage('');
  };

  // Tính tổng số lượng và tổng tiền giỏ POS
  const totalQuantity = useMemo(
    () => posCart.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0),
    [posCart]
  );
  const totalAmount = useMemo(
    () => posCart.reduce((sum, it) => sum + (Number(it.totalPrice) || 0), 0),
    [posCart]
  );

  // Tính tiền thừa thối lại
  const changeAmount = useMemo(() => {
    const given = Number(cashGiven) || 0;
    if (given <= 0 || paymentMethod !== 'COD') return 0;
    return Math.max(0, given - totalAmount);
  }, [cashGiven, totalAmount, paymentMethod]);

  // Xử lý chốt đơn tại quầy
  const handleCheckoutAtCounter = async () => {
    if (posCart.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất 1 món trà sữa vào đơn.');
      return;
    }

    setSubmittingOrder(true);
    setErrorMessage('');

    try {
      const shippingAddress =
        orderType === 'TAKE_AWAY'
          ? 'Tại quầy - Khách mang về (Take-away)'
          : 'Tại quầy - Dùng tại quán (Dine-in)';

      const payload = {
        customerName: customerName.trim() || 'Khách tại quầy',
        phoneNumber: phoneNumber.trim() || '0900000000',
        shippingAddress,
        note: orderNote.trim(),
        shippingFee: 0,
        discountAmount: 0,
        paymentMethod,
        items: posCart.map((it) => ({
          milkTeaId: it.milkTeaId || it.id,
          milkTeaName: it.name || it.milkTeaName,
          size: it.size || 'M',
          sugar: it.sugar || '70%',
          ice: it.ice || '100%',
          toppings: Array.isArray(it.toppings) ? it.toppings.join(', ') : it.toppings || '',
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          image: it.image,
          note: it.note || '',
        })),
      };

      const createdOrder = await orderService.createOrder(payload);

      setCompletedOrder({
        ...createdOrder,
        orderType,
        cashGiven: Number(cashGiven) || totalAmount,
        changeAmount,
        items: [...posCart],
        cashier: user?.fullName || user?.username || 'Thu ngân quầy',
      });

      setShowReceiptModal(true);
      handleClearCart();
    } catch (err) {
      setErrorMessage(err.message || 'Lỗi khi tạo đơn hàng tại quầy, vui lòng thử lại.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // In hóa đơn trực tiếp
  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div
      className="d-flex flex-column vh-100 bg-light"
      style={{ overflow: 'hidden', fontFamily: 'inherit' }}
    >
      {/* ================= 1. HEADER POS CHUYÊN NGHIỆP ================= */}
      <header
        className="d-flex align-items-center justify-content-between px-3 px-md-4 py-2 border-bottom shadow-sm flex-shrink-0"
        style={{
          background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
          height: '64px',
          color: '#ffffff',
          zIndex: 1030,
        }}
      >
        {/* Logo & Tên Module */}
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0"
            style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            }}
          >
            <i className="bi bi-cup-straw fs-5"></i>
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold fs-5 text-white lh-1">MilkTea POS</span>
              <Badge bg="success" pill style={{ fontSize: '0.68rem', padding: '4px 10px' }}>
                <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>TRỰC TUYẾN
              </Badge>
            </div>
            <small className="text-secondary d-none d-sm-block mt-1" style={{ fontSize: '0.72rem' }}>
              CỔNG THU NGÂN & GỌI MÓN TẠI QUẦY
            </small>
          </div>
        </div>

        {/* Giữa: Đồng hồ thời gian thực */}
        <div className="d-none d-lg-flex align-items-center gap-2 px-3 py-2 rounded-pill bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-light small">
          <i className="bi bi-clock-history text-warning"></i>
          <span className="fw-medium font-monospace">
            {currentTime.toLocaleTimeString('vi-VN')}
          </span>
          <span className="text-secondary">•</span>
          <span>
            {currentTime.toLocaleDateString('vi-VN', {
              weekday: 'short',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Phải: Thao tác & Thông tin nhân viên */}
        <div className="d-flex align-items-center gap-2">
          {/* Nút Làm mới Menu */}
          <Button
            variant="outline-light"
            size="sm"
            onClick={handleRefreshMenu}
            disabled={refreshing}
            className="rounded-pill px-3 py-2 border-opacity-25 d-flex align-items-center gap-2 small"
            title="Tải lại thực đơn mới nhất"
          >
            <i className={`bi bi-arrow-clockwise ${refreshing ? 'spin' : ''}`}></i>
            <span className="d-none d-md-inline">Làm Mới</span>
          </Button>

          {/* Nếu là ADMIN thì có nút qua Dashboard */}
          {user?.role === 'ADMIN' && (
            <Button
              variant="outline-warning"
              size="sm"
              onClick={() => navigate('/admin/dashboard')}
              className="rounded-pill px-3 py-2 border-opacity-50 d-flex align-items-center gap-2 small"
              title="Vào Trang Quản Trị"
            >
              <i className="bi bi-speedometer2"></i>
              <span className="d-none d-md-inline">Quản Trị</span>
            </Button>
          )}

          {/* Về trang cửa hàng khách */}
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => navigate('/')}
            className="rounded-pill px-3 py-2 border-opacity-25 d-flex align-items-center gap-2 small"
            title="Về Trang Chủ Khách Hàng"
          >
            <i className="bi bi-house"></i>
            <span className="d-none d-md-inline">Trang Chủ</span>
          </Button>

          {/* Thông tin nhân viên */}
          <div className="d-flex align-items-center gap-2 ps-2 border-start border-secondary border-opacity-25">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-dark fw-bold bg-warning"
              style={{ width: '34px', height: '34px', fontSize: '0.88rem' }}
            >
              {(user?.fullName || user?.username || 'S').charAt(0).toUpperCase()}
            </div>
            <div className="d-none d-xl-block text-start lh-sm">
              <span className="d-block fw-bold text-white small" style={{ maxWidth: '110px' }}>
                {user?.fullName || user?.username || 'Nhân viên'}
              </span>
              <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>
                {user?.role || 'STAFF'}
              </span>
            </div>
          </div>

          {/* Nút Đăng xuất */}
          <Button
            variant="danger"
            size="sm"
            onClick={handleLogout}
            className="rounded-pill p-2 px-3 ms-1 border-0"
            title="Đăng xuất ca trực"
          >
            <i className="bi bi-box-arrow-right"></i>
          </Button>
        </div>
      </header>

      {/* ================= 2. KHU VỰC CHÍNH (2 CỘT FULL SCREEN) ================= */}
      <div
        className="flex-grow-1 p-3"
        style={{
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
          backgroundColor: '#f1f5f9',
        }}
      >
        <Row className="g-3 h-100 m-0">
          {/* ================= CỘT TRÁI: THỰC ĐƠN QUÁN (65%) ================= */}
          <Col
            xs={12}
            lg={7}
            xl={8}
            className="h-100 d-flex flex-column pe-lg-2"
            style={{ minHeight: 0 }}
          >
            <Card className="border-0 shadow-sm rounded-4 h-100 d-flex flex-column p-3 bg-white">
              {/* Header tìm kiếm & Danh mục */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 pb-3 mb-2 border-bottom flex-shrink-0">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center bg-warning bg-opacity-25 text-warning"
                    style={{ width: '40px', height: '40px' }}
                  >
                    <i className="bi bi-cup-straw fs-5"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">Thực Đơn Trà Sữa</h5>
                    <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                      Chọn món để tùy chỉnh Size, Đường, Đá & Topping
                    </small>
                  </div>
                </div>

                {/* Thanh tìm kiếm nhanh */}
                <div style={{ maxWidth: '340px', width: '100%' }}>
                  <InputGroup size="sm" className="rounded-pill overflow-hidden border">
                    <InputGroup.Text className="bg-white border-0 ps-3">
                      <i className="bi bi-search text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Tìm theo tên món hoặc loại..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="border-0 shadow-none ps-2 py-2"
                    />
                    {searchKeyword && (
                      <Button
                        variant="link"
                        onClick={() => setSearchKeyword('')}
                        className="text-muted text-decoration-none border-0 pe-3"
                      >
                        <i className="bi bi-x-circle-fill"></i>
                      </Button>
                    )}
                  </InputGroup>
                </div>
              </div>

              {/* Danh mục dạng cuộn ngang */}
              <div
                className="d-flex gap-2 overflow-x-auto pb-2 mb-3 flex-shrink-0"
                style={{ whiteSpace: 'nowrap', scrollbarWidth: 'thin' }}
              >
                <Button
                  size="sm"
                  variant={selectedCategoryId === 'ALL' ? 'warning' : 'outline-secondary'}
                  className={`rounded-pill px-3 py-2 fw-bold ${
                    selectedCategoryId === 'ALL' ? 'text-dark shadow-sm' : 'border-opacity-50'
                  }`}
                  onClick={() => setSelectedCategoryId('ALL')}
                >
                  <i className="bi bi-grid-fill me-2"></i> Tất Cả ({milkTeas?.length || 0})
                </Button>
                {categories?.map((cat) => (
                  <Button
                    key={cat.id}
                    size="sm"
                    variant={
                      String(selectedCategoryId) === String(cat.id)
                        ? 'warning'
                        : 'outline-secondary'
                    }
                    className={`rounded-pill px-3 py-2 fw-bold ${
                      String(selectedCategoryId) === String(cat.id)
                        ? 'text-dark shadow-sm'
                        : 'border-opacity-50'
                    }`}
                    onClick={() => setSelectedCategoryId(cat.id)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>

              {/* Lưới sản phẩm (Có thanh cuộn riêng biệt) */}
              <div
                className="flex-grow-1 overflow-y-auto pe-1"
                style={{ minHeight: 0 }}
              >
                {loadingMenu ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="warning" />
                    <p className="text-muted small mt-2">Đang tải danh sách món...</p>
                  </div>
                ) : filteredMilkTeas.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-cup fs-1 d-block mb-2 text-secondary"></i>
                    <span>Không tìm thấy món trà sữa nào phù hợp.</span>
                  </div>
                ) : (
                  <Row className="g-3">
                    {filteredMilkTeas.map((tea) => (
                      <Col key={tea.id} xs={6} sm={4} md={4} xl={3}>
                        <div
                          onClick={() => tea.isAvailable !== false && setCustomizingProduct(tea)}
                          className={`p-3 rounded-4 border h-100 d-flex flex-column justify-content-between position-relative ${
                            tea.isAvailable === false
                              ? 'opacity-50 bg-light cursor-not-allowed'
                              : 'bg-white hover-card shadow-xs cursor-pointer'
                          }`}
                          style={{
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: '1px solid #e2e8f0',
                            padding: '14px',
                          }}
                        >
                          {/* Ảnh món */}
                          <div
                            className="position-relative mb-2 rounded-3 overflow-hidden bg-light"
                            style={{ height: '115px' }}
                          >
                            <img
                              src={tea.image || DEFAULT_TEA_IMAGE}
                              alt={tea.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = DEFAULT_TEA_IMAGE;
                              }}
                              className="w-100 h-100 object-fit-cover"
                            />
                            {tea.isAvailable === false ? (
                              <Badge
                                bg="secondary"
                                className="position-absolute top-0 start-0 m-2 rounded-pill shadow-sm"
                              >
                                Tạm hết
                              </Badge>
                            ) : (
                              <Badge
                                bg="dark"
                                className="position-absolute top-0 end-0 m-2 rounded-pill bg-opacity-75 shadow-sm"
                                style={{ fontSize: '0.68rem', padding: '4px 8px' }}
                              >
                                {tea.categoryName || 'Trà sữa'}
                              </Badge>
                            )}
                          </div>

                          {/* Thông tin & Giá */}
                          <div className="d-flex flex-column justify-content-between flex-grow-1">
                            <div
                              className="fw-bold text-dark text-truncate small mb-2"
                              title={tea.name}
                              style={{ fontSize: '0.86rem' }}
                            >
                              {tea.name}
                            </div>
                            <div className="d-flex justify-content-between align-items-center pt-1 border-top border-light">
                              <span className="fw-black text-danger fs-6 ps-1">
                                {formatPrice(tea.price)}
                              </span>
                              <Button
                                size="sm"
                                variant="warning"
                                className="rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  marginRight: '2px',
                                  marginBottom: '2px',
                                }}
                                disabled={tea.isAvailable === false}
                                title="Thêm vào đơn"
                              >
                                <i className="bi bi-plus text-dark fw-bold fs-5"></i>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            </Card>
          </Col>

          {/* ================= CỘT PHẢI: GIỎ HÀNG & THANH TOÁN (35%) ================= */}
          <Col
            xs={12}
            lg={5}
            xl={4}
            className="h-100 d-flex flex-column ps-lg-2"
            style={{ minHeight: 0 }}
          >
            <Card className="border-0 shadow-sm rounded-4 h-100 d-flex flex-column p-3 bg-white">
              {/* Header giỏ */}
              <div className="d-flex align-items-center justify-content-between pb-3 mb-2 border-bottom flex-shrink-0">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center bg-warning bg-opacity-25 text-warning"
                    style={{ width: '38px', height: '38px' }}
                  >
                    <i className="bi bi-receipt-cutoff fs-5"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark">Đơn Hàng Hiện Tại</h5>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {totalQuantity} món • {formatPrice(totalAmount)}
                    </small>
                  </div>
                </div>
                {posCart.length > 0 && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleClearCart}
                    className="rounded-pill px-3 py-2 border-0 small d-flex align-items-center gap-2"
                    title="Xóa toàn bộ giỏ đơn này"
                  >
                    <i className="bi bi-trash"></i>
                    <span>Hủy đơn</span>
                  </Button>
                )}
              </div>

              {/* Thông báo lỗi nếu có */}
              {errorMessage && (
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setErrorMessage('')}
                  className="rounded-3 py-2 px-3 small mb-2 flex-shrink-0"
                >
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {errorMessage}
                </Alert>
              )}

              {/* Danh sách các ly đã chọn (Cuộn độc lập) */}
              <div
                className="flex-grow-1 overflow-y-auto mb-2 pe-1"
                style={{ minHeight: '130px' }}
              >
                {posCart.length === 0 ? (
                  <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center py-4 text-muted">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center bg-light text-secondary mb-2"
                      style={{ width: '60px', height: '60px' }}
                    >
                      <i className="bi bi-cart-x fs-2"></i>
                    </div>
                    <span className="fw-medium small text-dark">Chưa có món nào trong đơn</span>
                    <p className="text-muted small mt-1 mb-0" style={{ fontSize: '0.78rem' }}>
                      Nhấp vào món ở cột thực đơn bên trái để thêm vào đơn.
                    </p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {posCart.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="p-3 rounded-3 bg-light border d-flex gap-2 align-items-center position-relative"
                      >
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span
                              className="fw-bold text-dark small text-truncate pe-2"
                              style={{ maxWidth: '170px' }}
                              title={item.name}
                            >
                              {item.name}
                            </span>
                            <span className="fw-bold text-danger small flex-shrink-0 ms-2">
                              {formatPrice(item.totalPrice)}
                            </span>
                          </div>

                          <div className="text-muted d-flex align-items-center gap-2 flex-wrap" style={{ fontSize: '0.75rem' }}>
                            <Badge bg="warning" text="dark" className="px-2 py-1">
                              Size {item.size}
                            </Badge>
                            <span>Đường: {item.sugar} • Đá: {item.ice}</span>
                          </div>

                          {item.toppings && item.toppings.length > 0 && (
                            <div className="text-secondary text-truncate mt-1" style={{ fontSize: '0.72rem' }}>
                              <i className="bi bi-plus text-warning me-1"></i>
                              {Array.isArray(item.toppings) ? item.toppings.join(', ') : item.toppings}
                            </div>
                          )}

                          {/* Bộ tăng giảm số lượng */}
                          <div className="d-flex align-items-center gap-2 mt-2">
                            <div
                              className="d-flex align-items-center bg-white rounded-pill border px-2 py-1 shadow-xs"
                              style={{ border: '1px solid #cbd5e1' }}
                            >
                              <Button
                                variant="light"
                                size="sm"
                                className="rounded-circle p-0 d-flex align-items-center justify-content-center text-dark border-0"
                                style={{ width: '26px', height: '26px', backgroundColor: '#f1f5f9' }}
                                onClick={() =>
                                  handleUpdateQuantity(item.cartItemId, item.quantity - 1)
                                }
                              >
                                <i className="bi bi-dash fw-bold fs-6"></i>
                              </Button>
                              <span
                                className="fw-bold px-3 text-dark fs-6"
                                style={{ minWidth: '40px', textAlign: 'center' }}
                              >
                                {item.quantity}
                              </span>
                              <Button
                                variant="warning"
                                size="sm"
                                className="rounded-circle p-0 d-flex align-items-center justify-content-center text-dark border-0"
                                style={{ width: '26px', height: '26px' }}
                                onClick={() =>
                                  handleUpdateQuantity(item.cartItemId, item.quantity + 1)
                                }
                              >
                                <i className="bi bi-plus fw-bold fs-6"></i>
                              </Button>
                            </div>
                            <span className="text-muted small ms-2" style={{ fontSize: '0.78rem' }}>
                              x {formatPrice(item.unitPrice)}
                            </span>
                            <button
                              className="btn btn-sm btn-link text-danger p-0 ms-auto text-decoration-none"
                              onClick={() => handleRemoveItem(item.cartItemId)}
                              title="Xóa món này"
                            >
                              <i className="bi bi-trash3 fs-6"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form chốt đơn & Thanh toán (Gắn ở đáy cột) */}
              <div className="border-top pt-3 mt-auto flex-shrink-0 small">
                {/* 1. Loại đơn: Dùng tại quán / Mang về */}
                <div className="d-flex gap-2 mb-2">
                  <Button
                    size="sm"
                    variant={orderType === 'DINE_IN' ? 'warning' : 'outline-secondary'}
                    className={`flex-grow-1 rounded-pill py-2 fw-bold ${
                      orderType === 'DINE_IN' ? 'text-dark shadow-sm' : 'border-opacity-50'
                    }`}
                    onClick={() => setOrderType('DINE_IN')}
                  >
                    <i className="bi bi-cup-hot me-2"></i>Dùng tại quán
                  </Button>
                  <Button
                    size="sm"
                    variant={orderType === 'TAKE_AWAY' ? 'warning' : 'outline-secondary'}
                    className={`flex-grow-1 rounded-pill py-2 fw-bold ${
                      orderType === 'TAKE_AWAY' ? 'text-dark shadow-sm' : 'border-opacity-50'
                    }`}
                    onClick={() => setOrderType('TAKE_AWAY')}
                  >
                    <i className="bi bi-bag-check me-2"></i>Mang về
                  </Button>
                </div>

                {/* 2. Tên khách & SĐT */}
                <Row className="g-2 mb-2">
                  <Col xs={7}>
                    <Form.Control
                      size="sm"
                      placeholder="Tên khách hàng"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="rounded-3 py-2 px-3"
                    />
                  </Col>
                  <Col xs={5}>
                    <Form.Control
                      size="sm"
                      placeholder="Số ĐT (tùy chọn)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="rounded-3 py-2 px-3"
                    />
                  </Col>
                </Row>

                {/* 3. Phương thức thanh toán */}
                <div className="d-flex gap-2 mb-2">
                  <Button
                    size="sm"
                    variant={paymentMethod === 'COD' ? 'dark' : 'outline-secondary'}
                    className="flex-grow-1 rounded-3 py-2 fw-semibold border-opacity-50"
                    onClick={() => setPaymentMethod('COD')}
                  >
                    <i className="bi bi-cash-stack me-2 text-warning"></i>Tiền Mặt
                  </Button>
                  <Button
                    size="sm"
                    variant={paymentMethod === 'VNPAY' ? 'primary' : 'outline-secondary'}
                    className="flex-grow-1 rounded-3 py-2 fw-semibold border-opacity-50"
                    onClick={() => setPaymentMethod('VNPAY')}
                  >
                    <i className="bi bi-qr-code me-2"></i>Quét VNPay
                  </Button>
                </div>

                {/* Nếu thanh toán Tiền mặt: Có gợi ý mệnh giá tiền nhanh */}
                {paymentMethod === 'COD' && (
                  <div className="bg-light p-3 rounded-3 border mb-2">
                    {/* Các nút bấm chọn tiền nhanh */}
                    <div className="d-flex gap-2 mb-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        className="py-1 px-3 rounded-pill border-opacity-50 text-dark fw-medium"
                        style={{ fontSize: '0.78rem' }}
                        onClick={() => setCashGiven(String(totalAmount))}
                      >
                        Đúng số tiền
                      </Button>
                      {QUICK_CASH_OPTIONS.map((amt) => (
                        <Button
                          key={amt}
                          size="sm"
                          variant="outline-secondary"
                          className="py-1 px-3 rounded-pill border-opacity-50 text-dark"
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => setCashGiven(String(amt))}
                        >
                          {amt / 1000}k
                        </Button>
                      ))}
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted fw-medium" style={{ fontSize: '0.82rem' }}>
                        Tiền khách đưa:
                      </span>
                      <Form.Control
                        size="sm"
                        type="number"
                        placeholder={String(totalAmount)}
                        value={cashGiven}
                        onChange={(e) => setCashGiven(e.target.value)}
                        className="rounded-3 text-end py-2 px-3 fw-bold fs-6 border"
                        style={{ width: '150px', height: '38px' }}
                      />
                    </div>
                    <div
                      className="d-flex justify-content-between align-items-center"
                      style={{ fontSize: '0.82rem' }}
                    >
                      <span className="text-muted">Tiền thối lại:</span>
                      <strong className="text-success fs-6">{formatPrice(changeAmount)}</strong>
                    </div>
                  </div>
                )}

                {/* 4. Tổng kết chi phí & Nút Chốt đơn */}
                <div className="d-flex justify-content-between align-items-center pt-2 border-top mb-2">
                  <span className="fw-bold text-dark fs-6">TỔNG CỘNG:</span>
                  <span className="fw-black text-danger fs-4 lh-1">
                    {formatPrice(totalAmount)}
                  </span>
                </div>

                <Button
                  variant="warning"
                  size="lg"
                  className="w-100 rounded-pill py-3 fw-bold text-dark shadow-sm d-flex align-items-center justify-content-center gap-2"
                  disabled={posCart.length === 0 || submittingOrder}
                  onClick={handleCheckoutAtCounter}
                >
                  {submittingOrder ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      <span>Đang xử lý đơn...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-printer-fill fs-5"></i>
                      <span>THANH TOÁN & IN HÓA ĐƠN</span>
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modal Tùy chỉnh topping khi chọn món */}
      <ProductDetailModal
        show={Boolean(customizingProduct)}
        product={customizingProduct}
        onHide={() => setCustomizingProduct(null)}
        onAddToCart={handleAddToCartFromModal}
      />

      {/* Modal Hóa đơn bán lẻ tại quầy (Receipt) */}
      <Modal
        show={showReceiptModal}
        onHide={() => setShowReceiptModal(false)}
        centered
        className="receipt-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5 text-dark d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill text-success"></i>
            <span>Tạo Đơn Thành Công</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" id="printable-receipt">
          {completedOrder && (
            <div
              className="p-3 bg-light rounded-4 border font-monospace text-dark"
              style={{ fontSize: '0.85rem' }}
            >
              {/* Tiêu đề tiệm */}
              <div className="text-center pb-2 border-bottom border-dark border-dashed mb-3">
                <h5 className="fw-bold mb-0 text-dark">SHOP MILK TEA</h5>
                <small className="text-muted d-block">Trà Sữa Đậm Vị Chuẩn Gu</small>
                <small className="text-muted d-block">Hotline: 1900 6868</small>
              </div>

              {/* Thông tin đơn */}
              <div className="d-flex justify-content-between mb-1">
                <span>Mã đơn:</span>
                <strong>#{completedOrder.orderCode}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Thời gian:</span>
                <span>{new Date().toLocaleString('vi-VN')}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Thu ngân:</span>
                <span>{completedOrder.cashier}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Khách hàng:</span>
                <span>{completedOrder.customerName}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Loại đơn:</span>
                <span className="badge bg-warning text-dark">
                  {completedOrder.orderType === 'TAKE_AWAY' ? 'Mang về' : 'Dùng tại quán'}
                </span>
              </div>

              {/* Bảng danh sách món */}
              <div className="border-top border-bottom border-dark border-dashed py-2 mb-2">
                <div
                  className="d-flex justify-content-between fw-bold pb-1 text-muted"
                  style={{ fontSize: '0.78rem' }}
                >
                  <span>Tên món</span>
                  <span>SL x Giá = Tiền</span>
                </div>
                {completedOrder.items?.map((it, idx) => (
                  <div key={idx} className="mb-2">
                    <div className="d-flex justify-content-between">
                      <span className="fw-bold">
                        {it.name} ({it.size})
                      </span>
                      <span>{formatPrice(it.totalPrice)}</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {it.quantity} x {formatPrice(it.unitPrice)}
                      {it.toppings &&
                        it.toppings.length > 0 &&
                        ` | +${
                          Array.isArray(it.toppings) ? it.toppings.join(', ') : it.toppings
                        }`}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tổng kết tiền */}
              <div className="d-flex justify-content-between mb-1">
                <span>Tạm tính tiền món:</span>
                <span>{formatPrice(completedOrder.subtotal || completedOrder.totalAmount)}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Phí dịch vụ / Ship:</span>
                <span className="text-success">0 đ</span>
              </div>
              <div className="d-flex justify-content-between fw-bold fs-6 py-1 border-top border-dark border-dashed mt-2">
                <span>TỔNG CỘNG:</span>
                <span className="text-danger">{formatPrice(completedOrder.totalAmount)}</span>
              </div>

              {completedOrder.paymentMethod === 'COD' ? (
                <>
                  <div className="d-flex justify-content-between text-muted mt-1">
                    <span>Tiền khách đưa:</span>
                    <span>{formatPrice(completedOrder.cashGiven)}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted">
                    <span>Tiền thối lại:</span>
                    <strong className="text-success">
                      {formatPrice(completedOrder.changeAmount)}
                    </strong>
                  </div>
                </>
              ) : (
                <div className="d-flex justify-content-between text-muted mt-1">
                  <span>Hình thức:</span>
                  <span className="badge bg-primary">VNPay QR / Chuyển khoản</span>
                </div>
              )}

              <div className="text-center pt-3 border-top border-dark border-dashed mt-3">
                <p className="mb-0 fw-semibold">Cảm ơn Quý khách & Hẹn gặp lại!</p>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                  Wi-Fi: ShopMilkTea | Pass: 88888888
                </small>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="outline-secondary"
            className="rounded-pill px-3 py-2"
            onClick={() => setShowReceiptModal(false)}
          >
            Đóng
          </Button>
          <Button
            variant="warning"
            className="rounded-pill px-4 py-2 fw-bold text-dark d-flex align-items-center gap-2"
            onClick={handlePrintReceipt}
          >
            <i className="bi bi-printer"></i>
            <span>In Phiếu (Ctrl+P)</span>
          </Button>
          {completedOrder?.paymentMethod === 'VNPAY' && completedOrder?.orderCode && (
            <Button
              variant="primary"
              className="rounded-pill px-3 py-2 fw-bold"
              onClick={() => navigate(`/payment/${completedOrder.orderCode}`)}
            >
              <i className="bi bi-qr-code me-1"></i>Xem Mã QR VNPay
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Style chuyên biệt cho máy in bill nhiệt POS (Print Receipt) & Animation */}
      <style>{`
        .hover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
          border-color: #f59e0b !important;
        }
        .spin {
          animation: spinAnimation 0.8s linear infinite;
        }
        @keyframes spinAnimation {
          100% { transform: rotate(360deg); }
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible !important;
          }
          #printable-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 320px !important;
            margin: 0 auto !important;
            padding: 10px !important;
            background: #ffffff !important;
            border: none !important;
            font-size: 11pt !important;
          }
          .modal-backdrop, .modal-header, .modal-footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default StaffPosPage;
