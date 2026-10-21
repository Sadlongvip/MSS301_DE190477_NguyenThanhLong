import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../page/LandingPage';
import MenuPage from '../page/MenuPage';
import CartPage from '../page/CartPage';
import AdminMenuPage from '../page/admin/AdminMenuPage';
import AdminRoute from '../component/auth/AdminRoute';
import ProtectedRoute from '../component/auth/ProtectedRoute';
import OrderPage from '../page/OrderPage';

/**
 * AppRouter - Cấu hình định tuyến trang cho toàn bộ ứng dụng Shop_MilkTea
 * - / : Trang Chủ (Landing Page)
 * - /menu : Trang Thực Đơn (Menu Page 30-70)
 * - /cart : Trang Giỏ Hàng (Cart Page cho User)
 * - /orders : Lịch Sử Đơn Hàng (Chỉ người dùng đã đăng nhập)
 * - /admin/menu : Trang Quản Trị Thực Đơn (Dành riêng cho ADMIN)
 * - * : Mặc định chuyển hướng về Trang Chủ
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute title="Lịch Sử Đơn Hàng Của Bạn">
              <OrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <AdminRoute>
              <AdminMenuPage />
            </AdminRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/menu" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
