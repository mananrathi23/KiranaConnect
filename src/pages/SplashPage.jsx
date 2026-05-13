// src/pages/SplashPage.jsx
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
<<<<<<< HEAD
=======
import './splashPage.css';
>>>>>>> 74f91b13a3bfe3a2d4eb731247f77aaddbf55877

export default function SplashPage() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
<<<<<<< HEAD
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden' }}>

      {/* Background decoration */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(173,216,230,0.3) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)',
        backgroundSize: '40px 40px', opacity: 0.4, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24,
          animation: 'float 4s ease-in-out infinite' }}>
          <div style={{ width: 96, height: 96, borderRadius: 28,
            background: 'linear-gradient(135deg, var(--primary-btn) 0%, var(--primary) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48,
            boxShadow: '0 20px 60px rgba(26,120,194,0.3), 0 0 0 1px rgba(173,216,230,0.3)' }}>🛺</div>
        </div>

        <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 'clamp(40px, 8vw, 72px)',
          letterSpacing: '-2px', marginBottom: 8, lineHeight: 1 }}>
          Kirana<span style={{ background: 'linear-gradient(135deg, var(--primary-btn), #38BDF8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Connect</span>
        </h1>

        <p style={{ fontSize: 'clamp(16px, 3vw, 22px)', color: 'var(--text-2)', fontWeight: 400,
          marginBottom: 8, letterSpacing: '0.5px' }}>
          Trade.&nbsp;<span style={{ color: 'var(--orange)', fontWeight: 600 }}>Grow.</span>&nbsp;Together.
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto 40px', lineHeight: 1.6 }}>
          B2B hyperlocal wholesale platform connecting Kirana stores with nearby wholesalers. Bulk orders, tier pricing, batched dispatch.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/login')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 40px',
            background: 'linear-gradient(135deg, var(--primary-btn) 0%, #0EA5E9 100%)',
            color: 'white', border: 'none', borderRadius: 'var(--radius-xl)',
            fontSize: 17, fontWeight: 700, fontFamily: 'Sora', cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(26,120,194,0.4)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(26,120,194,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 32px rgba(26,120,194,0.4)'; }}
          >Sign In →</button>
          <button onClick={() => navigate('/register')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 32px',
            background: 'transparent', color: 'var(--primary-btn)',
            border: '2px solid var(--primary)', borderRadius: 'var(--radius-xl)',
            fontSize: 17, fontWeight: 700, fontFamily: 'Sora', cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-soft)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >Create Account</button>
        </div>

        {/* Role badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
          {[
            { icon: '🏭', label: 'For Wholesalers',  color: 'var(--primary-soft)',  text: 'var(--primary-btn)' },
            { icon: '🛒', label: 'For Kirana Stores', color: 'var(--orange-soft)', text: 'var(--orange-dark)' },
          ].map(({ icon, label, color, text }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 'var(--radius-full)',
              background: color, color: text, fontSize: 13, fontWeight: 600 }}>
              <span>{icon}</span><span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom feature pills */}
      <div style={{ position: 'absolute', bottom: 32, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', padding: '0 24px',
        opacity: visible ? 0.65 : 0, transition: 'opacity 1.2s ease 0.4s' }}>
        {['📦 Bulk Orders', '⏱️ 6h Batches', '💰 Tier Pricing', '🔐 Dual JWT Auth', '⚛️ Redis Cache'].map(f => (
          <span key={f} style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 12px',
            borderRadius: 'var(--radius-full)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {f}
          </span>
=======

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="splash-container">
      
      {/* Background blobs */}
      <div className="blob blob-top" />
      <div className="blob blob-bottom" />

      {/* Grid overlay */}
      <div className="grid-overlay" />

      {/* Main content */}
      <div className={`content ${visible ? 'show' : ''}`}>
        
        {/* Logo */}
        <div className="logo-wrapper">
          <div className="logo">🛺</div>
        </div>

        {/* Brand */}
        <h1 className="brand">
          Kirana<span className="brand-highlight">Connect</span>
        </h1>

        {/* Tagline */}
        <p className="tagline">
          Trade. <span className="highlight">Grow.</span> Together.
        </p>

        <p className="description">
          B2B hyperlocal wholesale platform connecting Kirana stores with nearby wholesalers.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate('/login')}
          className="cta-btn"
        >
          Get Started <span>→</span>
        </button>

        {/* Role badges */}
        <div className="roles">
          <div className="badge wholesaler">
            🏭 <span>For Wholesalers</span>
          </div>
          <div className="badge kirana">
            🛒 <span>For Kirana Stores</span>
          </div>
        </div>
      </div>

      {/* Bottom features */}
      <div className={`features ${visible ? 'show' : ''}`}>
        {['📦 Bulk Orders', '⏱️ 6h Batches', '💰 Tier Pricing', '🔐 Dual Auth'].map(f => (
          <span key={f} className="feature-pill">{f}</span>
>>>>>>> 74f91b13a3bfe3a2d4eb731247f77aaddbf55877
        ))}
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 74f91b13a3bfe3a2d4eb731247f77aaddbf55877
