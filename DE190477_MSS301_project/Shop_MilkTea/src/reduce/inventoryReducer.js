/**
 * Action Types cho Inventory Reducer
 */
export const INVENTORY_ACTION_TYPES = {
  INVENTORY_START: 'INVENTORY_START',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_MILK_TEAS: 'SET_MILK_TEAS',
  SET_TOPPINGS: 'SET_TOPPINGS',
  SET_SIZES: 'SET_SIZES',
  SET_SELECTED_CATEGORY: 'SET_SELECTED_CATEGORY',
  SET_SEARCH_KEYWORD: 'SET_SEARCH_KEYWORD',
  MUTATE_START: 'MUTATE_START',
  MUTATE_SUCCESS: 'MUTATE_SUCCESS',
  MUTATE_FAILURE: 'MUTATE_FAILURE',
  INVENTORY_FAILURE: 'INVENTORY_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

/**
 * Trạng thái khởi tạo cho Inventory
 */
export const initialInventoryState = {
  categories: [],
  milkTeas: [],
  toppings: [],
  sizes: [],
  selectedCategoryId: null, // null là chọn tất cả
  searchKeyword: '',
  loading: false,
  submitting: false,
  error: null,
};

/**
 * Reducer quản lý trạng thái kho sản phẩm, danh mục, topping và bộ lọc
 * Giúp tối giản code xử lý state ở UI
 */
export function inventoryReducer(state, action) {
  switch (action.type) {
    case INVENTORY_ACTION_TYPES.INVENTORY_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case INVENTORY_ACTION_TYPES.SET_CATEGORIES:
      return {
        ...state,
        loading: false,
        categories: action.payload || [],
      };

    case INVENTORY_ACTION_TYPES.SET_MILK_TEAS:
      return {
        ...state,
        loading: false,
        milkTeas: action.payload || [],
      };

    case INVENTORY_ACTION_TYPES.SET_TOPPINGS:
      return {
        ...state,
        loading: false,
        toppings: action.payload || [],
      };

    case INVENTORY_ACTION_TYPES.SET_SIZES:
      return {
        ...state,
        loading: false,
        sizes: action.payload || [],
      };

    case INVENTORY_ACTION_TYPES.SET_SELECTED_CATEGORY:
      return {
        ...state,
        selectedCategoryId: action.payload,
      };

    case INVENTORY_ACTION_TYPES.SET_SEARCH_KEYWORD:
      return {
        ...state,
        searchKeyword: action.payload,
      };

    case INVENTORY_ACTION_TYPES.MUTATE_START:
      return {
        ...state,
        submitting: true,
        error: null,
      };

    case INVENTORY_ACTION_TYPES.MUTATE_SUCCESS:
      return {
        ...state,
        submitting: false,
        error: null,
      };

    case INVENTORY_ACTION_TYPES.MUTATE_FAILURE:
      return {
        ...state,
        submitting: false,
        error: action.payload,
      };

    case INVENTORY_ACTION_TYPES.INVENTORY_FAILURE:
      return {
        ...state,
        loading: false,
        submitting: false,
        error: action.payload,
      };

    case INVENTORY_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}
