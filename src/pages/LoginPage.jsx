// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
<<<<<<< HEAD

const ROLE_OPTIONS = [
  {
    value: 'WHOLESALER',
    icon: '🏭',
    label: 'Wholesaler',
    sub: 'Supply products',
    grad: 'linear-gradient(135deg,#ADD8E6,#2563EB)',
    blob: 'radial-gradient(circle,rgba(26,120,194,0.1) 0%,transparent 65%)',
  },
  {
    value: 'SHOP_OWNER',
    icon: '🛒',
    label: 'Kirana Owner',
    sub: 'Buy in bulk',
    grad: 'linear-gradient(135deg,#F97316,#FBBF24)',
    blob: 'radial-gradient(circle,rgba(249,115,22,0.1) 0%,transparent 65%)',
  },
];

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [role,     setRole]     = useState('WHOLESALER');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPwd,  setShowPwd]  = useState(false);

  const active = ROLE_OPTIONS.find(r => r.value === role);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password'); return; }
    setLoading(true); setError('');
    try {
      const user = await login(email, password);
      // Warn if role mismatch but still redirect to correct dashboard
      navigate(user.role === 'WHOLESALER' ? '/wholesaler/dashboard' : '/shop/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
=======
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
>>>>>>> 74f91b13a3bfe3a2d4eb731247f77aaddbf55877
    }
  };

  return (
<<<<<<< HEAD
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Animated background blob that changes with role */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600,
        background: 'radial-gradient(circle,rgba(173,216,230,0.25) 0%,transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-10%', width: 500, height: 500,
        background: active.blob, borderRadius: '50%', pointerEvents: 'none',
        transition: 'background 0.5s ease',
      }} />

      <div style={{
        width: '100%', maxWidth: 440,
        background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)',
        padding: '36px 36px 32px', position: 'relative', zIndex: 1,
        animation: 'fadeUp 0.5s ease',
      }}>
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, fontWeight: 500,
        }}>← Back</Link>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, var(--primary-btn), var(--primary))',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 14px', boxShadow: '0 8px 24px var(--primary-glow)',
          }}>🛺</div>
          <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 24, color: 'var(--text)' }}>
            Welcome back
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>
            Sign in to your KiranaConnect account
          </p>
        </div>

        {/* Role Toggle */}
        <div style={{ marginBottom: 26 }}>
          <div style={{
            fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.5px', marginBottom: 10, textAlign: 'center', fontFamily: 'Sora',
          }}>I am a…</div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            background: 'var(--surface-3)', borderRadius: 'var(--radius)',
            padding: 4, gap: 4,
          }}>
            {ROLE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setRole(opt.value); setError(''); }}
                style={{
                  padding: '14px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  border: role === opt.value ? '2px solid var(--primary)' : '2px solid transparent',
                  background: role === opt.value ? 'var(--surface)' : 'transparent',
                  boxShadow: role === opt.value ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s', textAlign: 'center',
                }}
              >
                {/* Avatar circle */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', margin: '0 auto 8px',
                  background: role === opt.value ? opt.grad : 'var(--border-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, transition: 'background 0.3s',
                  boxShadow: role === opt.value ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                }}>{opt.icon}</div>
                <div style={{
                  fontSize: 13, fontWeight: 700, fontFamily: 'Sora',
                  color: role === opt.value ? 'var(--primary-btn)' : 'var(--text-muted)',
                  transition: 'color 0.2s',
                }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{opt.sub}</div>
=======
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
>>>>>>> 74f91b13a3bfe3a2d4eb731247f77aaddbf55877
              </button>
            ))}
          </div>
        </div>

<<<<<<< HEAD
        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
=======
        <form onSubmit={handleLogin} className="form">
>>>>>>> 74f91b13a3bfe3a2d4eb731247f77aaddbf55877
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
<<<<<<< HEAD
              onChange={e => setEmail(e.target.value)}
=======
              onChange={(e) => setEmail(e.target.value)}
>>>>>>> 74f91b13a3bfe3a2d4eb731247f77aaddbf55877
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
<<<<<<< HEAD
            <div style={{ position: 'relative' }}>
=======
            <div className="pwd-container">
>>>>>>> 74f91b13a3bfe3a2d4eb731247f77aaddbf55877
              <input
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
<<<<<<< HEAD
                onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(p => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 16, color: 'var(--text-muted)',
                }}
              >{showPwd ? '🙈' : '👁️'}</button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              background: 'var(--red-soft)', color: 'var(--red)', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>⚠️ {error}</div>
          )}
=======
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
>>>>>>> 74f91b13a3bfe3a2d4eb731247f77aaddbf55877

          <button
            type="submit"
            disabled={loading}
<<<<<<< HEAD
            style={{
              padding: 14, marginTop: 4,
              background: loading
                ? 'var(--border)'
                : role === 'WHOLESALER'
                  ? 'linear-gradient(135deg, var(--primary-btn), #0EA5E9)'
                  : 'linear-gradient(135deg, #F97316, #FBBF24)',
              color: 'white', border: 'none', borderRadius: 'var(--radius)',
              fontSize: 16, fontWeight: 700, fontFamily: 'Sora',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : role === 'WHOLESALER'
                ? '0 4px 16px rgba(26,120,194,0.35)'
                : '0 4px 16px rgba(249,115,22,0.35)',
              transition: 'all 0.3s',
            }}
          >
            {loading
              ? '⏳ Signing in...'
              : `Sign in as ${role === 'WHOLESALER' ? 'Wholesaler' : 'Kirana Owner'} →`}
          </button>
        </form>

        <div style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{ color: 'var(--primary-btn)', fontWeight: 600, textDecoration: 'none' }}
          >Create one</Link>
=======
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
>>>>>>> 74f91b13a3bfe3a2d4eb731247f77aaddbf55877
        </div>
      </div>
    </div>
  );
}