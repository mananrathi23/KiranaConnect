// src/pages/wholesaler/ProductList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as productsApi from '../../api/products.js';
import { LoadingSpinner, ErrorMessage } from '../../components/LoadingSpinner';

const CAT_COLORS = {
  Staples:   { bg: '#DBEAFE', text: '#1A78C2' },
  Dairy:     { bg: '#FEF3C7', text: '#D97706' },
  Oils:      { bg: '#D1FAE5', text: '#059669' },
  Cleaning:  { bg: '#EDE9FE', text: '#7C3AED' },
  Snacks:    { bg: '#FEE9D6', text: '#C2410C' },
  Beverages: { bg: '#CFFAFE', text: '#0891B2' },
};

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try { setProducts(await productsApi.getMyProducts()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await productsApi.deleteProduct(id);
      setProducts(p => p.filter(x => x._id !== id));
      setDeleteId(null);
    } catch (err) { alert(err.message); }
    finally { setDeleting(false); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const getStockColor  = (s) => s < 50 ? 'var(--red)' : s < 150 ? 'var(--yellow)' : 'var(--green)';
  const getStockPct    = (s) => Math.min(100, (s / 500) * 100);

  if (loading) return <div className="page-container"><LoadingSpinner text="Loading products..." /></div>;
  if (error)   return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Product List</h2>
          <p className="page-subtitle">{products.length} products · {products.filter(p => p.stock < 100).length} low stock</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/wholesaler/products/add')}>＋ Add Product</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-wrap" style={{ borderRadius: 0, border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>MOQ</th>
                <th>Base Price</th><th>Tiers</th><th>Stock</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const cat   = CAT_COLORS[p.category] || { bg: 'var(--surface-3)', text: 'var(--text-muted)' };
                const base  = p.priceTiers[0]?.price ?? 0;
                const best  = p.priceTiers[p.priceTiers.length - 1]?.price ?? 0;
                const disc  = Math.round(((base - best) / base) * 100);
                return (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: {p._id.slice(-6)}</div>
                    </td>
                    <td>
                      <span style={{ padding: '3px 10px', background: cat.bg, color: cat.text,
                        borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600 }}>
                        {p.category}
                      </span>
                    </td>
                    <td><span style={{ fontWeight: 600, color: 'var(--text-2)' }}>{p.minOrderQty} units</span></td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora' }}>₹{base}/u</div>
                      {disc > 0 && <div style={{ fontSize: 11, color: 'var(--green)' }}>up to {disc}% off</div>}
                    </td>
                    <td><div className="badge badge-blue">{p.priceTiers.length} tiers</div></td>
                    <td style={{ minWidth: 140 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: getStockColor(p.stock), fontWeight: 700 }}>{p.stock} units</span>
                        <span style={{ color: 'var(--text-faint)' }}>{p.stock < 50 ? '⚠️' : p.stock < 150 ? '🔶' : '✅'}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${getStockPct(p.stock)}%`, background: getStockColor(p.stock) }} />
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/wholesaler/products/${p._id}/edit`)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(p._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>{search ? 'No results' : 'No products yet'}</h3>
            <p>{search ? 'Try a different search' : 'Click "Add Product" to list your first product'}</p>
          </div>
        )}
      </div>

      {/* Delete modal */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ padding: 32, maxWidth: 380, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, marginBottom: 8 }}>Delete Product?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
              This will permanently remove the product from your listings.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
