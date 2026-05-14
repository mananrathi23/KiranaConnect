// src/pages/kirana/ProductDetail.jsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as productsApi from '../../api/products.js';
import { useCart } from '../../context/CartContext';
import { getPriceForQty, getNextTier } from '../../utils/pricingHelper.js';
import { LoadingSpinner, ErrorMessage } from '../../components/LoadingSpinner';

const CAT_ICONS = { Staples: '🌾', Dairy: '🥛', Oils: '🫙', Cleaning: '🧹', Snacks: '🍪', Beverages: '🧃' };

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [qty,     setQty]     = useState(1);
  const [added,   setAdded]   = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const p = await productsApi.getProduct(id);
      setProduct(p);
      setQty(p.minOrderQty);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  // useMemo — recalculates ONLY when qty or product changes, not every render
  const pricing = useMemo(() => {
    if (!product) return {};
    const currentPrice  = getPriceForQty(product.priceTiers, qty);
    const nextTier      = getNextTier(product.priceTiers, qty);
    const unitsToUnlock = nextTier ? nextTier.minQty - qty : 0;
    const savings       = (product.priceTiers[0].price - currentPrice) * qty;
    return { currentPrice, nextTier, unitsToUnlock, savings, lineTotal: currentPrice * qty };
  }, [qty, product]);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="page-container"><LoadingSpinner text="Loading product..." /></div>;
  if (error)   return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;
  if (!product) return null;

  return (
    <div className="page-container" style={{ maxWidth: 820 }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate('/shop/browse')} style={{ marginBottom: 20 }}>
        ← Back to Browse
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {/* Left */}
        <div>
          <div style={{ height: 220, background: 'linear-gradient(135deg, var(--primary-soft), var(--surface-3))',
            borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 90, marginBottom: 20, border: '1px solid var(--border)' }}>
            {CAT_ICONS[product.category] || '📦'}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase',
              letterSpacing: '0.5px', marginBottom: 10, fontFamily: 'Sora' }}>Supplier Info</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius)',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-btn))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏭</div>
              <div>
                <div style={{ fontWeight: 700 }}>{product.wholesaler?.businessName || product.wholesaler?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{product.wholesaler?.email}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Min Order', value: `${product.minOrderQty} units`, color: 'var(--primary-btn)' },
                { label: 'In Stock',  value: `${product.stock} units`,       color: product.stock < 50 ? 'var(--red)' : 'var(--green)' },
                { label: 'Category',  value: product.category,               color: 'var(--purple)' },
                { label: 'Tiers',     value: `${product.priceTiers.length} tiers`, color: 'var(--orange)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center', padding: '10px 8px', background: 'var(--surface-3)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'Sora', fontWeight: 700 }}>{label}</div>
                  <div style={{ fontWeight: 700, color, fontSize: 13 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div>
          <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 24, color: 'var(--text)', marginBottom: 8 }}>
            {product.name}
          </h2>

          {/* Live price (useMemo) */}
          <div style={{ background: 'linear-gradient(135deg, var(--primary-btn), #0EA5E9)',
            borderRadius: 'var(--radius-lg)', padding: '20px 22px', color: 'white', marginBottom: 20 }}>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Live Price Preview (useMemo)</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
              <div>
                <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 36 }}>₹{pricing.currentPrice}</span>
                <span style={{ fontSize: 14, opacity: 0.85 }}>/unit</span>
              </div>
              <div>
                <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18 }}>
                  = ₹{pricing.lineTotal?.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Total for {qty} units</div>
              </div>
            </div>
            {pricing.savings > 0 && (
              <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.2)',
                borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: 13 }}>
                🎉 Saving ₹{pricing.savings?.toLocaleString()} vs base price
              </div>
            )}
          </div>

          {/* Tier table */}
          <div className="card" style={{ padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12, fontFamily: 'Sora' }}>
              💰 Tier Pricing
            </div>
            {product.priceTiers.map((tier, i) => {
              const isActive = qty >= tier.minQty &&
                (i === product.priceTiers.length - 1 || qty < product.priceTiers[i + 1].minQty);
              return (
                <div key={i} className={`tier-row ${isActive ? 'active-tier' : ''}`}>
                  <span className="tier-qty">≥ {tier.minQty} units</span>
                  <span className="tier-price">₹{tier.price}/unit</span>
                  {i > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--green)' }}>
                      Save {Math.round(((product.priceTiers[0].price - tier.price) / product.priceTiers[0].price) * 100)}%
                    </span>
                  )}
                  {isActive && <span style={{ fontSize: 11, background: 'var(--primary-btn)', color: 'white',
                    padding: '1px 7px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>ACTIVE</span>}
                </div>
              );
            })}
          </div>

          {/* Qty selector */}
          <div style={{ marginBottom: 14 }}>
            <div className="form-label" style={{ marginBottom: 8 }}>Quantity (MOQ: {product.minOrderQty})</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn btn-outline btn-icon"
                onClick={() => setQty(q => Math.max(product.minOrderQty, q - product.minOrderQty))}>−</button>
              <input className="form-input" type="number" value={qty}
                onChange={e => setQty(Math.max(product.minOrderQty, parseInt(e.target.value) || product.minOrderQty))}
                min={product.minOrderQty} step={product.minOrderQty}
                style={{ textAlign: 'center', width: 90, fontFamily: 'Sora', fontWeight: 700 }} />
              <button className="btn btn-outline btn-icon"
                onClick={() => setQty(q => q + product.minOrderQty)}>+</button>
            </div>
          </div>

          {/* Unlock nudge */}
          {pricing.nextTier && (
            <div style={{ background: 'var(--orange-soft)', border: '1px solid var(--orange)',
              borderRadius: 'var(--radius)', padding: '12px 14px', fontSize: 13,
              color: 'var(--orange-dark)', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
              🔓 Add {pricing.unitsToUnlock} more → unlock ₹{pricing.nextTier.price}/unit
              <button onClick={() => setQty(pricing.nextTier.minQty)} style={{
                marginLeft: 'auto', background: 'var(--orange)', color: 'white',
                border: 'none', borderRadius: 'var(--radius-sm)', padding: '4px 10px',
                fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Auto-fill</button>
            </div>
          )}

          <button className="btn btn-primary btn-lg" style={{ width: '100%',
            background: added ? 'var(--green)' : undefined }} onClick={handleAdd}>
            {added ? '✅ Added to Cart!' : `🛒 Add ${qty} units — ₹${pricing.lineTotal?.toLocaleString()}`}
          </button>
        </div>
      </div>

      <style>{`@media(max-width:640px){ .page-container > div:nth-child(2){ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}
