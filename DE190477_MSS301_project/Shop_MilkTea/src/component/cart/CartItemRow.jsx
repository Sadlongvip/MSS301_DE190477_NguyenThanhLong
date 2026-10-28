import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import { DEFAULT_TEA_IMAGE } from '../../constant/landingData';

/**
 * Component hiển thị một món đồ uống trong giỏ hàng
 */
export function CartItemRow({ item, index, onUpdateQuantity, onRemoveItem }) {
  const quantity = Number(item.quantity) || 1;
  const unitPrice = Number(item.unitPrice || item.price) || 0;
  const itemTotal = Number(item.totalPrice) || unitPrice * quantity;

  return (
    <div className="cart-item-card p-3 p-md-4 rounded-4 mb-3 d-flex flex-column flex-sm-row align-items-sm-center gap-3 gap-md-4 border">
      {/* 1. Ảnh món */}
      <div className="position-relative flex-shrink-0 align-self-start align-self-sm-center">
        <img
          src={item.image || DEFAULT_TEA_IMAGE}
          alt={item.name}
          className="rounded-4 object-fit-cover shadow-sm cart-item-img"
          style={{ width: '88px', height: '88px' }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_TEA_IMAGE;
          }}
        />
        {item.size && (
          <span
            className="position-absolute bottom-0 start-0 m-1 badge bg-dark bg-opacity-75 text-white rounded-pill px-2 py-0.5"
            style={{ fontSize: '0.68rem', backdropFilter: 'blur(4px)' }}
          >
            {item.size}
          </span>
        )}
      </div>

      {/* 2. Thông tin chi tiết đồ uống */}
      <div className="flex-grow-1 min-w-0">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <h5 className="fw-bold mb-1 text-dark fs-6 text-truncate" title={item.name}>
            {item.name}
          </h5>
          <button
            type="button"
            className="btn btn-link text-danger p-0 border-0 ms-2 flex-shrink-0 cart-delete-btn"
            onClick={() => onRemoveItem(item.cartItemId || index)}
            title="Xóa món này khỏi giỏ hàng"
          >
            <i className="bi bi-trash3 fs-6"></i>
          </button>
        </div>

        {/* Tùy chỉnh: Size, Đường, Đá */}
        <div className="d-flex flex-wrap gap-1 mb-2 mt-1">
          {item.size && (
            <Badge bg="light" text="dark" className="border fw-normal rounded-pill px-2 py-1">
              Size {item.size}
            </Badge>
          )}
          {item.sugar && (
            <Badge bg="light" text="secondary" className="border fw-normal rounded-pill px-2 py-1">
              <i className="bi bi-droplet-half text-warning me-1"></i>
              {item.sugar}
            </Badge>
          )}
          {item.ice && (
            <Badge bg="light" text="secondary" className="border fw-normal rounded-pill px-2 py-1">
              <i className="bi bi-snow text-info me-1"></i>
              {item.ice}
            </Badge>
          )}
        </div>

        {/* Topping list */}
        {item.toppings && item.toppings.length > 0 && (
          <div className="small text-muted mb-2 d-flex align-items-center flex-wrap gap-1" style={{ fontSize: '0.78rem' }}>
            <span className="fw-semibold text-dark">Topping:</span>
            {item.toppings.map((top, tIdx) => (
              <span key={tIdx} className="badge bg-warning bg-opacity-10 text-warning-emphasis border border-warning-subtle rounded-pill">
                +{top}
              </span>
            ))}
          </div>
        )}

        {/* Ghi chú */}
        {item.note && (
          <div className="small text-muted fst-italic mb-2" style={{ fontSize: '0.76rem' }}>
            <i className="bi bi-pencil me-1"></i> {item.note}
          </div>
        )}

        {/* Đơn giá */}
        <div className="small text-muted" style={{ fontSize: '0.8rem' }}>
          Đơn giá: <span className="fw-semibold text-dark">{unitPrice.toLocaleString('vi-VN')} đ</span>
        </div>
      </div>

      {/* 3. Bộ tăng giảm số lượng & Thành tiền */}
      <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-3 gap-md-4 pt-2 pt-sm-0 border-top border-sm-top-0">
        {/* Bộ đếm (+ / -) */}
        <div className="d-flex align-items-center bg-white rounded-pill p-1 border shadow-sm cart-stepper">
          <button
            type="button"
            className="btn btn-sm btn-link text-dark p-0 d-flex align-items-center justify-content-center text-decoration-none rounded-circle stepper-btn"
            onClick={() => onUpdateQuantity(item.cartItemId || index, quantity - 1)}
            aria-label="Giảm số lượng"
          >
            <i className="bi bi-dash"></i>
          </button>
          <span className="fw-bold px-2 text-center" style={{ minWidth: '32px', fontSize: '0.9rem' }}>
            {quantity}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-link text-dark p-0 d-flex align-items-center justify-content-center text-decoration-none rounded-circle stepper-btn"
            onClick={() => onUpdateQuantity(item.cartItemId || index, quantity + 1)}
            aria-label="Tăng số lượng"
          >
            <i className="bi bi-plus"></i>
          </button>
        </div>

        {/* Thành tiền */}
        <div className="text-end" style={{ minWidth: '95px' }}>
          <div className="fw-bold text-danger fs-6">
            {itemTotal.toLocaleString('vi-VN')} đ
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItemRow;
