import axiosClient from '../config/axiosClient';

/**
 * Service giao tiếp với payment-service (thông qua API Gateway)
 * Quản lý khởi tạo và kiểm tra giao dịch thanh toán
 * Endpoints: /api/payments
 */
const paymentService = {
  /**
   * Khởi tạo giao dịch thanh toán (VNPay / QR)
   * @param {{
   *   orderCode: string,
   *   amount: number,
   *   paymentMethod?: string,
   *   bankCode?: string,
   *   orderInfo?: string
   * }} paymentPayload
   * @returns {Promise<{
   *   transactionCode: string,
   *   orderCode: string,
   *   amount: number,
   *   paymentMethod: string,
   *   status: string,
   *   paymentUrl: string,
   *   message: string
   * }>}
   */
  createPayment: (paymentPayload) => {
    return axiosClient.post('/api/payments/create', paymentPayload);
  },

  /**
   * Kiểm tra trạng thái giao dịch thanh toán theo mã đơn hàng
   * @param {string} orderCode
   * @returns {Promise<{
   *   transactionCode: string,
   *   orderCode: string,
   *   amount: number,
   *   paymentMethod: string,
   *   status: string,
   *   paymentUrl: string,
   *   message: string
   * }>}
   */
  getPaymentStatus: (orderCode) => {
    return axiosClient.get(`/api/payments/${orderCode}/status`);
  },

  /**
   * Gọi IPN để đồng bộ trạng thái (Dành cho Webhook hoặc đối soát)
   * @param {Record<string, string>} params
   * @returns {Promise<any>}
   */
  processVNPayIpn: (params) => {
    return axiosClient.get('/api/payments/vnpay-ipn', { params });
  },
};

export default paymentService;
