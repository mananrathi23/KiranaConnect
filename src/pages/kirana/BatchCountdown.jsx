// src/pages/kirana/BatchCountdown.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as batchesApi from '../../api/batches.js';
import StatusBadge from '../../components/StatusBadge';
import CountdownTimer from '../../components/CountdownTimer';
import { LoadingSpinner, ErrorMessage } from '../../components/LoadingSpinner';

export default function BatchCountdown() {
  const navigate = useNavigate();
  const [nextDispatch,   setNextDispatch]   = useState(null);
  const [pendingOrders,  setPendingOrders]  = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const { nextDispatch: nd, pendingOrders: po } = await batchesApi.getNextDispatch();
      setNextDispatch(nd);
      setPendingOrders(po);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="page-container"><LoadingSpinner text="Loading batch info..." /></div>;
  if (error)   return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Batch Countdown</h2>
          <p className="page-subtitle">Orders are dispatched in batches every 6 hours</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={load}>↻ Refresh</button>
      </div>

      {/* Big countdown */}
      <div style={{ background: 'linear-gradient(135deg, #1A78C2 0%, #0EA5E9 50%, var(--primary) 100%)',
        borderRadius: 'var(--radius-xl)', padding: '40px 32px', textAlign: 'center', color: 'white',
        marginBottom: 28, boxShadow: '0 12px 40px rgba(26,120,194,0.35)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
          backgroundSize: '30px 30px' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚚</div>
          <h3 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 22, marginBottom: 8, opacity: 0.9 }}>
            Next Batch Dispatch In
          </h3>
          <p style={{ opacity: 0.75, fontSize: 14, marginBottom: 28 }}>
            Cron: <code style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: 4 }}>0 */6 * * *</code>
          </p>
          <CountdownTimer targetTime={nextDispatch} targetHour={18} size="large" />
          <p style={{ opacity: 0.75, fontSize: 13, marginTop: 20 }}>
            Place orders before this window closes to be included in the next dispatch
          </p>
        </div>
      </div>

      {/* Flow diagram */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>⚙️ How Batching Works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {[
            { step: '1', icon: '🛒', title: 'You Place Order', desc: 'Status: PENDING',   color: 'var(--yellow-soft)', text: 'var(--yellow)' },
            { step: '2', icon: '⏰', title: 'Cron Fires',      desc: 'Every 6 hours',     color: 'var(--purple-soft)', text: 'var(--purple)' },
            { step: '3', icon: '📦', title: 'Batch Created',   desc: 'Status: BATCHED',   color: 'var(--primary-soft)', text: 'var(--primary-btn)' },
            { step: '4', icon: '🚚', title: 'Dispatch',        desc: 'Status: DISPATCHED', color: 'var(--green-soft)',  text: 'var(--green)' },
          ].map(s => (
            <div key={s.step} style={{ padding: 16, borderRadius: 'var(--radius-lg)', background: s.color, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 13, color: s.text, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending orders */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16 }}>
            Your Pending Orders ({pendingOrders.length})
          </h3>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/shop/browse')}>+ Place Order</button>
        </div>
        {pendingOrders.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 0' }}>
            <div className="empty-icon">📭</div>
            <h3>No pending orders</h3>
            <p>Place orders now to catch the next dispatch</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingOrders.map(order => (
              <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 'var(--radius)',
                border: '1px solid var(--border-2)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>#{order._id?.slice(-6).toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {order.items?.length} items · {order.wholesaler?.businessName || 'Wholesaler'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ fontFamily: 'Sora', fontWeight: 700 }}>₹{order.totalAmount?.toLocaleString()}</div>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
