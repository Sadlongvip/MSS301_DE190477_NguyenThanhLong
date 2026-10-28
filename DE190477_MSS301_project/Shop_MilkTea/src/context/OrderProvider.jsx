import React, { useReducer, useCallback, useEffect, useMemo } from 'react';
import { OrderContext } from './OrderContext';
import {
  orderReducer,
  initialOrderState,
  ORDER_ACTION_TYPES,
} from '../reduce/orderReducer';
import orderService from '../service/orderService';
import useAuth from '../hook/useAuth';
import useCart from '../hook/useCart';

/**
 * OrderProvider - Nơi DUY NHẤT gọi API từ orderService
 * và điều phối state qua orderReducer.
 * Các UI component tuyệt đối không gọi trực tiếp orderService.
 */
export function OrderProvider({ children }) {
  const [state, dispatch] = useReducer(orderReducer, initialOrderState);
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  /**
   * Lấy danh sách toàn bộ đơn hàng của người dùng hiện tại
   */
  const fetchMyOrders = useCallback(async () => {
    if (!isAuthenticated) return { success: false, error: 'Chưa đăng nhập' };

    dispatch({ type: ORDER_ACTION_TYPES.ORDER_START });
    try {
      const data = await orderService.getMyOrders();
      dispatch({
        type: ORDER_ACTION_TYPES.SET_MY_ORDERS,
        payload: data || [],
      });
      return { success: true, data };
    } catch (err) {
      const msg = err.message || 'Không thể tải danh sách đơn hàng';
      dispatch({
        type: ORDER_ACTION_TYPES.ORDER_FAILURE,
        payload: msg,
      });
      return { success: false, error: msg };
    }
  }, [isAuthenticated]);

  /**
   * Xem chi tiết một đơn hàng theo orderCode
   */
  const getOrderDetail = useCallback(async (orderCode) => {
    if (!orderCode) return null;
    try {
      const data = await orderService.getOrderByCode(orderCode);
      dispatch({
        type: ORDER_ACTION_TYPES.SET_SELECTED_ORDER,
        payload: data,
      });
      return { success: true, data };
    } catch (err) {
      const msg = err.message || 'Không thể lấy thông tin chi tiết đơn hàng';
      dispatch({
        type: ORDER_ACTION_TYPES.ORDER_FAILURE,
        payload: msg,
      });
      return { success: false, error: msg };
    }
  }, []);

  /**
   * Hủy đơn hàng (khi đơn đang ở trạng thái PENDING)
   */
  const cancelOrder = useCallback(async (orderCode, reason = 'Khách hàng yêu cầu hủy đơn') => {
    if (!orderCode) return { success: false, error: 'Mã đơn không hợp lệ' };

    dispatch({ type: ORDER_ACTION_TYPES.CANCEL_ORDER_START });
    try {
      const data = await orderService.cancelOrder(orderCode, reason);
      dispatch({
        type: ORDER_ACTION_TYPES.CANCEL_ORDER_SUCCESS,
        payload: data || { orderCode, cancelReason: reason, status: 'CANCELLED' },
      });
      return { success: true, data };
    } catch (err) {
      const msg = err.message || 'Không thể hủy đơn hàng';
      dispatch({
        type: ORDER_ACTION_TYPES.ORDER_FAILURE,
        payload: msg,
      });
      return { success: false, error: msg };
    }
  }, []);

  /**
   * Chọn đơn hàng đang xem trong modal
   */
  const selectOrder = useCallback((order) => {
    dispatch({
      type: ORDER_ACTION_TYPES.SET_SELECTED_ORDER,
      payload: order,
    });
  }, []);

  /**
   * Chức năng "Mua lại" (Re-order):
   * Tự động thêm toàn bộ sản phẩm của đơn hàng cũ vào giỏ hàng
   */
  const reorder = useCallback((order) => {
    if (!order || !Array.isArray(order.items) || order.items.length === 0) {
      return { success: false, error: 'Không tìm thấy sản phẩm nào trong đơn hàng' };
    }

    try {
      order.items.forEach((item) => {
        addItem({
          id: item.milkTeaId,
          milkTeaId: item.milkTeaId,
          name: item.milkTeaName,
          milkTeaName: item.milkTeaName,
          size: item.size || 'M',
          sugar: item.sugar || '70%',
          ice: item.ice || '100%',
          toppings: item.toppings
            ? typeof item.toppings === 'string'
              ? item.toppings.split(',').map((t) => t.trim()).filter(Boolean)
              : item.toppings
            : [],
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice,
          price: item.unitPrice,
          image: item.image,
          note: item.note || '',
        });
      });
      return { success: true, count: order.items.length };
    } catch (err) {
      return { success: false, error: err.message || 'Không thể thêm sản phẩm vào giỏ hàng' };
    }
  }, [addItem]);

  /**
   * Đưa ngay một đơn hàng mới tạo vào danh sách (Optimistic UI / Instant update)
   */
  const addNewOrder = useCallback((order) => {
    if (order) {
      dispatch({
        type: ORDER_ACTION_TYPES.ADD_ORDER,
        payload: order,
      });
    }
  }, []);

  /**
   * Đặt bộ lọc trạng thái (ALL | PENDING | CONFIRMED | PREPARING | DELIVERING | COMPLETED | CANCELLED)
   */
  const setStatusFilter = useCallback((filter) => {
    dispatch({
      type: ORDER_ACTION_TYPES.SET_STATUS_FILTER,
      payload: filter,
    });
  }, []);

  /**
   * Đặt từ khóa tìm kiếm đơn hàng
   */
  const setSearchKeyword = useCallback((keyword) => {
    dispatch({
      type: ORDER_ACTION_TYPES.SET_SEARCH_KEYWORD,
      payload: keyword,
    });
  }, []);

  /**
   * Xóa thông báo lỗi
   */
  const clearError = useCallback(() => {
    dispatch({ type: ORDER_ACTION_TYPES.CLEAR_ERROR });
  }, []);

  // Tự động tải danh sách đơn hàng khi người dùng đã xác thực
  useEffect(() => {
    if (isAuthenticated) {
      fetchMyOrders();
    } else {
      dispatch({ type: ORDER_ACTION_TYPES.RESET_ORDERS });
    }
  }, [isAuthenticated, fetchMyOrders]);

  /**
   * Danh sách đơn hàng đã được lọc theo tab trạng thái và từ khóa tìm kiếm
   */
  const filteredOrders = useMemo(() => {
    let result = state.orders;

    // 1. Lọc theo trạng thái
    if (state.statusFilter && state.statusFilter !== 'ALL') {
      result = result.filter((ord) => ord.status === state.statusFilter);
    }

    // 2. Lọc theo từ khóa tìm kiếm (mã đơn, tên món, tên người nhận, SĐT)
    if (state.searchKeyword && state.searchKeyword.trim()) {
      const q = state.searchKeyword.trim().toLowerCase();
      result = result.filter((ord) => {
        const matchCode = ord.orderCode?.toLowerCase().includes(q);
        const matchName = ord.customerName?.toLowerCase().includes(q);
        const matchPhone = ord.phoneNumber?.toLowerCase().includes(q);
        const matchAddress = ord.shippingAddress?.toLowerCase().includes(q);
        const matchItem = ord.items?.some((it) =>
          it.milkTeaName?.toLowerCase().includes(q)
        );
        return matchCode || matchName || matchPhone || matchAddress || matchItem;
      });
    }

    return result;
  }, [state.orders, state.statusFilter, state.searchKeyword]);

  /**
   * Đếm số lượng đơn theo từng trạng thái để hiển thị badge số lượng trên các tab
   */
  const orderCounts = useMemo(() => {
    const counts = {
      ALL: state.orders.length,
      PENDING: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      DELIVERING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    state.orders.forEach((ord) => {
      if (counts[ord.status] !== undefined) {
        counts[ord.status] += 1;
      }
    });

    return counts;
  }, [state.orders]);

  /* ================= ADMIN ACTIONS (CỔNG GỌI API orderService DUY NHẤT) ================= */

  /**
   * Tải danh sách đơn hàng toàn hệ thống cho Admin
   */
  const fetchAdminOrders = useCallback(async (params = {}) => {
    dispatch({ type: ORDER_ACTION_TYPES.ORDER_START });
    try {
      const data = await orderService.searchOrders(params);
      dispatch({
        type: ORDER_ACTION_TYPES.SET_ADMIN_ORDERS,
        payload: data,
      });
      return { success: true, data };
    } catch (err) {
      const msg = err.message || 'Không thể tải danh sách đơn hàng quản trị';
      dispatch({
        type: ORDER_ACTION_TYPES.ORDER_FAILURE,
        payload: msg,
      });
      return { success: false, error: msg };
    }
  }, []);

  /**
   * Admin cập nhật trạng thái đơn hàng (PENDING -> CONFIRMED -> PREPARING -> DELIVERING -> COMPLETED / CANCELLED)
   */
  const updateOrderStatus = useCallback(async (orderCode, status, note = '') => {
    try {
      const res = await orderService.updateOrderStatus(orderCode, { status, note });
      dispatch({
        type: ORDER_ACTION_TYPES.UPDATE_ADMIN_ORDER_STATUS_SUCCESS,
        payload: res,
      });
      return { success: true, data: res };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể cập nhật trạng thái đơn hàng';
      return { success: false, error: msg };
    }
  }, []);

  /**
   * Admin cập nhật trạng thái thanh toán
   */
  const updatePaymentStatus = useCallback(async (orderCode, paymentStatus) => {
    try {
      const res = await orderService.updatePaymentStatus(orderCode, paymentStatus);
      dispatch({
        type: ORDER_ACTION_TYPES.UPDATE_ADMIN_ORDER_STATUS_SUCCESS,
        payload: res,
      });
      return { success: true, data: res };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể cập nhật thanh toán';
      return { success: false, error: msg };
    }
  }, []);

  /**
   * Admin lấy lịch sử Saga Choreography Logs của đơn hàng
   */
  const fetchSagaLogs = useCallback(async (orderCode) => {
    try {
      const data = await orderService.getSagaLogs(orderCode);
      dispatch({
        type: ORDER_ACTION_TYPES.SET_SAGA_LOGS,
        payload: data || [],
      });
      return { success: true, data };
    } catch (err) {
      const msg = err.message || 'Không thể tải lịch sử Saga logs';
      dispatch({
        type: ORDER_ACTION_TYPES.SET_SAGA_LOGS,
        payload: [],
      });
      return { success: false, error: msg };
    }
  }, []);

  const value = {
    // State từ Reducer
    orders: state.orders,
    adminOrders: state.adminOrders,
    adminPagination: state.adminPagination,
    sagaLogs: state.sagaLogs,
    filteredOrders,
    selectedOrder: state.selectedOrder,
    statusFilter: state.statusFilter,
    searchKeyword: state.searchKeyword,
    loading: state.loading,
    cancelling: state.cancelling,
    error: state.error,
    orderCounts,

    // Các hàm hành động người dùng
    fetchMyOrders,
    addNewOrder,
    getOrderDetail,
    cancelOrder,
    selectOrder,
    reorder,
    setStatusFilter,
    setSearchKeyword,
    clearError,

    // Các hàm hành động Admin (Cổng duy nhất gọi API)
    fetchAdminOrders,
    updateOrderStatus,
    updatePaymentStatus,
    fetchSagaLogs,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export default OrderProvider;
