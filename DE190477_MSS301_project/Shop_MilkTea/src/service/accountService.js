import axiosClient from '../config/axiosClient';

const accountService = {
  /**
   * Lấy danh sách tài khoản (có hỗ trợ tìm kiếm keyword)
   * @param {string} [keyword]
   * @returns {Promise<Array>}
   */
  getAccounts: (keyword) => {
    return axiosClient.get('/api/accounts', {
      params: keyword ? { keyword } : {},
    });
  },

  /**
   * Lấy chi tiết tài khoản theo ID
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  getAccountById: (id) => {
    return axiosClient.get(`/api/accounts/${id}`);
  },

  /**
   * Tạo tài khoản mới
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  createAccount: (data) => {
    return axiosClient.post('/api/accounts', data);
  },

  /**
   * Cập nhật thông tin tài khoản
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  updateAccount: (id, data) => {
    return axiosClient.put(`/api/accounts/${id}`, data);
  },

  /**
   * Xóa tài khoản theo ID
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  deleteAccount: (id) => {
    return axiosClient.delete(`/api/accounts/${id}`);
  },

  /**
   * Đổi mật khẩu tài khoản
   * @param {number|string} id
   * @param {string} newPassword
   * @returns {Promise<Object>}
   */
  changePassword: (id, newPassword) => {
    return axiosClient.put(`/api/accounts/${id}/password`, { password: newPassword });
  },
};

export default accountService;
