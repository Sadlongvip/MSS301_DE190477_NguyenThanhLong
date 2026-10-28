import axiosClient from '../config/axiosClient';

/**
 * Service giao tiếp với order-service (thông qua API Gateway)
 * Quản lý đơn hàng người dùng
 * Endpoints: /api/orders
 */
const orderService = {
  /**
   * Tạo đơn hàng mới
   * @param {{
   *   customerName: string,
   *   phoneNumber: string,
   *   shippingAddress: string,
   *   note?: string,
   *   voucherCode?: string,
   *   shippingFee?: number,
   *   discountAmount?: number,
   *   paymentMethod?: string,
   *   items: Array<any>
   * }} orderPayload
   * @returns {Promise<any>}
   */
  createOrder: (orderPayload) => {
    return axiosClient.post('/api/orders', orderPayload);
  },

  /**
   * Lấy danh sách đơn hàng của người dùng hiện tại
   * @returns {Promise<Array<any>>}
   */
  getMyOrders: () => {
    return axiosClient.get('/api/orders/my');
  },

  /**
   * Xem chi tiết đơn hàng theo mã đơn
   * @param {string} orderCode
   * @returns {Promise<any>}
   */
  getOrderByCode: (orderCode) => {
    return axiosClient.get(`/api/orders/${orderCode}`);
  },

  /**
   * Alias: Xem chi tiết đơn hàng theo mã đơn
   * @param {string} orderCode
   * @returns {Promise<any>}
   */
  getOrderDetail: (orderCode) => {
    return axiosClient.get(`/api/orders/${orderCode}`);
  },

  /**
   * Hủy đơn hàng
   * @param {string} orderCode
   * @param {string} [reason]
   * @returns {Promise<any>}
   */
  cancelOrder: (orderCode, reason) => {
    return axiosClient.put(`/api/orders/${orderCode}/cancel`, { reason });
  },

  /* ================= ADMIN ORDER MANAGEMENT ================= */
  /**
   * Lấy danh sách toàn bộ đơn hàng có lọc và phân trang (Dành cho Admin)
   * @param {{ status?: string, paymentStatus?: string, keyword?: string, page?: number, size?: number }} [params]
   */
  searchOrders: (params = {}) => {
    return axiosClient.get('/api/orders', { params });
  },

  /**
   * Cập nhật trạng thái đơn hàng (Dành cho Admin)
   * @param {string} orderCode
   * @param {{ status: string, note?: string }} data
   */
  updateOrderStatus: (orderCode, data) => {
    return axiosClient.put(`/api/orders/${orderCode}/status`, data);
  },

  /**
   * Cập nhật trạng thái thanh toán (Dành cho Admin)
   * @param {string} orderCode
   * @param {string} paymentStatus
   */
  updatePaymentStatus: (orderCode, paymentStatus) => {
    return axiosClient.put(`/api/orders/${orderCode}/payment-status`, { paymentStatus });
  },

  /**
   * Lấy lịch sử sự kiện Saga (Saga Choreography Logs) của đơn hàng
   * @param {string} orderCode
   */
  getSagaLogs: (orderCode) => {
    return axiosClient.get(`/api/orders/${orderCode}/saga-logs`);
  },
};

export default orderService;
