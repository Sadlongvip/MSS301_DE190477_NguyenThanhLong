import React, { useState } from 'react';
import { Offcanvas, Button, Badge, Form, InputGroup, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useCart from '../../hook/useCart';
import { DEFAULT_TEA_IMAGE } from '../../constant/landingData';

/**
 * CartDrawer - Ngăn kéo xem giỏ hàng phong cách Offcanvas
 */
export function CartDrawer({
  show,
  onHide,
  cartItems: propCartItems,
  onUpdateQuantity: propUpdateQuantity,
  onRemoveItem: propRemoveItem,
  onClearCart: propClearCart,
}) {
  const navigate = useNavigate();
  const cartContext = useCart();

  // Ưu tiên lấy từ useCart nếu không truyền props
  const cartItems = propCartItems !== undefined ? propCartItems : cartContext.cartItems;
  const onUpdateQuantity = propUpdateQuantity || cartContext.updateQuantity;
  const onRemoveItem = propRemoveItem || cartContext.removeItem;
  const onClearCart = propClearCart || cartContext.clearCart;
  const lastCompletedOrder = cartContext.lastCompletedOrder;
  const clearLastCompletedOrder = cartContext.clearLastCompletedOrder;

  // Tính tạm tính & phí ship theo context
  const subTotal = cartContext.subTotal !== undefined
    ? cartContext.subTotal
    : cartItems.reduce((sum, item) => sum + (item.totalPrice || item.price * item.quantity), 0);
  const shippingFee = cartContext.shippingFee !== undefined
    ? cartContext.shippingFee
    : (subTotal >= 120000 || cartItems.length === 0 ? 0 : 20000);
  const finalTotal = cartContext.finalTotal !== undefined
    ? cartContext.finalTotal
    : (subTotal + shippingFee);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    onHide();
    navigate('/cart');
  };

  const handleGoToCartPage = () => {
    onHide();
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    if (clearLastCompletedOrder) clearLastCompletedOrder();
    onHide();
  };

  const handleViewOrder = () => {
    onHide();
    navigate('/orders');
  };

  return (
    <Offcanvas show={show} onHide={onHide} placement="end" className="shadow-lg" style={{ width: '420px' }}>
      <Offcanvas.Header closeButton className="border-bottom">
        <Offcanvas.Title className="fw-bold d-flex align-items-center gap-2 fs-5">
          <i className="bi bi-bag-check-fill text-warning fs-4"></i>
          <span>Giỏ Hàng Của Bạn</span>
          {cartItems.length > 0 && (
            <Badge pill bg="warning" text="dark" className="ms-2">
              {cartItems.length} món
            </Badge>
          )}
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column p-0">
        {lastCompletedOrder ? (
          <div className="p-4 d-flex flex-column my-auto">
            <div className="text-center mb-3">
              <div className="text-success mb-2" style={{ fontSize: '3.2rem' }}>
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <h4 className="fw-bold text-success mb-1">Đặt Hàng Thành Công!</h4>
              <p className="text-muted small mb-0">
                Đơn hàng của bạn đã được ghi nhận và chuyển tới quầy pha chế.
              </p>
            </div>

            {/* Khối chi tiết đơn hàng vừa đặt */}
            <div className="bg-light p-3 rounded-4 border mb-3 small">
              <div className="d-flex justify-content-between align-items-center pb-2 border-bottom mb-2">
                <span className="text-muted">Mã đơn hàng:</span>
                <span className="fw-bold text-dark badge bg-warning text-dark px-2.5 py-1">
                  #{lastCompletedOrder.orderCode || 'ORD-SUCCESS'}
                </span>
              </div>

              {lastCompletedOrder.customerName && (
                <div className="d-flex justify-content-between text-muted mb-1.5">
                  <span>Khách nhận:</span>
                  <span className="fw-semibold text-dark">{lastCompletedOrder.customerName}</span>
                </div>
              )}

              {lastCompletedOrder.shippingAddress && (
                <div className="d-flex justify-content-between text-muted mb-2">
                  <span>Địa chỉ giao:</span>
                  <span className="fw-semibold text-dark text-end" style={{ maxWidth: '210px' }}>
                    {lastCompletedOrder.shippingAddress}
                  </span>
                </div>
              )}

              <div className="d-flex justify-content-between text-muted mb-1.5">
                <span>Tạm tính tiền món:</span>
                <span className="fw-semibold text-dark">
                  {Number(lastCompletedOrder.subtotal || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>

              {/* Số tiền ship hiển thị thực tế khi đặt hàng xong */}
              <div className="d-flex justify-content-between align-items-center mb-1.5 py-1 bg-white px-2 rounded-3 border border-success-subtle">
                <span className="fw-semibold text-dark d-flex align-items-center gap-1">
                  <i className="bi bi-truck text-success"></i>
                  <span>Phí vận chuyển:</span>
                </span>
                <span>
                  {Number(lastCompletedOrder.shippingFee || 0) === 0 ? (
                    <Badge bg="success" className="px-2 py-1">Miễn phí (0đ)</Badge>
                  ) : (
                    <strong className="text-dark">
                      {Number(lastCompletedOrder.shippingFee).toLocaleString('vi-VN')} đ
                    </strong>
                  )}
                </span>
              </div>

              {lastCompletedOrder.discountAmount > 0 && (
                <div className="d-flex justify-content-between text-success mb-1.5">
                  <span>Giảm giá:</span>
                  <span>-{Number(lastCompletedOrder.discountAmount).toLocaleString('vi-VN')} đ</span>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-2 fw-bold">
                <span className="text-dark fs-6">Tổng thanh toán:</span>
                <span className="text-danger fs-5">
                  {Number(lastCompletedOrder.totalAmount || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            {/* Nút tác vụ sau khi đặt hàng */}
            <div className="d-flex flex-column gap-2 mt-auto">
              <Button
                variant="success"
                onClick={handleViewOrder}
                className="w-100 py-2.5 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
              >
                <i className="bi bi-receipt"></i>
                <span>Xem Lịch Sử Đơn Hàng</span>
              </Button>
              <Button
                variant="outline-secondary"
                onClick={handleContinueShopping}
                className="w-100 py-2 rounded-pill small fw-semibold"
              >
                Tiếp Tục Đặt Món Mới
              </Button>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="p-4 text-center my-auto">
            <div className="text-muted mb-3" style={{ fontSize: '3.5rem' }}>
              <i className="bi bi-cup"></i>
            </div>
            <h5 className="fw-bold text-dark mb-1">Giỏ hàng đang trống</h5>
            <p className="text-muted small mb-4">
              Bạn chưa chọn món nào. Hãy ghé xem thực đơn trà sữa thơm lừng của quán nhé!
            </p>
            <Button
              className="btn-tea-primary rounded-pill px-4"
              onClick={onHide}
              href="#menu"
            >
              Xem Thực Đơn Ngay
            </Button>
          </div>

        ) : (
          <>
            {/* Danh sách các món trong giỏ */}
            <div className="flex-grow-1 overflow-y-auto p-3 d-flex flex-column gap-3">
              {cartItems.map((item, idx) => (
                <div
                  key={item.cartItemId || idx}
                  className="p-3 rounded-4 bg-light border d-flex gap-3 position-relative"
                >
                  <img
                    src={item.image || DEFAULT_TEA_IMAGE}
                    alt={item.name}
                    className="rounded-3 object-fit-cover"
                    style={{ width: '70px', height: '70px' }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_TEA_IMAGE;
                    }}
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start pr-3">
                      <h6 className="fw-bold mb-1 small text-dark" style={{ maxWidth: '180px' }}>
                        {item.name}
                      </h6>
                      <button
                        className="btn btn-link text-muted p-0 border-0"
                        onClick={() => onRemoveItem(item.cartItemId || idx)}
                        title="Xóa món này"
                      >
                        <i className="bi bi-x-circle text-danger"></i>
                      </button>
                    </div>

                    <div className="text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
                      <span className="me-2">Size: <strong>{item.size || 'M'}</strong></span>
                      <span className="me-2">Đường: <strong>{item.sugar || '70%'}</strong></span>
                      <span>Đá: <strong>{item.ice || '100%'}</strong></span>
                    </div>

                    {item.toppings && item.toppings.length > 0 && (
                      <div className="small text-muted mb-2" style={{ fontSize: '0.72rem' }}>
                        + {item.toppings.join(', ')}
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="fw-bold text-danger">
                        {(item.totalPrice || item.price * item.quantity).toLocaleString('vi-VN')} đ
                      </span>

                      <div className="d-flex align-items-center gap-2 bg-white rounded-pill px-2 py-1 border shadow-sm">
                        <button
                          className="btn btn-sm btn-link text-dark p-0 text-decoration-none"
                          onClick={() => onUpdateQuantity(item.cartItemId || idx, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </button>
                        <span className="small fw-bold px-1">{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-link text-dark p-0 text-decoration-none"
                          onClick={() => onUpdateQuantity(item.cartItemId || idx, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tóm tắt chi phí & Thanh toán */}
            <div className="p-3 border-top bg-white">
              {/* Tóm tắt chi phí */}
              <div className="d-flex flex-column gap-1 mb-3 small">
                <div className="d-flex justify-content-between text-muted">
                  <span>Tạm tính ({cartItems.length} món):</span>
                  <span>{subTotal.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="d-flex justify-content-between text-muted">
                  <span>Phí giao hàng:</span>
                  <span>{shippingFee === 0 ? <strong className="text-success">Miễn phí</strong> : `${shippingFee.toLocaleString('vi-VN')} đ`}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold fs-6 pt-2 border-top text-dark">
                  <span>Tổng thanh toán:</span>
                  <span className="text-danger fs-5">{finalTotal.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              {/* Nút tác vụ giỏ hàng */}
              <div className="d-flex flex-column gap-2">
                <Button
                  onClick={handleCheckout}
                  className="w-100 btn-tea-primary py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                >
                  <i className="bi bi-lightning-fill"></i>
                  <span>Thanh Toán Ngay ({finalTotal.toLocaleString('vi-VN')}đ)</span>
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={handleGoToCartPage}
                  className="w-100 py-1.5 small fw-semibold rounded-pill d-flex align-items-center justify-content-center gap-2"
                >
                  <i className="bi bi-cart3"></i>
                  <span>Xem Chi Tiết Giỏ Hàng</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}


export default CartDrawer;
