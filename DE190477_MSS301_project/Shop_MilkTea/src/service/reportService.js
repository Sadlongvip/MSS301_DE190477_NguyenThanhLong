import axiosClient from '../config/axiosClient';

/**
 * Service giao tiếp với report-service thông qua API Gateway
 * Endpoints: /api/reports/*
 */
const reportService = {
  /**
   * Lấy báo cáo tổng hợp dashboard
   */
  getDashboardReport: (params = {}) => {
    return axiosClient.get('/api/reports/dashboard', { params });
  },

  /**
   * Lấy tóm tắt chỉ số KPI
   */
  getSummary: (params = {}) => {
    return axiosClient.get('/api/reports/summary', { params });
  },

  /**
   * Lấy xu hướng doanh thu theo ngày
   */
  getDailyRevenueTrend: (params = {}) => {
    return axiosClient.get('/api/reports/revenue-trend', { params });
  },

  /**
   * Lấy danh sách sản phẩm bán chạy nhất
   */
  getTopSellingProducts: (params = {}) => {
    return axiosClient.get('/api/reports/top-selling', { params });
  },

  /**
   * Lấy phân bố trạng thái đơn hàng
   */
  getOrderStatusDistribution: (params = {}) => {
    return axiosClient.get('/api/reports/order-status', { params });
  },

  /**
   * Lấy thống kê phương thức thanh toán
   */
  getPaymentMethodBreakdown: (params = {}) => {
    return axiosClient.get('/api/reports/payment-methods', { params });
  },

  /**
   * Tải file CSV báo cáo danh sách đơn hàng (UTF-8 BOM mở bằng Excel không lỗi font)
   */
  exportOrdersReportCsv: async (params = {}) => {
    const response = await axiosClient.get('/api/reports/export/orders/csv', {
      params,
      responseType: 'blob',
    });
    const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `milktea_orders_report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  },
};


export default reportService;
