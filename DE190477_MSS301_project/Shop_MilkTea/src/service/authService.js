import axiosClient from '../config/axiosClient';

const authService = {
  /**
   * Đăng nhập tài khoản
   * @param {{ username: string, password: string }} credentials
   * @returns {Promise<{ token: string, username: string, role: string }>}
   */
  login: (credentials) => {
    return axiosClient.post('/api/auth/login', credentials);
  },

  /**
   * Đăng ký tài khoản mới
   * @param {Object} accountData
   * @returns {Promise<Object>}
   */
  register: (accountData) => {
    return axiosClient.post('/api/auth/register', accountData);
  },
};

export default authService;
