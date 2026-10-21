import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom Hook tiện dụng để các Component UI truy xuất dữ liệu xác thực & gọi action
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}

export default useAuth;
