// src/pages/kirana/KDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import * as ordersApi  from '../../api/orders.js';
import * as batchesApi from '../../api/batches.js';
import StatusBadge     from '../../components/StatusBadge';
import CountdownTimer  from '../../components/CountdownTimer';
import { LoadingSpinner, ErrorMessage } from '../../components/LoadingSpinner';

export default function KDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const { itemCount, total } = useCart();

  const [orders,       setOrders]       = useState([]);
  const [nextDispatch, setNextDispatch] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [o, nd] = await Promise.all([
        ordersApi.getMyOrders(),
        batchesApi.getNextDispatch(),
      ]);
      setOrders(o);
      setNextDispatch(nd.nextDispatch);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="page-container"><LoadingSpinner text="Loading dashboard..." /></div>;
  if (error)   return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;

  const activeOrders = orders.filter(o => o.status !== 'DISPATCHED');
  const savings = orders.reduce((s, o) => s + o.totalAmount * 0.08, 0);

  return (
    <div className="page-container">
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #F97316 0%, #FBBF24 60%, #FDE68A 100%)',
        borderRadius: 'var(--radius-xl)', padding: '28px 32px', marginBottom: 28,
        color: 'white', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 16,
        boxShadow: '0 8px 32px rgba(249,115,22,0.3)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 160, height: 160, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ opacity: 0.9, fontSize: 14, marginBottom: 4 }}>Welcome back 🙏</p>
          <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 26, margin: 0 }}>{user?.shopName}</h2>
          <p style={{ opacity: 0.85, fontSize: 14, marginTop: 4 }}>
            {activeOrders.length > 0
              ? `${activeOrders.length} active order${activeOrders.length > 1 ? 's' : ''} in progress`
              : 'No active orders — browse and stock up!'}
          </p>
        </div>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>🕐 Next Dispatch</div>
          <CountdownTimer targetTime={nextDispatch} targetHour={18} />
          <div style={{ fontSize: 11, opacity: 0.75, marginTop: 4 }}>Place orders before cutoff!</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Active Orders',      value: activeOrders.length,                icon: '📦', bg: '#DBEAFE' },
          { label: 'Cart Items',         value: itemCount,                          icon: '🛒', bg: '#FEF3C7' },
          { label: 'Savings This Month', value: `₹${Math.round(savings).toLocaleString()}`, icon: '💰', bg: '#D1FAE5' },
          { label: 'Total Orders',       value: orders.length,                      icon: '🗂️', bg: '#EDE9FE' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg, fontSize: 22 }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Recent orders */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16 }}>Recent Orders</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/shop/orders')}>View All</button>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-icon">📭</div>
              <h3>No orders yet</h3>
              <p>Browse products and place your first order</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.slice(0, 5).map(order => (
                <div key={order._id} style={{
                  padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>#{order._id.slice(-6).toUpperCase()}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {order.items?.length} items · {order.wholesalerInfo?.businessName || 'Wholesaler'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <StatusBadge status={order.status} />
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Sora' }}>
                      ₹{order.totalAmount?.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Actions */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { icon: '🛍️', label: 'Browse Products', to: '/shop/browse',       color: '#DBEAFE', text: '#1A78C2' },
                { icon: '🛒', label: `Cart (${itemCount})`, to: '/shop/cart',     color: '#FEF3C7', text: '#D97706' },
                { icon: '📋', label: 'Order History',   to: '/shop/orders',       color: '#D1FAE5', text: '#059669' },
                { icon: '⏱️', label: 'Batch Timer',     to: '/shop/batch-status', color: '#EDE9FE', text: '#7C3AED' },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.to)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '18px 10px', background: a.color, border: 'none',
                  borderRadius: 'var(--radius)', cursor: 'pointer', color: a.text, transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <span style={{ fontSize: 26 }}>{a.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Sora', textAlign: 'center' }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dispatch countdown */}
          <div style={{ background: 'linear-gradient(135deg, var(--purple-soft), var(--primary-soft))',
            border: '1.5px solid var(--primary)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase',
              letterSpacing: '0.5px', marginBottom: 10, fontFamily: 'Sora' }}>⚡ Next Batch Cutoff</div>
            <CountdownTimer targetTime={nextDispatch} targetHour={18} />
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 10 }}>
              Order now to make the next dispatch window
            </div>
            <button className="btn btn-primary" style={{ marginTop: 14, width: '100%' }}
              onClick={() => navigate('/shop/browse')}>Shop Now →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
