/**
 * Action Types cho Cart Reducer
 */
export const CART_ACTION_TYPES = {
  CART_START: 'CART_START',
  SET_CART_ITEMS: 'SET_CART_ITEMS',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM_QUANTITY: 'UPDATE_ITEM_QUANTITY',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SET_VOUCHER: 'SET_VOUCHER',
  REMOVE_VOUCHER: 'REMOVE_VOUCHER',
  SET_VOUCHER_ERROR: 'SET_VOUCHER_ERROR',
  CART_FAILURE: 'CART_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

const CART_STORAGE_KEY = 'milktea_cart';

/**
 * Chuẩn hóa một item giỏ hàng
 */
export function normalizeCartItem(item, index) {
  const toppingsList = Array.isArray(item.toppings)
    ? item.toppings
    : typeof item.toppings === 'string' && item.toppings.trim()
    ? item.toppings.split(',').map((t) => t.trim())
    : [];

  const size = item.size || 'M';
  const sugar = item.sugar || '70% Chuẩn vị';
  const ice = item.ice || 'Bình thường (100%)';
  const quantity = Math.max(1, Number(item.quantity) || 1);
  const unitPrice = Number(item.unitPrice || item.price) || 0;
  const totalPrice = Number(item.totalPrice) || unitPrice * quantity;
  const milkTeaId = item.milkTeaId || item.id;
  const cartItemId = item.cartItemId || `${milkTeaId}-${size}-${sugar}-${ice}-${toppingsList.sort().join('_')}`;

  return {
    index,
    cartItemId,
    id: milkTeaId,
    milkTeaId,
    name: item.milkTeaName || item.name || 'Trà Sữa',
    milkTeaName: item.milkTeaName || item.name || 'Trà Sữa',
    size,
    sugar,
    ice,
    toppings: toppingsList,
    quantity,
    unitPrice,
    price: unitPrice,
    totalPrice,
    image: item.image || 'https://images.unsplash.com/photo-1558857563-b37cfb8cb468?auto=format&fit=crop&w=600&q=80',
    note: item.note || '',
  };
}

/**
 * Lấy dữ liệu khởi tạo an toàn từ localStorage
 */
function getInitialCartItems() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((it, idx) => normalizeCartItem(it, idx));
      }
    }
  } catch {
    // Ignored
  }
  return [];
}

/**
 * Trạng thái khởi tạo cho Cart
 */
export const initialCartState = {
  items: getInitialCartItems(),
  loading: false,
  error: null,
  appliedVoucher: null,
  voucherError: '',
};

/**
 * Reducer quản lý toàn bộ trạng thái giỏ hàng
 * Giúp tối giản code xử lý state ở UI và tập trung logic biến đổi dữ liệu
 */
export function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTION_TYPES.CART_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CART_ACTION_TYPES.SET_CART_ITEMS: {
      const newItems = Array.isArray(action.payload)
        ? action.payload.map((it, idx) => normalizeCartItem(it, idx))
        : [];
      return {
        ...state,
        loading: false,
        items: newItems,
        error: null,
      };
    }

    case CART_ACTION_TYPES.ADD_ITEM: {
      const itemToAdd = normalizeCartItem(action.payload, state.items.length);
      const existingIndex = state.items.findIndex(
        (it) => it.cartItemId === itemToAdd.cartItemId
      );

      let updatedItems;
      if (existingIndex > -1) {
        updatedItems = state.items.map((it, idx) => {
          if (idx === existingIndex) {
            const newQty = it.quantity + itemToAdd.quantity;
            return {
              ...it,
              quantity: newQty,
              totalPrice: it.unitPrice * newQty,
            };
          }
          return it;
        });
      } else {
        updatedItems = [...state.items, itemToAdd];
      }

      return {
        ...state,
        loading: false,
        items: updatedItems.map((it, idx) => ({ ...it, index: idx })),
        error: null,
      };
    }

    case CART_ACTION_TYPES.UPDATE_ITEM_QUANTITY: {
      const { index, quantity } = action.payload;
      const newQty = Math.max(0, Number(quantity) || 0);

      let updatedItems;
      if (newQty <= 0) {
        updatedItems = state.items.filter((_, idx) => idx !== index);
      } else {
        updatedItems = state.items.map((it, idx) => {
          if (idx === index) {
            return {
              ...it,
              quantity: newQty,
              totalPrice: it.unitPrice * newQty,
            };
          }
          return it;
        });
      }

      return {
        ...state,
        loading: false,
        items: updatedItems.map((it, idx) => ({ ...it, index: idx })),
        error: null,
      };
    }

    case CART_ACTION_TYPES.REMOVE_ITEM: {
      const targetIndex = action.payload;
      const updatedItems = state.items.filter((_, idx) => idx !== targetIndex);
      return {
        ...state,
        loading: false,
        items: updatedItems.map((it, idx) => ({ ...it, index: idx })),
        error: null,
      };
    }

    case CART_ACTION_TYPES.CLEAR_CART:
      return {
        ...state,
        loading: false,
        items: [],
        appliedVoucher: null,
        voucherError: '',
        error: null,
      };

    case CART_ACTION_TYPES.SET_VOUCHER:
      return {
        ...state,
        appliedVoucher: action.payload,
        voucherError: '',
      };

    case CART_ACTION_TYPES.REMOVE_VOUCHER:
      return {
        ...state,
        appliedVoucher: null,
        voucherError: '',
      };

    case CART_ACTION_TYPES.SET_VOUCHER_ERROR:
      return {
        ...state,
        voucherError: action.payload || '',
      };

    case CART_ACTION_TYPES.CART_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CART_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
        voucherError: '',
      };

    default:
      return state;
  }
}

export default cartReducer;
