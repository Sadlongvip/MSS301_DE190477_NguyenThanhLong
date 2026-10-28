/**
 * Action Types cho Account Reducer
 */
export const ACCOUNT_ACTION_TYPES = {
  ACCOUNT_START: 'ACCOUNT_START',
  SET_ACCOUNTS: 'SET_ACCOUNTS',
  SET_SELECTED_ACCOUNT: 'SET_SELECTED_ACCOUNT',
  SET_KEYWORD: 'SET_KEYWORD',
  ACCOUNT_MUTATE_START: 'ACCOUNT_MUTATE_START',
  ACCOUNT_MUTATE_SUCCESS: 'ACCOUNT_MUTATE_SUCCESS',
  ACCOUNT_MUTATE_FAILURE: 'ACCOUNT_MUTATE_FAILURE',
  ACCOUNT_FAILURE: 'ACCOUNT_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

/**
 * Khởi tạo trạng thái Account
 */
export const initialAccountState = {
  accounts: [],
  selectedAccount: null,
  keyword: '',
  loading: false,
  submitting: false,
  error: null,
};

/**
 * Account Reducer - Quản lý danh sách và trạng thái tài khoản người dùng
 */
export function accountReducer(state, action) {
  switch (action.type) {
    case ACCOUNT_ACTION_TYPES.ACCOUNT_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ACCOUNT_ACTION_TYPES.SET_ACCOUNTS:
      return {
        ...state,
        loading: false,
        accounts: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case ACCOUNT_ACTION_TYPES.SET_SELECTED_ACCOUNT:
      return {
        ...state,
        selectedAccount: action.payload,
      };

    case ACCOUNT_ACTION_TYPES.SET_KEYWORD:
      return {
        ...state,
        keyword: action.payload,
      };

    case ACCOUNT_ACTION_TYPES.ACCOUNT_MUTATE_START:
      return {
        ...state,
        submitting: true,
        error: null,
      };

    case ACCOUNT_ACTION_TYPES.ACCOUNT_MUTATE_SUCCESS:
      return {
        ...state,
        submitting: false,
        error: null,
      };

    case ACCOUNT_ACTION_TYPES.ACCOUNT_MUTATE_FAILURE:
      return {
        ...state,
        submitting: false,
        error: action.payload,
      };

    case ACCOUNT_ACTION_TYPES.ACCOUNT_FAILURE:
      return {
        ...state,
        loading: false,
        submitting: false,
        error: action.payload,
      };

    case ACCOUNT_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

export default accountReducer;
