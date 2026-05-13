// src/pages/wholesaler/WDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as analyticsApi from '../../api/analytics.js';
import * as ordersApi    from '../../api/orders.js';
import StatusBadge       from '../../components/StatusBadge';
import CountdownTimer    from '../../components/CountdownTimer';
import { LoadingSpinner, ErrorMessage } from '../../components/LoadingSpinner';

export default function WDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary,    setSummary]    = useState(null);
  const [orders,     setOrders]     = useState([]);
  const [topProds,   setTopProds]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [s, o, t] = await Promise.all([
        analyticsApi.getSummary(),
        ordersApi.getIncomingOrders(),
        analyticsApi.getTopProducts(),
      ]);
      setSummary(s);
      setOrders(o.slice(0, 4));
      setTopProds(t.slice(0, 3));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="page-container"><LoadingSpinner text="Loading dashboard..." /></div>;
  if (error)   return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;

  const stats = [
    { label: 'Total Revenue',   value: `₹${((summary?.totalRevenue||0)/1000).toFixed(1)}K`, icon: '💰', iconBg: '#D1FAE5' },
    { label: 'Total Orders',    value: summary?.orderCount    || 0, icon: '📦', iconBg: '#DBEAFE' },
    { label: 'Pending Orders',  value: summary?.pendingOrders || 0, icon: '⏳', iconBg: '#FEF3C7' },
    { label: 'Low Stock Items', value: summary?.lowStockCount || 0, icon: '⚠️', iconBg: '#FEE2E2' },
  ];

  return (
    <div className="page-container">
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-btn) 0%, #0EA5E9 60%, var(--primary) 100%)',
        borderRadius: 'var(--radius-xl)', padding: '28px 32px', marginBottom: 28,
        color: 'white', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 16,
        boxShadow: '0 8px 32px rgba(26,120,194,0.35)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ opacity: 0.85, fontSize: 14, marginBottom: 4 }}>Good day 👋</p>
          <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 26, margin: 0 }}>{user?.businessName}</h2>
          <p style={{ opacity: 0.75, fontSize: 14, marginTop: 4 }}>
            {summary?.pendingOrders > 0
              ? `${summary.pendingOrders} pending orders need your attention`
              : 'All orders are up to date ✅'}
          </p>
        </div>
        <div style={{ textAlign: 'right', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Next Batch Dispatch</div>
          <CountdownTimer targetHour={18} />
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>Every 6 hours</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.iconBg, fontSize: 22 }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Recent orders */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16 }}>Recent Orders</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/wholesaler/orders')}>View All</button>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-icon">📭</div>
              <h3>No orders yet</h3>
              <p>Orders from kirana stores will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.map(order => (
                <div key={order._id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 14px', background: 'var(--surface-2)',
                  borderRadius: 'var(--radius)', border: '1px solid var(--border-2)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{order.shopOwnerInfo?.shopName || order.shopOwnerInfo?.name || 'Unknown Shop'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {order.items?.length} items · ₹{order.totalAmount?.toLocaleString()}
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Actions */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: '➕', label: 'Add Product',  to: '/wholesaler/products/add', color: '#DBEAFE', text: '#1A78C2' },
                { icon: '📋', label: 'View Orders',  to: '/wholesaler/orders',       color: '#FEF3C7', text: '#D97706' },
                { icon: '🔄', label: 'Update Stock', to: '/wholesaler/stock',        color: '#D1FAE5', text: '#059669' },
                { icon: '📈', label: 'Analytics',    to: '/wholesaler/analytics',    color: '#EDE9FE', text: '#7C3AED' },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.to)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '16px 10px', background: a.color, border: 'none',
                  borderRadius: 'var(--radius)', cursor: 'pointer', color: a.text, transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <span style={{ fontSize: 24 }}>{a.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Sora', textAlign: 'center' }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Top products */}
          {topProds.length > 0 && (
            <div className="card" style={{ padding: 24, flex: 1 }}>
              <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Top Products</h3>
              {topProds.map((p, i) => (
                <div key={p._id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>
                      <span style={{ color: 'var(--text-faint)', marginRight: 6 }}>#{i + 1}</span>{p.name}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>₹{(p.revenue/1000).toFixed(1)}K</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${p.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
