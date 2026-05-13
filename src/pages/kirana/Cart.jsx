// src/pages/kirana/Cart.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getNextTier } from '../../utils/pricingHelper.js';
import * as ordersApi from '../../api/orders.js';
import CountdownTimer from '../../components/CountdownTimer';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateQty, removeItem, clearCart, total } = useCart();
  const [placing, setPlacing] = useState(false);
  const [error,   setError]   = useState('');

  // useMemo — per-item next-tier info, recomputes only when cartItems changes
  const itemsWithTierInfo = useMemo(() =>
    cartItems.map(item => ({ ...item, nextTier: item.priceTiers ? getNextTier(item.priceTiers, item.qty) : null })),
    [cartItems]
  );

  const handlePlaceOrder = async () => {
    setPlacing(true); setError('');
    try {
      const orders = await ordersApi.placeOrder({
        items: cartItems.map(item => ({ product: item.productId, quantity: item.qty })),
      });
      clearCart();
      navigate('/shop/order-confirm', { state: { orders } });
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state" style={{ padding: '80px 20px' }}>
          <div className="empty-icon" style={{ fontSize: 72 }}>🛒</div>
          <h3 style={{ fontSize: 22 }}>Your cart is empty</h3>
          <p style={{ marginBottom: 24 }}>Browse wholesale products and add them to your cart</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/shop/browse')}>Browse Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">My Cart</h2>
          <p className="page-subtitle">
            {cartItems.length} item types ·{' '}
            <code style={{ fontSize: 12, background: 'var(--surface-3)', padding: '1px 6px', borderRadius: 4 }}>
              useMemo
            </code>{' '}
            total recalculates only on cart change
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/shop/browse')}>+ Add More</button>
      </div>

      {/* Dispatch notice */}
      <div style={{ background: 'linear-gradient(135deg, var(--orange-soft), var(--yellow-soft))',
        border: '1.5px solid var(--orange)', borderRadius: 'var(--radius-lg)', padding: '16px 20px',
        marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 24 }}>🚚</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--orange-dark)' }}>Order now to catch next dispatch!</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Orders batch every 6 hours — next window closes in:</div>
          </div>
        </div>
        <CountdownTimer targetHour={18} />
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius)', background: 'var(--red-soft)',
          border: '1px solid var(--red)', color: 'var(--red)', marginBottom: 20, fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {itemsWithTierInfo.map(item => (
            <div key={item.productId} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>₹{item.price}/unit · MOQ: {item.moq}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 18 }}>₹{(item.price * item.qty).toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.qty} × ₹{item.price}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
                <button className="btn btn-outline btn-icon"
                  onClick={() => updateQty(item.productId, Math.max(item.moq, item.qty - item.moq), item.priceTiers)}>−</button>
                <input className="form-input" type="number" value={item.qty}
                  onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= item.moq) updateQty(item.productId, v, item.priceTiers); }}
                  min={item.moq} style={{ textAlign: 'center', width: 80, fontFamily: 'Sora', fontWeight: 700 }} />
                <button className="btn btn-outline btn-icon"
                  onClick={() => updateQty(item.productId, item.qty + item.moq, item.priceTiers)}>+</button>
                <button onClick={() => removeItem(item.productId)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 20 }}>
                  🗑️
                </button>
              </div>

              {item.nextTier && (
                <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--orange-soft)',
                  borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--orange-dark)',
                  display: 'flex', alignItems: 'center', gap: 6 }}>
                  🔓 Add {item.nextTier.minQty - item.qty} more for ₹{item.nextTier.price}/unit
                  <button onClick={() => updateQty(item.productId, item.nextTier.minQty, item.priceTiers)} style={{
                    marginLeft: 'auto', background: 'var(--orange)', color: 'white', border: 'none',
                    borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    Unlock
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card" style={{ padding: 24, position: 'sticky', top: 80 }}>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Order Summary</h3>
            {cartItems.map(item => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between',
                marginBottom: 10, fontSize: 13, color: 'var(--text-2)' }}>
                <span>{item.name} ×{item.qty}</span>
                <span style={{ fontWeight: 600 }}>₹{(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: 14, marginTop: 8,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 22, color: 'var(--primary-btn)' }}>
                ₹{total.toLocaleString()}
              </span>
            </div>
            <div style={{ background: 'var(--green-soft)', borderRadius: 'var(--radius)', padding: '10px 14px',
              marginTop: 14, marginBottom: 20, fontSize: 13, color: 'var(--green)', fontWeight: 600,
              display: 'flex', gap: 8, alignItems: 'center' }}>
              🎉 Tier savings applied on all items!
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
              onClick={handlePlaceOrder} disabled={placing}>
              {placing ? '⏳ Placing Order...' : 'Place Order →'}
            </button>
            <button className="btn btn-outline" style={{ width: '100%', marginTop: 10 }}
              onClick={() => navigate('/shop/browse')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    </div>
  );
}
