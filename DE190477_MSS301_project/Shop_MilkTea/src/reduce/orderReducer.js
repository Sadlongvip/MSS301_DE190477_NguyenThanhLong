/**
 * Action Types cho Order Reducer
 */
export const ORDER_ACTION_TYPES = {
  ORDER_START: 'ORDER_START',
  SET_MY_ORDERS: 'SET_MY_ORDERS',
  ADD_ORDER: 'ADD_ORDER',
  SET_SELECTED_ORDER: 'SET_SELECTED_ORDER',
  CANCEL_ORDER_START: 'CANCEL_ORDER_START',
  CANCEL_ORDER_SUCCESS: 'CANCEL_ORDER_SUCCESS',
  SET_STATUS_FILTER: 'SET_STATUS_FILTER',
  SET_SEARCH_KEYWORD: 'SET_SEARCH_KEYWORD',
  ORDER_FAILURE: 'ORDER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_ORDERS: 'RESET_ORDERS',
};

/**
 * Trạng thái khởi tạo cho Quản lý đơn hàng
 */
export const initialOrderState = {
  orders: [],
  selectedOrder: null,
  statusFilter: 'ALL', // ALL | PENDING | CONFIRMED | PREPARING | DELIVERING | COMPLETED | CANCELLED
  searchKeyword: '',
  loading: false,
  cancelling: false,
  error: null,
};

/**
 * Reducer quản lý toàn bộ trạng thái đơn hàng của người dùng
 * Tuân thủ mô hình reducer tập trung của dự án
 */
export function orderReducer(state, action) {
  switch (action.type) {
    case ORDER_ACTION_TYPES.ORDER_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ORDER_ACTION_TYPES.SET_MY_ORDERS:
      return {
        ...state,
        loading: false,
        orders: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case ORDER_ACTION_TYPES.ADD_ORDER: {
      const newOrder = action.payload;
      if (!newOrder) return state;

      // Tránh trùng lặp nếu đơn đã tồn tại trong danh sách
      const exists = state.orders.some(
        (ord) => ord.orderCode === newOrder.orderCode || (ord.id && ord.id === newOrder.id)
      );

      if (exists) {
        return {
          ...state,
          orders: state.orders.map((ord) =>
            ord.orderCode === newOrder.orderCode || (ord.id && ord.id === newOrder.id) ? newOrder : ord
          ),
        };
      }

      return {
        ...state,
        orders: [newOrder, ...state.orders],
        statusFilter: 'ALL', // Đưa về tab Tất cả để người dùng thấy ngay đơn vừa đặt
      };
    }

    case ORDER_ACTION_TYPES.SET_SELECTED_ORDER:
      return {
        ...state,
        selectedOrder: action.payload,
      };

    case ORDER_ACTION_TYPES.CANCEL_ORDER_START:
      return {
        ...state,
        cancelling: true,
        error: null,
      };

    case ORDER_ACTION_TYPES.CANCEL_ORDER_SUCCESS: {
      const updatedOrder = action.payload;
      const newOrders = state.orders.map((ord) => {
        if (ord.orderCode === updatedOrder.orderCode || ord.id === updatedOrder.id) {
          return {
            ...ord,
            ...updatedOrder,
            status: 'CANCELLED',
          };
        }
        return ord;
      });

      const updatedSelected =
        state.selectedOrder &&
        (state.selectedOrder.orderCode === updatedOrder.orderCode || state.selectedOrder.id === updatedOrder.id)
          ? { ...state.selectedOrder, ...updatedOrder, status: 'CANCELLED' }
          : state.selectedOrder;

      return {
        ...state,
        cancelling: false,
        orders: newOrders,
        selectedOrder: updatedSelected,
        error: null,
      };
    }

    case ORDER_ACTION_TYPES.SET_STATUS_FILTER:
      return {
        ...state,
        statusFilter: action.payload,
      };

    case ORDER_ACTION_TYPES.SET_SEARCH_KEYWORD:
      return {
        ...state,
        searchKeyword: action.payload,
      };

    case ORDER_ACTION_TYPES.ORDER_FAILURE:
      return {
        ...state,
        loading: false,
        cancelling: false,
        error: action.payload,
      };

    case ORDER_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case ORDER_ACTION_TYPES.RESET_ORDERS:
      return {
        ...initialOrderState,
      };

    default:
      return state;
  }
}

export default orderReducer;
