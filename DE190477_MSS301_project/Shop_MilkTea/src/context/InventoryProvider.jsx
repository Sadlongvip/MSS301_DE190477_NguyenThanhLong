import { useReducer, useCallback, useEffect } from 'react';
import { InventoryContext } from './InventoryContext';
import {
  inventoryReducer,
  initialInventoryState,
  INVENTORY_ACTION_TYPES,
} from '../reduce/inventoryReducer';
import inventoryService from '../service/inventoryService';

/**
 * InventoryProvider - Nơi DUY NHẤT gọi API từ inventoryService
 * và điều phối state qua inventoryReducer.
 * Các component tuyệt đối không gọi trực tiếp service.
 */
export function InventoryProvider({ children }) {
  const [state, dispatch] = useReducer(inventoryReducer, initialInventoryState);

  /**
   * Tải danh sách Danh mục
   */
  const fetchCategories = useCallback(async (keyword) => {
    dispatch({ type: INVENTORY_ACTION_TYPES.INVENTORY_START });
    try {
      const data = await inventoryService.getCategories(keyword);
      dispatch({
        type: INVENTORY_ACTION_TYPES.SET_CATEGORIES,
        payload: data || [],
      });
      return { success: true, data };
    } catch (err) {
      const msg = err.message || 'Không thể tải danh sách danh mục';
      dispatch({
        type: INVENTORY_ACTION_TYPES.INVENTORY_FAILURE,
        payload: msg,
      });
      return { success: false, error: msg };
    }
  }, []);

  /**
   * Tải danh sách Trà sữa theo bộ lọc (keyword, categoryId)
   */
  const fetchMilkTeas = useCallback(async (params = {}) => {
    dispatch({ type: INVENTORY_ACTION_TYPES.INVENTORY_START });
    try {
      const data = await inventoryService.getMilkTeas(params);
      dispatch({
        type: INVENTORY_ACTION_TYPES.SET_MILK_TEAS,
        payload: data || [],
      });
      return { success: true, data };
    } catch (err) {
      const msg = err.message || 'Không thể tải danh sách sản phẩm';
      dispatch({
        type: INVENTORY_ACTION_TYPES.INVENTORY_FAILURE,
        payload: msg,
      });
      return { success: false, error: msg };
    }
  }, []);

  /**
   * Tải danh sách Topping
   */
  const fetchToppings = useCallback(async (keyword) => {
    try {
      const data = await inventoryService.getToppings(keyword);
      dispatch({
        type: INVENTORY_ACTION_TYPES.SET_TOPPINGS,
        payload: data || [],
      });
      return { success: true, data };
    } catch (err) {
      const msg = err.message || 'Không thể tải danh sách topping';
      dispatch({
        type: INVENTORY_ACTION_TYPES.INVENTORY_FAILURE,
        payload: msg,
      });
      return { success: false, error: msg };
    }
  }, []);

  /**
   * Tải danh sách Kích cỡ ly (Sizes)
   */
  const fetchSizes = useCallback(async () => {
    try {
      const data = await inventoryService.getSizes();
      dispatch({
        type: INVENTORY_ACTION_TYPES.SET_SIZES,
        payload: data || [],
      });
      return { success: true, data };
    } catch (err) {
      const msg = err.message || 'Không thể tải danh sách kích cỡ';
      // Không block UI nếu API sizes chưa sẵn sàng
      return { success: false, error: msg };
    }
  }, []);

  /**
   * Làm mới toàn bộ dữ liệu (sau khi Admin Thêm/Sửa/Xóa)
   */
  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      fetchCategories(),
      fetchMilkTeas(),
      fetchToppings(),
      fetchSizes(),
    ]);
  }, [fetchCategories, fetchMilkTeas, fetchToppings, fetchSizes]);

  /**
   * Lọc sản phẩm theo Category (kết hợp với từ khóa hiện tại)
   */
  const filterByCategory = useCallback(
    (categoryId) => {
      dispatch({
        type: INVENTORY_ACTION_TYPES.SET_SELECTED_CATEGORY,
        payload: categoryId,
      });
      fetchMilkTeas({
        categoryId,
        keyword: state.searchKeyword,
      });
    },
    [state.searchKeyword, fetchMilkTeas]
  );

  /**
   * Tìm kiếm sản phẩm theo từ khóa (kết hợp với category đang chọn)
   */
  const searchProducts = useCallback(
    (keyword) => {
      dispatch({
        type: INVENTORY_ACTION_TYPES.SET_SEARCH_KEYWORD,
        payload: keyword,
      });
      fetchMilkTeas({
        keyword,
        categoryId: state.selectedCategoryId,
      });
    },
    [state.selectedCategoryId, fetchMilkTeas]
  );

  /**
   * Xóa thông báo lỗi
   */
  const clearError = useCallback(() => {
    dispatch({ type: INVENTORY_ACTION_TYPES.CLEAR_ERROR });
  }, []);

  /* ================= CRUD ACTIONS (CỔNG GỌI API DUY NHẤT) ================= */

  // --- Milk Tea CRUD ---
  const createMilkTea = useCallback(async (data) => {
    dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_START });
    try {
      const res = await inventoryService.createMilkTea(data);
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_SUCCESS });
      await refreshAll();
      return { success: true, data: res };
    } catch (err) {
      const msg = err.message || 'Lỗi khi thêm món trà sữa';
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_FAILURE, payload: msg });
      return { success: false, error: msg };
    }
  }, [refreshAll]);

  const updateMilkTea = useCallback(async (id, data) => {
    dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_START });
    try {
      const res = await inventoryService.updateMilkTea(id, data);
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_SUCCESS });
      await refreshAll();
      return { success: true, data: res };
    } catch (err) {
      const msg = err.message || 'Lỗi khi cập nhật món trà sữa';
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_FAILURE, payload: msg });
      return { success: false, error: msg };
    }
  }, [refreshAll]);

  const deleteMilkTea = useCallback(async (id) => {
    dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_START });
    try {
      await inventoryService.deleteMilkTea(id);
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_SUCCESS });
      await refreshAll();
      return { success: true };
    } catch (err) {
      const msg = err.message || 'Lỗi khi xóa món trà sữa';
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_FAILURE, payload: msg });
      return { success: false, error: msg };
    }
  }, [refreshAll]);

  // --- Category CRUD ---
  const createCategory = useCallback(async (data) => {
    dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_START });
    try {
      const res = await inventoryService.createCategory(data);
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_SUCCESS });
      await refreshAll();
      return { success: true, data: res };
    } catch (err) {
      const msg = err.message || 'Lỗi khi thêm danh mục';
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_FAILURE, payload: msg });
      return { success: false, error: msg };
    }
  }, [refreshAll]);

  const updateCategory = useCallback(async (id, data) => {
    dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_START });
    try {
      const res = await inventoryService.updateCategory(id, data);
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_SUCCESS });
      await refreshAll();
      return { success: true, data: res };
    } catch (err) {
      const msg = err.message || 'Lỗi khi cập nhật danh mục';
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_FAILURE, payload: msg });
      return { success: false, error: msg };
    }
  }, [refreshAll]);

  const deleteCategory = useCallback(async (id) => {
    dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_START });
    try {
      await inventoryService.deleteCategory(id);
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_SUCCESS });
      await refreshAll();
      return { success: true };
    } catch (err) {
      const msg = err.message || 'Lỗi khi xóa danh mục';
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_FAILURE, payload: msg });
      return { success: false, error: msg };
    }
  }, [refreshAll]);

  // --- Topping CRUD ---
  const createTopping = useCallback(async (data) => {
    dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_START });
    try {
      const res = await inventoryService.createTopping(data);
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_SUCCESS });
      await refreshAll();
      return { success: true, data: res };
    } catch (err) {
      const msg = err.message || 'Lỗi khi thêm topping';
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_FAILURE, payload: msg });
      return { success: false, error: msg };
    }
  }, [refreshAll]);

  const updateTopping = useCallback(async (id, data) => {
    dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_START });
    try {
      const res = await inventoryService.updateTopping(id, data);
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_SUCCESS });
      await refreshAll();
      return { success: true, data: res };
    } catch (err) {
      const msg = err.message || 'Lỗi khi cập nhật topping';
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_FAILURE, payload: msg });
      return { success: false, error: msg };
    }
  }, [refreshAll]);

  const deleteTopping = useCallback(async (id) => {
    dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_START });
    try {
      await inventoryService.deleteTopping(id);
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_SUCCESS });
      await refreshAll();
      return { success: true };
    } catch (err) {
      const msg = err.message || 'Lỗi khi xóa topping';
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_FAILURE, payload: msg });
      return { success: false, error: msg };
    }
  }, [refreshAll]);

  // --- Size CRUD ---
  const createSize = useCallback(async (data) => {
    dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_START });
    try {
      const res = await inventoryService.createSize(data);
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_SUCCESS });
      await refreshAll();
      return { success: true, data: res };
    } catch (err) {
      const msg = err.message || 'Lỗi khi thêm kích cỡ ly';
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_FAILURE, payload: msg });
      return { success: false, error: msg };
    }
  }, [refreshAll]);

  const updateSize = useCallback(async (id, data) => {
    dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_START });
    try {
      const res = await inventoryService.updateSize(id, data);
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_SUCCESS });
      await refreshAll();
      return { success: true, data: res };
    } catch (err) {
      const msg = err.message || 'Lỗi khi cập nhật kích cỡ ly';
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_FAILURE, payload: msg });
      return { success: false, error: msg };
    }
  }, [refreshAll]);

  const deleteSize = useCallback(async (id) => {
    dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_START });
    try {
      await inventoryService.deleteSize(id);
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_SUCCESS });
      await refreshAll();
      return { success: true };
    } catch (err) {
      const msg = err.message || 'Lỗi khi xóa kích cỡ ly';
      dispatch({ type: INVENTORY_ACTION_TYPES.MUTATE_FAILURE, payload: msg });
      return { success: false, error: msg };
    }
  }, [refreshAll]);

  // Tải dữ liệu ban đầu khi Provider mount
  useEffect(() => {
    fetchCategories();
    fetchMilkTeas();
    fetchToppings();
    fetchSizes();
  }, [fetchCategories, fetchMilkTeas, fetchToppings, fetchSizes]);

  const value = {
    // Trạng thái từ Reducer
    categories: state.categories,
    milkTeas: state.milkTeas,
    toppings: state.toppings,
    sizes: state.sizes,
    selectedCategoryId: state.selectedCategoryId,
    searchKeyword: state.searchKeyword,
    loading: state.loading,
    submitting: state.submitting,
    error: state.error,

    // Các hàm hành động (cổng duy nhất gọi API)
    fetchCategories,
    fetchMilkTeas,
    fetchToppings,
    fetchSizes,
    refreshAll,
    filterByCategory,
    searchProducts,
    clearError,

    // CRUD MilkTeas
    createMilkTea,
    updateMilkTea,
    deleteMilkTea,

    // CRUD Categories
    createCategory,
    updateCategory,
    deleteCategory,

    // CRUD Toppings
    createTopping,
    updateTopping,
    deleteTopping,

    // CRUD Sizes
    createSize,
    updateSize,
    deleteSize,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export default InventoryProvider;
