import React, { useState } from 'react';
import { Card, Form, Button, ProgressBar, Alert, Badge } from 'react-bootstrap';

/**
 * Component Tóm Tắt Đơn Hàng & Tính Chi Phí cho Trang Giỏ Hàng
 */
export function CartSummaryCard({
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
  onApplyVoucher,
  onRemoveVoucher,
  onCheckout,
}) {
  const [voucherInput, setVoucherInput] = useState('');

  const handleApply = (e) => {
    e.preventDefault();
    if (voucherInput.trim()) {
      onApplyVoucher(voucherInput.trim());
      setVoucherInput('');
    }
  };

  const handleQuickVoucher = (code) => {
    onApplyVoucher(code);
  };

  return (
    <Card className="border-0 shadow-sm rounded-4 p-4 cart-summary-card sticky-top" style={{ top: '100px' }}>
      <h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
        <i className="bi bi-receipt-cutoff text-warning"></i>
        <span>Tóm Tắt Đơn Hàng</span>
      </h5>

      {/* 1. Thanh tiến trình Free Shipping */}
      <div className="p-3 rounded-4 mb-3 bg-light border border-warning-subtle free-shipping-box">
        <div className="d-flex justify-content-between align-items-center mb-1 small">
          <span className="fw-bold text-dark d-flex align-items-center gap-1">
            <i className="bi bi-truck text-warning"></i>
            {isFreeShipping ? 'Miễn phí vận chuyển' : 'Freeship đơn từ 120.000đ'}
          </span>
          <span className="fw-semibold" style={{ color: isFreeShipping ? '#16a34a' : '#d97706' }}>
            {freeShippingProgress}%
          </span>
        </div>

        <ProgressBar
          now={freeShippingProgress}
          variant={isFreeShipping ? 'success' : 'warning'}
          className="rounded-pill my-2"
          style={{ height: '8px' }}
        />

        <div className="text-muted" style={{ fontSize: '0.76rem' }}>
          {isFreeShipping ? (
            <span className="text-success fw-bold">
              <i className="bi bi-check-circle-fill me-1"></i> Chúc mừng! Đơn hàng của bạn được Freeship 0đ.
            </span>
          ) : (
            <span>
              Mua thêm <strong>{freeShippingRemaining.toLocaleString('vi-VN')} đ</strong> để được{' '}
              <strong className="text-warning">Freeship</strong>!
            </span>
          )}
        </div>
      </div>

      {/* 2. Nhập mã ưu đãi */}
      <div className="mb-3">
        <label className="form-label small fw-semibold text-muted mb-1">Mã Giảm Giá / Voucher</label>
        {appliedVoucher ? (
          <div className="d-flex justify-content-between align-items-center p-2 rounded-3 bg-success bg-opacity-10 border border-success-subtle">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-tag-fill text-success"></i>
              <div>
                <strong className="text-success small d-block">{appliedVoucher.code}</strong>
                <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                  {appliedVoucher.name} (-{discountAmount.toLocaleString('vi-VN')}đ)
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-link text-danger p-0 text-decoration-none fw-bold"
              onClick={onRemoveVoucher}
              title="Bỏ áp dụng mã"
            >
              <i className="bi bi-x-circle-fill"></i>
            </button>
          </div>
        ) : (
          <Form onSubmit={handleApply}>
            <div className="input-group">
              <input
                type="text"
                className="form-control rounded-start-pill ps-3 text-uppercase"
                placeholder="Nhập mã ưu đãi"
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
              <Button
                variant="warning"
                type="submit"
                className="rounded-end-pill px-3 fw-bold text-dark"
                style={{ fontSize: '0.85rem' }}
              >
                Áp Dụng
              </Button>
            </div>
            {voucherError && (
              <small className="text-danger mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-exclamation-circle me-1"></i>
                {voucherError}
              </small>
            )}

            {/* Gợi ý mã nhanh */}
            <div className="d-flex flex-wrap gap-1 mt-2">
              <span className="small text-muted me-1" style={{ fontSize: '0.72rem' }}>Gợi ý:</span>
              <button
                type="button"
                className="badge bg-white text-secondary border border-secondary-subtle rounded-pill text-decoration-none"
                onClick={() => handleQuickVoucher('FREESHIP')}
                style={{ cursor: 'pointer' }}
              >
                FREESHIP
              </button>
              <button
                type="button"
                className="badge bg-white text-secondary border border-secondary-subtle rounded-pill text-decoration-none"
                onClick={() => handleQuickVoucher('MILKTEA10')}
                style={{ cursor: 'pointer' }}
              >
                MILKTEA10 (-10%)
              </button>
              <button
                type="button"
                className="badge bg-white text-secondary border border-secondary-subtle rounded-pill text-decoration-none"
                onClick={() => handleQuickVoucher('SALE20K')}
                style={{ cursor: 'pointer' }}
              >
                SALE20K
              </button>
            </div>
          </Form>
        )}
      </div>

      <hr className="my-3 text-muted" />

      {/* 3. Bảng tổng hợp chi phí */}
      <div className="d-flex flex-column gap-2 small mb-3">
        <div className="d-flex justify-content-between text-muted">
          <span>Tạm tính ({totalQuantity} ly):</span>
          <span className="fw-semibold text-dark">{subTotal.toLocaleString('vi-VN')} đ</span>
        </div>

        <div className="d-flex justify-content-between text-muted">
          <span>Phí giao hàng:</span>
          <span>
            {shippingFee === 0 ? (
              <strong className="text-success">Miễn phí (0đ)</strong>
            ) : (
              <span className="fw-semibold text-dark">{shippingFee.toLocaleString('vi-VN')} đ</span>
            )}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="d-flex justify-content-between text-success fw-semibold">
            <span>Giảm giá voucher:</span>
            <span>-{discountAmount.toLocaleString('vi-VN')} đ</span>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-1">
          <div>
            <span className="fw-bold fs-6 text-dark d-block">Tổng thanh toán:</span>
            <small className="text-muted" style={{ fontSize: '0.72rem' }}>(Đã bao gồm VAT nếu có)</small>
          </div>
          <span className="fw-bold fs-4 text-danger">
            {finalTotal.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {/* 4. Nút Tiến Hành Đặt Hàng */}
      <Button
        className="w-100 btn-tea-primary py-3 rounded-pill fw-bold fs-6 shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3 checkout-btn"
        onClick={onCheckout}
        disabled={totalQuantity === 0}
      >
        <i className="bi bi-lightning-charge-fill"></i>
        <span>Tiến Hành Đặt Hàng</span>
      </Button>

      {/* 5. Cam kết khách hàng */}
      <div className="bg-light p-3 rounded-4 border">
        <div className="d-flex align-items-center gap-2 mb-2 text-muted small" style={{ fontSize: '0.76rem' }}>
          <i className="bi bi-clock-history text-warning fs-6"></i>
          <span>Giao nhanh trong <strong>30 phút</strong> đảm bảo đá không tan</span>
        </div>
        <div className="d-flex align-items-center gap-2 mb-2 text-muted small" style={{ fontSize: '0.76rem' }}>
          <i className="bi bi-shield-check text-success fs-6"></i>
          <span>Đảm bảo 100% nguyên liệu tự nhiên chuẩn vị</span>
        </div>
        <div className="d-flex align-items-center gap-2 text-muted small" style={{ fontSize: '0.76rem' }}>
          <i className="bi bi-arrow-repeat text-primary fs-6"></i>
          <span>Hỗ trợ đổi trả tức thì nếu sự cố đổ vỡ khi giao</span>
        </div>
      </div>
    </Card>
  );
}

export default CartSummaryCard;
