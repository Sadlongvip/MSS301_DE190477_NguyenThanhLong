import React, { useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge, ButtonGroup, Spinner, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layout/AdminLayout';
import useReport from '../../hook/useReport';
import useInventory from '../../hook/useInventory';
import { formatPrice } from '../../util/formatPrice';

/**
 * AdminDashboardPage - Trang Chính (Landing Page) của Quản Trị Viên
 * Trực tiếp hiển thị Báo Cáo Thống Kê kinh doanh & cung cấp các nút điều hướng nhanh
 * Tuân thủ chuẩn kiến trúc: Context là nơi duy nhất gọi API từ reportService.
 */
export function AdminDashboardPage() {
  const { dashboardData, summary, dateFilter, loading, fetchDashboardReport, changeDateFilter } = useReport();
  const { milkTeas } = useInventory();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardReport(dateFilter);
  }, [fetchDashboardReport, dateFilter]);

  const topSelling = dashboardData?.topSellingProducts || [];
  const orderDistribution = dashboardData?.orderStatusDistribution || [];
  const dailyTrend = dashboardData?.dailyRevenueTrend || [];

  return (
    <AdminLayout pageTitle="Báo Cáo & Thống Kê Hoạt Động Hệ Thống">
      {/* 1. HEADER BANNER & BỘ LỌC THỜI GIAN */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-3 p-md-4 rounded-4 shadow-sm border">
        <div>
          <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-graph-up-arrow text-warning"></i>
            <span>Tổng Quan Hoạt Động & Doanh Thu</span>
          </h4>
          <p className="text-muted small mb-0">
            Dữ liệu thống kê doanh số, số lượng đơn hàng và các món trà sữa được ưa chuộng nhất.
          </p>
        </div>

        {/* Nút lọc ngày - Đã fix lỗi viền khung */}
        <div
          className="d-inline-flex align-items-center p-1 bg-light border rounded-pill shadow-sm"
          style={{ gap: '4px' }}
        >
          <Button
            variant={dateFilter === 'today' ? 'warning' : 'light'}
            size="sm"
            className={`px-3 py-1.5 rounded-pill fw-semibold border-0 ${
              dateFilter === 'today' ? 'text-dark shadow-sm' : 'text-muted bg-transparent'
            }`}
            style={{ fontSize: '0.82rem', transition: 'all 0.2s ease' }}
            onClick={() => changeDateFilter('today')}
          >
            Hôm nay
          </Button>
          <Button
            variant={dateFilter === '7days' ? 'warning' : 'light'}
            size="sm"
            className={`px-3 py-1.5 rounded-pill fw-semibold border-0 ${
              dateFilter === '7days' ? 'text-dark shadow-sm' : 'text-muted bg-transparent'
            }`}
            style={{ fontSize: '0.82rem', transition: 'all 0.2s ease' }}
            onClick={() => changeDateFilter('7days')}
          >
            7 ngày qua
          </Button>
          <Button
            variant={dateFilter === '30days' ? 'warning' : 'light'}
            size="sm"
            className={`px-3 py-1.5 rounded-pill fw-semibold border-0 ${
              dateFilter === '30days' ? 'text-dark shadow-sm' : 'text-muted bg-transparent'
            }`}
            style={{ fontSize: '0.82rem', transition: 'all 0.2s ease' }}
            onClick={() => changeDateFilter('30days')}
          >
            30 ngày qua
          </Button>
        </div>
      </div>

      {loading && !dashboardData ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="warning" />
          <p className="text-muted small mt-2">Đang tổng hợp dữ liệu báo cáo...</p>
        </div>
      ) : (
        <>
          {/* 2. 4 THẺ CHỈ SỐ KPI CHÍNH */}
          <Row className="g-3 mb-4">
            {/* Tổng Doanh Thu */}
            <Col xs={12} sm={6} lg={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ background: '#ecfdf5' }}>
                <Card.Body className="p-3.5">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-success fw-semibold small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                      Tổng Doanh Thu
                    </span>
                    <div className="rounded-3 bg-success bg-opacity-10 p-2 text-success">
                      <i className="bi bi-cash-coin fs-5"></i>
                    </div>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">
                    {formatPrice(summary?.totalRevenue || 0)}
                  </h3>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Từ các đơn hàng hoàn thành
                  </small>
                </Card.Body>
              </Card>
            </Col>

            {/* Tổng Đơn Hoàn Thành */}
            <Col xs={12} sm={6} lg={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ background: '#eff6ff' }}>
                <Card.Body className="p-3.5">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-primary fw-semibold small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                      Đơn Đã Giao
                    </span>
                    <div className="rounded-3 bg-primary bg-opacity-10 p-2 text-primary">
                      <i className="bi bi-bag-check-fill fs-5"></i>
                    </div>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">
                    {summary?.completedOrdersCount ?? summary?.totalCompletedOrders ?? 0}
                  </h3>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Giao thành công
                  </small>
                </Card.Body>
              </Card>
            </Col>

            {/* Đơn Chờ Xử Lý */}
            <Col xs={12} sm={6} lg={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ background: '#fffbeb' }}>
                <Card.Body className="p-3.5">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-warning fw-semibold small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                      Đơn Chờ Duyệt
                    </span>
                    <div className="rounded-3 bg-warning bg-opacity-20 p-2 text-warning">
                      <i className="bi bi-hourglass-split fs-5"></i>
                    </div>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">
                    {summary?.pendingOrdersCount ?? 0}
                  </h3>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Cần xác nhận đơn
                  </small>
                </Card.Body>
              </Card>
            </Col>

            {/* Tổng Món Đang Phục Vụ */}
            <Col xs={12} sm={6} lg={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ background: '#fdf4ff' }}>
                <Card.Body className="p-3.5">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-purple fw-semibold small text-uppercase" style={{ color: '#9333ea', letterSpacing: '0.04em' }}>
                      Thực Đơn Trà Sữa
                    </span>
                    <div className="rounded-3 p-2" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                      <i className="bi bi-cup-hot-fill fs-5"></i>
                    </div>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">
                    {milkTeas?.length || summary?.totalProducts || 0}
                  </h3>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Món trong kho
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* 3. NÚT ĐIỀU HƯỚNG NHANH (QUICK ACTIONS CTA) */}
          <Row className="g-3 mb-4">
            <Col xs={12} sm={6} lg={3}>
              <Card
                className="border-0 shadow-sm rounded-4 p-3 bg-white h-100"
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => navigate('/admin/orders')}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2.5 rounded-circle bg-primary bg-opacity-10 text-primary">
                    <i className="bi bi-box-seam-fill fs-5"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0.5 text-dark" style={{ fontSize: '0.9rem' }}>Quản Lý Đơn Hàng</h6>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Duyệt đơn & logs</small>
                  </div>
                  <i className="bi bi-arrow-right ms-auto text-muted"></i>
                </div>
              </Card>
            </Col>

            <Col xs={12} sm={6} lg={3}>
              <Card
                className="border-0 shadow-sm rounded-4 p-3 bg-white h-100"
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => navigate('/admin/menu')}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2.5 rounded-circle bg-warning bg-opacity-10 text-warning">
                    <i className="bi bi-cup-straw fs-5"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0.5 text-dark" style={{ fontSize: '0.9rem' }}>Quản Lý Thực Đơn</h6>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Kho trà & topping</small>
                  </div>
                  <i className="bi bi-arrow-right ms-auto text-muted"></i>
                </div>
              </Card>
            </Col>

            <Col xs={12} sm={6} lg={3}>
              <Card
                className="border-0 shadow-sm rounded-4 p-3 bg-white h-100"
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => navigate('/admin/accounts')}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2.5 rounded-circle bg-success bg-opacity-10 text-success">
                    <i className="bi bi-person-badge fs-5"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0.5 text-dark" style={{ fontSize: '0.9rem' }}>Quản Lý Tài Khoản</h6>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Phân quyền Admin/Staff</small>
                  </div>
                  <i className="bi bi-arrow-right ms-auto text-muted"></i>
                </div>
              </Card>
            </Col>

            <Col xs={12} sm={6} lg={3}>
              <Card
                className="border-0 shadow-sm rounded-4 p-3 bg-white h-100"
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => navigate('/admin/report')}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2.5 rounded-circle bg-danger bg-opacity-10 text-danger">
                    <i className="bi bi-pie-chart-fill fs-5"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0.5 text-dark" style={{ fontSize: '0.9rem' }}>Báo Cáo & Biểu Đồ</h6>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Biểu đồ cột & bánh kem</small>
                  </div>
                  <i className="bi bi-arrow-right ms-auto text-muted"></i>
                </div>
              </Card>
            </Col>
          </Row>

          {/* 4. CHI TIẾT BÁO CÁO: TOP MÓN BÁN CHẠY & PHÂN BỐ ĐƠN HÀNG */}
          <Row className="g-3">
            {/* Top món bán chạy */}
            <Col xs={12} lg={7}>
              <Card className="border-0 shadow-sm rounded-4 bg-white h-100">
                <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-trophy-fill text-warning"></i>
                    <span>Top Món Bán Chạy Nhất</span>
                  </h6>
                  <Badge bg="warning" text="dark" className="px-2.5 py-1.5 rounded-pill">
                    Top {topSelling.length} Món
                  </Badge>
                </Card.Header>
                <Card.Body className="p-4">
                  {topSelling.length === 0 ? (
                    <p className="text-muted text-center py-4 small mb-0">
                      Chưa có dữ liệu bán chạy trong khoảng thời gian này.
                    </p>
                  ) : (
                    <Table responsive hover className="align-middle mb-0">
                      <thead>
                        <tr className="text-muted small text-uppercase">
                          <th>Sản Phẩm</th>
                          <th className="text-center">Số Lượng Đã Bán</th>
                          <th className="text-end">Doanh Thu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topSelling.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <span
                                  className="fw-bold text-muted"
                                  style={{ width: '20px', fontSize: '0.85rem' }}
                                >
                                  #{idx + 1}
                                </span>
                                <span className="fw-semibold text-dark">{item.milkTeaName}</span>
                              </div>
                            </td>
                            <td className="text-center">
                              <Badge bg="light" text="dark" className="border px-2.5 py-1">
                                {item.totalQuantity} ly
                              </Badge>
                            </td>
                            <td className="text-end fw-bold text-success">
                              {formatPrice(item.totalRevenue || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Phân bố trạng thái đơn hàng */}
            <Col xs={12} lg={5}>
              <Card className="border-0 shadow-sm rounded-4 bg-white h-100">
                <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
                  <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-pie-chart-fill text-primary"></i>
                    <span>Tỷ Lệ Trạng Thái Đơn Hàng</span>
                  </h6>
                </Card.Header>
                <Card.Body className="p-4 d-flex flex-column justify-content-around">
                  {orderDistribution.length === 0 ? (
                    <p className="text-muted text-center py-4 small mb-0">
                      Chưa có đơn hàng nào trong khoảng thời gian này.
                    </p>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {orderDistribution.map((item, idx) => {
                        const count = item.count || 0;
                        const status = item.status || 'UNKNOWN';
                        let variant = 'primary';
                        let label = status;
                        if (status === 'COMPLETED') {
                          variant = 'success';
                          label = 'Hoàn thành';
                        } else if (status === 'CANCELLED') {
                          variant = 'danger';
                          label = 'Đã hủy';
                        } else if (status === 'PENDING') {
                          variant = 'warning';
                          label = 'Chờ xác nhận';
                        } else if (status === 'SHIPPING' || status === 'DELIVERING') {
                          variant = 'info';
                          label = 'Đang giao hàng';
                        }

                        return (
                          <div key={idx}>
                            <div className="d-flex justify-content-between small fw-semibold mb-1">
                              <span>{label}</span>
                              <span className="text-muted">{count} đơn</span>
                            </div>
                            <ProgressBar
                              now={count}
                              max={summary?.totalOrders || count || 10}
                              variant={variant}
                              style={{ height: '8px', borderRadius: '10px' }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-3 border-top mt-3 text-center">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate('/admin/orders')}
                      className="rounded-pill px-3"
                    >
                      <i className="bi bi-arrow-up-right me-1"></i>
                      Xem Danh Sách Đơn Chi Tiết
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </AdminLayout>
  );
}

export default AdminDashboardPage;
