import { useContext } from 'react';
import { InventoryContext } from '../context/InventoryContext';

/**
 * Custom Hook tiện dụng để các Component UI truy xuất dữ liệu danh mục & thực đơn trà sữa
 * Kiểm tra ràng buộc phải được bao bọc bên trong InventoryProvider
 */
export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory phải được sử dụng bên trong InventoryProvider');
  }
  return context;
}

export default useInventory;
