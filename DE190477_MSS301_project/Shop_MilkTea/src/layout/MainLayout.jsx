import React from 'react';
import Header from '../component/common/Header';
import Footer from '../component/common/Footer';

/**
 * MainLayout - Bố cục chính cho toàn bộ ứng dụng Shop_MilkTea
 * Tách biệt Header điều hướng và Footer ra khỏi các trang chi tiết
 */
export function MainLayout({ children, cartCount = 0, onOpenCart, onOpenAuth }) {
  return (
    <div className="main-layout-wrapper d-flex flex-column min-vh-100">
      {/* 1. Header chính: Glassmorphism Navbar (logo, menu, giỏ hàng, auth) */}
      <Header
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        onOpenAuth={onOpenAuth}
      />

      {/* 3. Phần nội dung chính của trang */}
      <main className="flex-grow-1">
        {children}
      </main>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}

export default MainLayout;
