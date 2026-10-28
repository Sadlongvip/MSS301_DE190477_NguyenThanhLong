import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Row,
  Col,
  Tab,
  Nav,
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
import { InventoryContext } from '../../context/InventoryContext';
import { useNavigate } from 'react-router-dom';
import {
  validateMilkTeaForm,
  validateCategoryForm,
  validateToppingForm,
  validateSizeForm,
} from '../../validation/menuValidation';

const DEFAULT_TEA_IMAGE = 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&auto=format&fit=crop&q=80';

export function AdminMenuPage() {
  const {
    categories,
    milkTeas,
    toppings,
    sizes,
    refreshAll,
    createMilkTea,
    updateMilkTea,
    deleteMilkTea,
    createCategory,
    updateCategory,
    deleteCategory,
    createTopping,
    updateTopping,
    deleteTopping,
    createSize,
    updateSize,
    deleteSize,
  } = useContext(InventoryContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('milkteas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  // Toast feedback
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
  };

  // Loading state for operations
  const [submitting, setSubmitting] = useState(false);

  /* ================= MODAL STATES & ERRORS ================= */
  // Modal Trà sữa
  const [showTeaModal, setShowTeaModal] = useState(false);
  const [teaEditing, setTeaEditing] = useState(null); // null = tạo mới
  const [teaForm, setTeaForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    categoryId: '',
    isAvailable: true,
  });
  const [teaErrors, setTeaErrors] = useState({});

  // Modal Danh mục
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryEditing, setCategoryEditing] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [categoryErrors, setCategoryErrors] = useState({});

  // Modal Topping
  const [showToppingModal, setShowToppingModal] = useState(false);
  const [toppingEditing, setToppingEditing] = useState(null);
  const [toppingForm, setToppingForm] = useState({
    name: '',
    price: '',
    isAvailable: true,
  });
  const [toppingErrors, setToppingErrors] = useState({});

  // Modal Size
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [sizeEditing, setSizeEditing] = useState(null);
  const [sizeForm, setSizeForm] = useState({
    name: '',
    code: '',
    extraPrice: '',
    isDefault: false,
    isAvailable: true,
  });
  const [sizeErrors, setSizeErrors] = useState({});

  // Modal Xác nhận xóa
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  /* ================= HANDLERS: MILK TEA ================= */
  const handleOpenTeaModal = (tea = null) => {
    setTeaErrors({});
    if (tea) {
      setTeaEditing(tea);
      setTeaForm({
        name: tea.name || '',
        description: tea.description || '',
        price: tea.price || '',
        image: tea.image || '',
        categoryId: tea.categoryId || '',
        isAvailable: tea.isAvailable !== false,
      });
    } else {
      setTeaEditing(null);
      setTeaForm({
        name: '',
        description: '',
        price: '',
        image: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        isAvailable: true,
      });
    }
    setShowTeaModal(true);
  };

  const handleSaveTea = async (e) => {
    e.preventDefault();
    const validation = validateMilkTeaForm(teaForm);
    if (!validation.isValid) {
      setTeaErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: teaForm.name.trim(),
        description: teaForm.description.trim(),
        price: parseFloat(teaForm.price),
        image: teaForm.image.trim() || DEFAULT_TEA_IMAGE,
        categoryId: Number(teaForm.categoryId),
        isAvailable: Boolean(teaForm.isAvailable),
      };

      if (teaEditing) {
        const res = await updateMilkTea(teaEditing.id, payload);
        if (res.success) {
          showToast('Cập nhật món trà sữa thành công!');
        } else {
          showToast(res.error || 'Lỗi khi cập nhật trà sữa', 'danger');
          return;
        }
      } else {
        const res = await createMilkTea(payload);
        if (res.success) {
          showToast('Thêm món trà sữa mới thành công!');
        } else {
          showToast(res.error || 'Lỗi khi thêm trà sữa', 'danger');
          return;
        }
      }

      setShowTeaModal(false);
    } catch (err) {
      showToast(err.message || 'Lỗi khi lưu trà sữa', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTea = (tea) => {
    setDeleteConfirm({
      show: true,
      title: 'Xóa Món Trà Sữa',
      message: `Bạn có chắc chắn muốn xóa "${tea.name}" khỏi thực đơn không?`,
      onConfirm: async () => {
        const res = await deleteMilkTea(tea.id);
        if (res.success) {
          showToast(`Đã xóa món "${tea.name}"`);
        } else {
          showToast(res.error || 'Không thể xóa món', 'danger');
        }
      },
    });
  };

  /* ================= HANDLERS: CATEGORY ================= */
  const handleOpenCategoryModal = (cat = null) => {
    setCategoryErrors({});
    if (cat) {
      setCategoryEditing(cat);
      setCategoryForm({ name: cat.name || '' });
    } else {
      setCategoryEditing(null);
      setCategoryForm({ name: '' });
    }
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const validation = validateCategoryForm(categoryForm);
    if (!validation.isValid) {
      setCategoryErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = { name: categoryForm.name.trim() };
      if (categoryEditing) {
        const res = await updateCategory(categoryEditing.id, payload);
        if (res.success) {
          showToast('Cập nhật danh mục thành công!');
        } else {
          showToast(res.error || 'Lỗi khi cập nhật danh mục', 'danger');
          return;
        }
      } else {
        const res = await createCategory(payload);
        if (res.success) {
          showToast('Thêm danh mục mới thành công!');
        } else {
          showToast(res.error || 'Lỗi khi thêm danh mục', 'danger');
          return;
        }
      }
      setShowCategoryModal(false);
    } catch (err) {
      showToast(err.message || 'Lỗi khi lưu danh mục', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = (cat) => {
    setDeleteConfirm({
      show: true,
      title: 'Xóa Danh Mục',
      message: `Bạn có chắc muốn xóa danh mục "${cat.name}"? Các món thuộc danh mục này sẽ mất liên kết danh mục!`,
      onConfirm: async () => {
        const res = await deleteCategory(cat.id);
        if (res.success) {
          showToast(`Đã xóa danh mục "${cat.name}"`);
        } else {
          showToast(res.error || 'Không thể xóa danh mục', 'danger');
        }
      },
    });
  };

  /* ================= HANDLERS: TOPPING ================= */
  const handleOpenToppingModal = (top = null) => {
    setToppingErrors({});
    if (top) {
      setToppingEditing(top);
      setToppingForm({
        name: top.name || '',
        price: top.price || '',
        isAvailable: top.isAvailable !== false,
      });
    } else {
      setToppingEditing(null);
      setToppingForm({ name: '', price: '', isAvailable: true });
    }
    setShowToppingModal(true);
  };

  const handleSaveTopping = async (e) => {
    e.preventDefault();
    const validation = validateToppingForm(toppingForm);
    if (!validation.isValid) {
      setToppingErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: toppingForm.name.trim(),
        price: parseFloat(toppingForm.price),
        isAvailable: Boolean(toppingForm.isAvailable),
      };

      if (toppingEditing) {
        const res = await updateTopping(toppingEditing.id, payload);
        if (res.success) {
          showToast('Cập nhật topping thành công!');
        } else {
          showToast(res.error || 'Lỗi khi cập nhật topping', 'danger');
          return;
        }
      } else {
        const res = await createTopping(payload);
        if (res.success) {
          showToast('Thêm topping mới thành công!');
        } else {
          showToast(res.error || 'Lỗi khi thêm topping', 'danger');
          return;
        }
      }
      setShowToppingModal(false);
    } catch (err) {
      showToast(err.message || 'Lỗi khi lưu topping', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTopping = (top) => {
    setDeleteConfirm({
      show: true,
      title: 'Xóa Topping',
      message: `Bạn có chắc muốn xóa topping "${top.name}"?`,
      onConfirm: async () => {
        const res = await deleteTopping(top.id);
        if (res.success) {
          showToast(`Đã xóa topping "${top.name}"`);
        } else {
          showToast(res.error || 'Không thể xóa topping', 'danger');
        }
      },
    });
  };

  /* ================= HANDLERS: SIZE ================= */
  const handleOpenSizeModal = (s = null) => {
    setSizeErrors({});
    if (s) {
      setSizeEditing(s);
      setSizeForm({
        name: s.name || '',
        code: s.code || '',
        extraPrice: s.extraPrice || 0,
        isDefault: Boolean(s.isDefault),
        isAvailable: s.isAvailable !== false,
      });
    } else {
      setSizeEditing(null);
      setSizeForm({
        name: '',
        code: '',
        extraPrice: 0,
        isDefault: false,
        isAvailable: true,
      });
    }
    setShowSizeModal(true);
  };

  const handleSaveSize = async (e) => {
    e.preventDefault();
    const validation = validateSizeForm(sizeForm);
    if (!validation.isValid) {
      setSizeErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: sizeForm.name.trim(),
        code: sizeForm.code.trim().toUpperCase(),
        extraPrice: parseFloat(sizeForm.extraPrice || 0),
        isDefault: Boolean(sizeForm.isDefault),
        isAvailable: Boolean(sizeForm.isAvailable),
      };

      if (sizeEditing) {
        const res = await updateSize(sizeEditing.id, payload);
        if (res.success) {
          showToast('Cập nhật size ly thành công!');
        } else {
          showToast(res.error || 'Lỗi khi cập nhật size', 'danger');
          return;
        }
      } else {
        const res = await createSize(payload);
        if (res.success) {
          showToast('Thêm size ly mới thành công!');
        } else {
          showToast(res.error || 'Lỗi khi thêm size', 'danger');
          return;
        }
      }
      setShowSizeModal(false);
    } catch (err) {
      showToast(err.message || 'Lỗi khi lưu size ly', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSize = (s) => {
    setDeleteConfirm({
      show: true,
      title: 'Xóa Kích Cỡ Ly',
      message: `Bạn có chắc muốn xóa "${s.name}"?`,
      onConfirm: async () => {
        const res = await deleteSize(s.id);
        if (res.success) {
          showToast(`Đã xóa size "${s.name}"`);
        } else {
          showToast(res.error || 'Không thể xóa size', 'danger');
        }
      },
    });
  };

  /* ================= FILTERED DATA ================= */
  const filteredTeas = milkTeas.filter((t) => {
    const matchCat = !selectedCategoryFilter || String(t.categoryId) === String(selectedCategoryFilter);
    const matchKw =
      !searchTerm.trim() ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchKw;
  });

  return (
    <AdminLayout pageTitle="Quản Lý Thực Đơn & Kho Hàng">
      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          show={toast.show}
          bg={toast.variant}
          onClose={() => setToast({ ...toast, show: false })}
          delay={3500}
          autohide
        >
          <Toast.Body className="text-white fw-semibold d-flex align-items-center justify-content-between">
            <span>{toast.message}</span>
            <Button
              variant="link"
              className="text-white p-0 text-decoration-none ms-2"
              onClick={() => setToast({ ...toast, show: false })}
            >
              ✕
            </Button>
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <div>
        <Container fluid className="px-0">
          {/* Header Banner */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 bg-white p-4 rounded-4 shadow-sm border mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <Badge bg="danger" className="px-2.5 py-1.5 rounded-pill">
                  <i className="bi bi-shield-check me-1"></i> ADMIN PORTAL
                </Badge>
                <Badge bg="warning" text="dark" className="px-2.5 py-1.5 rounded-pill">
                  API Gateway Port 9000
                </Badge>
              </div>
              <h3 className="fw-black text-dark mb-1">Quản Trị Thực Đơn & Kho Hàng</h3>
              <p className="text-muted small mb-0">
                Thêm, sửa, xóa danh mục, các món trà sữa, topping và cấu hình kích cỡ ly (Size) trực tiếp vào Database qua Gateway.
              </p>
            </div>

            <div className="d-flex gap-2">
              <Button
                variant="warning"
                size="sm"
                className="rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm fw-semibold text-dark"
                onClick={() => navigate('/admin/dashboard')}
                title="Xem Báo Cáo Doanh Thu & Đơn Hàng"
              >
                <i className="bi bi-graph-up-arrow"></i>
                <span>Xem Báo Cáo</span>
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                className="rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm"
                onClick={refreshAll}
                title="Làm mới dữ liệu từ máy chủ"
              >
                <i className="bi bi-arrow-clockwise"></i>
                <span>Đồng Bộ Dữ Liệu</span>
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Nav variant="pills" className="bg-white p-2 rounded-4 shadow-sm border mb-4 gap-2">
              <Nav.Item>
                <Nav.Link eventKey="milkteas" className="rounded-pill fw-bold px-3 py-2">
                  <i className="bi bi-cup-hot-fill me-2"></i> Món Trà Sữa ({milkTeas.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="categories" className="rounded-pill fw-bold px-3 py-2">
                  <i className="bi bi-tags-fill me-2"></i> Danh Mục ({categories.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="toppings" className="rounded-pill fw-bold px-3 py-2">
                  <i className="bi bi-stars me-2"></i> Topping ({toppings.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="sizes" className="rounded-pill fw-bold px-3 py-2">
                  <i className="bi bi-aspect-ratio-fill me-2"></i> Cỡ Ly (Sizes) ({sizes.length})
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* ================= TAB 1: MILK TEAS ================= */}
              <Tab.Pane eventKey="milkteas">
                <Card className="border-0 rounded-4 shadow-sm overflow-hidden">
                  <Card.Header className="bg-white p-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1" style={{ maxWidth: '600px' }}>
                      <div className="unified-input-group rounded-pill shadow-sm bg-white flex-grow-1">
                        <span className="unified-input-icon">
                          <i className="bi bi-search text-muted"></i>
                        </span>
                        <input
                          placeholder="Tìm kiếm món theo tên hoặc mô tả..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="unified-input-control"
                        />
                      </div>

                      <Form.Select
                        size="sm"
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        className="rounded-pill border shadow-none"
                        style={{ maxWidth: '200px' }}
                      >
                        <option value="">Tất cả danh mục</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </Form.Select>
                    </div>

                    <Button
                      variant="warning"
                      size="sm"
                      className="rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm text-nowrap"
                      onClick={() => handleOpenTeaModal(null)}
                    >
                      <i className="bi bi-plus-circle-fill"></i>
                      <span>Thêm Món Mới</span>
                    </Button>
                  </Card.Header>

                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table hover className="align-middle mb-0 text-nowrap">
                        <thead className="table-light text-muted small text-uppercase">
                          <tr>
                            <th className="ps-4">Sản Phẩm</th>
                            <th>Danh Mục</th>
                            <th>Giá Bán</th>
                            <th>Trạng Thái</th>
                            <th className="text-end pe-4">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTeas.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center py-5 text-muted">
                                Không tìm thấy món trà sữa nào phù hợp.
                              </td>
                            </tr>
                          ) : (
                            filteredTeas.map((tea) => (
                              <tr key={tea.id}>
                                <td className="ps-4">
                                  <div className="d-flex align-items-center gap-3">
                                    <img
                                      src={tea.image || DEFAULT_TEA_IMAGE}
                                      alt={tea.name}
                                      className="rounded-3 object-fit-cover shadow-sm border"
                                      style={{ width: '50px', height: '50px' }}
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = DEFAULT_TEA_IMAGE;
                                      }}
                                    />
                                    <div>
                                      <div className="fw-bold text-dark">{tea.name}</div>
                                      <small className="text-muted d-block text-truncate" style={{ maxWidth: '280px' }}>
                                        {tea.description || 'Chưa có mô tả'}
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <Badge bg="warning-subtle" text="dark" className="border border-warning-subtle rounded-pill px-2.5 py-1">
                                    {tea.categoryName || 'Không có'}
                                  </Badge>
                                </td>
                                <td>
                                  <span className="fw-bold text-danger">
                                    {tea.price.toLocaleString('vi-VN')} đ
                                  </span>
                                </td>
                                <td>
                                  {tea.isAvailable !== false ? (
                                    <Badge bg="success-subtle" text="success" className="border border-success-subtle rounded-pill px-2.5 py-1">
                                      <i className="bi bi-check-circle-fill me-1"></i> Còn hàng
                                    </Badge>
                                  ) : (
                                    <Badge bg="secondary-subtle" text="secondary" className="border border-secondary-subtle rounded-pill px-2.5 py-1">
                                      <i className="bi bi-x-circle-fill me-1"></i> Tạm hết
                                    </Badge>
                                  )}
                                </td>
                                <td className="text-end pe-4">
                                  <div className="d-flex justify-content-end gap-2">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="rounded-pill px-2.5 py-1"
                                      onClick={() => handleOpenTeaModal(tea)}
                                      title="Chỉnh sửa món"
                                    >
                                      <i className="bi bi-pencil-square"></i> Sửa
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      className="rounded-pill px-2.5 py-1"
                                      onClick={() => handleDeleteTea(tea)}
                                      title="Xóa món"
                                    >
                                      <i className="bi bi-trash"></i> Xóa
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* ================= TAB 2: CATEGORIES ================= */}
              <Tab.Pane eventKey="categories">
                <Card className="border-0 rounded-4 shadow-sm overflow-hidden">
                  <Card.Header className="bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0 text-dark">Danh Sách Danh Mục Trà Sữa</h5>
                    <Button
                      variant="warning"
                      size="sm"
                      className="rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                      onClick={() => handleOpenCategoryModal(null)}
                    >
                      <i className="bi bi-plus-circle-fill"></i>
                      <span>Thêm Danh Mục</span>
                    </Button>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table hover className="align-middle mb-0">
                        <thead className="table-light text-muted small text-uppercase">
                          <tr>
                            <th className="ps-4">ID</th>
                            <th>Tên Danh Mục</th>
                            <th>Số Lượng Món</th>
                            <th className="text-end pe-4">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="text-center py-5 text-muted">
                                Chưa có danh mục nào.
                              </td>
                            </tr>
                          ) : (
                            categories.map((cat) => (
                              <tr key={cat.id}>
                                <td className="ps-4 fw-bold text-muted">#{cat.id}</td>
                                <td className="fw-bold text-dark">{cat.name}</td>
                                <td>
                                  <Badge bg="info-subtle" text="dark" className="rounded-pill px-2.5 py-1">
                                    {cat.milkTeaCount || 0} món
                                  </Badge>
                                </td>
                                <td className="text-end pe-4">
                                  <div className="d-flex justify-content-end gap-2">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="rounded-pill px-2.5 py-1"
                                      onClick={() => handleOpenCategoryModal(cat)}
                                    >
                                      <i className="bi bi-pencil-square"></i> Sửa
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      className="rounded-pill px-2.5 py-1"
                                      onClick={() => handleDeleteCategory(cat)}
                                    >
                                      <i className="bi bi-trash"></i> Xóa
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* ================= TAB 3: TOPPINGS ================= */}
              <Tab.Pane eventKey="toppings">
                <Card className="border-0 rounded-4 shadow-sm overflow-hidden">
                  <Card.Header className="bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0 text-dark">Danh Sách Topping Thêm</h5>
                    <Button
                      variant="warning"
                      size="sm"
                      className="rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                      onClick={() => handleOpenToppingModal(null)}
                    >
                      <i className="bi bi-plus-circle-fill"></i>
                      <span>Thêm Topping Mới</span>
                    </Button>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table hover className="align-middle mb-0">
                        <thead className="table-light text-muted small text-uppercase">
                          <tr>
                            <th className="ps-4">ID</th>
                            <th>Tên Topping</th>
                            <th>Giá Tiền</th>
                            <th>Trạng Thái</th>
                            <th className="text-end pe-4">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {toppings.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center py-5 text-muted">
                                Chưa có topping nào.
                              </td>
                            </tr>
                          ) : (
                            toppings.map((top) => (
                              <tr key={top.id}>
                                <td className="ps-4 fw-bold text-muted">#{top.id}</td>
                                <td className="fw-bold text-dark">{top.name}</td>
                                <td>
                                  <span className="fw-bold text-danger">
                                    +{top.price.toLocaleString('vi-VN')} đ
                                  </span>
                                </td>
                                <td>
                                  {top.isAvailable !== false ? (
                                    <Badge bg="success-subtle" text="success" className="border border-success-subtle rounded-pill px-2.5 py-1">
                                      Còn hàng
                                    </Badge>
                                  ) : (
                                    <Badge bg="secondary-subtle" text="secondary" className="border border-secondary-subtle rounded-pill px-2.5 py-1">
                                      Tạm hết
                                    </Badge>
                                  )}
                                </td>
                                <td className="text-end pe-4">
                                  <div className="d-flex justify-content-end gap-2">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="rounded-pill px-2.5 py-1"
                                      onClick={() => handleOpenToppingModal(top)}
                                    >
                                      <i className="bi bi-pencil-square"></i> Sửa
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      className="rounded-pill px-2.5 py-1"
                                      onClick={() => handleDeleteTopping(top)}
                                    >
                                      <i className="bi bi-trash"></i> Xóa
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* ================= TAB 4: SIZES ================= */}
              <Tab.Pane eventKey="sizes">
                <Card className="border-0 rounded-4 shadow-sm overflow-hidden">
                  <Card.Header className="bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="fw-bold mb-0 text-dark">Cấu Hình Kích Cỡ Ly (Sizes)</h5>
                      <small className="text-muted">
                        Các size ly và mức giá phụ thu áp dụng cho khách khi chọn món trên thực đơn.
                      </small>
                    </div>
                    <Button
                      variant="warning"
                      size="sm"
                      className="rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                      onClick={() => handleOpenSizeModal(null)}
                    >
                      <i className="bi bi-plus-circle-fill"></i>
                      <span>Thêm Cỡ Ly Mới</span>
                    </Button>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table hover className="align-middle mb-0">
                        <thead className="table-light text-muted small text-uppercase">
                          <tr>
                            <th className="ps-4">Mã Size</th>
                            <th>Tên Hiển Thị</th>
                            <th>Phụ Thu Giá</th>
                            <th>Mặc Định</th>
                            <th>Trạng Thái</th>
                            <th className="text-end pe-4">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sizes.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="text-center py-5 text-muted">
                                Chưa có kích cỡ nào.
                              </td>
                            </tr>
                          ) : (
                            sizes.map((s) => (
                              <tr key={s.id}>
                                <td className="ps-4">
                                  <Badge bg="dark" className="px-2.5 py-1.5 rounded-3 fs-6">
                                    {s.code}
                                  </Badge>
                                </td>
                                <td className="fw-bold text-dark">{s.name}</td>
                                <td>
                                  <span className="fw-bold text-danger">
                                    {s.extraPrice > 0 ? `+${s.extraPrice.toLocaleString('vi-VN')} đ` : '+0 đ'}
                                  </span>
                                </td>
                                <td>
                                  {s.isDefault ? (
                                    <Badge bg="primary-subtle" text="primary" className="rounded-pill px-2.5 py-1">
                                      <i className="bi bi-star-fill me-1"></i> Size chuẩn
                                    </Badge>
                                  ) : (
                                    <span className="text-muted small">-</span>
                                  )}
                                </td>
                                <td>
                                  {s.isAvailable !== false ? (
                                    <Badge bg="success-subtle" text="success" className="border border-success-subtle rounded-pill px-2.5 py-1">
                                      Hoạt động
                                    </Badge>
                                  ) : (
                                    <Badge bg="secondary-subtle" text="secondary" className="border border-secondary-subtle rounded-pill px-2.5 py-1">
                                      Tạm ngưng
                                    </Badge>
                                  )}
                                </td>
                                <td className="text-end pe-4">
                                  <div className="d-flex justify-content-end gap-2">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="rounded-pill px-2.5 py-1"
                                      onClick={() => handleOpenSizeModal(s)}
                                    >
                                      <i className="bi bi-pencil-square"></i> Sửa
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      className="rounded-pill px-2.5 py-1"
                                      onClick={() => handleDeleteSize(s)}
                                    >
                                      <i className="bi bi-trash"></i> Xóa
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Container>
      </div>

      {/* ================= MODAL: THÊM / SỬA MILK TEA ================= */}
      <Modal show={showTeaModal} onHide={() => !submitting && setShowTeaModal(false)} centered size="lg">
        <Form onSubmit={handleSaveTea} noValidate>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold fs-5">
              {teaEditing ? 'Chỉnh Sửa Món Trà Sữa' : 'Thêm Món Trà Sữa Mới'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Row className="g-3">
              <Col md={8}>
                <Form.Group className="mb-3" controlId="teaName">
                  <Form.Label className="fw-semibold small">Tên Trà Sữa *</Form.Label>
                  <Form.Control
                    placeholder="VD: Trà sữa trân châu đường đen"
                    value={teaForm.name}
                    onChange={(e) => {
                      setTeaForm({ ...teaForm, name: e.target.value });
                      if (teaErrors.name) setTeaErrors({ ...teaErrors, name: '' });
                    }}
                    isInvalid={Boolean(teaErrors.name)}
                  />
                  {teaErrors.name && (
                    <Form.Control.Feedback type="invalid" className="d-block small">
                      <i className="bi bi-exclamation-circle-fill me-1"></i>
                      {teaErrors.name}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="teaPrice">
                  <Form.Label className="fw-semibold small">Giá Bán (VNĐ) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1000"
                    step="1000"
                    placeholder="VD: 35000"
                    value={teaForm.price}
                    onChange={(e) => {
                      setTeaForm({ ...teaForm, price: e.target.value });
                      if (teaErrors.price) setTeaErrors({ ...teaErrors, price: '' });
                    }}
                    isInvalid={Boolean(teaErrors.price)}
                  />
                  {teaErrors.price && (
                    <Form.Control.Feedback type="invalid" className="d-block small">
                      <i className="bi bi-exclamation-circle-fill me-1"></i>
                      {teaErrors.price}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="teaCategoryId">
                  <Form.Label className="fw-semibold small">Danh Mục Sản Phẩm *</Form.Label>
                  <Form.Select
                    value={teaForm.categoryId}
                    onChange={(e) => {
                      setTeaForm({ ...teaForm, categoryId: e.target.value });
                      if (teaErrors.categoryId) setTeaErrors({ ...teaErrors, categoryId: '' });
                    }}
                    isInvalid={Boolean(teaErrors.categoryId)}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>
                  {teaErrors.categoryId && (
                    <Form.Control.Feedback type="invalid" className="d-block small">
                      <i className="bi bi-exclamation-circle-fill me-1"></i>
                      {teaErrors.categoryId}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="teaImage">
                  <Form.Label className="fw-semibold small">URL Hình Ảnh</Form.Label>
                  <Form.Control
                    placeholder="https://images.unsplash.com/..."
                    value={teaForm.image}
                    onChange={(e) => setTeaForm({ ...teaForm, image: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-3" controlId="teaDescription">
                  <Form.Label className="fw-semibold small">Mô Tả Sản Phẩm</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Giới thiệu hương vị trà, độ béo của sữa và topping kèm theo..."
                    value={teaForm.description}
                    onChange={(e) => setTeaForm({ ...teaForm, description: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group controlId="teaIsAvailable">
                  <Form.Check
                    type="switch"
                    label="Món này đang có sẵn phục vụ khách (Bỏ tick nếu tạm hết hàng)"
                    checked={teaForm.isAvailable}
                    onChange={(e) => setTeaForm({ ...teaForm, isAvailable: e.target.checked })}
                    className="fw-semibold small text-success"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowTeaModal(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button variant="warning" type="submit" disabled={submitting} className="fw-bold px-4">
              {submitting ? <Spinner size="sm" /> : 'Lưu Sản Phẩm'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ================= MODAL: THÊM / SỬA CATEGORY ================= */}
      <Modal show={showCategoryModal} onHide={() => !submitting && setShowCategoryModal(false)} centered>
        <Form onSubmit={handleSaveCategory} noValidate>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold fs-5">
              {categoryEditing ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form.Group controlId="categoryName">
              <Form.Label className="fw-semibold small">Tên Danh Mục *</Form.Label>
              <Form.Control
                placeholder="VD: Trà trái cây tươi, Trà sữa truyền thống..."
                value={categoryForm.name}
                onChange={(e) => {
                  setCategoryForm({ ...categoryForm, name: e.target.value });
                  if (categoryErrors.name) setCategoryErrors({ ...categoryErrors, name: '' });
                }}
                isInvalid={Boolean(categoryErrors.name)}
              />
              {categoryErrors.name && (
                <Form.Control.Feedback type="invalid" className="d-block small">
                  <i className="bi bi-exclamation-circle-fill me-1"></i>
                  {categoryErrors.name}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowCategoryModal(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button variant="warning" type="submit" disabled={submitting} className="fw-bold px-4">
              {submitting ? <Spinner size="sm" /> : 'Lưu Danh Mục'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ================= MODAL: THÊM / SỬA TOPPING ================= */}
      <Modal show={showToppingModal} onHide={() => !submitting && setShowToppingModal(false)} centered>
        <Form onSubmit={handleSaveTopping} noValidate>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold fs-5">
              {toppingEditing ? 'Chỉnh Sửa Topping' : 'Thêm Topping Mới'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3" controlId="toppingName">
              <Form.Label className="fw-semibold small">Tên Topping *</Form.Label>
              <Form.Control
                placeholder="VD: Trân châu hoàng kim"
                value={toppingForm.name}
                onChange={(e) => {
                  setToppingForm({ ...toppingForm, name: e.target.value });
                  if (toppingErrors.name) setToppingErrors({ ...toppingErrors, name: '' });
                }}
                isInvalid={Boolean(toppingErrors.name)}
              />
              {toppingErrors.name && (
                <Form.Control.Feedback type="invalid" className="d-block small">
                  <i className="bi bi-exclamation-circle-fill me-1"></i>
                  {toppingErrors.name}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="toppingPrice">
              <Form.Label className="fw-semibold small">Giá Tiền (VNĐ) *</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="1000"
                placeholder="VD: 8000"
                value={toppingForm.price}
                onChange={(e) => {
                  setToppingForm({ ...toppingForm, price: e.target.value });
                  if (toppingErrors.price) setToppingErrors({ ...toppingErrors, price: '' });
                }}
                isInvalid={Boolean(toppingErrors.price)}
              />
              {toppingErrors.price && (
                <Form.Control.Feedback type="invalid" className="d-block small">
                  <i className="bi bi-exclamation-circle-fill me-1"></i>
                  {toppingErrors.price}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group controlId="toppingIsAvailable">
              <Form.Check
                type="switch"
                label="Topping đang còn hàng (Bỏ tick nếu tạm hết hàng)"
                checked={toppingForm.isAvailable}
                onChange={(e) => setToppingForm({ ...toppingForm, isAvailable: e.target.checked })}
                className="fw-semibold small text-success"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowToppingModal(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button variant="warning" type="submit" disabled={submitting} className="fw-bold px-4">
              {submitting ? <Spinner size="sm" /> : 'Lưu Topping'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ================= MODAL: THÊM / SỬA SIZE ================= */}
      <Modal show={showSizeModal} onHide={() => !submitting && setShowSizeModal(false)} centered>
        <Form onSubmit={handleSaveSize} noValidate>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold fs-5">
              {sizeEditing ? 'Chỉnh Sửa Kích Cỡ Ly' : 'Thêm Kích Cỡ Ly Mới'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3" controlId="sizeName">
              <Form.Label className="fw-semibold small">Tên Kích Cỡ *</Form.Label>
              <Form.Control
                placeholder="VD: Size L (Cỡ lớn)"
                value={sizeForm.name}
                onChange={(e) => {
                  setSizeForm({ ...sizeForm, name: e.target.value });
                  if (sizeErrors.name) setSizeErrors({ ...sizeErrors, name: '' });
                }}
                isInvalid={Boolean(sizeErrors.name)}
              />
              {sizeErrors.name && (
                <Form.Control.Feedback type="invalid" className="d-block small">
                  <i className="bi bi-exclamation-circle-fill me-1"></i>
                  {sizeErrors.name}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group controlId="sizeCode">
                  <Form.Label className="fw-semibold small">Mã Size (Code) *</Form.Label>
                  <Form.Control
                    placeholder="VD: M, L, XL"
                    value={sizeForm.code}
                    onChange={(e) => {
                      setSizeForm({ ...sizeForm, code: e.target.value });
                      if (sizeErrors.code) setSizeErrors({ ...sizeErrors, code: '' });
                    }}
                    isInvalid={Boolean(sizeErrors.code)}
                  />
                  {sizeErrors.code && (
                    <Form.Control.Feedback type="invalid" className="d-block small">
                      <i className="bi bi-exclamation-circle-fill me-1"></i>
                      {sizeErrors.code}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="sizeExtraPrice">
                  <Form.Label className="fw-semibold small">Phụ Thu Giá (VNĐ) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="VD: 6000"
                    value={sizeForm.extraPrice}
                    onChange={(e) => {
                      setSizeForm({ ...sizeForm, extraPrice: e.target.value });
                      if (sizeErrors.extraPrice) setSizeErrors({ ...sizeErrors, extraPrice: '' });
                    }}
                    isInvalid={Boolean(sizeErrors.extraPrice)}
                  />
                  {sizeErrors.extraPrice && (
                    <Form.Control.Feedback type="invalid" className="d-block small">
                      <i className="bi bi-exclamation-circle-fill me-1"></i>
                      {sizeErrors.extraPrice}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-2" controlId="sizeIsDefault">
              <Form.Check
                type="checkbox"
                label="Đặt làm Size mặc định khi khách chọn món"
                checked={sizeForm.isDefault}
                onChange={(e) => setSizeForm({ ...sizeForm, isDefault: e.target.checked })}
                className="fw-semibold small"
              />
            </Form.Group>

            <Form.Group controlId="sizeIsAvailable">
              <Form.Check
                type="switch"
                label="Size ly này đang khả dụng phục vụ"
                checked={sizeForm.isAvailable}
                onChange={(e) => setSizeForm({ ...sizeForm, isAvailable: e.target.checked })}
                className="fw-semibold small text-success"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowSizeModal(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button variant="warning" type="submit" disabled={submitting} className="fw-bold px-4">
              {submitting ? <Spinner size="sm" /> : 'Lưu Kích Cỡ'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ================= MODAL: XÁC NHẬN XÓA ================= */}
      <Modal show={deleteConfirm.show} onHide={() => setDeleteConfirm({ ...deleteConfirm, show: false })} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold fs-5 text-danger d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{deleteConfirm.title}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-2">
          <p className="text-muted mb-0">{deleteConfirm.message}</p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setDeleteConfirm({ ...deleteConfirm, show: false })}>
            Hủy bỏ
          </Button>
          <Button
            variant="danger"
            className="fw-bold px-4"
            onClick={async () => {
              if (deleteConfirm.onConfirm) {
                await deleteConfirm.onConfirm();
              }
              setDeleteConfirm({ ...deleteConfirm, show: false });
            }}
          >
            Đồng Ý Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
}

export default AdminMenuPage;
