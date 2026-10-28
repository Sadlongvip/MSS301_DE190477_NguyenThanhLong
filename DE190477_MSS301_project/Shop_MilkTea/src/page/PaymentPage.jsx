import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import MainLayout from '../layout/MainLayout';
import useCart from '../hook/useCart';
import paymentService from '../service/paymentService';
import orderService from '../service/orderService';

/**
 * PaymentPage - Trang Quét Mã QR & Thanh Toán Trực Tuyến qua Payment Service
 * Tích hợp VNPay Sandbox & VietQR động, tự động polling kiểm tra trạng thái thanh toán theo thời gian thực.
 */
export function PaymentPage() {
  const { orderCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { totalQuantity } = useCart();

  const [order, setOrder] = useState(location.state?.order || null);
  const [paymentData, setPaymentData] = useState(location.state?.paymentData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('PENDING'); // PENDING | SUCCESS | FAILED
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15 phút đếm ngược (900s)

  const pollingTimerRef = useRef(null);

  // 1. Tải thông tin đơn hàng và tạo link thanh toán nếu chưa có
  const initPayment = useCallback(async () => {
    if (!orderCode) {
      setError('Mã đơn hàng không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Lấy chi tiết đơn hàng
      const fetchDetailFn = orderService.getOrderDetail || orderService.getOrderByCode;
      let orderRes = location.state?.order;
      try {
        const remoteOrder = await fetchDetailFn(orderCode);
        if (remoteOrder) {
          orderRes = remoteOrder;
          setOrder(remoteOrder);
        }
      } catch (fetchErr) {
        if (!orderRes) {
          throw fetchErr;
        }
      }
      if (orderRes) {
        setOrder(orderRes);
      }

      // Nếu đơn đã thanh toán rồi
      if (orderRes.paymentStatus === 'PAID') {
        setPaymentStatus('SUCCESS');
        setLoading(false);
        return;
      }

      // Khởi tạo link thanh toán từ payment-service
      const totalPay = orderRes.totalAmount || (orderRes.subtotal + (orderRes.shippingFee || 0));
      const payRes = await paymentService.createPayment({
        orderCode: orderRes.orderCode,
        amount: totalPay,
        paymentMethod: 'VNPAY',
        orderInfo: `Thanh toan don hang ${orderRes.orderCode}`,
      });

      setPaymentData(payRes);
      if (payRes.status === 'SUCCESS') {
        setPaymentStatus('SUCCESS');
      }
    } catch (err) {
      console.error('Lỗi khởi tạo thanh toán:', err);
      setError(err.message || 'Không thể kết nối đến cổng thanh toán, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [orderCode]);

  useEffect(() => {
    initPayment();
  }, [initPayment]);

  // 2. Bộ đếm ngược 15 phút (thời gian hiệu lực của mã QR VNPay)
  useEffect(() => {
    if (paymentStatus === 'SUCCESS') return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentStatus]);

  // 3. Tự động kiểm tra trạng thái thanh toán (Polling mỗi 3 giây)
  const checkStatus = useCallback(async () => {
    if (!orderCode || paymentStatus === 'SUCCESS') return;
    try {
      const res = await paymentService.getPaymentStatus(orderCode);
      if (res && res.status === 'SUCCESS') {
        setPaymentStatus('SUCCESS');
        if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      } else if (res && res.status === 'FAILED') {
        setPaymentStatus('FAILED');
      }
    } catch {
      // Có thể order-service hoặc payment-service đang cập nhật, tiếp tục polling
    }
  }, [orderCode, paymentStatus]);

  useEffect(() => {
    if (paymentStatus !== 'SUCCESS' && !loading && !error) {
      pollingTimerRef.current = setInterval(checkStatus, 3000);
    }
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [checkStatus, paymentStatus, loading, error]);

  // Format thời gian đếm ngược mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sao chép link thanh toán
  const handleCopyLink = () => {
    if (paymentData?.paymentUrl) {
      navigator.clipboard.writeText(paymentData.paymentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Sao chép thẻ test
  const handleCopyCard = (cardNum) => {
    navigator.clipboard.writeText(cardNum);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  // Link QR code ảnh sắc nét sinh động
  const qrImageUrl = paymentData?.paymentUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=${encodeURIComponent(
        paymentData.paymentUrl
      )}`
    : '';

  return (
    <MainLayout cartCount={totalQuantity} onOpenCart={() => navigate('/cart')}>
      <div className="payment-page-wrapper py-4 py-md-5" style={{ background: '#f8fafc', minHeight: '85vh' }}>
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
                <Link to="/orders" className="text-decoration-none text-muted">
                  Đơn Hàng
                </Link>
              </li>
              <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">
                Thanh Toán Đơn #{orderCode}
              </li>
            </ol>
          </nav>

          {/* Khi đang tải dữ liệu ban đầu */}
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="warning" style={{ width: '3rem', height: '3rem' }} />
              <p className="mt-3 text-muted fw-semibold">Đang kết nối cổng thanh toán VNPay...</p>
            </div>
          )}

          {/* Thông báo lỗi nếu có */}
          {error && !loading && (
            <Alert variant="danger" className="rounded-4 p-4 shadow-sm border-0 mb-4">
              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-exclamation-octagon-fill fs-2 text-danger"></i>
                <div className="flex-grow-1">
                  <h5 className="fw-bold mb-1">Không Thể Khởi Tạo Thanh Toán</h5>
                  <p className="mb-0 small">{error}</p>
                </div>
                <Button variant="outline-danger" className="rounded-pill px-4" onClick={initPayment}>
                  Thử Lại
                </Button>
              </div>
            </Alert>
          )}

          {/* GIAO DIỆN KHI THANH TOÁN THÀNH CÔNG */}
          {paymentStatus === 'SUCCESS' && !loading && (
            <Card className="border-0 shadow-sm rounded-5 p-4 p-md-5 text-center bg-white mx-auto" style={{ maxWidth: '640px' }}>
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto mb-4 shadow"
                style={{
                  width: '96px',
                  height: '96px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#ffffff',
                  fontSize: '3rem',
                }}
              >
                <i className="bi bi-check-lg"></i>
              </div>
              <Badge bg="success" className="px-3 py-2 rounded-pill fs-6 fw-bold mb-2 align-self-center">
                GIAO DỊCH THÀNH CÔNG
              </Badge>
              <h2 className="fw-bold text-dark mb-2">Thanh Toán Hoàn Tất!</h2>
              <p className="text-muted small mb-4">
                Đơn hàng <strong className="text-dark">#{orderCode}</strong> đã được thanh toán thành công qua cổng điện tử.
                Quầy pha chế đang chuẩn bị những ly trà sữa thơm ngon nhất cho bạn.
              </p>

              <div className="p-3 bg-light rounded-4 border mb-4 text-start small">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Mã đơn hàng:</span>
                  <span className="fw-bold text-dark">#{orderCode}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Số tiền đã thanh toán:</span>
                  <span className="fw-bold text-success fs-6">
                    {order?.totalAmount?.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Phương thức:</span>
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2 py-1">
                    Cổng VNPay QR
                  </span>
                </div>
              </div>

              <div className="d-flex justify-content-center gap-3">
                <Button
                  variant="success"
                  className="rounded-pill px-4 py-2.5 fw-bold shadow-sm d-flex align-items-center gap-2"
                  onClick={() => navigate('/orders')}
                >
                  <i className="bi bi-receipt"></i>
                  <span>Xem Lịch Sử Đơn Hàng</span>
                </Button>
                <Button
                  variant="outline-secondary"
                  className="rounded-pill px-4 py-2.5 fw-semibold"
                  onClick={() => navigate('/menu')}
                >
                  Tiếp Tục Mua Hàng
                </Button>
              </div>
            </Card>
          )}

          {/* GIAO DIỆN QUÉT MÃ QR (KHI ĐANG CHỜ THANH TOÁN) */}
          {paymentStatus !== 'SUCCESS' && !loading && !error && (
            <Row className="g-4 align-items-start">
              {/* Cột trái: Khung hiển thị mã QR */}
              <Col lg={7}>
                <Card className="border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white text-center position-relative overflow-hidden">
                  {/* Dải màu nhận diện trên đầu card */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '6px',
                      background: 'linear-gradient(90deg, #d97706 0%, #2563eb 100%)',
                    }}
                  />

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src="https://sandbox.vnpayment.vn/paymentv2/Images/brands/logo.svg"
                        alt="VNPay"
                        style={{ height: '28px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <span className="fw-bold text-dark fs-5">VNPay-QR Thanh Toán</span>
                    </div>
                    <Badge bg="warning" text="dark" className="px-3 py-1.5 rounded-pill fw-bold small">
                      <i className="bi bi-clock-history me-1"></i> Còn {formatTime(countdown)}
                    </Badge>
                  </div>

                  <p className="text-muted small mb-4">
                    Sử dụng ứng dụng <strong>Ngân hàng</strong> hoặc <strong>Ví VNPay</strong> quét mã QR phía dưới để thanh toán nhanh chóng.
                  </p>

                  {/* Khung chứa ảnh mã QR */}
                  <div className="d-inline-flex flex-column align-items-center justify-content-center p-3 rounded-4 bg-light border shadow-sm mx-auto mb-3 position-relative">
                    {qrImageUrl ? (
                      <img
                        src={qrImageUrl}
                        alt="Mã QR Thanh Toán VNPay"
                        className="rounded-3 shadow-sm img-fluid"
                        style={{ width: '250px', height: '250px', objectFit: 'contain' }}
                      />
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center bg-white rounded-3"
                        style={{ width: '250px', height: '250px' }}
                      >
                        <Spinner animation="border" variant="warning" />
                      </div>
                    )}

                    {/* Logo trung tâm trang trí mã QR */}
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm border position-absolute"
                      style={{ width: '42px', height: '42px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                    >
                      <i className="bi bi-qr-code-scan text-primary fs-5"></i>
                    </div>
                  </div>

                  {/* Trạng thái chờ quét tự động polling */}
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-4 text-primary small fw-semibold">
                    <Spinner animation="grow" size="sm" variant="primary" />
                    <span>Hệ thống đang tự động lắng nghe giao dịch...</span>
                  </div>

                  {/* Các nút bấm hành động */}
                  <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                    {paymentData?.paymentUrl && (
                      <Button
                        as="a"
                        href={paymentData.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="primary"
                        className="rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
                      >
                        <i className="bi bi-box-arrow-up-right"></i>
                        <span>Mở Cổng VNPay Sandbox</span>
                      </Button>
                    )}
                    <Button
                      variant={copiedLink ? 'success' : 'outline-secondary'}
                      className="rounded-pill px-3 py-2 small fw-semibold d-flex align-items-center gap-1.5"
                      onClick={handleCopyLink}
                    >
                      <i className={copiedLink ? 'bi bi-check-lg' : 'bi bi-link-45deg'}></i>
                      <span>{copiedLink ? 'Đã chép link' : 'Sao chép link'}</span>
                    </Button>
                    <Button
                      variant="outline-warning"
                      className="rounded-pill px-3 py-2 small fw-semibold text-dark d-flex align-items-center gap-1.5"
                      onClick={checkStatus}
                      title="Kiểm tra trạng thái ngay"
                    >
                      <i className="bi bi-arrow-repeat"></i>
                      <span>Kiểm tra lại</span>
                    </Button>
                  </div>

                  {/* Hướng dẫn thanh toán 3 bước */}
                  <div className="text-start bg-light rounded-4 p-3 border small">
                    <strong className="d-block text-dark mb-2">
                      <i className="bi bi-info-circle-fill text-warning me-1"></i> Các bước quét mã:
                    </strong>
                    <ol className="mb-0 ps-3 text-muted">
                      <li className="mb-1">Mở ứng dụng Ngân hàng (MB, VCB, Techcombank, BIDV, ...) hoặc Ví VNPay.</li>
                      <li className="mb-1">Chọn tính năng <strong>Quét mã QR</strong> trên màn hình chính của ứng dụng.</li>
                      <li>Hướng camera vào mã QR ở trên để hoàn tất thanh toán.</li>
                    </ol>
                  </div>
                </Card>
              </Col>

              {/* Cột phải: Thông tin đơn hàng & Thẻ test sandbox */}
              <Col lg={5}>
                {/* Tóm tắt đơn hàng */}
                <Card className="border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                  <h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                    <i className="bi bi-receipt-cutoff text-warning"></i>
                    <span>Chi Tiết Đơn Hàng</span>
                  </h5>

                  <div className="d-flex flex-column gap-2 small pb-3 border-bottom">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Mã đơn hàng:</span>
                      <strong className="text-dark">#{orderCode}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Người nhận:</span>
                      <span className="text-dark fw-semibold">{order?.customerName || 'Khách hàng'}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Số điện thoại:</span>
                      <span className="text-dark">{order?.phoneNumber || '-'}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Địa chỉ nhận:</span>
                      <span className="text-dark text-end" style={{ maxWidth: '200px' }}>
                        {order?.shippingAddress || '-'}
                      </span>
                    </div>
                  </div>

                  {/* Danh sách món tóm tắt */}
                  {order?.items && order.items.length > 0 && (
                    <div className="py-3 border-bottom small">
                      <span className="text-muted d-block mb-2">Món đã đặt ({order.items.length} món):</span>
                      <div className="d-flex flex-column gap-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="d-flex justify-content-between align-items-center">
                            <span className="text-truncate text-dark" style={{ maxWidth: '190px' }}>
                              {item.quantity}x {item.milkTeaName} ({item.size})
                            </span>
                            <span className="text-muted fw-semibold">
                              {(item.unitPrice * item.quantity).toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Phí vận chuyển & Tổng tiền */}
                  <div className="pt-3 small d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between text-muted">
                      <span>Phí giao hàng:</span>
                      <span className="fw-semibold text-dark">
                        {order?.shippingFee ? `${order.shippingFee.toLocaleString('vi-VN')} đ` : '1.000 đ'}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                      <span className="fw-bold text-dark fs-6">Tổng thanh toán:</span>
                      <span className="fw-bold text-danger fs-4">
                        {(order?.totalAmount || paymentData?.amount || 0).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Hộp hỗ trợ tài khoản test VNPay Sandbox */}
                <Card className="border-0 shadow-sm rounded-4 p-4 bg-white border-start border-4 border-warning">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-shield-check text-warning fs-5"></i>
                    <strong className="text-dark small">Tài Khoản Thẻ Test Sandbox</strong>
                  </div>
                  <p className="text-muted" style={{ fontSize: '0.78rem' }}>
                    Nếu thanh toán qua cổng VNPay Sandbox trực tiếp, bạn có thể sử dụng thông tin thẻ thử nghiệm sau:
                  </p>
                  <div className="bg-light p-2.5 rounded-3 border small font-monospace d-flex flex-column gap-1">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Ngân hàng:</span>
                      <strong className="text-dark">NCB</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Số thẻ:</span>
                      <div className="d-flex align-items-center gap-1">
                        <strong className="text-primary">9704198526191432198</strong>
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-0 text-decoration-none"
                          onClick={() => handleCopyCard('9704198526191432198')}
                          title="Sao chép số thẻ"
                        >
                          <i className={copiedCard ? 'bi bi-check-lg text-success' : 'bi bi-clipboard'}></i>
                        </button>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Tên chủ thẻ:</span>
                      <strong className="text-dark">NGUYEN VAN A</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Ngày phát hành:</span>
                      <strong className="text-dark">07/15</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Mã OTP:</span>
                      <strong className="text-danger">123456</strong>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </MainLayout>
  );
}

export default PaymentPage;
