// src/pages/wholesaler/StockUpdate.jsx
import { useState, useEffect } from 'react';
import * as productsApi from '../../api/products.js';
import { LoadingSpinner, ErrorMessage } from '../../components/LoadingSpinner';

export default function StockUpdate() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [inputs,   setInputs]   = useState({});   // { productId: newStockValue }
  const [saved,    setSaved]    = useState({});
  const [saving,   setSaving]   = useState({});
  const [errors,   setErrors]   = useState({});

  const load = async () => {
    setLoading(true); setError('');
    try { setProducts(await productsApi.getMyProducts()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleUpdate = async (product) => {
    const val = parseInt(inputs[product._id]);
    if (isNaN(val) || val < 0) {
      setErrors(e => ({ ...e, [product._id]: 'Enter a valid number ≥ 0' }));
      return;
    }
    setSaving(s => ({ ...s, [product._id]: true }));
    setErrors(e => ({ ...e, [product._id]: '' }));
    try {
      const updated = await productsApi.updateStock(product._id, val);
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, stock: updated.stock } : p));
      setInputs(i => ({ ...i, [product._id]: '' }));
      setSaved(s => ({ ...s, [product._id]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [product._id]: false })), 2500);
    } catch (err) {
      setErrors(e => ({ ...e, [product._id]: err.message }));
    } finally {
      setSaving(s => ({ ...s, [product._id]: false }));
    }
  };

  const getStatus = (stock) => {
    if (stock < 50)  return { label: '⚠️ Critical', color: 'var(--red)',    bg: 'var(--red-soft)' };
    if (stock < 150) return { label: '🔶 Low',      color: 'var(--yellow)', bg: 'var(--yellow-soft)' };
    return               { label: '✅ Good',         color: 'var(--green)',  bg: 'var(--green-soft)' };
  };

  if (loading) return <div className="page-container"><LoadingSpinner text="Loading stock data..." /></div>;
  if (error)   return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Stock Update</h2>
          <p className="page-subtitle">
            Uses atomic{' '}
            <code style={{ background: 'var(--surface-3)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>
              $inc
            </code>{' '}
            — prevents race conditions and overselling
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {products.filter(p => p.stock < 100).length > 0 && (
            <div style={{ padding: '8px 16px', borderRadius: 'var(--radius)',
              background: 'var(--red-soft)', border: '1px solid var(--red)',
              fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>
              ⚠️ {products.filter(p => p.stock < 100).length} items low
            </div>
          )}
        </div>
      </div>

      {/* Tech note */}
      <div style={{ background: 'var(--surface-3)', border: '1px dashed var(--border)',
        borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 24,
        display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20 }}>🔒</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 4, fontFamily: 'Sora' }}>
            Atomic Stock Decrement on Orders
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            When a kirana places an order:{' '}
            <code style={{ background: 'var(--surface)', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>
              findOneAndUpdate({'{'} stock: {'{'} $gte: qty {'}'} {'}'}, {'{'} $inc: {'{'} stock: -qty {'}'} {'}'})
            </code>
            . If result is <code style={{ background: 'var(--surface)', padding: '1px 4px', borderRadius: 4, fontSize: 11 }}>null</code>
            {' '}→ insufficient stock → 409. No overselling possible.
          </div>
        </div>
      </div>

      {products.length === 0 && (
        <div className="empty-state card" style={{ padding: 48 }}>
          <div className="empty-icon">📦</div>
          <h3>No products listed</h3>
          <p>Add products first to manage stock</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {products.map(product => {
          const status = getStatus(product.stock);
          return (
            <div key={product._id} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                {/* Info */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flex: 1, minWidth: 200 }}>
                  <div style={{ width: 48, height: 48, background: 'var(--surface-3)',
                    borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>📦</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{product.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {product.category} · MOQ: {product.minOrderQty}
                    </div>
                  </div>
                </div>

                {/* Stock display */}
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.5px', fontFamily: 'Sora', marginBottom: 2 }}>Current</div>
                    <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 28, color: status.color, lineHeight: 1 }}>
                      {product.stock}
                    </div>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)',
                      background: status.bg, color: status.color, fontWeight: 700 }}>
                      {status.label}
                    </span>
                  </div>

                  <span style={{ fontSize: 24, color: 'var(--text-faint)' }}>→</span>

                  {/* Input */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="New stock"
                      value={inputs[product._id] || ''}
                      onChange={e => setInputs(i => ({ ...i, [product._id]: e.target.value }))}
                      style={{ width: 120 }}
                      min="0"
                      onKeyDown={e => e.key === 'Enter' && handleUpdate(product)}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleUpdate(product)}
                      disabled={!inputs[product._id] || saving[product._id]}
                    >
                      {saving[product._id] ? '⏳' : 'Update'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {saved[product._id] && (
                <div style={{ marginTop: 12, padding: '8px 14px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--green-soft)', color: 'var(--green)', fontSize: 13, fontWeight: 600 }}>
                  ✅ Stock updated successfully
                </div>
              )}
              {errors[product._id] && (
                <div style={{ marginTop: 12, padding: '8px 14px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--red-soft)', color: 'var(--red)', fontSize: 13 }}>
                  ⚠️ {errors[product._id]}
                </div>
              )}

              {/* Stock bar */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11,
                  color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>0</span><span>500</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${Math.min(100, (product.stock / 500) * 100)}%`,
                    background: status.color,
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
