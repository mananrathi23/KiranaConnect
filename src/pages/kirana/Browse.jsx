// src/pages/kirana/Browse.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as productsApi from '../../api/products.js';
import { useCart } from '../../context/CartContext';
import { getPriceForQty, getNextTier } from '../../utils/pricingHelper.js';
import { LoadingSpinner, ErrorMessage } from '../../components/LoadingSpinner';

const CATEGORIES   = ['All', 'Staples', 'Dairy', 'Oils', 'Cleaning', 'Snacks', 'Beverages'];
const CAT_ICONS    = { Staples: '🌾', Dairy: '🥛', Oils: '🫙', Cleaning: '🧹', Snacks: '🍪', Beverages: '🧃', All: '🏪' };
const CAT_COLORS   = {
  Staples:   { bg: '#DBEAFE', text: '#1A78C2' }, Dairy:     { bg: '#FEF3C7', text: '#D97706' },
  Oils:      { bg: '#D1FAE5', text: '#059669' }, Cleaning:  { bg: '#EDE9FE', text: '#7C3AED' },
  Snacks:    { bg: '#FEE9D6', text: '#C2410C' }, Beverages: { bg: '#CFFAFE', text: '#0891B2' },
};

export default function Browse() {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [addedId,  setAddedId]  = useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try { setProducts(await productsApi.getAllProducts()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = products.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase());
    const mc = category === 'All' || p.category === category;
    return ms && mc;
  });

  const handleAdd = (product) => {
    addToCart(product);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1400);
  };

  const isInCart = (id) => cartItems.some(i => i.productId === id);

  if (loading) return <div className="page-container"><LoadingSpinner text="Loading products..." /></div>;
  if (error)   return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Browse Products</h2>
          <p className="page-subtitle">
            {filtered.length} products · Served from{' '}
            <span style={{ background: 'var(--green-soft)', color: 'var(--green)', padding: '1px 8px',
              borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 700 }}>
              Redis cache
            </span>{' '}with 24h TTL
          </p>
        </div>
      </div>

      {/* Search + category filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search products..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: '7px 14px', borderRadius: 'var(--radius-full)',
              border: category === c ? '2px solid var(--primary-btn)' : '1.5px solid var(--border)',
              background: category === c ? 'var(--primary-btn)' : 'var(--surface)',
              color: category === c ? 'white' : 'var(--text-2)',
              fontSize: 13, fontWeight: category === c ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {CAT_ICONS[c] || '📦'} {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No products found</h3>
          <p>Try a different search or category filter</p>
        </div>
      ) : (
        <div className="grid-auto">
          {filtered.map(product => {
            const basePrice = product.priceTiers[0]?.price ?? 0;
            const bestPrice = product.priceTiers[product.priceTiers.length - 1]?.price ?? 0;
            const discount  = Math.round(((basePrice - bestPrice) / (basePrice || 1)) * 100);
            const cat       = CAT_COLORS[product.category] || { bg: 'var(--surface-3)', text: 'var(--text-muted)' };
            const inCart    = isInCart(product._id);
            const isLow     = product.stock < 50;
            const nextTier  = getNextTier(product.priceTiers, product.minOrderQty);

            return (
              <div key={product._id} className="card" style={{ overflow: 'hidden', transition: 'all 0.2s', position: 'relative' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>

                {isLow && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--red)',
                    color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px',
                    borderRadius: 'var(--radius-full)', zIndex: 1 }}>LOW STOCK</div>
                )}

                <div style={{ height: 90, background: `linear-gradient(135deg, ${cat.bg}, ${cat.bg}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
                  {CAT_ICONS[product.category] || '📦'}
                </div>

                <div style={{ padding: '16px 18px' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)',
                    background: cat.bg, color: cat.text, fontWeight: 700 }}>{product.category}</span>

                  <h4 onClick={() => navigate(`/shop/products/${product._id}`)} style={{
                    fontFamily: 'Sora', fontWeight: 700, fontSize: 15, color: 'var(--text)',
                    margin: '8px 0 4px', lineHeight: 1.3, cursor: 'pointer' }}>
                    {product.name}
                  </h4>

                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                    MOQ: <strong style={{ color: 'var(--text-2)' }}>{product.minOrderQty} units</strong>
                    &nbsp;·&nbsp;Stock:{' '}
                    <strong style={{ color: isLow ? 'var(--red)' : 'var(--green)' }}>{product.stock}</strong>
                  </div>

                  {/* Tier pricing */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase',
                      letterSpacing: '0.5px', marginBottom: 6, fontFamily: 'Sora' }}>Tier Pricing</div>
                    {product.priceTiers.map((tier, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                        padding: '3px 8px', borderRadius: 4, fontSize: 12, marginBottom: 2,
                        background: i === product.priceTiers.length - 1 ? 'var(--green-soft)' : 'transparent' }}>
                        <span style={{ color: 'var(--text-muted)' }}>≥{tier.minQty} units</span>
                        <span style={{ fontWeight: 700, fontFamily: 'Sora',
                          color: i === product.priceTiers.length - 1 ? 'var(--green)' : 'var(--text-2)' }}>
                          ₹{tier.price}/u
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Price + discount */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>₹{basePrice}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>/unit</span>
                    </div>
                    {discount > 0 && (
                      <span style={{ background: 'var(--green-soft)', color: 'var(--green)',
                        fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                        Up to {discount}% off
                      </span>
                    )}
                  </div>

                  {/* Unlock hint */}
                  {nextTier && (
                    <div style={{ background: 'var(--orange-soft)', border: '1px solid var(--orange)',
                      borderRadius: 'var(--radius-sm)', padding: '7px 10px', fontSize: 12,
                      color: 'var(--orange-dark)', marginBottom: 12 }}>
                      🔓 Order {nextTier.minQty}+ to get ₹{nextTier.price}/unit
                    </div>
                  )}

                  {/* CTAs */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }}
                      onClick={() => navigate(`/shop/products/${product._id}`)}>Details</button>
                    <button className="btn btn-primary btn-sm" style={{ flex: 2,
                      background: addedId === product._id ? 'var(--green)' : undefined }}
                      onClick={() => handleAdd(product)}>
                      {addedId === product._id ? '✅ Added!' : inCart ? '+ Add More' : '🛒 Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
