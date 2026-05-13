// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RegisterPage.css';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('WHOLESALER');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPwd: '',
    businessName: '',
    shopName: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const { name, email, password, confirmPwd, businessName, shopName, address } = form;

    if (!name || !email || !password || !confirmPwd || !address) {
      setError('Please fill all required fields');
      return;
    }

    if (role === 'WHOLESALER' && !businessName) {
      setError('Business name required');
      return;
    }

    if (role === 'SHOP_OWNER' && !shopName) {
      setError('Shop name required');
      return;
    }

    if (password !== confirmPwd) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    // MOCK (later replace with API)
    await new Promise((r) => setTimeout(r, 600));

    // TEMP login
    const user = login(email, password, role);

    setLoading(false);

    if (user.role === 'WHOLESALER') navigate('/wholesaler/dashboard');
    else navigate('/shop/dashboard');
  };

  return (
    <div className="register-wrapper">
      <div className="bg-circle-1" />
      <div className={`bg-circle-2 ${role}`} />

      <div className="register-card">
        <Link to="/login" className="back-link">← Back to Login</Link>

        <div className="header">
          <div className="header-icon">🛺</div>
          <h2>Create account</h2>
          <p>Join KiranaConnect and start trading</p>
        </div>

        {/* Role Toggle */}
        <div className="role-toggle">
          <div className="toggle-grid">
            {[
              { value: 'WHOLESALER', icon: '🏭', label: 'Wholesaler' },
              { value: 'SHOP_OWNER', icon: '🛒', label: 'Kirana Owner' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setRole(opt.value); setError(''); }}
                className={`toggle-btn ${role === opt.value ? 'active' : ''}`}
              >
                <div className="toggle-icon">{opt.icon}</div>
                <div className="toggle-title">{opt.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleRegister} className="form">

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input name="name" className="form-input" value={form.name} onChange={handleChange} />
          </div>

          {role === 'WHOLESALER' && (
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input name="businessName" className="form-input" value={form.businessName} onChange={handleChange} />
            </div>
          )}

          {role === 'SHOP_OWNER' && (
            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <input name="shopName" className="form-input" value={form.shopName} onChange={handleChange} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              className="form-input"
              placeholder="Enter full address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="pwd-container">
              <input
                name="password"
                type={showPwd ? 'text' : 'password'}
                className="form-input"
                value={form.password}
                onChange={handleChange}
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(p => !p)}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              name="confirmPwd"
              type="password"
              className="form-input"
              value={form.confirmPwd}
              onChange={handleChange}
            />
          </div>

          {error && <div className="error-box">⚠️ {error}</div>}

          <button type="submit" disabled={loading} className={`submit-btn ${loading ? 'loading' : ''}`}>
            {loading ? '⏳ Creating account...' : 'Register →'}
          </button>
        </form>

        <div className="bottom-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}