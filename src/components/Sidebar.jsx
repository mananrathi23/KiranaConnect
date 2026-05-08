import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './sidebar.css';

const WHOLESALER_NAV = [
  { to: '/wholesaler/dashboard',  icon: '📊', label: 'Dashboard' },
  { to: '/wholesaler/products',   icon: '📦', label: 'Products' },
  { to: '/wholesaler/orders',     icon: '📋', label: 'Orders' },
  { to: '/wholesaler/batches',    icon: '🚚', label: 'Batches' },
  { to: '/wholesaler/analytics',  icon: '📈', label: 'Analytics' },
  { to: '/wholesaler/stock',      icon: '🔄', label: 'Stock Update' },
];

const KIRANA_NAV = [
  { to: '/shop/dashboard',     icon: '🏠', label: 'Dashboard' },
  { to: '/shop/browse',        icon: '🛍️', label: 'Browse Products' },
  { to: '/shop/cart',          icon: '🛒', label: 'My Cart' },
  { to: '/shop/orders',        icon: '📋', label: 'Order History' },
  { to: '/shop/batch-status',  icon: '⏱️', label: 'Batch Countdown' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const navItems = user?.role === 'WHOLESALER' ? WHOLESALER_NAV : KIRANA_NAV;

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`} 
        onClick={onClose} 
      />

      <aside 
        className={`sidebar-desktop ${isOpen ? 'mobile-open' : ''}`}
        style={{ transform: isOpen ? 'translateX(0)' : undefined }}
      >
        {/* Logo Section */}
        <div className="sidebar-logo-section">
          <div className="logo-container">
            <div className="logo-box">🛺</div>
            <div>
              <div className="logo-text">
                Kirana<span>Connect</span>
              </div>
              <div className="logo-subtitle">
                {user?.role === 'WHOLESALER' ? 'Wholesaler Portal' : 'Shop Owner Portal'}
              </div>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="sidebar-user-card">
          <div 
            className="avatar-circle"
            style={{
              background: user?.role === 'WHOLESALER'
                ? 'linear-gradient(135deg, #ADD8E6, #60A5FA)'
                : 'linear-gradient(135deg, #F97316, #FBBF24)',
            }}
          >
            {user?.avatar}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div className="user-name-text">{user?.name}</div>
            <div className="user-role-text">
              {user?.role === 'WHOLESALER' ? user?.businessName : user?.shopName}
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav-container">
          <div className="nav-group-label">Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className="sidebar-nav-link"
              style={({ isActive }) => ({
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--primary-btn)' : 'var(--text-muted)',
                background: isActive ? 'var(--primary-soft)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary-btn)' : '3px solid transparent',
              })}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}