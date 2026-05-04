// src/pages/SplashPage.jsx
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './splashPage.css';

export default function SplashPage() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

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
        ))}
      </div>
    </div>
  );
}