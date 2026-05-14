// src/pages/wholesaler/KhataLedger.jsx
import { useState, useEffect } from 'react';
import * as khataApi from '../../api/khata.js';
import { LoadingSpinner, ErrorMessage } from '../../components/LoadingSpinner';

export default function KhataLedger() {
  const [data,     setData]     = useState({ totalReceivable: 0, khatas: [] });
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [settling, setSettling] = useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try { setData(await khataApi.getLedger()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSettle = async (khata) => {
    if (!window.confirm(`Mark ₹${khata.totalOutstanding.toLocaleString()} from ${khata.shopOwner?.shopName} as settled?`)) return;
    setSettling(khata._id);
    try {
      await khataApi.settleKhata(khata._id);
      await load();
    } catch (err) { alert(err.message); }
    finally { setSettling(null); }
  };

  if (loading) return <div className="page-container"><LoadingSpinner text="Loading Khata Ledger..." /></div>;
  if (error)   return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;

  const { totalReceivable, pendingCount, khatas } = data;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">📒 Khata Ledger</h2>
          <p className="page-subtitle">Shops that owe you money — sorted by outstanding amount</p>
        </div>
      </div>

      {/* Total Receivable Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1A78C222, #0EA5E922)',
        border: '1.5px solid var(--primary-btn)',
        borderRadius: 'var(--radius-lg)', padding: '20px 24px',
        marginBottom: 28, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
            Total Receivable
          </div>
          <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 32, color: 'var(--primary-btn)' }}>
            ₹{totalReceivable.toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {khatas.length} open account(s)
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Click "Settle" once payment is received in cash or UPI
          </div>
        </div>
      </div>

      {/* Pending settlement alert */}
      {pendingCount > 0 && (
        <div style={{
          background: '#FFFBEB', border: '1.5px solid #D97706',
          borderRadius: 'var(--radius-lg)', padding: '14px 20px',
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 22 }}>⏳</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#92400E' }}>
              {pendingCount} settlement request{pendingCount > 1 ? 's' : ''} awaiting your verification
            </div>
            <div style={{ fontSize: 12, color: '#B45309', marginTop: 2 }}>
              Shop owner(s) have paid. Review and click "Verify & Confirm" to clear their balance.
            </div>
          </div>
        </div>
      )}

      {khatas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h3>All accounts settled!</h3>
          <p>No shop owes you money right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {khatas.map((khata, idx) => (
            <div key={khata._id} className="card" style={{
              padding: 0, overflow: 'hidden',
              border: khata.status === 'SETTLEMENT_REQUESTED'
                ? '2px solid #D97706'
                : '1px solid var(--border)',
            }}>
              {/* Settlement requested label */}
              {khata.status === 'SETTLEMENT_REQUESTED' && (
                <div style={{
                  background: '#FEF3C7', padding: '8px 20px',
                  borderBottom: '1px solid #D97706',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 12, fontWeight: 700, color: '#92400E',
                }}>
                  ⏳ Payment claimed by shop owner
                  {khata.settlementRequestedAt && (
                    <span style={{ fontWeight: 400, color: '#B45309' }}>
                      &nbsp;· Requested on {new Date(khata.settlementRequestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              )}

              {/* Shop row */}
              <div style={{
                padding: '16px 20px', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
              }}>
                {/* Rank + shop info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: idx === 0 ? 'linear-gradient(135deg,#F59E0B,#FBBF24)'
                      : idx === 1 ? 'linear-gradient(135deg,#9CA3AF,#D1D5DB)'
                      : 'linear-gradient(135deg,#CD7C2F,#D97706)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 14, color: 'white',
                  }}>#{idx + 1}</div>
                  <div>
                    <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>
                      🛒 {khata.shopOwner?.shopName || khata.shopOwner?.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {khata.shopOwner?.email} · {khata.entries?.length ?? 0} order(s)
                    </div>
                  </div>
                </div>

                {/* Outstanding + action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Outstanding</div>
                    <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 22,
                      color: khata.status === 'SETTLEMENT_REQUESTED' ? '#D97706' : 'var(--primary-btn)' }}>
                      ₹{khata.totalOutstanding.toLocaleString()}
                    </div>
                  </div>

                  {khata.status === 'SETTLEMENT_REQUESTED' ? (
                    <button
                      onClick={() => handleSettle(khata)}
                      disabled={settling === khata._id}
                      className="btn btn-primary btn-sm"
                      style={{ background: 'linear-gradient(135deg,#D97706,#F59E0B)', minWidth: 130 }}
                    >
                      {settling === khata._id ? '⏳ Confirming...' : '✅ Verify & Confirm'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSettle(khata)}
                      disabled={settling === khata._id}
                      className="btn btn-primary btn-sm"
                      style={{ background: 'var(--green)', minWidth: 120 }}
                    >
                      {settling === khata._id ? '⏳ Settling...' : '✅ Mark Settled'}
                    </button>
                  )}
                </div>
              </div>

              {/* Collapsible entries table */}
              <div style={{ borderTop: '1px solid var(--border)', padding: '12px 20px',
                background: 'var(--surface-3)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Order Entries
                </div>
                {(khata.entries ?? []).map((entry, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '6px 0', fontSize: 13,
                    borderBottom: i < khata.entries.length - 1 ? '1px dashed var(--border)' : 'none',
                  }}>
                    <span style={{ color: 'var(--text-2)' }}>{entry.note}</span>
                    <span style={{ fontWeight: 700 }}>₹{entry.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
