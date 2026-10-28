import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Form,
  Modal,
  Spinner,
  Toast,
  ToastContainer,
  InputGroup,
  ButtonGroup,
} from 'react-bootstrap';
import AdminLayout from '../../layout/AdminLayout';
import useOrder from '../../hook/useOrder';
import reportService from '../../service/reportService';
import { formatPrice } from '../../util/formatPrice';

/**
 * AdminOrderPage - Quản trị đơn hàng toàn hệ thống & Xem Saga Choreography Logs
 * Tuân thủ mô hình Reducer - Service - Context: Chỉ tương tác qua useOrder().
 */
export function AdminOrderPage() {
  const {
    adminOrders,
    sagaLogs,
    loading,
    fetchAdminOrders,
    updateOrderStatus,
    updatePaymentStatus,
    fetchSagaLogs,
  } = useOrder();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [exportingCsv, setExportingCsv] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
  };

  const handleExportOrdersCsv = async () => {
    try {
      setExportingCsv(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      await reportService.exportOrdersReportCsv(params);
      showToast('Đã xuất file báo cáo đơn hàng (CSV) thành công!');
    } catch (err) {
      showToast(err.message || 'Lỗi khi xuất file báo cáo đơn hàng', 'danger');
    } finally {
      setExportingCsv(false);
    }
  };


  // Modal Chi tiết Đơn hàng & Đổi trạng thái
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', note: '' });
  const [submitting, setSubmitting] = useState(false);

  // Modal Saga Choreography Logs
  const [showSagaModal, setShowSagaModal] = useState(false);
  const [loadingSaga, setLoadingSaga] = useState(false);

  // Load danh sách đơn hàng
  useEffect(() => {
    const params = {};
    if (statusFilter !== 'ALL') {
      params.status = statusFilter;
    }
    if (searchTerm.trim()) {
      params.keyword = searchTerm.trim();
    }
    fetchAdminOrders(params);
  }, [fetchAdminOrders, statusFilter, searchTerm]);

  // Mở modal chi tiết
  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setStatusForm({
      status: order.status || 'PENDING',
      note: '',
    });
  };

  // Cập nhật trạng thái đơn
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSubmitting(true);
    const res = await updateOrderStatus(selectedOrder.orderCode, statusForm.status, statusForm.note);
    setSubmitting(false);

    if (res.success) {
      showToast(`Đã cập nhật trạng thái đơn ${selectedOrder.orderCode} thành ${statusForm.status}!`);
      setSelectedOrder(null);
      // Refresh
      fetchAdminOrders({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        keyword: searchTerm.trim() || undefined,
      });
    } else {
      showToast(res.error || 'Lỗi khi cập nhật trạng thái', 'danger');
    }
  };

  // Cập nhật trạng thái thanh toán
  const handleTogglePayment = async (order) => {
    const newStatus = order.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID';
    const res = await updatePaymentStatus(order.orderCode, newStatus);
    if (res.success) {
      showToast(`Đã chuyển trạng thái thanh toán đơn ${order.orderCode} sang ${newStatus}!`);
      fetchAdminOrders({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        keyword: searchTerm.trim() || undefined,
      });
    } else {
      showToast(res.error || 'Lỗi khi cập nhật thanh toán', 'danger');
    }
  };

  // Mở xem Saga Logs
  const handleOpenSagaLogs = async (order) => {
    setSelectedOrder(order);
    setShowSagaModal(true);
    setLoadingSaga(true);
    await fetchSagaLogs(order.orderCode);
    setLoadingSaga(false);
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'COMPLETED':
        return <Badge bg="success">Hoàn thành</Badge>;
      case 'CANCELLED':
        return <Badge bg="danger">Đã hủy</Badge>;
      case 'PENDING':
        return <Badge bg="warning" text="dark">Chờ xác nhận</Badge>;
      case 'CONFIRMED':
        return <Badge bg="info">Đã xác nhận</Badge>;
      case 'PREPARING':
        return <Badge bg="primary">Đang pha chế</Badge>;
      case 'DELIVERING':
      case 'SHIPPING':
        return <Badge bg="secondary">Đang giao hàng</Badge>;
      default:
        return <Badge bg="light" text="dark">{st}</Badge>;
    }
  };

  return (
    <AdminLayout pageTitle="Quản Lý Đơn Hàng Hệ Thống">
      {/* 1. THANH TÌM KIẾM & BỘ LỌC TRẠNG THÁI */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white">
        <Card.Body className="p-3 p-md-4">
          <Row className="g-3 align-items-center justify-content-between">
            <Col xs={12} lg={4}>
              <div className="unified-input-group rounded-pill shadow-sm">
                <span className="unified-input-icon">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn, tên khách, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="unified-input-control"
                />
              </div>
            </Col>

            <Col xs={12} lg={8} className="d-flex justify-content-lg-end align-items-center flex-wrap gap-2">
              <div
                className="d-inline-flex align-items-center p-1 bg-light border rounded-pill shadow-sm flex-nowrap overflow-x-auto"
                style={{ gap: '3px' }}
              >
                {[
                  { key: 'ALL', label: 'Tất cả' },
                  { key: 'PENDING', label: 'Chờ duyệt' },
                  { key: 'CONFIRMED', label: 'Đã xác nhận' },
                  { key: 'PREPARING', label: 'Pha chế' },
                  { key: 'DELIVERING', label: 'Đang giao' },
                  { key: 'COMPLETED', label: 'Hoàn thành' },
                  { key: 'CANCELLED', label: 'Đã hủy' },
                ].map((tab) => (
                  <Button
                    key={tab.key}
                    variant={statusFilter === tab.key ? 'warning' : 'light'}
                    size="sm"
                    className={`px-3 py-1.5 rounded-pill fw-semibold text-nowrap border-0 ${
                      statusFilter === tab.key ? 'text-dark shadow-sm' : 'text-muted bg-transparent'
                    }`}
                    style={{ fontSize: '0.82rem', transition: 'all 0.2s ease' }}
                    onClick={() => setStatusFilter(tab.key)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline-success"
                size="sm"
                className="rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm bg-white text-nowrap"
                style={{ fontSize: '0.82rem' }}
                disabled={exportingCsv}
                onClick={handleExportOrdersCsv}
                title="Tải file CSV danh sách đơn hàng để mở trong Excel"
              >
                {exportingCsv ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    <span>Đang xuất...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-earmark-excel-fill text-success fs-6"></i>
                    <span>Xuất CSV</span>
                  </>
                )}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>


      {/* 2. BẢNG DANH SÁCH ĐƠN HÀNG */}
      <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <Card.Body className="p-0">
          {loading && adminOrders.length === 0 ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="warning" />
              <p className="text-muted small mt-2">Đang tải danh sách đơn hàng...</p>
            </div>
          ) : adminOrders.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-receipt text-muted fs-1 mb-2 d-block"></i>
              <p className="text-muted mb-0">Không có đơn hàng nào phù hợp bộ lọc.</p>
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="bg-light border-bottom">
                <tr className="text-muted small text-uppercase">
                  <th className="ps-4">Mã Đơn Hàng</th>
                  <th>Khách Hàng</th>
                  <th>Tổng Tiền</th>
                  <th>Thanh Toán</th>
                  <th>Trạng Thái</th>
                  <th>Thời Gian</th>
                  <th className="text-end pe-4">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {adminOrders.map((ord) => (
                  <tr key={ord.id || ord.orderCode}>
                    <td className="ps-4">
                      <span className="fw-bold text-dark d-block">{ord.orderCode}</span>
                      <small className="text-muted">
                        {ord.items?.length || 0} món
                      </small>
                    </td>

                    <td>
                      <span className="fw-semibold text-dark d-block">{ord.customerName}</span>
                      <small className="text-muted">{ord.phoneNumber}</small>
                    </td>

                    <td>
                      <span className="fw-bold text-success">
                        {formatPrice(ord.totalAmount || 0)}
                      </span>
                    </td>

                    <td>
                      <Badge
                        bg={ord.paymentStatus === 'PAID' ? 'success' : 'warning'}
                        text={ord.paymentStatus === 'PAID' ? 'white' : 'dark'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleTogglePayment(ord)}
                        title="Bấm để đổi trạng thái thanh toán"
                      >
                        {ord.paymentStatus === 'PAID' ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
                      </Badge>
                    </td>

                    <td>{getStatusBadge(ord.status)}</td>

                    <td>
                      <small className="text-muted">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleString('vi-VN') : '---'}
                      </small>
                    </td>

                    <td className="text-end pe-4">
                      <div className="d-inline-flex gap-2">
                        {/* Nút Xem Chi Tiết & Đổi Trạng Thái */}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleOpenDetail(ord)}
                          className="rounded-pill px-2.5 d-flex align-items-center gap-1"
                          title="Cập nhật trạng thái đơn"
                        >
                          <i className="bi bi-pencil-square"></i>
                          <span>Xử Lý</span>
                        </Button>

                        {/* Nút Xem Saga Choreography Logs */}
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleOpenSagaLogs(ord)}
                          className="rounded-pill px-2.5 d-flex align-items-center gap-1"
                          title="Xem luồng Saga Choreography Logs"
                        >
                          <i className="bi bi-diagram-3-fill text-warning"></i>
                          <span>Saga</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* 3. MODAL CHI TIẾT & CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG */}
      {selectedOrder && !showSagaModal && (
        <Modal
          show={Boolean(selectedOrder)}
          onHide={() => !submitting && setSelectedOrder(null)}
          size="lg"
          centered
        >
          <Form onSubmit={handleUpdateStatus} noValidate>
            <Modal.Header closeButton={!submitting}>
              <Modal.Title className="fw-bold fs-5">
                Chi Tiết Đơn Hàng #{selectedOrder.orderCode}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="py-3">
              <Row className="g-3 mb-3">
                <Col xs={12} sm={6}>
                  <p className="small mb-1 text-muted">Khách hàng:</p>
                  <p className="fw-bold mb-0 text-dark">{selectedOrder.customerName}</p>
                  <small className="text-muted">{selectedOrder.phoneNumber}</small>
                </Col>
                <Col xs={12} sm={6}>
                  <p className="small mb-1 text-muted">Địa chỉ nhận hàng:</p>
                  <p className="fw-semibold mb-0 text-dark small">{selectedOrder.shippingAddress || 'Nhận tại quầy'}</p>
                </Col>
              </Row>

              {/* Danh sách món */}
              <h6 className="fw-bold text-dark mt-3 mb-2 small text-uppercase">Danh sách món đặt:</h6>
              <div className="border rounded-3 p-2 bg-light mb-3">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-center py-2 border-bottom last-border-0">
                    <div>
                      <span className="fw-bold text-dark">{item.milkTeaName}</span>
                      <small className="text-muted d-block">
                        Size: {item.sizeCode || 'M'} | SL: {item.quantity} | Topping: {item.toppingNames?.join(', ') || 'Không'}
                      </small>
                    </div>
                    <span className="fw-bold text-dark">{formatPrice(item.subtotalPrice || 0)}</span>
                  </div>
                ))}
                <div className="d-flex justify-content-between pt-2 fw-bold fs-6 text-success">
                  <span>Tổng cộng:</span>
                  <span>{formatPrice(selectedOrder.totalAmount || 0)}</span>
                </div>
              </div>

              {/* Cập nhật trạng thái */}
              <h6 className="fw-bold text-dark mt-3 mb-2 small text-uppercase">Chuyển trạng thái đơn hàng:</h6>
              <Row className="g-3">
                <Col xs={12} sm={6}>
                  <Form.Group controlId="orderStatusSelect">
                    <Form.Label className="small text-muted mb-1">Trạng thái đơn hàng</Form.Label>
                    <Form.Select
                      value={statusForm.status}
                      onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                      className="rounded-3"
                    >
                      <option value="PENDING">PENDING (Chờ xác nhận)</option>
                      <option value="CONFIRMED">CONFIRMED (Xác nhận đơn)</option>
                      <option value="PREPARING">PREPARING (Đang pha chế)</option>
                      <option value="DELIVERING">DELIVERING (Đang giao hàng)</option>
                      <option value="COMPLETED">COMPLETED (Giao thành công)</option>
                      <option value="CANCELLED">CANCELLED (Hủy đơn)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group controlId="orderStatusNote">
                    <Form.Label className="small text-muted mb-1">Ghi chú cập nhật</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ghi chú cập nhật (nếu có)"
                      value={statusForm.note}
                      onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })}
                      className="rounded-3"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                disabled={submitting}
                className="rounded-pill px-3"
              >
                Đóng
              </Button>
              <Button
                variant="warning"
                size="sm"
                type="submit"
                disabled={submitting}
                className="fw-bold rounded-pill px-4"
              >
                {submitting ? 'Đang lưu...' : 'Lưu Trạng Thái'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}

      {/* 4. MODAL SAGA CHOREOGRAPHY LOGS (ĐẶC THÙ CHO MICROSERVICES SAGA) */}
      <Modal
        show={showSagaModal}
        onHide={() => setShowSagaModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2">
            <i className="bi bi-diagram-3-fill text-warning"></i>
            <span>Saga Choreography Logs - #{selectedOrder?.orderCode}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          {loadingSaga ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="warning" />
              <p className="text-muted small mt-2">Đang tải lịch sử sự kiện Saga từ Kafka...</p>
            </div>
          ) : sagaLogs.length === 0 ? (
            <div className="text-center py-4 text-muted small">
              Chưa có bản ghi sự kiện Saga nào cho đơn hàng này.
            </div>
          ) : (
            <div className="timeline-wrapper px-2">
              {sagaLogs.map((log, index) => {
                const status = log.result || log.status || 'SUCCESS';
                const isFail = status === 'FAILED' || status === 'COMPENSATED' || status === 'CANCELLED';
                const logTime = log.time || log.createdAt;
                return (
                  <div
                    key={log.id || index}
                    className="d-flex align-items-start gap-3 mb-3 p-3 rounded-3 border"
                    style={{ backgroundColor: isFail ? '#fef2f2' : '#f8fafc' }}
                  >
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 ${
                        isFail ? 'bg-danger' : 'bg-success'
                      }`}
                      style={{ width: '32px', height: '32px' }}
                    >
                      <i className={`bi ${isFail ? 'bi-x-lg' : 'bi-check-lg'}`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold text-dark">{log.step || log.eventType}</span>
                        <Badge bg={isFail ? 'danger' : 'success'} style={{ fontSize: '0.7rem' }}>
                          {status}
                        </Badge>
                      </div>
                      <p className="text-muted small mb-1">{log.message || log.payload || 'Thực hiện sự kiện microservices thành công'}</p>
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {logTime ? new Date(logTime).toLocaleString('vi-VN') : '---'}
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" size="sm" onClick={() => setShowSagaModal(false)} className="rounded-pill px-3">
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 5. TOAST FEEDBACK */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          delay={3500}
          autohide
          bg={toast.variant}
          className="text-white shadow-lg rounded-3"
        >
          <Toast.Body className="d-flex align-items-center gap-2">
            <i className={`bi ${toast.variant === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} fs-5`}></i>
            <span className="fw-semibold">{toast.message}</span>
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </AdminLayout>
  );
}

export default AdminOrderPage;
