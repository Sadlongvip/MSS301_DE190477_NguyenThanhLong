import React, { useReducer, useEffect, useCallback, useMemo, useContext } from 'react';
import CartContext from './CartContext';
import { AuthContext } from './AuthContext';
import {
  cartReducer,
  initialCartState,
  CART_ACTION_TYPES,
  normalizeCartItem,
} from '../reduce/cartReducer';
import cartService from '../service/cartService';
import orderService from '../service/orderService';

const CART_STORAGE_KEY = 'milktea_cart';
const SESSION_STORAGE_KEY = 'milktea_session_id';
const FREE_SHIPPING_THRESHOLD = 120000;
const STANDARD_SHIPPING_FEE = 20000;

// Khởi tạo hoặc lấy sessionId định danh cho khách vãng lai
function getOrCreateSessionId() {
  try {
    let sid = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem(SESSION_STORAGE_KEY, sid);
    }
    return sid;
  } catch {
    return 'sess_fallback';
  }
}

/**
 * CartProvider - Nơi DUY NHẤT gọi API từ cartService và orderService
 * và điều phối state qua cartReducer.
 * Các component và trang tuyệt đối không gọi trực tiếp service hay axios.
 */
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const user = authContext?.user;

  // Tự động lưu giỏ hàng vào localStorage mỗi khi state.items thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // Ignored
    }
  }, [state.items]);

  /**
   * Tải giỏ hàng từ Backend (order-service)
   */
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    dispatch({ type: CART_ACTION_TYPES.CART_START });
    try {
      const data = await cartService.getCart();
      if (data && Array.isArray(data.items)) {
        dispatch({
          type: CART_ACTION_TYPES.SET_CART_ITEMS,
          payload: data.items,
        });
      }
    } catch (err) {
      console.warn('Lỗi khi tải giỏ hàng từ server:', err.message);
      dispatch({
        type: CART_ACTION_TYPES.CART_FAILURE,
        payload: err.message || 'Không thể tải giỏ hàng từ máy chủ',
      });
    }
  }, [isAuthenticated]);

  // Tự động tải lại giỏ hàng khi trạng thái đăng nhập thay đổi
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  /**
   * Thêm sản phẩm vào giỏ
   */
  const addToCart = useCallback(
    async (item) => {
      // 1. Cập nhật state qua Reducer (Optimistic UI)
      dispatch({
        type: CART_ACTION_TYPES.ADD_ITEM,
        payload: item,
      });

      // 2. Nếu đã đăng nhập, gọi API lưu lên database
      if (isAuthenticated) {
        try {
          const sessionId = getOrCreateSessionId();
          const toppingsString = Array.isArray(item.toppings)
            ? item.toppings.join(', ')
            : item.toppings || '';

          const payload = {
            milkTeaId: item.milkTeaId || item.id,
            milkTeaName: item.name || item.milkTeaName,
            size: item.size || 'M',
            sugar: item.sugar || '70%',
            ice: item.ice || '100%',
            toppings: toppingsString,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || item.price || 0,
            image: item.image,
            note: item.note || '',
            sessionId,
          };

          const res = await cartService.addToCart(payload);
          if (res && Array.isArray(res.items)) {
            dispatch({
              type: CART_ACTION_TYPES.SET_CART_ITEMS,
              payload: res.items,
            });
          }
        } catch (err) {
          console.warn('Lưu giỏ hàng vào backend thất bại, giữ lưu cục bộ:', err.message);
        }
      }
    },
    [isAuthenticated]
  );

  /**
   * Cập nhật số lượng của một món
   */
  const updateQuantity = useCallback(
    async (cartItemIdOrIndex, newQty) => {
      const quantity = Math.max(0, Number(newQty) || 0);

      let targetIndex = -1;
      if (typeof cartItemIdOrIndex === 'number' && cartItemIdOrIndex < state.items.length) {
        targetIndex = cartItemIdOrIndex;
      } else {
        targetIndex = state.items.findIndex((it) => it.cartItemId === cartItemIdOrIndex);
      }

      if (targetIndex === -1) return;

      // 1. Cập nhật Reducer
      if (quantity <= 0) {
        dispatch({
          type: CART_ACTION_TYPES.REMOVE_ITEM,
          payload: targetIndex,
        });
      } else {
        dispatch({
          type: CART_ACTION_TYPES.UPDATE_ITEM_QUANTITY,
          payload: { index: targetIndex, quantity },
        });
      }

      // 2. Gọi backend nếu đã đăng nhập
      if (isAuthenticated) {
        try {
          const sessionId = getOrCreateSessionId();
          let res;
          if (quantity <= 0) {
            res = await cartService.removeCartItem(targetIndex, sessionId);
          } else {
            res = await cartService.updateCartItemQuantity(targetIndex, quantity, sessionId);
          }
          if (res && Array.isArray(res.items)) {
            dispatch({
              type: CART_ACTION_TYPES.SET_CART_ITEMS,
              payload: res.items,
            });
          }
        } catch (err) {
          console.warn('Cập nhật số lượng lên server lỗi:', err.message);
        }
      }
    },
    [state.items, isAuthenticated]
  );

  /**
   * Xóa một món khỏi giỏ hàng
   */
  const removeItem = useCallback(
    async (cartItemIdOrIndex) => {
      let targetIndex = -1;
      if (typeof cartItemIdOrIndex === 'number' && cartItemIdOrIndex < state.items.length) {
        targetIndex = cartItemIdOrIndex;
      } else {
        targetIndex = state.items.findIndex((it) => it.cartItemId === cartItemIdOrIndex);
      }

      if (targetIndex === -1) return;

      // 1. Cập nhật Reducer
      dispatch({
        type: CART_ACTION_TYPES.REMOVE_ITEM,
        payload: targetIndex,
      });

      // 2. Gọi backend nếu đã đăng nhập
      if (isAuthenticated) {
        try {
          const sessionId = getOrCreateSessionId();
          const res = await cartService.removeCartItem(targetIndex, sessionId);
          if (res && Array.isArray(res.items)) {
            dispatch({
              type: CART_ACTION_TYPES.SET_CART_ITEMS,
              payload: res.items,
            });
          }
        } catch (err) {
          console.warn('Xóa sản phẩm trên server lỗi:', err.message);
        }
      }
    },
    [state.items, isAuthenticated]
  );

  /**
   * Xóa toàn bộ giỏ hàng
   */
  const clearCart = useCallback(async () => {
    dispatch({ type: CART_ACTION_TYPES.CLEAR_CART });
    localStorage.removeItem(CART_STORAGE_KEY);

    if (isAuthenticated) {
      try {
        const sessionId = getOrCreateSessionId();
        await cartService.clearCart(sessionId);
      } catch (err) {
        console.warn('Xóa giỏ hàng trên server lỗi:', err.message);
      }
    }
  }, [isAuthenticated]);

  /**
   * Áp dụng mã giảm giá
   */
  const applyVoucher = useCallback((code) => {
    if (!code || !code.trim()) {
      dispatch({
        type: CART_ACTION_TYPES.SET_VOUCHER_ERROR,
        payload: 'Vui lòng nhập mã giảm giá',
      });
      return false;
    }

    const upper = code.trim().toUpperCase();
    if (upper === 'FREESHIP') {
      dispatch({
        type: CART_ACTION_TYPES.SET_VOUCHER,
        payload: { code: upper, name: 'Miễn phí vận chuyển', discountType: 'FREESHIP', value: 20000 },
      });
      return true;
    } else if (upper === 'MILKTEA10') {
      dispatch({
        type: CART_ACTION_TYPES.SET_VOUCHER,
        payload: { code: upper, name: 'Giảm 10% tổng đơn trà sữa', discountType: 'PERCENT', value: 0.1 },
      });
      return true;
    } else if (upper === 'SALE20K') {
      dispatch({
        type: CART_ACTION_TYPES.SET_VOUCHER,
        payload: { code: upper, name: 'Giảm 20.000đ trực tiếp', discountType: 'FIXED', value: 20000 },
      });
      return true;
    } else {
      dispatch({
        type: CART_ACTION_TYPES.SET_VOUCHER_ERROR,
        payload: 'Mã ưu đãi không hợp lệ hoặc đã hết hạn',
      });
      return false;
    }
  }, []);

  const removeVoucher = useCallback(() => {
    dispatch({ type: CART_ACTION_TYPES.REMOVE_VOUCHER });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: CART_ACTION_TYPES.CLEAR_ERROR });
  }, []);

  // Tính toán tóm tắt chi phí qua useMemo
  const totalQuantity = useMemo(() => {
    return state.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [state.items]);

  const subTotal = useMemo(() => {
    return state.items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  }, [state.items]);

  const isFreeShipping = subTotal >= FREE_SHIPPING_THRESHOLD || state.items.length === 0;

  const rawShippingFee = isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;

  const discountAmount = useMemo(() => {
    if (!state.appliedVoucher || state.items.length === 0) return 0;
    if (state.appliedVoucher.discountType === 'FREESHIP') {
      return rawShippingFee;
    }
    if (state.appliedVoucher.discountType === 'PERCENT') {
      return Math.round(subTotal * state.appliedVoucher.value);
    }
    if (state.appliedVoucher.discountType === 'FIXED') {
      return Math.min(subTotal, state.appliedVoucher.value);
    }
    return 0;
  }, [state.appliedVoucher, state.items.length, rawShippingFee, subTotal]);

  const shippingFee = state.appliedVoucher?.discountType === 'FREESHIP' ? 0 : rawShippingFee;

  const finalTotal = useMemo(() => {
    if (state.items.length === 0) return 0;
    const base = subTotal + shippingFee;
    return Math.max(0, state.appliedVoucher?.discountType === 'FREESHIP' ? base : base - discountAmount);
  }, [state.items.length, subTotal, shippingFee, state.appliedVoucher, discountAmount]);

  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subTotal);
  const freeShippingProgress = Math.min(100, Math.round((subTotal / FREE_SHIPPING_THRESHOLD) * 100));

  /**
   * Tiến hành đặt hàng (Checkout)
   * Nơi DUY NHẤT gọi orderService.createOrder, không để Page gọi trực tiếp
   */
  const checkout = useCallback(
    async (orderData) => {
      if (state.items.length === 0) {
        return { success: false, error: 'Giỏ hàng đang trống' };
      }

      dispatch({ type: CART_ACTION_TYPES.CART_START });
      try {
        const orderPayload = {
          customerName: (orderData.customerName || user?.username || '').trim(),
          phoneNumber: (orderData.phoneNumber || '').trim(),
          shippingAddress: (orderData.shippingAddress || '').trim(),
          note: (orderData.note || '').trim(),
          voucherCode: state.appliedVoucher ? state.appliedVoucher.code : null,
          shippingFee,
          discountAmount,
          paymentMethod: orderData.paymentMethod || 'COD',
          items: state.items.map((it) => ({
            milkTeaId: it.milkTeaId || it.id,
            milkTeaName: it.name || it.milkTeaName,
            size: it.size || 'M',
            sugar: it.sugar || '70%',
            ice: it.ice || '100%',
            toppings: Array.isArray(it.toppings) ? it.toppings.join(', ') : it.toppings || '',
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            image: it.image,
            note: it.note || '',
          })),
        };

        const response = await orderService.createOrder(orderPayload);

        // Đặt hàng thành công -> Xóa sạch giỏ hàng
        dispatch({ type: CART_ACTION_TYPES.CLEAR_CART });
        localStorage.removeItem(CART_STORAGE_KEY);

        return { success: true, order: response };
      } catch (err) {
        const errorMsg = err.message || 'Không thể tạo đơn hàng, vui lòng thử lại sau';
        dispatch({
          type: CART_ACTION_TYPES.CART_FAILURE,
          payload: errorMsg,
        });
        return { success: false, error: errorMsg };
      }
    },
    [state.items, state.appliedVoucher, shippingFee, discountAmount, user?.username]
  );

  const value = {
    // Trạng thái từ Reducer
    cartItems: state.items,
    loading: state.loading,
    error: state.error,
    appliedVoucher: state.appliedVoucher,
    voucherError: state.voucherError,

    // Các chỉ số tính toán
    totalQuantity,
    subTotal,
    shippingFee,
    isFreeShipping,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    freeShippingRemaining,
    freeShippingProgress,
    discountAmount,
    finalTotal,

    // Các hàm hành động (cổng duy nhất gọi API)
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    applyVoucher,
    removeVoucher,
    clearError,
    refreshCart: fetchCart,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartProvider;
