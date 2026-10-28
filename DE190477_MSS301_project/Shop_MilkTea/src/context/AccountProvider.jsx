import React, { useReducer, useCallback, useEffect } from 'react';
import { AccountContext } from './AccountContext';
import {
  accountReducer,
  initialAccountState,
  ACCOUNT_ACTION_TYPES,
} from '../reduce/accountReducer';
import accountService from '../service/accountService';

/**
 * AccountProvider - Nơi DUY NHẤT gọi API từ accountService
 * và điều phối state qua accountReducer.
 * Các UI Component tuyệt đối không gọi trực tiếp accountService.
 */
export function AccountProvider({ children }) {
  const [state, dispatch] = useReducer(accountReducer, initialAccountState);

  /**
   * Lấy danh sách tài khoản theo từ khóa tìm kiếm
   */
  const fetchAccounts = useCallback(async (keyword = '') => {
    dispatch({ type: ACCOUNT_ACTION_TYPES.ACCOUNT_START });
    try {
      const data = await accountService.getAccounts(keyword);
      dispatch({
        type: ACCOUNT_ACTION_TYPES.SET_ACCOUNTS,
        payload: data || [],
      });
      return { success: true, data };
    } catch (err) {
      const msg = err.message || 'Không thể tải danh sách tài khoản';
      dispatch({
        type: ACCOUNT_ACTION_TYPES.ACCOUNT_FAILURE,
        payload: msg,
      });
      return { success: false, error: msg };
    }
  }, []);

  /**
   * Tạo tài khoản mới
   */
  const createAccount = useCallback(async (data) => {
    dispatch({ type: ACCOUNT_ACTION_TYPES.ACCOUNT_MUTATE_START });
    try {
      const res = await accountService.createAccount(data);
      dispatch({ type: ACCOUNT_ACTION_TYPES.ACCOUNT_MUTATE_SUCCESS });
      await fetchAccounts(state.keyword);
      return { success: true, data: res };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi tạo tài khoản';
      dispatch({
        type: ACCOUNT_ACTION_TYPES.ACCOUNT_MUTATE_FAILURE,
        payload: msg,
      });
      return { success: false, error: msg };
    }
  }, [fetchAccounts, state.keyword]);

  /**
   * Cập nhật thông tin tài khoản
   */
  const updateAccount = useCallback(async (id, data) => {
    dispatch({ type: ACCOUNT_ACTION_TYPES.ACCOUNT_MUTATE_START });
    try {
      const res = await accountService.updateAccount(id, data);
      dispatch({ type: ACCOUNT_ACTION_TYPES.ACCOUNT_MUTATE_SUCCESS });
      await fetchAccounts(state.keyword);
      return { success: true, data: res };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi cập nhật tài khoản';
      dispatch({
        type: ACCOUNT_ACTION_TYPES.ACCOUNT_MUTATE_FAILURE,
        payload: msg,
      });
      return { success: false, error: msg };
    }
  }, [fetchAccounts, state.keyword]);

  /**
   * Xóa tài khoản
   */
  const deleteAccount = useCallback(async (id) => {
    dispatch({ type: ACCOUNT_ACTION_TYPES.ACCOUNT_MUTATE_START });
    try {
      await accountService.deleteAccount(id);
      dispatch({ type: ACCOUNT_ACTION_TYPES.ACCOUNT_MUTATE_SUCCESS });
      await fetchAccounts(state.keyword);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi xóa tài khoản';
      dispatch({
        type: ACCOUNT_ACTION_TYPES.ACCOUNT_MUTATE_FAILURE,
        payload: msg,
      });
      return { success: false, error: msg };
    }
  }, [fetchAccounts, state.keyword]);

  /**
   * Cập nhật từ khóa tìm kiếm
   */
  const setKeyword = useCallback((keyword) => {
    dispatch({
      type: ACCOUNT_ACTION_TYPES.SET_KEYWORD,
      payload: keyword,
    });
    fetchAccounts(keyword);
  }, [fetchAccounts]);

  /**
   * Đổi mật khẩu tài khoản
   */
  const changePassword = useCallback(async (id, newPassword) => {
    dispatch({ type: ACCOUNT_ACTION_TYPES.ACCOUNT_MUTATE_START });
    try {
      const data = await accountService.changePassword(id, newPassword);
      dispatch({ type: ACCOUNT_ACTION_TYPES.ACCOUNT_MUTATE_SUCCESS });
      return { success: true, data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi đổi mật khẩu';
      dispatch({
        type: ACCOUNT_ACTION_TYPES.ACCOUNT_MUTATE_FAILURE,
        payload: msg,
      });
      return { success: false, error: msg };
    }
  }, []);

  /**
   * Xóa thông báo lỗi
   */
  const clearError = useCallback(() => {
    dispatch({ type: ACCOUNT_ACTION_TYPES.CLEAR_ERROR });
  }, []);

  const value = {
    // Trạng thái từ reducer
    accounts: state.accounts,
    selectedAccount: state.selectedAccount,
    keyword: state.keyword,
    loading: state.loading,
    submitting: state.submitting,
    error: state.error,

    // Cổng duy nhất gọi API
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    changePassword,
    setKeyword,
    clearError,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
}

export default AccountProvider;
