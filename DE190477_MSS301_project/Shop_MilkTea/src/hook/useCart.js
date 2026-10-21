import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

/**
 * Custom Hook tiện dụng để các Component UI truy xuất dữ liệu & thao tác giỏ hàng
 * Kiểm tra ràng buộc phải được bao bọc bên trong CartProvider
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được sử dụng bên trong CartProvider');
  }
  return context;
}

export default useCart;
