// src/components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const WHOLESALER_NAV = [
  { to: '/wholesaler/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/wholesaler/products',  icon: '📦', label: 'Products' },
  { to: '/wholesaler/orders',    icon: '📋', label: 'Orders' },
  { to: '/wholesaler/batches',   icon: '🚚', label: 'Batches' },
  { to: '/wholesaler/analytics', icon: '📈', label: 'Analytics' },
  { to: '/wholesaler/stock',     icon: '🔄', label: 'Stock Update' },
];
const KIRANA_NAV = [
  { to: '/shop/dashboard',    icon: '🏠', label: 'Dashboard' },
  { to: '/shop/browse',       icon: '🛍️', label: 'Browse Products' },
  { to: '/shop/cart',         icon: '🛒', label: 'My Cart' },
  { to: '/shop/orders',       icon: '📋', label: 'Order History' },
  { to: '/shop/batch-status', icon: '⏱️', label: 'Batch Countdown' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate  = useNavigate();
  const navItems  = user?.role === 'WHOLESALER' ? WHOLESALER_NAV : KIRANA_NAV;

  const handleLogout = () => { logout(); navigate('/login'); onClose?.(); };

  return (
    <>
      {isOpen && <div className="sidebar-overlay show" onClick={onClose} />}

      <aside style={{
        position:'fixed', top:0, left:0, width:'var(--sidebar-w)', height:'100vh',
        background:'var(--surface)', borderRight:'1px solid var(--border)',
        display:'flex', flexDirection:'column', zIndex:100,
        boxShadow:'var(--shadow-md)',
        transition:'transform var(--transition-slow)',
      }} className={`sidebar-desktop${isOpen ? ' mobile-open' : ''}`}>

        {/* Logo */}
        <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40,
              background:'linear-gradient(135deg, var(--primary-btn), var(--primary))',
              borderRadius:'var(--radius)', display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:20, boxShadow:'0 4px 12px var(--primary-glow)' }}>🛺</div>
            <div>
              <div style={{ fontFamily:'Sora', fontWeight:800, fontSize:16, color:'var(--text)' }}>
                Kirana<span style={{ color:'var(--primary-btn)' }}>Connect</span>
              </div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:1 }}>
                {user?.role === 'WHOLESALER' ? 'Wholesaler Portal' : 'Shop Owner Portal'}
              </div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div style={{ margin:'16px 12px', padding:'12px 14px', background:'var(--surface-3)',
          borderRadius:'var(--radius)', border:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:'50%',
              background: user?.role === 'WHOLESALER'
                ? 'linear-gradient(135deg,#ADD8E6,#60A5FA)'
                : 'linear-gradient(135deg,#F97316,#FBBF24)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
              {user?.role === 'WHOLESALER' ? '🏭' : '🛒'}
            </div>
            <div style={{ overflow:'hidden' }}>
              <div style={{ fontWeight:600, fontSize:14, color:'var(--text)',
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>
                {user?.role === 'WHOLESALER' ? user?.businessName : user?.shopName}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'8px 12px', overflowY:'auto' }}>
          <div style={{ fontSize:11, color:'var(--text-faint)', fontWeight:700, textTransform:'uppercase',
            letterSpacing:'0.8px', marginBottom:8, paddingLeft:8, fontFamily:'Sora' }}>Menu</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} onClick={onClose}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:12, padding:'10px 12px',
                borderRadius:'var(--radius-sm)', marginBottom:4,
                fontSize:14, fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--primary-btn)' : 'var(--text-muted)',
                background: isActive ? 'var(--primary-soft)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary-btn)' : '3px solid transparent',
                transition:'all 0.15s', textDecoration:'none',
              })}>
              <span style={{ fontSize:18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
