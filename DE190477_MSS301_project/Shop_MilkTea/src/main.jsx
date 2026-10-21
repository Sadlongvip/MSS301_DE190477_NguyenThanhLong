import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthProvider';
import { CartProvider } from './context/CartProvider';
import { InventoryProvider } from './context/InventoryProvider';
import { OrderProvider } from './context/OrderProvider';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <InventoryProvider>
          <OrderProvider>
            <App />
          </OrderProvider>
        </InventoryProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);

