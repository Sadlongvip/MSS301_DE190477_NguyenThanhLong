import { useContext } from 'react';
import { AccountContext } from '../context/AccountContext';

/**
 * Custom Hook truy xuất trạng thái và hành động quản lý tài khoản
 */
export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount phải được sử dụng bên trong AccountProvider');
  }
  return context;
}

export default useAccount;
