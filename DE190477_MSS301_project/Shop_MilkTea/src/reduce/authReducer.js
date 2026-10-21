// Định nghĩa các loại action cho Reducer
export const AUTH_ACTION_TYPES = {
  AUTH_START: 'AUTH_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_ACCOUNTS: 'SET_ACCOUNTS',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Hàm lấy dữ liệu khởi tạo an toàn từ localStorage
function getInitialUser() {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

const savedToken = localStorage.getItem('token');

export const initialAuthState = {
  user: getInitialUser(),
  token: savedToken,
  isAuthenticated: Boolean(savedToken),
  loading: false,
  error: null,
  accounts: [],
};

/**
 * Reducer quản lý toàn bộ trạng thái xác thực và tài khoản
 * Giúp tối giản code xử lý state (loading, error, user...) ở UI
 */
export function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTION_TYPES.AUTH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTION_TYPES.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
        error: null,
      };

    case AUTH_ACTION_TYPES.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case AUTH_ACTION_TYPES.AUTH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case AUTH_ACTION_TYPES.LOGOUT:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        token: null,
        user: null,
        error: null,
        accounts: [],
      };

    case AUTH_ACTION_TYPES.SET_ACCOUNTS:
      return {
        ...state,
        loading: false,
        accounts: action.payload,
        error: null,
      };

    case AUTH_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}
