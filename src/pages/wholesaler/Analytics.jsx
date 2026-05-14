// src/pages/wholesaler/Analytics.jsx
import { useState, useEffect } from 'react';
import * as analyticsApi from '../../api/analytics.js';
import { LoadingSpinner, ErrorMessage } from '../../components/LoadingSpinner';

function BarChart({ data }) {
  if (!data?.length) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No data yet</div>;
  const max = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>₹{(d.revenue/1000).toFixed(1)}K</div>
          <div style={{ width: '100%', height: `${(d.revenue / max) * 120}px`, minHeight: 4,
            background: 'linear-gradient(180deg, var(--primary-btn), var(--primary))',
            borderRadius: '4px 4px 0 0', transition: 'height 0.6s ease', boxShadow: '0 2px 8px var(--primary-glow)' }} />
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>{d.date}</div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data }) {
  if (!data?.length) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No data yet</div>;
  const total = data.reduce((s, d) => s + d.revenue, 0) || 1;
  let cumulative = 0;
  const polarToXY = (cx, cy, r, angle) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const segments = data.map(d => {
    const pct  = (d.revenue / total) * 360;
    const s    = polarToXY(50, 50, 38, cumulative);
    cumulative += pct;
    const e    = polarToXY(50, 50, 38, cumulative);
    const large = pct > 180 ? 1 : 0;
    return { ...d, path: `M 50 50 L ${s.x} ${s.y} A 38 38 0 ${large} 1 ${e.x} ${e.y} Z` };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      <svg viewBox="0 0 100 100" style={{ width: 140, height: 140, flexShrink: 0 }}>
        {segments.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity={0.88} />)}
        <circle cx="50" cy="50" r="22" fill="var(--surface)" />
        <text x="50" y="47" textAnchor="middle" fill="var(--text)" fontSize="7" fontFamily="Sora" fontWeight="800">Total</text>
        <text x="50" y="57" textAnchor="middle" fill="var(--text-2)" fontSize="6" fontFamily="Sora">₹{(total/1000).toFixed(0)}K</text>
      </svg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map(d => (
          <div key={d.category} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
            <span style={{ flex: 1, color: 'var(--text-2)', fontWeight: 500 }}>{d.category}</span>
            <span style={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora' }}>₹{(d.revenue/1000).toFixed(1)}K</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>{d.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  const [summary,    setSummary]    = useState(null);
  const [timeline,   setTimeline]   = useState([]);
  const [topProds,   setTopProds]   = useState([]);
  const [catData,    setCatData]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [s, t, tp, cat] = await Promise.all([
        analyticsApi.getSummary(),
        analyticsApi.getOrdersTimeline(),
        analyticsApi.getTopProducts(),
        analyticsApi.getRevenueByCategory(),
      ]);
      setSummary(s); setTimeline(t); setTopProds(tp); setCatData(cat);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="page-container"><LoadingSpinner text="Loading analytics..." /></div>;
  if (error)   return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Analytics</h2>
          <p className="page-subtitle">Business performance overview</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Revenue',   value: `₹${((summary?.totalRevenue||0)/1000).toFixed(1)}K`, icon: '💰', bg: '#D1FAE5' },
          { label: 'Total Orders',    value: summary?.orderCount    || 0,                          icon: '📦', bg: '#DBEAFE' },
          { label: 'Avg Order Value', value: `₹${(summary?.avgOrderValue||0).toLocaleString()}`,   icon: '📊', bg: '#EDE9FE' },
          { label: 'Active Products', value: summary?.totalProducts || 0,                          icon: '🏷️', bg: '#FEF3C7' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg, fontSize: 22 }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>📈 Revenue (Last 7 Days)</h3>
          <BarChart data={timeline} />
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>🎯 Revenue by Category</h3>
          <DonutChart data={catData} />
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16 }}>🏆 Top Products</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Ranked by revenue — uses MongoDB <code style={{ background: 'var(--surface-3)', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>$lookup</code> aggregation
          </p>
        </div>
        {topProds.length === 0 ? (
          <div className="empty-state" style={{ padding: 48 }}>
            <div className="empty-icon">📊</div>
            <h3>No sales data yet</h3>
            <p>Analytics will appear once orders are placed</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead><tr><th>Rank</th><th>Product</th><th>Revenue</th><th>Orders</th><th>Share</th></tr></thead>
              <tbody>
                {topProds.map((p, i) => (
                  <tr key={p._id}>
                    <td><span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 18,
                      color: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#B45309' : 'var(--text-faint)' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                    </span></td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, color: 'var(--green)' }}>₹{(p.revenue/1000).toFixed(1)}K</span></td>
                    <td style={{ color: 'var(--text-2)', fontWeight: 500 }}>{p.orders}</td>
                    <td style={{ minWidth: 160 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className="progress-fill" style={{ width: `${p.percent}%` }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 36, fontWeight: 600 }}>{p.percent}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
