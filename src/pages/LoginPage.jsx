// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('WHOLESALER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 600)); // demo delay

    const user = login(email, password, role);
    setLoading(false);

    if (user.role === 'WHOLESALER') navigate('/wholesaler/dashboard');
    else navigate('/shop/dashboard');
  };

  const fillDemo = () => {
    if (role === 'WHOLESALER') {
      setEmail('rajesh@agrosupply.com');
      setPassword('demo1234');
    } else {
      setEmail('priya@sharmakirana.com');
      setPassword('demo1234');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="bg-circle-1" />
      <div className={`bg-circle-2 ${role}`} />

      <div className="login-card">
        <Link to="/" className="back-link">← Back</Link>

        <div className="header">
          <div className="header-icon">🛺</div>
          <h2>Welcome back</h2>
          <p>Sign in to your KiranaConnect account</p>
        </div>

        <div className="role-toggle">
          {/* <div className="toggle-label">I am a...</div> */}

          <div className="toggle-grid">
            {[
              { value: 'WHOLESALER', icon: '🏭', label: 'Wholesaler', sub: 'Supply products' },
              { value: 'SHOP_OWNER', icon: '🛒', label: 'Kirana Owner', sub: 'Buy in bulk' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setRole(opt.value);
                  setError('');
                }}
                className={`toggle-btn ${role === opt.value ? 'active' : ''}`}
              >
                <div className="toggle-icon">{opt.icon}</div>
                <div className="toggle-title">{opt.label}</div>
                <div className="toggle-sub">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="pwd-container">
              <input
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPwd((p) => !p)}
              >
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <div className="error-box">⚠️ {error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={`submit-btn ${loading ? 'loading' : ''}`}
          >
            {loading
              ? '⏳ Signing in...'
              : `Sign in as ${role === 'WHOLESALER' ? 'Wholesaler' : 'Shop Owner'} →`}
          </button>
        </form>

        <div className="demo-box">
          <div className="demo-label">🧪 Demo Mode — use any credentials</div>
          <button onClick={fillDemo} className="demo-btn">
            Fill demo credentials
          </button>
        </div>
        <div className="bottom-link">
        Don’t have an account? <Link to="/register">Create account</Link>
        </div>
      </div>
    </div>
  );
}