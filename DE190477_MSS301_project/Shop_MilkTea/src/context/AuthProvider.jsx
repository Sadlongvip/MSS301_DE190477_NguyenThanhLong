import { useReducer, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { authReducer, initialAuthState, AUTH_ACTION_TYPES } from '../reduce/authReducer';
import authService from '../service/authService';
import accountService from '../service/accountService';

/**
 * AuthProvider - Nơi duy nhất gọi API từ các service và điều phối state qua Reducer
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  /**
   * Đăng nhập: Gọi authService -> Lưu thông tin -> Dispatch Reducer
   */
  const login = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTION_TYPES.AUTH_START });
    try {
      const data = await authService.login(credentials);
      const token = data.accessToken || data.token;
      const user = {
        userId: data.userId,
        username: data.username,
        email: data.email,
        role: data.role,
      };

      if (token) {
        localStorage.setItem('token', token);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      dispatch({
        type: AUTH_ACTION_TYPES.LOGIN_SUCCESS,
        payload: { token, user },
      });

      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Đăng nhập thất bại';
      dispatch({
        type: AUTH_ACTION_TYPES.AUTH_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Đăng ký tài khoản mới: Gọi authService -> Dispatch Reducer
   */
  const register = useCallback(async (accountData) => {
    dispatch({ type: AUTH_ACTION_TYPES.AUTH_START });
    try {
      const data = await authService.register(accountData);
      dispatch({ type: AUTH_ACTION_TYPES.REGISTER_SUCCESS });
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Đăng ký thất bại';
      dispatch({
        type: AUTH_ACTION_TYPES.AUTH_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Đăng xuất: Xóa localStorage -> Dispatch Reducer
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: AUTH_ACTION_TYPES.LOGOUT });
  }, []);

  /**
   * Lấy danh sách tài khoản: Gọi accountService -> Cập nhật accounts vào Reducer
   */
  const fetchAccounts = useCallback(async (keyword) => {
    dispatch({ type: AUTH_ACTION_TYPES.AUTH_START });
    try {
      const data = await accountService.getAccounts(keyword);
      dispatch({
        type: AUTH_ACTION_TYPES.SET_ACCOUNTS,
        payload: data || [],
      });
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Không thể tải danh sách tài khoản';
      dispatch({
        type: AUTH_ACTION_TYPES.AUTH_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Xóa thông báo lỗi
   */
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTION_TYPES.CLEAR_ERROR });
  }, []);

  const value = {
    // Trạng thái từ Reducer
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    accounts: state.accounts,
    // Các hàm hành động (cổng duy nhất gọi API)
    login,
    register,
    logout,
    fetchAccounts,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
