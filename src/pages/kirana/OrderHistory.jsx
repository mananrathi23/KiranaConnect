// src/pages/kirana/OrderHistory.jsx
import { useState, useEffect } from 'react';
import * as ordersApi from '../../api/orders.js';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner, ErrorMessage } from '../../components/LoadingSpinner';

const STEPS = ['PENDING', 'BATCHED', 'DISPATCHED'];

function OrderTimeline({ status }) {
  const cur = status === 'CANCELLED' ? -1 : STEPS.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {STEPS.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
            background: cur < 0 ? 'var(--red)' : i <= cur ? 'var(--primary-btn)' : 'var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, color: 'white', fontWeight: 700, transition: 'background 0.3s',
          }}>{cur < 0 ? '✕' : i < cur ? '✓' : i + 1}</div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < cur ? 'var(--primary-btn)' : 'var(--border)', transition: 'background 0.3s' }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OrderHistory() {
  const [orders,   setOrders]   = useState([]);
  const [filter,   setFilter]   = useState('ALL');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [expanded, setExpanded] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (orderId) => {
    try {
      setDownloading(orderId);
      const blob = await ordersApi.downloadInvoice(orderId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to download invoice: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const load = async () => {
    setLoading(true); setError('');
    try { setOrders(await ordersApi.getMyOrders()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const tabs = ['ALL', 'PENDING', 'BATCHED', 'DISPATCHED'];
  const counts   = Object.fromEntries(tabs.map(t => [t, t === 'ALL' ? orders.length : orders.filter(o => o.status === t).length]));
  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div className="page-container"><LoadingSpinner text="Loading order history..." /></div>;
  if (error)   return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Order History</h2>
          <p className="page-subtitle">{orders.length} orders · Track status in real time</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={load}>↻ Refresh</button>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t} className={`tab-btn ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t === 'ALL' ? '📋' : t === 'PENDING' ? '⏳' : t === 'BATCHED' ? '📦' : '✅'} {t}
            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700,
              background: filter === t ? 'var(--primary-btn)' : 'var(--border)',
              color: filter === t ? 'white' : 'var(--text-muted)',
              borderRadius: 'var(--radius-full)', padding: '1px 7px' }}>{counts[t]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card" style={{ padding: 48 }}>
          <div className="empty-icon">📭</div>
          <h3>{filter === 'ALL' ? 'No orders yet' : `No ${filter.toLowerCase()} orders`}</h3>
          <p>{filter === 'ALL' ? 'Browse products and place your first bulk order' : 'Nothing matches this filter'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(order => (
            <div key={order._id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px', cursor: 'pointer',
                borderLeft: `4px solid ${order.status === 'PENDING' ? 'var(--yellow)' : order.status === 'BATCHED' ? 'var(--purple)' : order.status === 'CANCELLED' ? 'var(--red)' : 'var(--green)'}` }}
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16 }}>
                      Order #{order._id?.slice(-6).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      &nbsp;·&nbsp;{order.wholesalerInfo?.businessName || 'Wholesaler'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 18 }}>₹{order.totalAmount?.toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.items?.length} items</div>
                    </div>
                    <StatusBadge status={order.status} />
                    <span style={{ color: 'var(--text-muted)' }}>{expanded === order._id ? '▲' : '▼'}</span>
                  </div>
                </div>
                <OrderTimeline status={order.status} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  {STEPS.map(s => (
                    <span key={s} style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, flex: 1, textAlign: 'center' }}>{s}</span>
                  ))}
                </div>
              </div>
              {expanded === order._id && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-2)' }}>
                  <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px',
                        background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>{item.productName || 'Product'}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>
                            × {item.quantity} units @ ₹{item.priceAtPurchase}
                          </span>
                        </div>
                        <span style={{ fontWeight: 700, fontFamily: 'Sora' }}>
                          ₹{(item.quantity * item.priceAtPurchase).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn btn-outline btn-sm" 
                      onClick={(e) => { e.stopPropagation(); handleDownload(order._id); }}
                      disabled={downloading === order._id}
                    >
                      {downloading === order._id ? '⏳ Downloading...' : '📄 Download PDF Invoice'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
