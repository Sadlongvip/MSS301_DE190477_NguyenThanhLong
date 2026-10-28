import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Alert,
  Toast,
  ToastContainer,
  InputGroup,
} from 'react-bootstrap';
import AdminLayout from '../../layout/AdminLayout';
import useAccount from '../../hook/useAccount';
import {
  validateAccountForm,
  validateAccountUsername,
  validateAccountEmail,
  validateAccountPassword,
  validateAccountPhone,
  validateAccountRole,
} from '../../validation/accountValidation';

/**
 * AdminAccountPage - Quản trị tài khoản người dùng & nhân viên
 * Tuân thủ nghiêm ngặt:
 * 1. Chỉ gọi API qua AccountContext (không import accountService).
 * 2. Xác thực (verification) dữ liệu form tạo/sửa tài khoản bằng accountValidation.
 * 3. Không dùng alert() hay popup mặc định của browser/input box (dùng inline error + Toast/Banner riêng).
 */
export function AdminAccountPage() {
  const navigate = useNavigate();
  const {
    accounts,
    loading,
    submitting,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  } = useAccount();

  const [searchTerm, setSearchTerm] = useState('');

  // Toast feedback thông báo thành công/thất bại
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
  };

  // State Modal Thêm/Sửa Tài Khoản
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null); // null = tạo mới
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'CUSTOMER',
    status: 'ACTIVE',
  });

  // State lưu lỗi validation từng trường
  const [formErrors, setFormErrors] = useState({});
  // State lưu lỗi từ server trả về (nếu có)
  const [serverError, setServerError] = useState('');

  // Modal xác nhận xóa
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    account: null,
  });

  // Load danh sách tài khoản
  useEffect(() => {
    fetchAccounts(searchTerm);
  }, [fetchAccounts, searchTerm]);

  // Mở modal thêm/sửa
  const handleOpenModal = (account = null) => {
    setFormErrors({});
    setServerError('');
    if (account) {
      setEditingAccount(account);
      setForm({
        username: account.username || '',
        email: account.email || '',
        password: '', // Khi edit không bắt buộc nhập mật khẩu
        phoneNumber: account.phoneNumber || '',
        role: account.role || 'CUSTOMER',
        status: account.status || 'ACTIVE',
      });
    } else {
      setEditingAccount(null);
      setForm({
        username: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'CUSTOMER',
        status: 'ACTIVE',
      });
    }
    setShowModal(true);
  };

  // Cập nhật giá trị input và xóa lỗi của trường đó khi người dùng gõ
  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Kiểm tra lỗi khi người dùng rời khỏi ô input (onBlur)
  const handleInputBlur = (field) => {
    let err = '';
    const isEdit = Boolean(editingAccount);
    if (field === 'username') err = validateAccountUsername(form.username);
    else if (field === 'email') err = validateAccountEmail(form.email);
    else if (field === 'password') err = validateAccountPassword(form.password, isEdit);
    else if (field === 'phoneNumber') err = validateAccountPhone(form.phoneNumber);
    else if (field === 'role') err = validateAccountRole(form.role);

    if (err) {
      setFormErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  // Submit Form với Custom Verification (không dùng alert hay popup browser)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // 1. Kiểm tra validation bằng accountValidation
    const isEdit = Boolean(editingAccount);
    const formToValidate = isEdit ? { ...form, password: '' } : form;
    const { isValid, errors } = validateAccountForm(formToValidate, isEdit);

    if (!isValid) {
      setFormErrors(errors);
      return; // Dừng lại, lỗi đã được hiển thị bên dưới từng ô input
    }

    // 2. Chuẩn bị payload (khi sửa tài khoản, không gửi password để tránh ghi đè)
    const payload = {
      username: form.username.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim() || null,
      role: form.role,
      status: form.status || 'ACTIVE',
    };
    if (!isEdit && form.password && form.password.trim()) {
      payload.password = form.password;
    }

    // 3. Gọi Context
    let result;
    if (editingAccount) {
      result = await updateAccount(editingAccount.id, payload);
    } else {
      result = await createAccount(payload);
    }

    if (result.success) {
      showToast(
        editingAccount ? 'Cập nhật tài khoản thành công!' : 'Tạo mới tài khoản thành công!',
        'success'
      );
      setShowModal(false);
    } else {
      setServerError(result.error || 'Có lỗi xảy ra khi lưu tài khoản');
    }
  };

  // Xóa tài khoản
  const handleConfirmDelete = async () => {
    if (!deleteConfirm.account) return;
    const result = await deleteAccount(deleteConfirm.account.id);
    if (result.success) {
      showToast('Đã xóa tài khoản thành công!', 'success');
    } else {
      showToast(result.error || 'Không thể xóa tài khoản', 'danger');
    }
    setDeleteConfirm({ show: false, account: null });
  };

  // Lọc danh sách theo keyword phía client nếu cần
  const filteredAccounts = accounts.filter((acc) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      acc.username?.toLowerCase().includes(q) ||
      acc.email?.toLowerCase().includes(q) ||
      acc.phoneNumber?.includes(q)
    );
  });

  return (
    <AdminLayout pageTitle="Quản Lý Tài Khoản Người Dùng">
      {/* 1. THANH TÌM KIẾM & NÚT THÊM TÀI KHOẢN */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white">
        <Card.Body className="p-3 p-md-4">
          <Row className="g-3 align-items-center justify-content-between">
            <Col xs={12} md={6} lg={4}>
              <div className="unified-input-group rounded-pill shadow-sm">
                <span className="unified-input-icon">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  placeholder="Tìm theo username, email, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="unified-input-control"
                />
              </div>
            </Col>

            <Col xs={12} md="auto">
              <Button
                variant="warning"
                onClick={() => handleOpenModal(null)}
                className="fw-bold px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2"
              >
                <i className="bi bi-person-plus-fill"></i>
                <span>Thêm Tài Khoản Mới</span>
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 2. BẢNG DANH SÁCH TÀI KHOẢN */}
      <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <Card.Body className="p-0">
          {loading && accounts.length === 0 ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="warning" />
              <p className="text-muted small mt-2">Đang tải danh sách tài khoản...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-people text-muted fs-1 mb-2 d-block"></i>
              <p className="text-muted mb-0">Không tìm thấy tài khoản nào phù hợp.</p>
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="bg-light border-bottom">
                <tr className="text-muted small text-uppercase">
                  <th className="ps-4">Tài Khoản</th>
                  <th>Email</th>
                  <th>Số Điện Thoại</th>
                  <th>Vai Trò</th>
                  <th>Trạng Thái</th>
                  <th className="text-end pe-4">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2.5">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{
                            width: '36px',
                            height: '36px',
                            background:
                              acc.role === 'ADMIN'
                                ? '#ef4444'
                                : acc.role === 'STAFF'
                                ? '#3b82f6'
                                : '#f59e0b',
                            fontSize: '0.85rem',
                          }}
                        >
                          {acc.username ? acc.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span className="fw-bold text-dark d-block">{acc.username}</span>
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                            ID: #{acc.id}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="text-secondary small">{acc.email || 'Chưa cập nhật'}</span>
                    </td>

                    <td>
                      <span className="text-secondary small">{acc.phoneNumber || '---'}</span>
                    </td>

                    <td>
                      <Badge
                        bg={
                          acc.role === 'ADMIN'
                            ? 'danger'
                            : acc.role === 'STAFF'
                            ? 'primary'
                            : 'warning'
                        }
                        className="px-2.5 py-1 text-uppercase rounded-pill"
                        style={{ fontSize: '0.72rem' }}
                      >
                        {acc.role || 'CUSTOMER'}
                      </Badge>
                    </td>

                    <td>
                      <Badge
                        bg={acc.status === 'ACTIVE' ? 'success' : 'secondary'}
                        className="px-2.5 py-1 text-uppercase rounded-pill"
                        style={{ fontSize: '0.72rem' }}
                      >
                        <i
                          className={`bi ${
                            acc.status === 'ACTIVE'
                              ? 'bi-check-circle-fill'
                              : 'bi-dash-circle-fill'
                          } me-1`}
                        ></i>
                        {acc.status === 'ACTIVE' ? 'Hoạt Động' : 'Đã Khóa'}
                      </Badge>
                    </td>

                    <td className="text-end pe-4">
                      <div className="d-inline-flex gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleOpenModal(acc)}
                          className="rounded-pill px-3 d-flex align-items-center gap-1"
                          title="Chỉnh sửa thông tin tài khoản"
                        >
                          <i className="bi bi-pencil-square"></i>
                          <span>Sửa</span>
                        </Button>

                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => navigate(`/admin/accounts/${acc.id}/change-password`)}
                          className="rounded-pill px-3 d-flex align-items-center gap-1 text-dark fw-semibold"
                          title="Đổi mật khẩu tài khoản"
                        >
                          <i className="bi bi-key-fill text-warning"></i>
                          <span>Đổi MK</span>
                        </Button>

                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setDeleteConfirm({ show: true, account: acc })}
                          className="rounded-pill px-2.5"
                          title="Xóa tài khoản"
                        >
                          <i className="bi bi-trash-fill"></i>
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

      {/* 3. MODAL TẠO / SỬA TÀI KHOẢN VỚI CUSTOM VERIFICATION FEEDBACK */}
      <Modal
        show={showModal}
        onHide={() => !submitting && setShowModal(false)}
        centered
        backdrop="static"
      >
        {/* Thuộc tính noValidate vô hiệu hóa hoàn toàn tooltip popup mặc định của browser */}
        <Form onSubmit={handleSubmit} noValidate>
          <Modal.Header closeButton={!submitting} className="border-0 pb-0">
            <Modal.Title className="fw-bold fs-5">
              {editingAccount ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Tài Khoản Mới'}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="py-3">
            {/* Banner lỗi từ server nếu có */}
            {serverError && (
              <Alert variant="danger" className="rounded-3 py-2 small d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                <div>{serverError}</div>
              </Alert>
            )}

            {/* 1. Tên đăng nhập */}
            <Form.Group className="mb-3" controlId="accountUsername">
              <Form.Label className="small fw-semibold text-dark">
                Tên đăng nhập <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ví dụ: admin_tea01"
                value={form.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onBlur={() => handleInputBlur('username')}
                isInvalid={Boolean(formErrors.username)}
                className="rounded-3"
                disabled={Boolean(editingAccount)} // Không cho sửa username sau khi tạo
              />
              {formErrors.username && (
                <Form.Control.Feedback type="invalid" className="d-block small">
                  <i className="bi bi-exclamation-circle-fill me-1"></i>
                  {formErrors.username}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {/* 2. Email */}
            <Form.Group className="mb-3" controlId="accountEmail">
              <Form.Label className="small fw-semibold text-dark">
                Địa chỉ Email <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="Ví dụ: user@example.com"
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleInputBlur('email')}
                isInvalid={Boolean(formErrors.email)}
                className="rounded-3"
              />
              {formErrors.email && (
                <Form.Control.Feedback type="invalid" className="d-block small">
                  <i className="bi bi-exclamation-circle-fill me-1"></i>
                  {formErrors.email}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {/* 3. Mật khẩu (Chỉ hiển thị khi thêm mới, khi sửa có trang riêng biệt) */}
            {!editingAccount ? (
              <Form.Group className="mb-3" controlId="accountPassword">
                <Form.Label className="small fw-semibold text-dark">
                  Mật khẩu <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={form.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleInputBlur('password')}
                  isInvalid={Boolean(formErrors.password)}
                  className="rounded-3"
                />
                {formErrors.password && (
                  <Form.Control.Feedback type="invalid" className="d-block small">
                    <i className="bi bi-exclamation-circle-fill me-1"></i>
                    {formErrors.password}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            ) : (
              <div className="mb-3 p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between">
                <div>
                  <div className="fw-semibold small text-dark d-flex align-items-center gap-1.5">
                    <i className="bi bi-shield-lock-fill text-warning"></i>
                    <span>Bảo mật & Mật khẩu</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                    Mật khẩu được quản lý tại trang riêng biệt.
                  </div>
                </div>
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="rounded-pill text-dark fw-bold px-3 py-1 shadow-sm"
                  onClick={() => {
                    setShowModal(false);
                    navigate(`/admin/accounts/${editingAccount.id}/change-password`);
                  }}
                >
                  <i className="bi bi-key-fill text-warning me-1"></i>
                  Đổi Mật Khẩu
                </Button>
              </div>
            )}

            {/* 4. Số điện thoại */}
            <Form.Group className="mb-3" controlId="accountPhoneNumber">
              <Form.Label className="small fw-semibold text-dark">Số điện thoại</Form.Label>
              <Form.Control
                type="text"
                placeholder="10 chữ số (Ví dụ: 0901234567)"
                value={form.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                onBlur={() => handleInputBlur('phoneNumber')}
                isInvalid={Boolean(formErrors.phoneNumber)}
                className="rounded-3"
              />
              {formErrors.phoneNumber && (
                <Form.Control.Feedback type="invalid" className="d-block small">
                  <i className="bi bi-exclamation-circle-fill me-1"></i>
                  {formErrors.phoneNumber}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {/* 5. Vai trò (Role) */}
            <Form.Group className="mb-3" controlId="accountRole">
              <Form.Label className="small fw-semibold text-dark">
                Vai trò hệ thống <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={form.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                onBlur={() => handleInputBlur('role')}
                isInvalid={Boolean(formErrors.role)}
                className="rounded-3"
              >
                <option value="CUSTOMER">CUSTOMER (Khách hàng)</option>
                <option value="STAFF">STAFF (Nhân viên)</option>
                <option value="ADMIN">ADMIN (Quản trị viên)</option>
              </Form.Select>
              {formErrors.role && (
                <Form.Control.Feedback type="invalid" className="d-block small">
                  <i className="bi bi-exclamation-circle-fill me-1"></i>
                  {formErrors.role}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {/* 6. Trạng thái (Status) */}
            <Form.Group className="mb-2" controlId="accountStatus">
              <Form.Label className="small fw-semibold text-dark">
                Trạng thái hoạt động <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={form.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="rounded-3"
              >
                <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
                <option value="INACTIVE">INACTIVE (Đã khóa / Ngừng hoạt động)</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="outline-secondary"
              onClick={() => setShowModal(false)}
              disabled={submitting}
              className="rounded-pill px-3"
            >
              Hủy Bỏ
            </Button>
            <Button
              variant="warning"
              type="submit"
              disabled={submitting}
              className="fw-bold rounded-pill px-4"
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" /> Đang lưu...
                </>
              ) : (
                'Lưu Tài Khoản'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* 4. MODAL XÁC NHẬN XÓA TÀI KHOẢN */}
      <Modal
        show={deleteConfirm.show}
        onHide={() => setDeleteConfirm({ show: false, account: null })}
        centered
        size="sm"
      >
        <Modal.Body className="text-center p-4">
          <div className="text-danger mb-3" style={{ fontSize: '2.5rem' }}>
            <i className="bi bi-exclamation-octagon-fill"></i>
          </div>
          <h6 className="fw-bold mb-2">Xác nhận xóa tài khoản?</h6>
          <p className="text-muted small mb-4">
            Bạn có chắc chắn muốn xóa tài khoản{' '}
            <strong className="text-dark">{deleteConfirm.account?.username}</strong>? Hành động này không thể hoàn tác.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setDeleteConfirm({ show: false, account: null })}
              className="rounded-pill px-3"
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              className="rounded-pill px-3 fw-bold"
            >
              Xác Nhận Xóa
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* 5. TOAST FEEDBACK NỔI GÓC MÀN HÌNH (RIÊNG BIỆT, KHÔNG DÙNG ALERT) */}
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

export default AdminAccountPage;
