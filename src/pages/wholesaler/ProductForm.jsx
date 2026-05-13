// src/pages/wholesaler/ProductForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as productsApi from '../../api/products.js';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const CATEGORIES = ['Staples', 'Dairy', 'Oils', 'Cleaning', 'Snacks', 'Beverages'];

export default function ProductForm() {
  const navigate    = useNavigate();
  const { id }      = useParams();         // present when editing
  const isEdit      = Boolean(id);

  const [form, setForm] = useState({ name: '', category: 'Staples', stock: '', minOrderQty: '' });
  const [tiers, setTiers] = useState([{ minQty: '', price: '' }, { minQty: '', price: '' }]);
  const [loading,  setLoading]  = useState(isEdit);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);

  // Load existing product when editing
  useEffect(() => {
    if (!isEdit) return;
    productsApi.getProduct(id)
      .then(p => {
        setForm({ name: p.name, category: p.category, stock: p.stock, minOrderQty: p.minOrderQty });
        setTiers(p.priceTiers.map(t => ({ minQty: t.minQty, price: t.price })));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const upd  = (f, v) => setForm(x => ({ ...x, [f]: v }));
  const updT = (i, f, v) => setTiers(t => t.map((tier, idx) => idx === i ? { ...tier, [f]: v } : tier));
  const addTier    = () => setTiers(t => [...t, { minQty: '', price: '' }]);
  const removeTier = (i) => { if (tiers.length > 1) setTiers(t => t.filter((_, idx) => idx !== i)); };

  const handleSave = async (e) => {
    e.preventDefault();
    const validTiers = tiers.filter(t => t.minQty && t.price);
    if (!validTiers.length) { setError('Add at least one price tier'); return; }

    const payload = {
      name:        form.name,
      category:    form.category,
      stock:       Number(form.stock),
      minOrderQty: Number(form.minOrderQty),
      priceTiers:  validTiers.map(t => ({ minQty: Number(t.minQty), price: Number(t.price) })),
    };

    setSaving(true); setError('');
    try {
      if (isEdit) await productsApi.updateProduct(id, payload);
      else        await productsApi.createProduct(payload);
      setSuccess(true);
      setTimeout(() => navigate('/wholesaler/products'), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-container"><LoadingSpinner text="Loading product..." /></div>;

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <p className="page-subtitle">{isEdit ? 'Update product details and pricing' : 'List a new product for kirana stores to discover'}</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/wholesaler/products')}>← Back</button>
      </div>

      {success && (
        <div style={{ padding: '14px 18px', borderRadius: 'var(--radius)', background: 'var(--green-soft)',
          border: '1.5px solid var(--green)', color: 'var(--green)', fontWeight: 600, marginBottom: 20 }}>
          ✅ Product {isEdit ? 'updated' : 'created'} successfully! Redirecting...
        </div>
      )}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius)', background: 'var(--red-soft)',
          border: '1px solid var(--red)', color: 'var(--red)', marginBottom: 20 }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="card" style={{ padding: 28, marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 20, color: 'var(--primary-btn)' }}>
            📦 Basic Information
          </h3>
          <div className="grid-2" style={{ gap: 20, marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className="form-input" placeholder="e.g. Basmati Rice (Premium)"
                value={form.name} onChange={e => upd('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-input" value={form.category} onChange={e => upd('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2" style={{ gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Stock (units) *</label>
              <input className="form-input" type="number" placeholder="e.g. 500"
                value={form.stock} onChange={e => upd('stock', e.target.value)} required min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Min Order Quantity (MOQ) *</label>
              <input className="form-input" type="number" placeholder="e.g. 25"
                value={form.minOrderQty} onChange={e => upd('minOrderQty', e.target.value)} required min="1" />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Minimum units per order</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, color: 'var(--orange)' }}>💰 Tier Pricing</h3>
            <button type="button" className="btn btn-outline btn-sm" onClick={addTier}>＋ Add Tier</button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Higher quantity = lower price per unit</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: '8px 16px',
            marginBottom: 12, fontSize: 12, color: 'var(--text-muted)', fontWeight: 700,
            textTransform: 'uppercase', paddingLeft: 4, fontFamily: 'Sora', letterSpacing: '0.5px' }}>
            <span>Min. Quantity</span><span>Price Per Unit (₹)</span><span />
          </div>

          {tiers.map((tier, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: '8px 16px', marginBottom: 12, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type="number" placeholder={`≥ ${(i + 1) * 25}`}
                  value={tier.minQty} onChange={e => updT(i, 'minQty', e.target.value)} style={{ paddingLeft: 36 }} />
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13 }}>≥</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type="number" placeholder="Price"
                  value={tier.price} onChange={e => updT(i, 'price', e.target.value)} style={{ paddingLeft: 28 }} />
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13 }}>₹</span>
              </div>
              <button type="button" onClick={() => removeTier(i)}
                style={{ width: 32, height: 32, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  background: 'var(--red-soft)', color: 'var(--red)', cursor: 'pointer', fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
          ))}

          {tiers.some(t => t.minQty && t.price) && (
            <div style={{ background: 'var(--surface-3)', borderRadius: 'var(--radius)', padding: 16, marginTop: 16, border: '1px dashed var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, fontFamily: 'Sora', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preview</div>
              {tiers.filter(t => t.minQty && t.price).map((t, i) => (
                <div key={i} className="tier-row">
                  <span className="tier-qty">≥ {t.minQty} units</span>
                  <span className="tier-price">₹{t.price}/unit</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline btn-lg" onClick={() => navigate('/wholesaler/products')} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? '⏳ Saving...' : `💾 ${isEdit ? 'Update' : 'Save'} Product`}
          </button>
        </div>
      </form>
    </div>
  );
}
