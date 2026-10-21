import axiosClient from '../config/axiosClient';

/**
 * Service giao tiếp với order-service (thông qua API Gateway)
 * Quản lý giỏ hàng người dùng
 * Endpoints: /api/carts
 */
const cartService = {
  /**
   * Lấy thông tin giỏ hàng hiện tại (theo User đã đăng nhập hoặc sessionId)
   * @param {string} [sessionId]
   * @returns {Promise<any>}
   */
  getCart: (sessionId) => {
    return axiosClient.get('/api/carts', {
      params: sessionId ? { sessionId } : {},
    });
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param {{
   *   milkTeaId: number|string,
   *   milkTeaName: string,
   *   size?: string,
   *   sugar?: string,
   *   ice?: string,
   *   toppings?: string,
   *   quantity: number,
   *   unitPrice: number,
   *   image?: string,
   *   note?: string,
   *   sessionId?: string
   * }} itemData
   * @returns {Promise<any>}
   */
  addToCart: (itemData) => {
    return axiosClient.post('/api/carts/items', itemData);
  },

  /**
   * Cập nhật số lượng của một món trong giỏ hàng
   * @param {number} index - Vị trí của món trong giỏ hàng (0-indexed)
   * @param {number} quantity - Số lượng mới
   * @param {string} [sessionId]
   * @returns {Promise<any>}
   */
  updateCartItemQuantity: (index, quantity, sessionId) => {
    return axiosClient.put(`/api/carts/items/${index}`, { quantity }, {
      params: sessionId ? { sessionId } : {},
    });
  },

  /**
   * Xóa một món khỏi giỏ hàng theo index
   * @param {number} index - Vị trí của món trong giỏ hàng (0-indexed)
   * @param {string} [sessionId]
   * @returns {Promise<any>}
   */
  removeCartItem: (index, sessionId) => {
    return axiosClient.delete(`/api/carts/items/${index}`, {
      params: sessionId ? { sessionId } : {},
    });
  },

  /**
   * Xóa toàn bộ sản phẩm trong giỏ hàng
   * @param {string} [sessionId]
   * @returns {Promise<any>}
   */
  clearCart: (sessionId) => {
    return axiosClient.delete('/api/carts', {
      params: sessionId ? { sessionId } : {},
    });
  },
};

export default cartService;
