// src/App.jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar  from './components/Sidebar';
import Navbar   from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import NotificationManager from './components/NotificationManager';

import SplashPage    from './pages/SplashPage';
import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';

import WDashboard    from './pages/wholesaler/WDashboard';
import ProductList   from './pages/wholesaler/ProductList';
import ProductForm   from './pages/wholesaler/ProductForm';
import IncomingOrders from './pages/wholesaler/IncomingOrders';
import BatchView     from './pages/wholesaler/BatchView';
import Analytics     from './pages/wholesaler/Analytics';
import StockUpdate   from './pages/wholesaler/StockUpdate';

import KDashboard    from './pages/kirana/KDashboard';
import Browse        from './pages/kirana/Browse';
import ProductDetail from './pages/kirana/ProductDetail';
import Cart          from './pages/kirana/Cart';
import OrderConfirm  from './pages/kirana/OrderConfirm';
import OrderHistory  from './pages/kirana/OrderHistory';
import BatchCountdown from './pages/kirana/BatchCountdown';
import MyKhata       from './pages/kirana/MyKhata';

import KhataLedger   from './pages/wholesaler/KhataLedger';

import Profile from './pages/shared/Profile';

function PrivateRoute({ children, allowedRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'WHOLESALER' ? '/wholesaler/dashboard' : '/shop/dashboard'} replace />;
  }
  return children;
}

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar onMenuClick={() => setSidebarOpen(o => !o)} />
        <main>{children}</main>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  const { user } = useAuth();
  const defaultDash = user?.role === 'WHOLESALER' ? '/wholesaler/dashboard' : '/shop/dashboard';

  return (
    <>
      <ScrollToTop />
      <NotificationManager />
      <ToastContainer position="top-right" autoClose={5000} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<SplashPage />} />
        <Route path="/login"    element={user ? <Navigate to={defaultDash} /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to={defaultDash} /> : <RegisterPage />} />

        {/* Wholesaler */}
        <Route path="/wholesaler/*" element={
          <PrivateRoute allowedRole="WHOLESALER">
            <AppLayout>
              <Routes>
                <Route path="dashboard"        element={<WDashboard />} />
                <Route path="products"         element={<ProductList />} />
                <Route path="products/add"     element={<ProductForm />} />
                <Route path="products/:id/edit" element={<ProductForm />} />
                <Route path="orders"           element={<IncomingOrders />} />
                <Route path="batches"          element={<BatchView />} />
                <Route path="analytics"        element={<Analytics />} />
                <Route path="stock"            element={<StockUpdate />} />
                <Route path="khata"            element={<KhataLedger />} />
                <Route path="*"                element={<Navigate to="dashboard" />} />
              </Routes>
            </AppLayout>
          </PrivateRoute>
        } />

        {/* Kirana */}
        <Route path="/shop/*" element={
          <PrivateRoute allowedRole="SHOP_OWNER">
            <AppLayout>
              <Routes>
                <Route path="dashboard"    element={<KDashboard />} />
                <Route path="browse"       element={<Browse />} />
                <Route path="products/:id" element={<ProductDetail />} />
                <Route path="cart"         element={<Cart />} />
                <Route path="order-confirm" element={<OrderConfirm />} />
                <Route path="orders"       element={<OrderHistory />} />
                <Route path="batch-status" element={<BatchCountdown />} />
                <Route path="khata"        element={<MyKhata />} />
                <Route path="*"            element={<Navigate to="dashboard" />} />
              </Routes>
            </AppLayout>
          </PrivateRoute>
        } />

        {/* Shared */}
        <Route path="/profile" element={
          <PrivateRoute>
            <AppLayout><Profile /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
