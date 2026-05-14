// src/pages/kirana/OrderConfirm.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import CountdownTimer from '../../components/CountdownTimer';

export default function OrderConfirm() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const orders    = state?.orders || [];

  const totalAmount = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const totalItems  = orders.reduce((s, o) => s + (o.items?.length || 0), 0);

  return (
    <div className="page-container" style={{ maxWidth: 560, margin: '40px auto' }}>
      <div className="card" style={{ padding: '40px 36px', textAlign: 'center' }}>
        <div style={{ width: 88, height: 88, background: 'linear-gradient(135deg, var(--green), #34D399)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 44, margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(5,150,105,0.3)',
          animation: 'fadeUp 0.5s ease' }}>✅</div>

        <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 26, marginBottom: 8 }}>Order Placed!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 28 }}>
          Your bulk order has been placed and will be processed in the next dispatch window.
        </p>

        {orders.map(order => (
          <div key={order._id} style={{ background: 'var(--surface-3)', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 16, textAlign: 'left' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.5px', fontFamily: 'Sora', marginBottom: 6 }}>Order ID</div>
            <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20, color: 'var(--primary-btn)',
              letterSpacing: '2px', marginBottom: 14 }}>
              #{order._id?.slice(-8).toUpperCase()}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-2)' }}>
              <span>{order.items?.length} items</span>
              <span style={{ fontWeight: 700, color: 'var(--green)', fontFamily: 'Sora' }}>
                ₹{order.totalAmount?.toLocaleString()}
              </span>
            </div>
          </div>
        ))}

        <div style={{ background: 'linear-gradient(135deg, var(--orange-soft), var(--yellow-soft))',
          border: '1px solid var(--orange)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange-dark)', marginBottom: 10 }}>
            🕐 Dispatch countdown:
          </div>
          <CountdownTimer targetHour={18} />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Status: PENDING → BATCHED → DISPATCHED
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/shop/orders')}>📋 View Orders</button>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/shop/browse')}>🛍️ Shop More</button>
        </div>
      </div>
    </div>
  );
}
