import axiosClient from '../config/axiosClient';

/**
 * Service giao tiếp với inventory-service thông qua API Gateway
 * Endpoints: /api/categories, /api/milkteas, /api/toppings
 */
const inventoryService = {
  /* ================= CATEGORIES ================= */
  /**
   * Lấy danh sách danh mục trà sữa (hỗ trợ tìm kiếm theo từ khóa)
   * @param {string} [keyword]
   * @returns {Promise<Array<{ id: number, name: string, milkTeaCount: number }>>}
   */
  getCategories: (keyword) => {
    return axiosClient.get('/api/categories', {
      params: keyword ? { keyword } : {},
    });
  },

  /**
   * Thêm mới danh mục
   * @param {{ name: string }} data
   */
  createCategory: (data) => {
    return axiosClient.post('/api/categories', data);
  },

  /**
   * Cập nhật danh mục
   * @param {number|string} id
   * @param {{ name: string }} data
   */
  updateCategory: (id, data) => {
    return axiosClient.put(`/api/categories/${id}`, data);
  },

  /**
   * Xóa danh mục
   * @param {number|string} id
   */
  deleteCategory: (id) => {
    return axiosClient.delete(`/api/categories/${id}`);
  },

  /* ================= MILK TEAS ================= */
  /**
   * Lấy danh sách sản phẩm trà sữa (hỗ trợ lọc theo categoryId và tìm kiếm keyword)
   * @param {{ keyword?: string, categoryId?: number|string }} [params]
   * @returns {Promise<Array<{ id: number, name: string, description: string, price: number, image: string, categoryId: number, categoryName: string, isAvailable: boolean }>>}
   */
  getMilkTeas: (params = {}) => {
    const query = {};
    if (params.keyword && params.keyword.trim()) {
      query.keyword = params.keyword.trim();
    }
    if (params.categoryId) {
      query.categoryId = params.categoryId;
    }
    return axiosClient.get('/api/milkteas', { params: query });
  },

  /**
   * Lấy chi tiết sản phẩm trà sữa theo ID
   * @param {number|string} id
   */
  getMilkTeaById: (id) => {
    return axiosClient.get(`/api/milkteas/${id}`);
  },

  /**
   * Thêm mới sản phẩm trà sữa
   * @param {{ name: string, description?: string, price: number, image?: string, categoryId: number, isAvailable?: boolean }} data
   */
  createMilkTea: (data) => {
    return axiosClient.post('/api/milkteas', data);
  },

  /**
   * Cập nhật sản phẩm trà sữa
   * @param {number|string} id
   * @param {{ name: string, description?: string, price: number, image?: string, categoryId: number, isAvailable?: boolean }} data
   */
  updateMilkTea: (id, data) => {
    return axiosClient.put(`/api/milkteas/${id}`, data);
  },

  /**
   * Xóa sản phẩm trà sữa
   * @param {number|string} id
   */
  deleteMilkTea: (id) => {
    return axiosClient.delete(`/api/milkteas/${id}`);
  },

  /* ================= TOPPINGS ================= */
  /**
   * Lấy danh sách topping
   * @param {string} [keyword]
   * @returns {Promise<Array<{ id: number, name: string, price: number, isAvailable: boolean }>>}
   */
  getToppings: (keyword) => {
    return axiosClient.get('/api/toppings', {
      params: keyword ? { keyword } : {},
    });
  },

  /**
   * Lấy chi tiết topping theo ID
   * @param {number|string} id
   */
  getToppingById: (id) => {
    return axiosClient.get(`/api/toppings/${id}`);
  },

  /**
   * Thêm mới topping
   * @param {{ name: string, price: number, isAvailable?: boolean }} data
   */
  createTopping: (data) => {
    return axiosClient.post('/api/toppings', data);
  },

  /**
   * Cập nhật topping
   * @param {number|string} id
   * @param {{ name: string, price: number, isAvailable?: boolean }} data
   */
  updateTopping: (id, data) => {
    return axiosClient.put(`/api/toppings/${id}`, data);
  },

  /**
   * Xóa topping
   * @param {number|string} id
   */
  deleteTopping: (id) => {
    return axiosClient.delete(`/api/toppings/${id}`);
  },

  /* ================= TEA SIZES ================= */
  /**
   * Lấy danh sách kích cỡ ly
   * @returns {Promise<Array<{ id: number, name: string, code: string, extraPrice: number, isDefault: boolean, isAvailable: boolean }>>}
   */
  getSizes: () => {
    return axiosClient.get('/api/sizes');
  },

  /**
   * Lấy chi tiết size theo ID
   * @param {number|string} id
   */
  getSizeById: (id) => {
    return axiosClient.get(`/api/sizes/${id}`);
  },

  /**
   * Thêm mới size ly
   * @param {{ name: string, code: string, extraPrice: number, isDefault?: boolean, isAvailable?: boolean }} data
   */
  createSize: (data) => {
    return axiosClient.post('/api/sizes', data);
  },

  /**
   * Cập nhật size ly
   * @param {number|string} id
   * @param {{ name: string, code: string, extraPrice: number, isDefault?: boolean, isAvailable?: boolean }} data
   */
  updateSize: (id, data) => {
    return axiosClient.put(`/api/sizes/${id}`, data);
  },

  /**
   * Xóa size ly
   * @param {number|string} id
   */
  deleteSize: (id) => {
    return axiosClient.delete(`/api/sizes/${id}`);
  },
};

export default inventoryService;
