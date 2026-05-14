// src/components/Navbar.jsx
import { useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const PAGE_TITLES = {
  '/wholesaler/dashboard': 'Dashboard',   '/wholesaler/products': 'Product List',
  '/wholesaler/products/add': 'Add Product', '/wholesaler/orders': 'Incoming Orders',
  '/wholesaler/batches': 'Batch Dispatch',   '/wholesaler/analytics': 'Analytics',
  '/wholesaler/stock': 'Stock Update',
  '/shop/dashboard': 'Dashboard',  '/shop/browse': 'Browse Products',
  '/shop/cart': 'My Cart',          '/shop/orders': 'Order History',
  '/shop/batch-status': 'Batch Countdown', '/profile': 'Profile',
};

export default function Navbar({ onMenuClick }) {
  const { pathname }  = useLocation();
  const { user, theme, toggleTheme } = useAuth();
  const { itemCount } = useCart();

  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] || 'KiranaConnect';

  return (
    <header style={{
      position:'fixed', top:0, left:'var(--sidebar-w)', right:0, height:'var(--navbar-h)',
      background:'var(--surface)', borderBottom:'1px solid var(--border)',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 24px', zIndex:50, boxShadow:'var(--shadow-xs)',
      transition:'left var(--transition-slow)',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <button onClick={onMenuClick} className="mobile-menu-btn"
          style={{ display:'none', padding:8, border:'1.5px solid var(--border)',
            borderRadius:'var(--radius-sm)', background:'transparent', color:'var(--text)',
            fontSize:18, cursor:'pointer' }}>☰</button>
        <h1 style={{ fontFamily:'Sora', fontWeight:700, fontSize:18, color:'var(--text)' }}>{title}</h1>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          style={{ padding:'8px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)',
            background:'var(--surface-2)', color:'var(--text)', fontSize:16, cursor:'pointer',
            transition:'all var(--transition)' }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {user?.role === 'SHOP_OWNER' && (
          <NavLink to="/shop/cart" style={{ position:'relative', display:'flex', alignItems:'center' }}>
            <button style={{ padding:'8px 12px', border:'1.5px solid var(--border)',
              borderRadius:'var(--radius-sm)', background:'var(--surface-2)', color:'var(--text)',
              fontSize:18, cursor:'pointer' }}>🛒</button>
            {itemCount > 0 && (
              <span style={{ position:'absolute', top:-6, right:-6, background:'var(--orange)',
                color:'white', borderRadius:'50%', width:18, height:18,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:10, fontWeight:700 }}>{itemCount > 99 ? '99+' : itemCount}</span>
            )}
          </NavLink>
        )}

        <NavLink to="/profile" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
          <div style={{ width:36, height:36, borderRadius:'50%',
            background: user?.role === 'WHOLESALER'
              ? 'linear-gradient(135deg,#ADD8E6,#2563EB)'
              : 'linear-gradient(135deg,#F97316,#FBBF24)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
            boxShadow:'var(--shadow-sm)', cursor:'pointer' }}>
            {user?.role === 'WHOLESALER' ? '🏭' : '🛒'}
          </div>
          <span className="nav-username" style={{ fontSize:14, fontWeight:600, color:'var(--text)', display:'none' }}>
            {user?.name?.split(' ')[0]}
          </span>
        </NavLink>
      </div>

      <style>{`
        @media(max-width:768px){ header{left:0 !important;} .mobile-menu-btn{display:flex !important;} }
        @media(min-width:1024px){ .nav-username{display:inline !important;} }
      `}</style>
    </header>
  );
}