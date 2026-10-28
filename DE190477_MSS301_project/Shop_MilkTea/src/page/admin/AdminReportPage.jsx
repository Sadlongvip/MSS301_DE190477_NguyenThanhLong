import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Spinner,
  Tab,
  Nav,
  ProgressBar,
} from 'react-bootstrap';
import AdminLayout from '../../layout/AdminLayout';
import useReport from '../../hook/useReport';
import { formatPrice } from '../../util/formatPrice';
import { DEFAULT_TEA_IMAGE } from '../../constant/landingData';

/**
 * Helper: Tạo đường cong/cung SVG cho biểu đồ Donut (Bánh kem)
 */
function createDonutArc(cx, cy, rInner, rOuter, startAngle, endAngle) {
  const rad = (deg) => ((deg - 90) * Math.PI) / 180;
  const x1 = cx + rOuter * Math.cos(rad(endAngle));
  const y1 = cy + rOuter * Math.sin(rad(endAngle));
  const x2 = cx + rOuter * Math.cos(rad(startAngle));
  const y2 = cy + rOuter * Math.sin(rad(startAngle));
  const x3 = cx + rInner * Math.cos(rad(startAngle));
  const y3 = cy + rInner * Math.sin(rad(startAngle));
  const x4 = cx + rInner * Math.cos(rad(endAngle));
  const y4 = cy + rInner * Math.sin(rad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 1 ${x4} ${y4} Z`;
}

/**
 * Component: Biểu đồ Bánh Kem (Donut / Pie Chart)
 */
function DonutChart({ data = [], centerLabel = 'Tổng số', centerValue = 0, unit = '' }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  }, [data]);

  const slices = useMemo(() => {
    if (!total || total === 0) return [];
    let currentAngle = 0;
    return data.map((item, idx) => {
      const val = Number(item.value) || 0;
      const sliceAngle = (val / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;
      return {
        ...item,
        startAngle,
        endAngle: Math.min(endAngle, 359.99),
        percentage: ((val / total) * 100).toFixed(1),
        idx,
      };
    });
  }, [data, total]);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-pie-chart text-secondary fs-1 d-block mb-2"></i>
        <span className="small">Chưa có dữ liệu thống kê cho mục này</span>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center">
      <div style={{ position: 'relative', width: '220px', height: '220px' }}>
        <svg viewBox="0 0 240 240" width="100%" height="100%">
          {slices.map((slice) => {
            const isHovered = hoveredIdx === slice.idx;
            const rInner = isHovered ? 60 : 64;
            const rOuter = isHovered ? 104 : 100;
            const pathD = createDonutArc(120, 120, rInner, rOuter, slice.startAngle, slice.endAngle);
            return (
              <path
                key={slice.idx}
                d={pathD}
                fill={slice.color}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  opacity: hoveredIdx === null || hoveredIdx === slice.idx ? 1 : 0.6,
                }}
                onMouseEnter={() => setHoveredIdx(slice.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Text ở tâm biểu đồ bánh kem */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            maxWidth: '120px',
          }}
        >
          {hoveredIdx !== null ? (
            <>
              <small className="text-muted d-block fw-semibold" style={{ fontSize: '0.7rem' }}>
                {slices[hoveredIdx]?.label}
              </small>
              <span className="fw-bold fs-6 text-dark d-block">
                {unit === 'VNĐ'
                  ? formatPrice(slices[hoveredIdx]?.value)
                  : `${slices[hoveredIdx]?.value} ${unit}`}
              </span>
              <Badge bg="dark" style={{ fontSize: '0.65rem' }}>
                {slices[hoveredIdx]?.percentage}%
              </Badge>
            </>
          ) : (
            <>
              <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                {centerLabel}
              </small>
              <span className="fw-bold fs-6 text-dark d-block">
                {unit === 'VNĐ' ? formatPrice(centerValue) : `${centerValue} ${unit}`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Chú thích (Legend) */}
      <div className="w-100 mt-3">
        <div className="d-flex flex-wrap justify-content-center gap-2">
          {slices.map((item) => (
            <div
              key={item.idx}
              className={`d-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill small border ${
                hoveredIdx === item.idx ? 'bg-white shadow-sm border-warning' : 'bg-light border-transparent'
              }`}
              style={{ cursor: 'pointer', fontSize: '0.76rem', transition: 'all 0.2s' }}
              onMouseEnter={() => setHoveredIdx(item.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <span
                className="rounded-circle d-inline-block"
                style={{ width: '9px', height: '9px', backgroundColor: item.color }}
              ></span>
              <span className="fw-semibold text-dark">{item.label}:</span>
              <span className="text-muted">
                {unit === 'VNĐ' ? formatPrice(item.value) : item.value} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Component: Biểu đồ Cột & Đường Doanh Thu (Combo Bar & Line Chart)
 */
function RevenueTrendChart({ trends = [] }) {
  const [chartMode, setChartMode] = useState('combo'); // 'combo' | 'bar' | 'line'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Kích thước SVG
  const width = 800;
  const height = 300;
  const padding = { top: 30, right: 40, bottom: 45, left: 75 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxRevenue = useMemo(() => {
    if (!trends || trends.length === 0) return 100000;
    const maxVal = Math.max(...trends.map((t) => Number(t.revenue) || 0));
    return maxVal > 0 ? maxVal * 1.15 : 100000;
  }, [trends]);

  const maxOrders = useMemo(() => {
    if (!trends || trends.length === 0) return 10;
    const maxVal = Math.max(...trends.map((t) => Number(t.totalOrders ?? t.orderCount ?? 0)));
    return maxVal > 0 ? Math.ceil(maxVal * 1.2) : 10;
  }, [trends]);

  if (!trends || trends.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-bar-chart-line text-secondary fs-1 d-block mb-2"></i>
        <span>Chưa có dữ liệu xu hướng doanh thu trong thời gian này</span>
      </div>
    );
  }

  const stepX = chartW / Math.max(trends.length, 1);
  const barWidth = Math.min(stepX * 0.55, 36);

  // Tính tọa độ đường biểu diễn số đơn
  const linePoints = trends.map((t, i) => {
    const x = padding.left + i * stepX + stepX / 2;
    const orderCount = Number(t.totalOrders ?? t.orderCount ?? 0);
    const y = padding.top + chartH - (orderCount / maxOrders) * chartH;
    return { x, y, orderCount, ...t };
  });

  const polylinePoints = linePoints.map((p) => `${p.x},${p.y}`).join(' ');

  // 4 vạch ngang tỷ lệ
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div>
      {/* Header điều khiển chế độ hiển thị */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-1.5 small">
            <span
              className="rounded"
              style={{ width: '12px', height: '12px', background: 'linear-gradient(180deg, #f59e0b, #d97706)' }}
            ></span>
            <span className="text-secondary fw-semibold">Cột: Doanh thu (VNĐ)</span>
          </div>
          <div className="d-flex align-items-center gap-1.5 small">
            <span
              className="rounded-circle"
              style={{ width: '10px', height: '10px', backgroundColor: '#3b82f6' }}
            ></span>
            <span className="text-secondary fw-semibold">Đường: Số đơn hàng</span>
          </div>
        </div>

        {/* Nút đổi kiểu xem */}
        <div className="d-inline-flex p-1 bg-light border rounded-pill shadow-sm" style={{ gap: '2px' }}>
          <Button
            size="sm"
            variant={chartMode === 'combo' ? 'warning' : 'light'}
            className={`px-2.5 py-1 rounded-pill border-0 fw-semibold ${
              chartMode === 'combo' ? 'text-dark shadow-sm' : 'text-muted bg-transparent'
            }`}
            style={{ fontSize: '0.74rem' }}
            onClick={() => setChartMode('combo')}
          >
            Kết Hợp
          </Button>
          <Button
            size="sm"
            variant={chartMode === 'bar' ? 'warning' : 'light'}
            className={`px-2.5 py-1 rounded-pill border-0 fw-semibold ${
              chartMode === 'bar' ? 'text-dark shadow-sm' : 'text-muted bg-transparent'
            }`}
            style={{ fontSize: '0.74rem' }}
            onClick={() => setChartMode('bar')}
          >
            Biểu Đồ Cột
          </Button>
          <Button
            size="sm"
            variant={chartMode === 'line' ? 'warning' : 'light'}
            className={`px-2.5 py-1 rounded-pill border-0 fw-semibold ${
              chartMode === 'line' ? 'text-dark shadow-sm' : 'text-muted bg-transparent'
            }`}
            style={{ fontSize: '0.74rem' }}
            onClick={() => setChartMode('line')}
          >
            Biểu Đồ Đường
          </Button>
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', minWidth: '600px', height: 'auto', display: 'block' }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="barHoverGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="lineAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Vạch ngang & nhãn trục Y */}
          {yTicks.map((ratio, idx) => {
            const y = padding.top + chartH - ratio * chartH;
            const revLabel = (ratio * maxRevenue) / 1000 >= 1000
              ? `${((ratio * maxRevenue) / 1000000).toFixed(1)}M`
              : `${Math.round((ratio * maxRevenue) / 1000)}k`;
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray={ratio === 0 ? '0' : '4 4'}
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="500"
                >
                  {revLabel}
                </text>
              </g>
            );
          })}

          {/* CỘT DOANH THU (BARS) */}
          {(chartMode === 'combo' || chartMode === 'bar') &&
            trends.map((item, i) => {
              const xCenter = padding.left + i * stepX + stepX / 2;
              const barX = xCenter - barWidth / 2;
              const rev = Number(item.revenue) || 0;
              const barH = Math.max((rev / maxRevenue) * chartH, 3);
              const barY = padding.top + chartH - barH;
              const isHovered = hoveredPoint?.index === i;

              return (
                <rect
                  key={i}
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barH}
                  rx="4"
                  ry="4"
                  fill={isHovered ? 'url(#barHoverGradient)' : 'url(#barGradient)'}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={() => setHoveredPoint({ ...item, x: xCenter, y: barY, index: i })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}

          {/* VÙNG ĐỔ BÓNG DƯỚI ĐƯỜNG (LINE AREA) */}
          {(chartMode === 'combo' || chartMode === 'line') && linePoints.length > 1 && (
            <polygon
              points={`${linePoints[0].x},${padding.top + chartH} ${polylinePoints} ${
                linePoints[linePoints.length - 1].x
              },${padding.top + chartH}`}
              fill="url(#lineAreaGradient)"
            />
          )}

          {/* ĐƯỜNG XU HƯỚNG SỐ ĐƠN (POLYLINE) */}
          {(chartMode === 'combo' || chartMode === 'line') && linePoints.length > 1 && (
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* CÁC ĐIỂM TRÒN TRÊN ĐƯỜNG */}
          {(chartMode === 'combo' || chartMode === 'line') &&
            linePoints.map((p, i) => {
              const isHovered = hoveredPoint?.index === i;
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill="#ffffff"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={() => setHoveredPoint({ ...p, index: i })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}

          {/* NHÃN TRỤC X (NGÀY THÁNG) */}
          {trends.map((item, i) => {
            const xCenter = padding.left + i * stepX + stepX / 2;
            const rawDate = item.reportDate || item.date || `D${i + 1}`;
            // Rút gọn ngày (VD: 2026-10-24 -> 24/10)
            const parts = rawDate.split('-');
            const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : rawDate;

            return (
              <text
                key={i}
                x={xCenter}
                y={height - 15}
                textAnchor="middle"
                fill="#64748b"
                fontSize="10.5"
                fontWeight="600"
              >
                {displayDate}
              </text>
            );
          })}
        </svg>

        {/* Tooltip khi hover */}
        {hoveredPoint && (
          <div
            className="shadow-lg rounded-3 p-2 bg-dark text-white position-absolute"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: '10px',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
              zIndex: 10,
              fontSize: '0.78rem',
              minWidth: '150px',
            }}
          >
            <div className="fw-bold text-warning border-bottom border-secondary pb-1 mb-1">
              {hoveredPoint.reportDate || hoveredPoint.date}
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-light opacity-75">Doanh thu:</span>
              <strong className="text-white">{formatPrice(hoveredPoint.revenue || 0)}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-light opacity-75">Tổng đơn:</span>
              <strong className="text-info">{hoveredPoint.totalOrders ?? hoveredPoint.orderCount ?? 0} đơn</strong>
            </div>
            {hoveredPoint.completedOrders !== undefined && (
              <div className="d-flex justify-content-between">
                <span className="text-light opacity-75">Thành công:</span>
                <span className="text-success">{hoveredPoint.completedOrders} đơn</span>
              </div>
            )}
            {hoveredPoint.cancelledOrders !== undefined && hoveredPoint.cancelledOrders > 0 && (
              <div className="d-flex justify-content-between">
                <span className="text-light opacity-75">Đã hủy:</span>
                <span className="text-danger">{hoveredPoint.cancelledOrders} đơn</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * AdminReportPage - Trang Báo Cáo & Thống Kê Phân Tích Doanh Thu Hệ Thống
 */
export function AdminReportPage() {
  const { dashboardData, summary, dateFilter, loading, fetchDashboardReport, changeDateFilter, exportOrdersReportCsv } = useReport();
  const [activeTab, setActiveTab] = useState('daily');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchDashboardReport(dateFilter);
  }, [fetchDashboardReport, dateFilter]);

  const handleExportCsv = async () => {
    setExporting(true);
    await exportOrdersReportCsv(dateFilter);
    setExporting(false);
  };


  // Trích xuất dữ liệu xu hướng doanh thu
  const trends = useMemo(() => {
    return dashboardData?.revenueTrends || dashboardData?.dailyRevenueTrend || [];
  }, [dashboardData]);

  // Trích xuất dữ liệu Top bán chạy
  const topSelling = useMemo(() => {
    return dashboardData?.topSelling || dashboardData?.topSellingProducts || [];
  }, [dashboardData]);

  // Dữ liệu Donut Chart 1: Trạng thái đơn hàng
  const statusChartData = useMemo(() => {
    const list = dashboardData?.orderStatusDistribution || [];
    const colorMap = {
      COMPLETED: '#10b981',
      DELIVERED: '#10b981',
      CONFIRMED: '#3b82f6',
      PROCESSING: '#f59e0b',
      PENDING: '#f59e0b',
      CANCELLED: '#ef4444',
      FAILED: '#ef4444',
    };
    const labelMap = {
      COMPLETED: 'Hoàn thành',
      DELIVERED: 'Đã giao',
      CONFIRMED: 'Đã duyệt',
      PROCESSING: 'Đang làm',
      PENDING: 'Chờ xử lý',
      CANCELLED: 'Đã hủy',
      FAILED: 'Thất bại',
    };
    return list.map((item) => ({
      label: labelMap[item.status] || item.status,
      value: Number(item.count || item.totalOrders || 0),
      color: colorMap[item.status] || '#8b5cf6',
    }));
  }, [dashboardData]);

  // Dữ liệu Donut Chart 2: Phương thức thanh toán
  const paymentChartData = useMemo(() => {
    const list = dashboardData?.paymentMethods || dashboardData?.paymentMethodBreakdown || [];
    const colorList = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    return list.map((item, idx) => ({
      label: item.paymentMethod || item.method || `Phương thức ${idx + 1}`,
      value: Number(item.totalAmount ?? item.orderCount ?? item.count ?? 0),
      color: colorList[idx % colorList.length],
    }));
  }, [dashboardData]);

  const totalOrders = useMemo(() => {
    return summary?.totalOrdersCount ?? summary?.totalOrders ?? statusChartData.reduce((s, i) => s + i.value, 0);
  }, [summary, statusChartData]);

  const totalRev = useMemo(() => {
    return summary?.totalRevenue || 0;
  }, [summary]);

  return (
    <AdminLayout pageTitle="Phân Tích & Báo Cáo Doanh Thu Bán Hàng">
      {/* 1. HEADER BANNER VÀ BỘ LỌC THỜI GIAN */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-3 p-md-4 rounded-4 shadow-sm border">
        <div>
          <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-pie-chart-fill text-warning"></i>
            <span>Trung Tâm Báo Cáo & Biểu Đồ Thống Kê</span>
          </h4>
          <p className="text-muted small mb-0">
            Trực quan hóa doanh số bán trà sữa bằng biểu đồ đường cột và biểu đồ tròn bánh kem.
          </p>
        </div>

        {/* Nút lọc thời gian & Xuất file báo cáo */}
        <div className="d-flex align-items-center flex-wrap gap-2">
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

          <Button
            variant="outline-success"
            size="sm"
            className="rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm bg-white"
            style={{ fontSize: '0.82rem' }}
            disabled={exporting}
            onClick={handleExportCsv}
            title="Tải file CSV danh sách đơn hàng để mở trong Excel"
          >
            {exporting ? (
              <>
                <Spinner animation="border" size="sm" />
                <span>Đang xuất file...</span>
              </>
            ) : (
              <>
                <i className="bi bi-file-earmark-excel-fill text-success fs-6"></i>
                <span>Xuất Báo Cáo (CSV)</span>
              </>
            )}
          </Button>
        </div>
      </div>


      {loading && !dashboardData ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="warning" />
          <p className="text-muted small mt-2">Đang tải và tính toán biểu đồ phân tích...</p>
        </div>
      ) : (
        <>
          {/* 2. CHỈ SỐ KPI TÓM TẮT TRÊN CÙNG */}
          <Row className="g-3 mb-4">
            <Col xs={12} sm={6} lg={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100 p-3" style={{ background: '#ecfdf5' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-success small fw-semibold text-uppercase">Doanh Thu Thu Được</span>
                  <i className="bi bi-cash-stack text-success fs-5"></i>
                </div>
                <h4 className="fw-bold text-dark mb-1">{formatPrice(totalRev)}</h4>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Tổng tiền đơn hoàn thành</small>
              </Card>
            </Col>

            <Col xs={12} sm={6} lg={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100 p-3" style={{ background: '#eff6ff' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-primary small fw-semibold text-uppercase">Tổng Số Đơn Hàng</span>
                  <i className="bi bi-receipt text-primary fs-5"></i>
                </div>
                <h4 className="fw-bold text-dark mb-1">{totalOrders} đơn</h4>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Trong khoảng thời gian chọn</small>
              </Card>
            </Col>

            <Col xs={12} sm={6} lg={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100 p-3" style={{ background: '#fef3c7' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-warning small fw-semibold text-uppercase">Giá Trị Đơn Trung Bình</span>
                  <i className="bi bi-calculator text-warning fs-5"></i>
                </div>
                <h4 className="fw-bold text-dark mb-1">
                  {totalOrders > 0 ? formatPrice(Math.round(totalRev / totalOrders)) : '0 đ'}
                </h4>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>AOV (Average Order Value)</small>
              </Card>
            </Col>

            <Col xs={12} sm={6} lg={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100 p-3" style={{ background: '#fdf4ff' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-semibold text-uppercase" style={{ color: '#9333ea' }}>Tỷ Lệ Thành Công</span>
                  <i className="bi bi-shield-check fs-5" style={{ color: '#9333ea' }}></i>
                </div>
                <h4 className="fw-bold text-dark mb-1">
                  {totalOrders > 0
                    ? `${Math.round(((summary?.completedOrdersCount || summary?.totalCompletedOrders || 0) / totalOrders) * 100)}%`
                    : '100%'}
                </h4>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Đơn giao thành công</small>
              </Card>
            </Col>
          </Row>

          {/* 3. KHU VỰC BIỂU ĐỒ: BIỂU ĐỒ CỘT & ĐƯỜNG DOANH THU */}
          <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white">
            <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                  <i className="bi bi-bar-chart-fill text-warning"></i>
                  <span>Biểu Đồ Xu Hướng Doanh Thu & Số Đơn Theo Ngày</span>
                </h5>
                <p className="text-muted small mb-0">
                  Biểu diễn doanh thu (cột vàng) và số lượng đơn hàng (đường xanh) theo từng mốc thời gian.
                </p>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <RevenueTrendChart trends={trends} />
            </Card.Body>
          </Card>

          {/* 4. KHU VỰC BIỂU ĐỒ BÁNH KEM (PIE / DONUT CHARTS) */}
          <Row className="g-4 mb-4">
            {/* Biểu đồ bánh kem 1: Tỷ lệ phân bố trạng thái đơn */}
            <Col xs={12} lg={6}>
              <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
                <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                      <i className="bi bi-pie-chart-fill text-success"></i>
                      <span>Biểu Đồ Bánh Kem: Trạng Thái Đơn Hàng</span>
                    </h6>
                    <small className="text-muted">Tỷ trọng các đơn hoàn thành, chờ duyệt và bị hủy</small>
                  </div>
                </Card.Header>
                <Card.Body className="p-4">
                  <DonutChart
                    data={statusChartData}
                    centerLabel="Tổng Đơn"
                    centerValue={totalOrders}
                    unit="đơn"
                  />
                </Card.Body>
              </Card>
            </Col>

            {/* Biểu đồ bánh kem 2: Phương thức thanh toán */}
            <Col xs={12} lg={6}>
              <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
                <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                      <i className="bi bi-credit-card-2-front-fill text-primary"></i>
                      <span>Biểu Đồ Bánh Kem: Phương Thức Thanh Toán</span>
                    </h6>
                    <small className="text-muted">Cơ cấu doanh số giữa Tiền mặt, VNPAY, Chuyển khoản...</small>
                  </div>
                </Card.Header>
                <Card.Body className="p-4">
                  <DonutChart
                    data={paymentChartData}
                    centerLabel="Doanh Thu"
                    centerValue={totalRev}
                    unit="VNĐ"
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* 5. BẢNG THỐNG KÊ CHI TIẾT SỐ LIỆU */}
          <Card className="border-0 shadow-sm rounded-4 bg-white mb-4">
            <Card.Header className="bg-transparent border-bottom pt-3 px-4 pb-0">
              <Nav variant="tabs" className="border-0" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav.Item>
                  <Nav.Link eventKey="daily" className="fw-bold text-dark py-2.5 px-3">
                    <i className="bi bi-calendar3 me-2 text-warning"></i>
                    Bảng Thống Kê Theo Ngày ({trends.length} ngày)
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="topSelling" className="fw-bold text-dark py-2.5 px-3">
                    <i className="bi bi-trophy-fill me-2 text-warning"></i>
                    Bảng Xếp Hạng Top Món Bán Chạy ({topSelling.length} món)
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>

            <Card.Body className="p-0">
              {activeTab === 'daily' ? (
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead className="bg-light border-bottom">
                      <tr className="text-muted small text-uppercase">
                        <th className="ps-4">Ngày Báo Cáo</th>
                        <th>Doanh Thu (VNĐ)</th>
                        <th>Tổng Đơn Hàng</th>
                        <th>Đơn Thành Công</th>
                        <th>Đơn Đã Hủy</th>
                        <th>Tỷ Lệ Thành Công</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trends.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-4 text-muted small">
                            Không có dữ liệu theo ngày trong khoảng thời gian này.
                          </td>
                        </tr>
                      ) : (
                        trends.map((item, idx) => {
                          const rev = Number(item.revenue) || 0;
                          const total = Number(item.totalOrders ?? item.orderCount ?? 0);
                          const comp = Number(item.completedOrders ?? total);
                          const cancel = Number(item.cancelledOrders ?? 0);
                          const rate = total > 0 ? Math.round((comp / total) * 100) : 100;

                          return (
                            <tr key={idx}>
                              <td className="ps-4 fw-bold text-dark">
                                <i className="bi bi-calendar-event me-2 text-secondary"></i>
                                {item.reportDate || item.date}
                              </td>
                              <td className="fw-bold text-success">{formatPrice(rev)}</td>
                              <td>
                                <Badge bg="light" text="dark" className="border px-2.5 py-1">
                                  {total} đơn
                                </Badge>
                              </td>
                              <td>
                                <span className="text-success fw-semibold">
                                  <i className="bi bi-check-circle-fill me-1"></i>
                                  {comp}
                                </span>
                              </td>
                              <td>
                                <span className={cancel > 0 ? 'text-danger fw-semibold' : 'text-muted'}>
                                  {cancel > 0 ? <i className="bi bi-x-circle-fill me-1"></i> : null}
                                  {cancel}
                                </span>
                              </td>
                              <td style={{ minWidth: '150px' }}>
                                <div className="d-flex align-items-center gap-2">
                                  <ProgressBar
                                    variant={rate >= 80 ? 'success' : rate >= 50 ? 'warning' : 'danger'}
                                    now={rate}
                                    style={{ height: '6px', flexGrow: 1 }}
                                    className="rounded-pill"
                                  />
                                  <span className="small fw-semibold text-muted" style={{ minWidth: '35px' }}>
                                    {rate}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead className="bg-light border-bottom">
                      <tr className="text-muted small text-uppercase">
                        <th className="ps-4">Hạng</th>
                        <th>Món Trà Sữa</th>
                        <th>Số Lượng Bán Ra</th>
                        <th>Doanh Thu Mang Lại</th>
                        <th>Tỷ Trọng Đóng Góp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topSelling.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted small">
                            Chưa có dữ liệu món bán chạy.
                          </td>
                        </tr>
                      ) : (
                        topSelling.map((item, idx) => {
                          const sold = Number(item.totalQuantitySold ?? item.totalSold ?? item.quantity ?? 0);
                          const rev = Number(item.totalRevenue ?? item.revenue ?? 0);
                          const share = totalRev > 0 ? ((rev / totalRev) * 100).toFixed(1) : 0;

                          return (
                            <tr key={idx}>
                              <td className="ps-4">
                                <span
                                  className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold"
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    backgroundColor: idx === 0 ? '#fef3c7' : idx === 1 ? '#f1f5f9' : idx === 2 ? '#ffedd5' : '#f8fafc',
                                    color: idx === 0 ? '#b45309' : idx === 1 ? '#475569' : idx === 2 ? '#c2410c' : '#64748b',
                                    fontSize: '0.82rem',
                                  }}
                                >
                                  {idx + 1}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2.5">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt=""
                                      className="rounded-3 shadow-sm object-fit-cover"
                                      style={{ width: '38px', height: '38px' }}
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = DEFAULT_TEA_IMAGE;
                                      }}
                                    />
                                  )}
                                  <div>
                                    <span className="fw-bold text-dark d-block">
                                      {item.milkTeaName || item.productName || item.name}
                                    </span>
                                    <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                                      ID: #{item.milkTeaId || item.productId || idx + 1}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <Badge bg="warning" text="dark" className="px-2.5 py-1 fw-bold rounded-pill">
                                  {sold} ly
                                </Badge>
                              </td>
                              <td className="fw-bold text-success">{formatPrice(rev)}</td>
                              <td style={{ minWidth: '160px' }}>
                                <div className="d-flex align-items-center gap-2">
                                  <ProgressBar
                                    variant="warning"
                                    now={Number(share)}
                                    style={{ height: '6px', flexGrow: 1 }}
                                    className="rounded-pill"
                                  />
                                  <span className="small fw-semibold text-muted" style={{ minWidth: '40px' }}>
                                    {share}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </AdminLayout>
  );
}

export default AdminReportPage;
