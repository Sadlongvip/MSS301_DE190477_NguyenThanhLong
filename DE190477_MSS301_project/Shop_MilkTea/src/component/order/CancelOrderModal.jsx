import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import useOrder from '../../hook/useOrder';

const REASON_OPTIONS = [
  'Tôi đổi ý, không muốn đặt nữa',
  'Tôi muốn thay đổi món / kích cỡ / topping',
  'Thời gian giao hàng dự kiến quá lâu',
  'Tôi điền nhầm thông tin địa chỉ hoặc số điện thoại',
  'Lý do khác',
];

/**
 * CancelOrderModal - Modal xác nhận hủy đơn hàng kèm chọn lý do
 */
export function CancelOrderModal({ show, onHide, order }) {
  const { cancelOrder, cancelling } = useOrder();
  const [selectedReason, setSelectedReason] = useState(REASON_OPTIONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    let finalReason = selectedReason;
    if (selectedReason === 'Lý do khác') {
      if (!customReason.trim()) {
        setErrorMessage('Vui lòng nhập lý do bạn muốn hủy đơn hàng');
        return;
      }
      finalReason = customReason.trim();
    } else if (customReason.trim()) {
      finalReason = `${selectedReason}: ${customReason.trim()}`;
    }

    const res = await cancelOrder(order.orderCode, finalReason);
    if (res.success) {
      onHide();
    } else {
      setErrorMessage(res.error || 'Hủy đơn hàng thất bại, vui lòng thử lại');
    }
  };

  return (
    <Modal show={show} onHide={() => !cancelling && onHide()} centered className="rounded-4">
      <Modal.Header closeButton={!cancelling} className="border-0 pb-0">
        <Modal.Title className="fw-bold fs-5 text-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>Xác Nhận Hủy Đơn Hàng</span>
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="py-3 px-4">
          <p className="text-secondary small mb-3">
            Bạn có chắc chắn muốn hủy đơn hàng <strong>#{order.orderCode}</strong> không?
            Hành động này không thể hoàn tác sau khi đã gửi yêu cầu.
          </p>

          {errorMessage && (
            <Alert variant="danger" className="py-2 px-3 small rounded-3 mb-3">
              <i className="bi bi-x-circle-fill me-1"></i>
              {errorMessage}
            </Alert>
          )}

          <div className="mb-3">
            <label className="fw-bold text-dark small mb-2 d-block">
              Vui lòng cho Shop biết lý do hủy đơn:
            </label>
            <div className="d-flex flex-column gap-2">
              {REASON_OPTIONS.map((reason) => (
                <label
                  key={reason}
                  className={`p-2.5 rounded-3 border d-flex align-items-center gap-2.5 cursor-pointer small transition-all ${
                    selectedReason === reason ? 'border-warning bg-warning bg-opacity-10 fw-semibold text-dark' : 'bg-light text-secondary'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <Form.Group controlId="customReason" className="mb-2">
            <Form.Label className="small fw-semibold text-secondary">
              Ghi chú thêm lý do chi tiết (nếu có):
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Nhập thêm chi tiết..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="rounded-3 small"
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 px-4 pb-4">
          <Button
            variant="light"
            className="rounded-pill px-4 text-secondary"
            onClick={onHide}
            disabled={cancelling}
          >
            Giữ Lại Đơn
          </Button>

          <Button
            type="submit"
            variant="danger"
            className="rounded-pill px-4 fw-semibold d-inline-flex align-items-center gap-2"
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <Spinner size="sm" animation="border" />
                <span>Đang xử lý hủy...</span>
              </>
            ) : (
              <>
                <i className="bi bi-check2-circle"></i>
                <span>Đồng Ý Hủy Đơn</span>
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default CancelOrderModal;
