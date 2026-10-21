import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form, Badge, Row, Col } from 'react-bootstrap';
import { InventoryContext } from '../../context/InventoryContext';
import { TOPPINGS as FALLBACK_TOPPINGS } from '../../constant/landingData';

const DEFAULT_FALLBACK_SIZES = [
  { id: 1, code: 'M', name: 'Size M (Tiêu chuẩn)', extraPrice: 0, isDefault: true, isAvailable: true },
  { id: 2, code: 'L', name: 'Size L (Cỡ lớn)', extraPrice: 6000, isDefault: false, isAvailable: true },
  { id: 3, code: 'XL', name: 'Size XL (Khổng lồ 1L)', extraPrice: 12000, isDefault: false, isAvailable: true },
];

/**
 * Modal Tùy chỉnh chi tiết đồ uống (Đường, Đá, Size, Topping)
 */
export function ProductDetailModal({ show, product, onHide, onAddToCart }) {
  const { toppings: contextToppings, sizes: contextSizes } = useContext(InventoryContext) || {};

  // Ưu tiên lấy từ Backend, fallback sang dữ liệu mẫu nếu Backend chưa có
  const availableToppings = contextToppings && contextToppings.length > 0 ? contextToppings : FALLBACK_TOPPINGS;
  const availableSizes = contextSizes && contextSizes.length > 0 ? contextSizes : DEFAULT_FALLBACK_SIZES;

  const [size, setSize] = useState('M');
  const [sugar, setSugar] = useState('70% Chuẩn vị');
  const [ice, setIce] = useState('Bình thường (100%)');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [quantity, setQuantity] = useState(1);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      const defaultSize = availableSizes.find((s) => s.isDefault && s.isAvailable !== false) || availableSizes[0];
      setSize(defaultSize ? defaultSize.code : 'M');
      setSugar('70% Chuẩn vị');
      setIce('Bình thường (100%)');
      setSelectedToppings([]);
      setQuantity(1);
    }
  }, [product, availableSizes]);

  if (!product) return null;

  // Tính toán phụ thu theo size đang chọn
  const chosenSizeObj = availableSizes.find((s) => s.code === size);
  const sizeExtra = chosenSizeObj ? (chosenSizeObj.extraPrice || 0) : 0;

  // Tính toán tổng tiền topping
  const toppingsTotal = selectedToppings.reduce((sum, topId) => {
    const item = availableToppings.find((t) => t.id === topId);
    return sum + (item ? item.price : 0);
  }, 0);

  const unitPrice = product.price + sizeExtra + toppingsTotal;
  const totalPrice = unitPrice * quantity;

  const handleToppingToggle = (topId) => {
    const item = availableToppings.find((t) => t.id === topId);
    if (item && item.isAvailable === false) return; // Không cho chọn topping hết hàng

    if (selectedToppings.includes(topId)) {
      setSelectedToppings(selectedToppings.filter((id) => id !== topId));
    } else {
      setSelectedToppings([...selectedToppings, topId]);
    }
  };

  const handleConfirm = () => {
    const customizedItem = {
      ...product,
      cartItemId: `${product.id}-${size}-${sugar}-${ice}-${selectedToppings.sort().join('_')}`,
      size,
      sizeName: chosenSizeObj ? chosenSizeObj.name : `Size ${size}`,
      sizeExtra,
      sugar,
      ice,
      toppings: selectedToppings
        .map((id) => availableToppings.find((t) => t.id === id)?.name)
        .filter(Boolean),
      unitPrice,
      quantity,
      totalPrice,
    };

    onAddToCart(customizedItem);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="rounded-4">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold fs-5">Tùy Chọn Đồ Uống</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <Row className="g-4">
          {/* Cột trái: Hình ảnh & Thông tin sản phẩm */}
          <Col md={5}>
            <div className="rounded-4 overflow-hidden shadow-sm mb-3 position-relative" style={{ height: '260px' }}>
              <img
                src={product.image}
                alt={product.name}
                className="w-100 h-100 object-fit-cover"
              />
              <span className={`badge-custom-tag bg-${product.tagColor || 'primary'}`}>
                {product.tag}
              </span>
            </div>
            <h5 className="fw-bold mb-1">{product.name}</h5>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="text-warning fw-bold small">
                <i className="bi bi-star-fill me-1"></i>
                {product.rating}
              </span>
              <span className="text-muted small">({product.reviewsCount} lượt thích)</span>
              {product.calories && (
                <Badge bg="light" text="dark" className="border ms-auto">
                  🔥 {product.calories}
                </Badge>
              )}
            </div>
            <p className="text-muted small mb-0">{product.description}</p>
          </Col>

          {/* Cột phải: Lựa chọn Tùy biến */}
          <Col md={7}>
            {/* Chọn Size */}
            <div className="mb-3">
              <Form.Label className="fw-bold small text-dark d-block">
                1. Kích cỡ ly (Size):
              </Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {availableSizes.map((s) => {
                  const isSelected = size === s.code;
                  const isOutOfStock = s.isAvailable === false;
                  const extraText = s.extraPrice > 0 ? `+${s.extraPrice.toLocaleString('vi-VN')}đ` : '+0đ';

                  return (
                    <Button
                      key={s.code || s.id}
                      variant={isSelected ? 'warning' : 'outline-secondary'}
                      size="sm"
                      disabled={isOutOfStock}
                      className={`flex-fill rounded-3 text-start p-2 ${
                        isSelected ? 'fw-bold border-warning' : 'border'
                      } ${isOutOfStock ? 'opacity-50' : ''}`}
                      onClick={() => !isOutOfStock && setSize(s.code)}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>{s.name}</span>
                        {isOutOfStock && <Badge bg="danger" className="ms-1" style={{ fontSize: '0.65rem' }}>Hết</Badge>}
                      </div>
                      <small className="opacity-75">{extraText}</small>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Chọn Mức Đường */}
            <div className="mb-3">
              <Form.Label className="fw-bold small text-dark d-block">
                2. Lượng đường:
              </Form.Label>
              <div className="d-flex flex-wrap gap-1">
                {['0% Không đường', '30% Ít ngọt', '50% Vừa phải', '70% Chuẩn vị', '100% Đậm đà'].map((lvl) => (
                  <Button
                    key={lvl}
                    variant={sugar === lvl ? 'warning' : 'light'}
                    size="sm"
                    className="rounded-pill px-3 py-1 small border"
                    onClick={() => setSugar(lvl)}
                  >
                    {lvl}
                  </Button>
                ))}
              </div>
            </div>

            {/* Chọn Mức Đá */}
            <div className="mb-3">
              <Form.Label className="fw-bold small text-dark d-block">
                3. Lượng đá:
              </Form.Label>
              <div className="d-flex flex-wrap gap-1">
                {['Đá riêng', '30% Đá', '50% Đá', 'Bình thường (100%)', 'Uống Nóng'].map((lvl) => (
                  <Button
                    key={lvl}
                    variant={ice === lvl ? 'warning' : 'light'}
                    size="sm"
                    className="rounded-pill px-3 py-1 small border"
                    onClick={() => setIce(lvl)}
                  >
                    {lvl}
                  </Button>
                ))}
              </div>
            </div>

            {/* Thêm Topping */}
            <div className="mb-3">
              <Form.Label className="fw-bold small text-dark d-block">
                4. Topping kèm thêm:
              </Form.Label>
              <div className="d-flex flex-column gap-1">
                {availableToppings.map((top) => {
                  const isChecked = selectedToppings.includes(top.id);
                  const isOutOfStock = top.isAvailable === false;

                  return (
                    <div
                      key={top.id}
                      onClick={() => !isOutOfStock && handleToppingToggle(top.id)}
                      className={`d-flex align-items-center justify-content-between p-2 rounded-3 border ${
                        isOutOfStock
                          ? 'bg-light opacity-50 cursor-not-allowed'
                          : isChecked
                          ? 'bg-warning-subtle border-warning cursor-pointer'
                          : 'bg-light cursor-pointer'
                      }`}
                      style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <Form.Check
                          type="checkbox"
                          id={`topping-${top.id}`}
                          label={top.name}
                          checked={isChecked}
                          disabled={isOutOfStock}
                          onChange={() => {}}
                          className="small fw-semibold pointer-events-none"
                        />
                        {isOutOfStock && (
                          <Badge bg="secondary" style={{ fontSize: '0.65rem' }}>
                            Tạm hết
                          </Badge>
                        )}
                      </div>
                      <span className="small text-danger fw-bold">+{top.price.toLocaleString('vi-VN')}đ</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Số lượng */}
            <div className="d-flex align-items-center justify-content-between pt-2 border-top">
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-circle"
                  style={{ width: '32px', height: '32px' }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="fw-bold px-2">{quantity}</span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-circle"
                  style={{ width: '32px', height: '32px' }}
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>

              <div className="text-end">
                <small className="text-muted d-block">Tổng cộng</small>
                <span className="fw-bold fs-5 text-danger">
                  {totalPrice.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button variant="light" onClick={onHide} className="rounded-pill px-4">
          Hủy bỏ
        </Button>
        <Button onClick={handleConfirm} className="btn-tea-primary px-4">
          <i className="bi bi-cart-plus-fill me-2"></i>
          Thêm Vào Giỏ ({totalPrice.toLocaleString('vi-VN')}đ)
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProductDetailModal;
