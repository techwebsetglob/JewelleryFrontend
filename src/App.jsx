import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AurumChatBot from './components/AurumChatBot';

// Pages
import Home from './pages/Home';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import PromoManager from './pages/admin/PromoManager';
import OrderTrackingPage from './pages/OrderTrackingPage';
import UpdateTrackingPanel from './pages/admin/UpdateTrackingPanel';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <CartDrawer />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/promos" element={
            <ProtectedRoute>
              <PromoManager />
            </ProtectedRoute>
          } />
          <Route path="/track" element={<OrderTrackingPage />} />
          <Route path="/admin/tracking" element={
            <ProtectedRoute>
              <UpdateTrackingPanel />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      <Footer />

      {/* Global floating components — renders on every page */}
      <AurumChatBot />
    </div>
  );
}

export default App;
