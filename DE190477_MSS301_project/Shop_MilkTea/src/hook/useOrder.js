import { useContext } from 'react';
import { OrderContext } from '../context/OrderContext';

/**
 * Custom Hook tiện dụng để các Component UI truy xuất dữ liệu đơn hàng & gọi action
 * Đảm bảo các component không gọi trực tiếp service mà thông qua Provider
 */
export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder phải được sử dụng bên trong OrderProvider');
  }
  return context;
}

export default useOrder;
