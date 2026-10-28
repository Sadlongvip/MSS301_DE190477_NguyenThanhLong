import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
  formatDateTime,
  formatCurrency,
} from '../../util/orderUtils';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=300&auto=format&fit=crop&q=80';

/**
 * OrderCard - Thẻ hiển thị tóm tắt một đơn hàng trong danh sách
 */
export function OrderCard({ order, onViewDetail, onCancelOrder, onReorder }) {
  const navigate = useNavigate();
  const statusCfg = ORDER_STATUS_CONFIG[order.status] || {
    label: order.status,
    badgeClass: 'bg-secondary text-white',
    icon: 'bi-question-circle',
  };

  const paymentStatusCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus] || {
    label: order.paymentStatus || 'Chưa thanh toán',
    badgeClass: 'border border-secondary text-secondary bg-light',
    icon: 'bi-hourglass-split',
  };

  const paymentMethodCfg = PAYMENT_METHOD_CONFIG[order.paymentMethod] || {
    label: order.paymentMethod || 'Tiền mặt (COD)',
    icon: 'bi-cash-coin',
  };

  const isPending = order.status === 'PENDING';
  const isCancelled = order.status === 'CANCELLED';

  return (
    <Card className="glass-card mb-3 border-0 shadow-sm overflow-hidden rounded-4">
      {/* Header đơn hàng */}
      <Card.Header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="fw-bold text-dark fs-6 d-flex align-items-center gap-1">
            <i className="bi bi-receipt text-warning"></i>
            <span>#{order.orderCode}</span>
          </span>
          <span className="text-muted small">•</span>
          <span className="text-muted small d-flex align-items-center gap-1">
            <i className="bi bi-clock"></i>
            <span>{formatDateTime(order.createdAt)}</span>
          </span>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Badge phương thức thanh toán */}
          <span
            className="badge rounded-pill bg-light text-secondary border px-2.5 py-1.5 small fw-normal d-inline-flex align-items-center gap-1"
            title="Phương thức thanh toán"
          >
            <i className={`bi ${paymentMethodCfg.icon} text-warning`}></i>
            <span>{paymentMethodCfg.label}</span>
          </span>

          {/* Badge trạng thái thanh toán */}
          <span
            className={`badge rounded-pill px-2.5 py-1.5 small fw-medium d-inline-flex align-items-center gap-1 ${paymentStatusCfg.badgeClass}`}
          >
            <i className={`bi ${paymentStatusCfg.icon}`}></i>
            <span>{paymentStatusCfg.label}</span>
          </span>

          {/* Badge trạng thái đơn hàng */}
          <Badge
            pill
            className={`px-3 py-1.5 fs-7 d-inline-flex align-items-center gap-1 shadow-xs ${statusCfg.badgeClass}`}
          >
            <i className={`bi ${statusCfg.icon}`}></i>
            <span>{statusCfg.label}</span>
          </Badge>
        </div>
      </Card.Header>

      {/* Body: Danh sách các món trong đơn hàng */}
      <Card.Body className="p-3 p-md-4">
        <div className="order-items-list mb-3">
          {order.items && order.items.length > 0 ? (
            order.items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="d-flex align-items-center justify-content-between py-2 border-bottom border-light gap-3"
              >
                {/* Ảnh và thông tin món */}
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={item.image || DEFAULT_IMAGE}
                    alt={item.milkTeaName}
                    className="rounded-3 object-fit-cover shadow-xs flex-shrink-0"
                    style={{ width: '56px', height: '56px' }}
                    onError={(e) => {
                      e.target.src = DEFAULT_IMAGE;
                    }}
                  />
                  <div>
                    <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.95rem' }}>
                      {item.milkTeaName}
                    </h6>
                    <div className="text-muted small d-flex flex-wrap gap-2 align-items-center">
                      <span className="badge bg-light text-dark border">Size {item.size || 'M'}</span>
                      {item.sugar && <span>Đường: {item.sugar}</span>}
                      {item.ice && <span>Đá: {item.ice}</span>}
                      {item.toppings && (
                        <span className="text-secondary">
                          <i className="bi bi-plus-circle me-1"></i>
                          {item.toppings}
                        </span>
                      )}
                    </div>
                    {item.note && (
                      <small className="text-warning d-block mt-1 fst-italic">
                        <i className="bi bi-chat-left-dots me-1"></i>
                        {item.note}
                      </small>
                    )}
                  </div>
                </div>

                {/* Số lượng và giá */}
                <div className="text-end flex-shrink-0">
                  <div className="text-muted small">x{item.quantity}</div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.92rem' }}>
                    {formatCurrency(item.totalPrice)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted small mb-0">Không có dữ liệu chi tiết món đồ uống.</p>
          )}
        </div>

        {/* Thông tin giao hàng & Lý do hủy nếu có */}
        <div className="row g-2 align-items-center small text-muted mb-2">
          <div className="col-12 col-md-7">
            <div className="d-flex align-items-center gap-1 text-truncate">
              <i className="bi bi-geo-alt-fill text-danger flex-shrink-0"></i>
              <span className="text-truncate">
                Giao đến: <strong className="text-dark">{order.customerName}</strong> ({order.phoneNumber}) - {order.shippingAddress}
              </span>
            </div>
          </div>
          {isCancelled && order.cancelReason && (
            <div className="col-12">
              <div className="p-2 rounded-3 bg-danger bg-opacity-10 text-danger small mt-1">
                <i className="bi bi-info-circle-fill me-1"></i>
                Lý do hủy: <strong>{order.cancelReason}</strong>
              </div>
            </div>
          )}
        </div>
      </Card.Body>

      {/* Footer: Tổng tiền & Thao tác */}
      <Card.Footer className="bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <span className="text-muted small d-block">Tổng số tiền thanh toán:</span>
          <span className="fw-bold fs-5 text-danger">{formatCurrency(order.totalAmount)}</span>
          {order.discountAmount > 0 && (
            <span className="badge bg-success bg-opacity-10 text-success ms-2 small">
              Tiết kiệm {formatCurrency(order.discountAmount)}
            </span>
          )}
        </div>

        {/* Các nút hành động */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Nút Quét QR Thanh Toán nếu là đơn VNPay chưa thanh toán */}
          {!isCancelled && order.paymentMethod === 'VNPAY' && order.paymentStatus !== 'PAID' && (
            <Button
              variant="warning"
              size="sm"
              className="rounded-pill px-3 fw-bold text-dark d-inline-flex align-items-center gap-1 shadow-sm"
              onClick={() => navigate(`/payment/${order.orderCode}`)}
            >
              <i className="bi bi-qr-code-scan"></i>
              <span>Quét QR Thanh Toán</span>
            </Button>
          )}

          {/* Nút Hủy đơn hàng: Chỉ khi đơn PENDING */}
          {isPending && (
            <Button
              variant="outline-danger"
              size="sm"
              className="rounded-pill px-3 fw-semibold d-inline-flex align-items-center gap-1"
              onClick={() => onCancelOrder(order)}
            >
              <i className="bi bi-x-circle"></i>
              <span>Hủy Đơn</span>
            </Button>
          )}

          {/* Nút Xem chi tiết */}
          <Button
            variant="outline-secondary"
            size="sm"
            className="rounded-pill px-3 fw-semibold d-inline-flex align-items-center gap-1"
            onClick={() => onViewDetail(order)}
          >
            <i className="bi bi-eye"></i>
            <span>Chi Tiết</span>
          </Button>

          {/* Nút Mua Lại (Re-order) */}
          <Button
            className="btn-tea-primary btn-sm rounded-pill px-3.5 fw-semibold d-inline-flex align-items-center gap-1 shadow-xs"
            onClick={() => onReorder(order)}
          >
            <i className="bi bi-arrow-repeat"></i>
            <span>Mua Lại</span>
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
}

export default OrderCard;
