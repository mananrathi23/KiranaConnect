// src/pages/wholesaler/BatchView.jsx
import { useState, useEffect } from 'react';
import * as batchesApi from '../../api/batches.js';
import StatusBadge from '../../components/StatusBadge';
import CountdownTimer from '../../components/CountdownTimer';
import { LoadingSpinner, ErrorMessage } from '../../components/LoadingSpinner';

export default function BatchView() {
  const [batches,      setBatches]      = useState([]);
  const [nextDispatch, setNextDispatch] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [dispatching,  setDispatching]  = useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [b, nd] = await Promise.all([batchesApi.getBatches(), batchesApi.getNextDispatch()]);
      setBatches(b);
      setNextDispatch(nd.nextDispatch);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleDispatch = async (id) => {
    setDispatching(id);
    try {
      await batchesApi.dispatchBatch(id);
      setBatches(prev => prev.map(b => b._id === id ? { ...b, status: 'DISPATCHED' } : b));
    } catch (err) { alert(err.message); }
    finally { setDispatching(null); }
  };

  if (loading) return <div className="page-container"><LoadingSpinner text="Loading batches..." /></div>;
  if (error)   return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Batch Dispatch</h2>
          <p className="page-subtitle">Orders grouped every 6 hours by cron job</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
          background: 'var(--orange-soft)', border: '1.5px solid var(--orange)', borderRadius: 'var(--radius)' }}>
          <span style={{ fontSize: 14, color: 'var(--orange-dark)', fontWeight: 600 }}>Next run in:</span>
          <CountdownTimer targetTime={nextDispatch} targetHour={18} />
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, var(--purple-soft), var(--primary-soft))',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px',
        marginBottom: 28, display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 32 }}>⚙️</span>
        <div>
          <h4 style={{ fontFamily: 'Sora', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>How Batching Works</h4>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 600 }}>
            Cron <code style={{ background: 'var(--surface)', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>0 */6 * * *</code> fires every 6h.
            All PENDING orders are grouped per wholesaler → a Batch doc is created → orders updated to BATCHED.
            Idempotent: wholesalers with an open batch in the same window are skipped.
          </p>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="empty-state card" style={{ padding: 48 }}>
          <div className="empty-icon">📦</div>
          <h3>No batches yet</h3>
          <p>Batches are created automatically by the cron job every 6 hours</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {batches.map(batch => {
            const totalValue   = batch.orders?.reduce((s, o) => s + (o.totalAmount || 0), 0) || 0;
            const orderCount   = batch.orders?.length || 0;
            return (
              <div key={batch._id} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px',
                  background: batch.status === 'DISPATCHED' ? 'var(--green-soft)' : 'var(--primary-soft)',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 18 }}>Batch #{batch._id.slice(-6).toUpperCase()}</span>
                      <StatusBadge status={batch.status} />
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {new Date(batch.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 22,
                      color: batch.status === 'DISPATCHED' ? 'var(--green)' : 'var(--primary-btn)' }}>
                      ₹{totalValue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{orderCount} order{orderCount !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                    {batch.orders?.flatMap(o => o.items || []).reduce((acc, item) => {
                      const name = item.product?.name || 'Product';
                      const ex   = acc.find(a => a.name === name);
                      if (ex) ex.qty += item.quantity; else acc.push({ name, qty: item.quantity });
                      return acc;
                    }, []).map(p => (
                      <div key={p.name} style={{ padding: '8px 14px', background: 'var(--surface-2)',
                        border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 13 }}>
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                        <span style={{ color: 'var(--primary-btn)', marginLeft: 8, fontWeight: 700, fontFamily: 'Sora' }}>×{p.qty}</span>
                      </div>
                    ))}
                  </div>
                  {batch.status === 'CREATED' && (
                    <button className="btn btn-primary" disabled={dispatching === batch._id}
                      onClick={() => handleDispatch(batch._id)}>
                      {dispatching === batch._id ? '⏳ Dispatching...' : '🚚 Dispatch This Batch'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
