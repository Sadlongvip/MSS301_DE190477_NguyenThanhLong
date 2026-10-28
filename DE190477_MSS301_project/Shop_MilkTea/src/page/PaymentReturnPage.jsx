import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Container, Card, Button, Badge, Spinner } from 'react-bootstrap';
import MainLayout from '../layout/MainLayout';
import useCart from '../hook/useCart';
import paymentService from '../service/paymentService';

/**
 * PaymentReturnPage - Trang Tiếp Nhận Kết Quả Thanh Toán từ VNPay
 * Hứng URL callback: /payment/vnpay-return
 */
export function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { totalQuantity } = useCart();

  const [processing, setProcessing] = useState(true);
  const [ipnSynced, setIpnSynced] = useState(false);

  const responseCode = searchParams.get('vnp_ResponseCode');
  const txnRef = searchParams.get('vnp_TxnRef');
  const rawAmount = searchParams.get('vnp_Amount');
  const bankCode = searchParams.get('vnp_BankCode');
  const transactionNo = searchParams.get('vnp_TransactionNo');
  const orderInfo = searchParams.get('vnp_OrderInfo') || '';

  const isSuccess = responseCode === '00';
  const amount = rawAmount ? Math.round(Number(rawAmount) / 100) : 0;

  // Trích xuất mã đơn hàng từ OrderInfo nếu có
  const orderCodeMatch = orderInfo.match(/ORD-[A-Za-z0-9_-]+/i);
  const detectedOrderCode = orderCodeMatch ? orderCodeMatch[0] : null;

  useEffect(() => {
    // Tự động đồng bộ IPN với payment-service để đảm bảo DB luôn ghi nhận ngay
    const syncCallback = async () => {
      try {
        const allParams = Object.fromEntries(searchParams.entries());
        if (allParams.vnp_SecureHash) {
          await paymentService.processVNPayIpn(allParams);
          setIpnSynced(true);
        }
      } catch (err) {
        console.warn('Đồng bộ IPN cục bộ (có thể IPN đã được xử lý):', err.message);
      } finally {
        setProcessing(false);
      }
    };

    if (searchParams.get('vnp_ResponseCode')) {
      syncCallback();
    } else {
      setProcessing(false);
    }
  }, [searchParams]);

  return (
    <MainLayout cartCount={totalQuantity} onOpenCart={() => navigate('/cart')}>
      <div className="payment-return-wrapper py-5" style={{ background: '#f8fafc', minHeight: '80vh' }}>
        <Container style={{ maxWidth: '650px' }}>
          {processing ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="warning" style={{ width: '3rem', height: '3rem' }} />
              <p className="mt-3 text-muted fw-semibold">Đang xác thực kết quả thanh toán từ VNPay...</p>
            </div>
          ) : isSuccess ? (
            /* TRẠNG THÁI GIAO DỊCH THÀNH CÔNG */
            <Card className="border-0 shadow-sm rounded-5 p-4 p-md-5 text-center bg-white">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto mb-4 shadow"
                style={{
                  width: '96px',
                  height: '96px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#ffffff',
                  fontSize: '3.2rem',
                }}
              >
                <i className="bi bi-check-lg"></i>
              </div>

              <Badge bg="success" className="px-3 py-2 rounded-pill fs-6 fw-bold mb-2 align-self-center">
                THANH TOÁN THÀNH CÔNG
              </Badge>
              <h2 className="fw-bold text-dark mb-2">Giao Dịch Hoàn Tất!</h2>
              <p className="text-muted small mb-4">
                Khoản thanh toán của bạn đã được cổng VNPay xác nhận thành công.
                Cửa hàng đang tiến hành pha chế và giao hàng trong thời gian sớm nhất.
              </p>

              <div className="p-3 bg-light rounded-4 border mb-4 text-start small">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Mã giao dịch VNPay:</span>
                  <span className="fw-bold font-monospace text-dark">{transactionNo || '-'}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Mã tham chiếu:</span>
                  <span className="font-monospace text-dark">{txnRef || '-'}</span>
                </div>
                {bankCode && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Ngân hàng:</span>
                    <span className="fw-semibold text-dark">{bankCode}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Số tiền thanh toán:</span>
                  <span className="fw-bold text-success fs-5">{amount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Nội dung:</span>
                  <span className="text-muted text-end text-truncate" style={{ maxWidth: '240px' }}>
                    {orderInfo || 'Thanh toán đơn hàng'}
                  </span>
                </div>
              </div>

              <div className="d-flex justify-content-center gap-3 flex-wrap">
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
                  Tiếp Tục Đặt Thêm Món
                </Button>
              </div>
            </Card>
          ) : (
            /* TRẠNG THÁI GIAO DỊCH THẤT BẠI HOẶC BỊ HỦY */
            <Card className="border-0 shadow-sm rounded-5 p-4 p-md-5 text-center bg-white">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto mb-4 shadow"
                style={{
                  width: '96px',
                  height: '96px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#ffffff',
                  fontSize: '3rem',
                }}
              >
                <i className="bi bi-x-lg"></i>
              </div>

              <Badge bg="danger" className="px-3 py-2 rounded-pill fs-6 fw-bold mb-2 align-self-center">
                THANH TOÁN CHƯA HOÀN TẤT
              </Badge>
              <h2 className="fw-bold text-dark mb-2">Giao Dịch Bị Hủy / Thất Bại</h2>
              <p className="text-muted small mb-4">
                Bạn đã hủy giao dịch hoặc cổng thanh toán phản hồi không thành công (Mã lỗi: {responseCode || 'N/A'}).
                Đơn hàng của bạn vẫn được lưu ở trạng thái chưa thanh toán.
              </p>

              <div className="d-flex justify-content-center gap-3 flex-wrap">
                {detectedOrderCode ? (
                  <Button
                    variant="warning"
                    className="rounded-pill px-4 py-2.5 fw-bold shadow-sm text-dark d-flex align-items-center gap-2"
                    onClick={() => navigate(`/payment/${detectedOrderCode}`)}
                  >
                    <i className="bi bi-arrow-repeat"></i>
                    <span>Thử Thanh Toán Lại</span>
                  </Button>
                ) : (
                  <Button
                    variant="warning"
                    className="rounded-pill px-4 py-2.5 fw-bold shadow-sm text-dark d-flex align-items-center gap-2"
                    onClick={() => navigate('/orders')}
                  >
                    <i className="bi bi-receipt"></i>
                    <span>Vào Danh Sách Đơn Hàng</span>
                  </Button>
                )}
                <Button
                  variant="outline-secondary"
                  className="rounded-pill px-4 py-2.5 fw-semibold"
                  onClick={() => navigate('/cart')}
                >
                  Quay Lại Giỏ Hàng
                </Button>
              </div>
            </Card>
          )}
        </Container>
      </div>
    </MainLayout>
  );
}

export default PaymentReturnPage;
