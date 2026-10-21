import axios from 'axios';

// Khởi tạo instance axios với Base URL lấy từ biến môi trường .env
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho Request: Tự động đính kèm token nếu đã đăng nhập
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response: Trả về trực tiếp data và xử lý lỗi tập trung
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Xử lý khi token hết hạn hoặc chưa xác thực (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Đã xảy ra lỗi khi kết nối tới máy chủ';

    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
