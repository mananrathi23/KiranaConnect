// src/pages/wholesaler/IncomingOrders.jsx
import { useState, useEffect } from 'react';
import * as ordersApi from '../../api/orders.js';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner, ErrorMessage } from '../../components/LoadingSpinner';

export default function IncomingOrders() {
  const [orders,   setOrders]   = useState([]);
  const [tab,      setTab]      = useState('ALL');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try { setOrders(await ordersApi.getIncomingOrders()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      const updated = await ordersApi.updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: updated.status } : o));
    } catch (err) { alert(err.message); }
    finally { setUpdating(null); }
  };

  const tabs   = ['ALL', 'PENDING', 'BATCHED', 'DISPATCHED'];
  const counts = Object.fromEntries(tabs.map(t => [t, t === 'ALL' ? orders.length : orders.filter(o => o.status === t).length]));
  const filtered = tab === 'ALL' ? orders : orders.filter(o => o.status === tab);

  if (loading) return <div className="page-container"><LoadingSpinner text="Loading orders..." /></div>;
  if (error)   return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Incoming Orders</h2>
          <p className="page-subtitle">{counts.PENDING} pending · {orders.length} total</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={load}>↻ Refresh</button>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'ALL' ? '📋' : t === 'PENDING' ? '⏳' : t === 'BATCHED' ? '📦' : '✅'} {t}
            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700,
              background: tab === t ? 'var(--primary-btn)' : 'var(--border)',
              color: tab === t ? 'white' : 'var(--text-muted)',
              borderRadius: 'var(--radius-full)', padding: '1px 7px' }}>{counts[t]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state card" style={{ padding: 48 }}>
          <div className="empty-icon">📭</div>
          <h3>No {tab === 'ALL' ? '' : tab.toLowerCase()} orders</h3>
          <p>Orders placed by kirana shops will appear here</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map(order => {
          const shop = order.shopOwnerInfo?.shopName || order.shopOwnerInfo?.name || 'Unknown Shop';
          return (
            <div key={order._id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{
                padding: '18px 20px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
                borderLeft: `4px solid ${order.status === 'PENDING' ? 'var(--yellow)' : order.status === 'BATCHED' ? 'var(--purple)' : 'var(--green)'}`,
              }} onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flex: 1 }}>
                  <div style={{ width: 44, height: 44, background: 'var(--surface-3)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏪</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{shop}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      #{order._id.slice(-6)} · {new Date(order.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18 }}>₹{order.totalAmount?.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.items?.length} items</div>
                  </div>
                  <StatusBadge status={order.status} />
                  <span style={{ color: 'var(--text-muted)' }}>{expanded === order._id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === order._id && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-2)' }}>
                  <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>{item.productName || 'Product'}</span>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 10 }}>× {item.quantity} units</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontFamily: 'Sora' }}>₹{(item.quantity * item.priceAtPurchase).toLocaleString()}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>₹{item.priceAtPurchase}/unit</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {order.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button className="btn btn-primary" disabled={updating === order._id}
                        onClick={() => updateStatus(order._id, 'BATCHED')}>
                        {updating === order._id ? '...' : '✅ Accept Order'}
                      </button>
                      <button className="btn btn-danger" disabled={updating === order._id}
                        onClick={() => updateStatus(order._id, 'CANCELLED')}>✕ Reject</button>
                    </div>
                  )}
                  {order.status === 'BATCHED' && (
                    <button className="btn btn-primary" disabled={updating === order._id}
                      onClick={() => updateStatus(order._id, 'DISPATCHED')}>
                      {updating === order._id ? '...' : '🚚 Mark Dispatched'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
