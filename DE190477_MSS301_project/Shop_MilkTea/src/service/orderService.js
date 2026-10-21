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
   * Hủy đơn hàng
   * @param {string} orderCode
   * @param {string} [reason]
   * @returns {Promise<any>}
   */
  cancelOrder: (orderCode, reason) => {
    return axiosClient.put(`/api/orders/${orderCode}/cancel`, { reason });
  },
};

export default orderService;
