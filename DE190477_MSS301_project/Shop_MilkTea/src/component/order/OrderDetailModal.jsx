import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Badge, Row, Col, Table } from 'react-bootstrap';
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
 * OrderDetailModal - Modal hiển thị toàn diện thông tin chi tiết một đơn hàng
 */
export function OrderDetailModal({ show, onHide, order, onCancelOrder, onReorder }) {
  const navigate = useNavigate();
  if (!order) return null;

  const statusCfg = ORDER_STATUS_CONFIG[order.status] || {
    label: order.status,
    badgeClass: 'bg-secondary text-white',
    icon: 'bi-question-circle',
    desc: '',
  };

  const paymentStatusCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus] || {
    label: order.paymentStatus || 'Chưa thanh toán',
    badgeClass: 'border border-secondary text-secondary bg-light',
    icon: 'bi-hourglass-split',
  };

  const paymentMethodCfg = PAYMENT_METHOD_CONFIG[order.paymentMethod] || {
    label: order.paymentMethod || 'Tiền mặt khi nhận hàng (COD)',
    icon: 'bi-cash-coin',
  };

  const isPending = order.status === 'PENDING';
  const isCancelled = order.status === 'CANCELLED';

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="rounded-4">
      {/* Modal Header */}
      <Modal.Header closeButton className="border-bottom py-3 px-4">
        <Modal.Title className="fw-bold fs-5 text-dark d-flex align-items-center gap-2 flex-wrap">
          <i className="bi bi-receipt text-warning"></i>
          <span>Chi Tiết Đơn Hàng #{order.orderCode}</span>
          <Badge pill className={`ms-2 fs-7 px-3 py-1.5 ${statusCfg.badgeClass}`}>
            <i className={`bi ${statusCfg.icon} me-1`}></i>
            {statusCfg.label}
          </Badge>
        </Modal.Title>
      </Modal.Header>

      {/* Modal Body */}
      <Modal.Body className="p-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
        {/* Banner trạng thái */}
        <div
          className="p-3 rounded-4 mb-4 d-flex align-items-center gap-3"
          style={{
            backgroundColor: statusCfg.bgColor || '#fef3c7',
            color: statusCfg.color || '#92400e',
          }}
        >
          <div className="fs-3 lh-1">
            <i className={`bi ${statusCfg.icon}`}></i>
          </div>
          <div>
            <div className="fw-bold fs-6">Trạng thái: {statusCfg.label}</div>
            <small style={{ fontSize: '0.82rem' }}>
              {statusCfg.desc || 'Đơn hàng đang được cập nhật thông tin.'}
            </small>
          </div>
        </div>

        {/* Thông tin hủy nếu có */}
        {isCancelled && order.cancelReason && (
          <div className="alert alert-danger rounded-4 py-2 px-3 small mb-4">
            <i className="bi bi-x-octagon-fill me-2"></i>
            Lý do hủy đơn: <strong>{order.cancelReason}</strong>
          </div>
        )}

        {/* 2 Cột: Thông tin nhận hàng & Thông tin thanh toán */}
        <Row className="g-3 mb-4">
          <Col md={6}>
            <div className="p-3 rounded-4 bg-light border h-100">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-person-lines-fill text-warning"></i>
                <span>Thông Tin Nhận Hàng</span>
              </h6>
              <div className="small text-secondary mb-1">
                Người nhận: <strong className="text-dark">{order.customerName}</strong>
              </div>
              <div className="small text-secondary mb-1">
                Số điện thoại: <strong className="text-dark">{order.phoneNumber}</strong>
              </div>
              <div className="small text-secondary mb-1">
                Địa chỉ: <span className="text-dark">{order.shippingAddress}</span>
              </div>
              {order.note && (
                <div className="small text-secondary mt-2 p-2 rounded-3 bg-white border">
                  Ghi chú đơn: <em className="text-dark">{order.note}</em>
                </div>
              )}
            </div>
          </Col>

          <Col md={6}>
            <div className="p-3 rounded-4 bg-light border h-100">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-credit-card-2-front text-warning"></i>
                <span>Thanh Toán & Thời Gian</span>
              </h6>
              <div className="small text-secondary mb-1 d-flex justify-content-between">
                <span>Hình thức:</span>
                <strong className="text-dark">{paymentMethodCfg.label}</strong>
              </div>
              <div className="small text-secondary mb-1 d-flex justify-content-between align-items-center">
                <span>Trạng thái:</span>
                <span className={`badge rounded-pill px-2 py-1 ${paymentStatusCfg.badgeClass}`}>
                  {paymentStatusCfg.label}
                </span>
              </div>
              <div className="small text-secondary mb-1 d-flex justify-content-between">
                <span>Ngày đặt hàng:</span>
                <span className="text-dark">{formatDateTime(order.createdAt)}</span>
              </div>
              {order.updatedAt && (
                <div className="small text-secondary d-flex justify-content-between">
                  <span>Cập nhật lần cuối:</span>
                  <span className="text-dark">{formatDateTime(order.updatedAt)}</span>
                </div>
              )}
            </div>
          </Col>
        </Row>

        {/* Danh sách các món trong đơn hàng */}
        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <i className="bi bi-cup-hot-fill text-warning"></i>
          <span>Danh Sách Sản Phẩm ({order.items?.length || 0})</span>
        </h6>

        <div className="border rounded-4 overflow-hidden mb-4 bg-white">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light small text-secondary">
              <tr>
                <th className="py-2.5 px-3">Món đồ uống</th>
                <th className="py-2.5 px-2 text-center">Tùy chọn</th>
                <th className="py-2.5 px-2 text-center">Đơn giá</th>
                <th className="py-2.5 px-2 text-center">SL</th>
                <th className="py-2.5 px-3 text-end">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.length > 0 ? (
                order.items.map((it, idx) => (
                  <tr key={it.id || idx}>
                    <td className="py-2.5 px-3">
                      <div className="d-flex align-items-center gap-2.5">
                        <img
                          src={it.image || DEFAULT_IMAGE}
                          alt={it.milkTeaName}
                          className="rounded-3 object-fit-cover shadow-xs"
                          style={{ width: '48px', height: '48px' }}
                          onError={(e) => {
                            e.target.src = DEFAULT_IMAGE;
                          }}
                        />
                        <div>
                          <div className="fw-bold text-dark small">{it.milkTeaName}</div>
                          {it.note && (
                            <small className="text-warning fst-italic d-block" style={{ fontSize: '0.75rem' }}>
                              <i className="bi bi-chat-dots me-1"></i>
                              {it.note}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <div className="small text-muted" style={{ fontSize: '0.78rem' }}>
                        <div>Size: <strong>{it.size || 'M'}</strong></div>
                        <div>Đường: {it.sugar || '70%'} • Đá: {it.ice || '100%'}</div>
                        {it.toppings && <div className="text-secondary">{it.toppings}</div>}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center small text-secondary">
                      {formatCurrency(it.unitPrice)}
                    </td>
                    <td className="py-2.5 px-2 text-center fw-bold small text-dark">
                      {it.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-end fw-bold text-dark small">
                      {formatCurrency(it.totalPrice)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-3 text-muted small">
                    Không có sản phẩm trong đơn hàng
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Bảng hạch toán tài chính */}
        <div className="p-3.5 rounded-4 bg-light border">
          <div className="d-flex justify-content-between small text-secondary mb-2">
            <span>Tạm tính tiền hàng:</span>
            <span className="fw-semibold text-dark">{formatCurrency(order.subtotal)}</span>
          </div>

          <div className="d-flex justify-content-between small text-secondary mb-2">
            <span>Phí vận chuyển:</span>
            <span>
              {order.shippingFee === 0 ? (
                <span className="badge bg-success bg-opacity-10 text-success">Miễn phí ship</span>
              ) : (
                <span className="fw-semibold text-dark">{formatCurrency(order.shippingFee)}</span>
              )}
            </span>
          </div>

          {order.discountAmount > 0 && (
            <div className="d-flex justify-content-between small text-success mb-2">
              <span>
                Giảm giá voucher {order.voucherCode ? `(${order.voucherCode})` : ''}:
              </span>
              <span className="fw-semibold">-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}

          <hr className="my-2" />

          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold text-dark">Tổng cộng thanh toán:</span>
            <span className="fw-bold fs-4 text-danger">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </Modal.Body>

      {/* Modal Footer */}
      <Modal.Footer className="border-top py-3 px-4 d-flex justify-content-between flex-wrap gap-2">
        <Button variant="light" className="rounded-pill px-4 text-secondary" onClick={onHide}>
          Đóng
        </Button>

        <div className="d-flex gap-2">
          {/* Nút Quét QR nếu là đơn VNPay chưa thanh toán */}
          {!isCancelled && order.paymentMethod === 'VNPAY' && order.paymentStatus !== 'PAID' && (
            <Button
              variant="warning"
              className="rounded-pill px-4 fw-bold text-dark d-inline-flex align-items-center gap-1.5 shadow-sm"
              onClick={() => {
                onHide();
                navigate(`/payment/${order.orderCode}`);
              }}
            >
              <i className="bi bi-qr-code-scan"></i>
              <span>Quét QR Thanh Toán</span>
            </Button>
          )}

          {/* Nút Hủy đơn nếu còn PENDING */}
          {isPending && (
            <Button
              variant="outline-danger"
              className="rounded-pill px-4 fw-semibold d-inline-flex align-items-center gap-1.5"
              onClick={() => {
                onHide();
                onCancelOrder(order);
              }}
            >
              <i className="bi bi-x-circle"></i>
              <span>Hủy Đơn Hàng</span>
            </Button>
          )}

          {/* Nút Mua Lại */}
          <Button
            className="btn-tea-primary rounded-pill px-4 fw-semibold d-inline-flex align-items-center gap-1.5 shadow"
            onClick={() => {
              onHide();
              onReorder(order);
            }}
          >
            <i className="bi bi-arrow-repeat"></i>
            <span>Mua Lại Đơn Này</span>
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default OrderDetailModal;
