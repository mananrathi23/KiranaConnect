// src/pages/kirana/MyKhata.jsx
import { useState, useEffect } from 'react';
import * as khataApi from '../../api/khata.js';
import { LoadingSpinner, ErrorMessage } from '../../components/LoadingSpinner';

export default function MyKhata() {
  const [khatas,   setKhatas]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [settling, setSettling] = useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try { setKhatas(await khataApi.getMyKhata()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSettle = async (khata) => {
    if (khata.status === 'SETTLEMENT_REQUESTED') return; // already pending
    if (!window.confirm(`Request settlement of ₹${khata.totalOutstanding.toLocaleString()} with ${khata.wholesaler?.businessName}?\n\nThe wholesaler will need to verify this payment before your balance clears.`)) return;
    setSettling(khata._id);
    try {
      await khataApi.settleByShop(khata._id);
      await load();
    } catch (err) { alert(err.message); }
    finally { setSettling(null); }
  };

  const totalOutstanding = khatas.reduce((s, k) => s + k.totalOutstanding, 0);

  if (loading) return <div className="page-container"><LoadingSpinner text="Loading your Khata..." /></div>;
  if (error)   return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">📒 My Khata</h2>
          <p className="page-subtitle">Your credit ledger — orders placed with "Pay Later"</p>
        </div>
      </div>

      {/* Outstanding Banner */}
      <div style={{
        background: totalOutstanding > 0
          ? 'linear-gradient(135deg, #7C3AED22, #6D28D922)'
          : 'var(--green-soft)',
        border: `1.5px solid ${totalOutstanding > 0 ? '#7C3AED' : 'var(--green)'}`,
        borderRadius: 'var(--radius-lg)', padding: '20px 24px',
        marginBottom: 28, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
            Total Outstanding
          </div>
          <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 32,
            color: totalOutstanding > 0 ? '#7C3AED' : 'var(--green)' }}>
            ₹{totalOutstanding.toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {khatas.filter(k => k.totalOutstanding > 0).length} open account(s)
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {khatas.filter(k => k.totalOutstanding === 0).length} settled
          </div>
        </div>
      </div>

      {khatas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📒</div>
          <h3>No Khata entries yet</h3>
          <p>Place an order using "Pay on Khata" to start your credit ledger.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {khatas.map(khata => (
            <div key={khata._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Wholesaler header */}
              <div style={{
                padding: '16px 20px',
                background: khata.totalOutstanding > 0 ? 'var(--primary-soft)' : 'var(--green-soft)',
                borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
              }}>
                <div>
                  <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>
                    🏭 {khata.wholesaler?.businessName || khata.wholesaler?.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {khata.wholesaler?.email}
                  </div>
                </div>
                {/* Status action area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Outstanding</div>
                    <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20,
                      color: khata.status === 'SETTLED' ? 'var(--green)'
                        : khata.status === 'SETTLEMENT_REQUESTED' ? '#D97706'
                        : 'var(--primary-btn)' }}>
                      ₹{khata.totalOutstanding.toLocaleString()}
                    </div>
                  </div>

                  {/* OPEN → show Settle button */}
                  {khata.status === 'OPEN' && (
                    <button
                      onClick={() => handleSettle(khata)}
                      disabled={settling === khata._id}
                      className="btn btn-primary btn-sm"
                      style={{ background: 'var(--green)' }}
                    >
                      {settling === khata._id ? '⏳' : '✅ Request Settlement'}
                    </button>
                  )}

                  {/* SETTLEMENT_REQUESTED → show pending badge */}
                  {khata.status === 'SETTLEMENT_REQUESTED' && (
                    <div style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', fontSize: 11, fontWeight: 700,
                        color: '#92400E', background: '#FEF3C7',
                        border: '1.5px solid #D97706',
                        padding: '5px 10px', borderRadius: 'var(--radius-full)',
                      }}>
                        ⏳ Awaiting Wholesaler
                      </span>
                      {khata.settlementRequestedAt && (
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                          Requested {new Date(khata.settlementRequestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SETTLED */}
                  {khata.status === 'SETTLED' && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)',
                      background: 'white', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                      ✅ SETTLED
                    </span>
                  )}
                </div>
              </div>

              {/* Entries */}
              <div style={{ padding: '12px 20px' }}>
                {khata.entries.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>No entries.</p>
                ) : (
                  khata.entries.map((entry, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 0', borderBottom: i < khata.entries.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{entry.note}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>
                          ₹{entry.amount.toLocaleString()}
                        </div>
                        {entry.settledAt ? (
                          <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>Settled</div>
                        ) : (
                          <div style={{ fontSize: 11, color: '#7C3AED', fontWeight: 600 }}>Pending</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
