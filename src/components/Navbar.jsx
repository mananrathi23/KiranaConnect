// src/components/Navbar.jsx
import { useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './navbar.css';

const PAGE_TITLES = {
  '/wholesaler/dashboard': 'Dashboard',
  '/wholesaler/products': 'Product List',
  '/wholesaler/products/add': 'Add Product',
  '/wholesaler/orders': 'Incoming Orders',
  '/wholesaler/batches': 'Batch Dispatch',
  '/wholesaler/analytics': 'Analytics',
  '/wholesaler/stock': 'Stock Update',
  '/shop/dashboard': 'Dashboard',
  '/shop/browse': 'Browse Products',
  '/shop/cart': 'My Cart',
  '/shop/orders': 'Order History',
  '/shop/batch-status': 'Batch Countdown',
  '/profile': 'Profile',
};

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const { user, theme, toggleTheme } = useAuth();
  const { itemCount } = useCart();

  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] || 'KiranaConnect';

  return (
    <header className="navbar">
      
      <div className="navbar-left">
        
        <button onClick={onMenuClick} className="mobile-menu-btn">☰</button>

        <div>
          <h1 className="navbar-title">{title}</h1>
        </div>
      </div>

      <div className="navbar-right">
        
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="theme-btn"
          title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Cart */}
        {user?.role === 'SHOP_OWNER' && (
          <NavLink to="/shop/cart" className="cart-link">
            <button className="cart-btn">🛒</button>

            {itemCount > 0 && (
              <span className="cart-badge">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </NavLink>
        )}

        {/* Avatar */}
        <NavLink to="/profile" className="profile-link">
          <div
            className={`avatar ${user?.role === 'WHOLESALER' ? 'wholesaler' : 'shop'}`}
          >
            {user?.avatar}
          </div>

          <span className="nav-username">
            {user?.name?.split(' ')[0]}
          </span>
        </NavLink>
      </div>

    </header>
  );
}