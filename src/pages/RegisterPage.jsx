// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('WHOLESALER');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    businessName: '',
    shopName: '',
    address: '',
    email: '',
    password: '',
    confirmPwd: '',
  });

  const active = ROLE_OPTIONS.find(r => r.value === role);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, businessName, shopName, address, email, password, confirmPwd } = form;

    if (!name || !email || !password || !confirmPwd || !address) {
      setError("Please fill all required fields");
      return;
    }
    if (role === "WHOLESALER" && !businessName) {
      setError("Business name is required");
      return;
    }
    if (role === "SHOP_OWNER" && !shopName) {
      setError("Shop name is required");
      return;
    }
    if (password !== confirmPwd) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true); setError("");

    try {
      const user = await register({
        ...form,
        role
      });

      navigate(
        user.role === "WHOLESALER"
          ? "/wholesaler/dashboard"
          : "/shop/dashboard"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Blobs */}
      <div style={{
        position: "absolute",
        top: "-20%", right: "-10%",
        width: 600, height: 600,
        background: "radial-gradient(circle,rgba(173,216,230,0.25) 0%,transparent 65%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        bottom: "-20%", left: "-10%",
        width: 500, height: 500,
        background: active.blob,
        borderRadius: "50%",
        pointerEvents: "none",
        transition: "background .5s ease"
      }} />

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 500,
        background: "var(--surface)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-lg)",
        padding: "36px 36px 32px",
        position: "relative",
        zIndex: 1,
        animation: "fadeUp 0.5s ease"
      }}>
        {/* Back Link */}
        <Link to="/login" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "var(--text-muted)",
          marginBottom: 24, fontWeight: 500
        }}>
          ← Back to Login
        </Link>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56,
            background: "linear-gradient(135deg, var(--primary-btn), var(--primary))",
            borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28,
            margin: "0 auto 14px",
            boxShadow: "0 8px 24px var(--primary-glow)"
          }}>
            🛺
          </div>

          <h2 style={{
            fontSize: 24,
            fontFamily: "Sora",
            fontWeight: 800,
            color: "var(--text)"
          }}>Create account</h2>

          <p style={{
            color: "var(--text-muted)",
            fontSize: 14,
            marginTop: 6
          }}>Join KiranaConnect and start trading</p>
        </div>

        {/* Role Selection */}
        <div style={{ marginBottom: 26 }}>
          <div style={{
            fontSize: 12, color: "var(--text-muted)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 10,
            textAlign: "center",
            fontFamily: "Sora",
          }}>
            I am a…
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: "var(--surface-3)",
            borderRadius: "var(--radius)",
            padding: 4,
            gap: 4
          }}>
            {ROLE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setRole(opt.value); setError(""); }}
                style={{
                  padding: "14px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: role === opt.value
                    ? "2px solid var(--primary)"
                    : "2px solid transparent",
                  background: role === opt.value ? "var(--surface)" : "transparent",
                  boxShadow: role === opt.value ? "var(--shadow-sm)" : "none",
                  cursor: "pointer",
                  transition: "all .2s",
                  textAlign: "center"
                }}
              >
                <div style={{
                  width: 44, height: 44,
                  borderRadius: "50%",
                  margin: "0 auto 8px",
                  background: role === opt.value ? opt.grad : "var(--border-2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22,
                  transition: "background .3s",
                  boxShadow: role === opt.value
                    ? "0 4px 12px rgba(0,0,0,0.15)"
                    : "none"
                }}>{opt.icon}</div>

                <div style={{
                  fontSize: 13, fontWeight: 700,
                  fontFamily: "Sora",
                  color: role === opt.value
                    ? "var(--primary-btn)"
                    : "var(--text-muted)",
                  transition: "color .2s"
                }}>{opt.label}</div>

                <div style={{
                  fontSize: 11,
                  color: "var(--text-faint)",
                  marginTop: 2
                }}>{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleRegister} style={{
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              name="name"
              className="form-input"
              placeholder="Rajesh Kumar"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          {/* Business / Shop */}
          {role === "WHOLESALER" ? (
            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input
                name="businessName"
                className="form-input"
                placeholder="Agro Supply Co."
                value={form.businessName}
                onChange={handleChange}
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Shop Name *</label>
              <input
                name="shopName"
                className="form-input"
                placeholder="Sharma Kirana Store"
                value={form.shopName}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Address */}
          <div className="form-group">
            <label className="form-label">Address *</label>
            <textarea
              name="address"
              className="form-input"
              placeholder="Street, City, District"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password *</label>
            <div style={{ position: "relative" }}>
              <input
                name="password"
                type={showPwd ? "text" : "password"}
                className="form-input"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(p => !p)}
                style={{
                  position: "absolute",
                  right: 12, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  color: "var(--text-muted)"
                }}
              >
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input
              name="confirmPwd"
              type="password"
              className="form-input"
              placeholder="Re-enter password"
              value={form.confirmPwd}
              onChange={handleChange}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              background: "var(--red-soft)",
              color: "var(--red)",
              fontSize: 13,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: 14,
              marginTop: 4,
              background: loading
                ? "var(--border)"
                : role === "WHOLESALER"
                  ? "linear-gradient(135deg, var(--primary-btn), #0EA5E9)"
                  : "linear-gradient(135deg, #F97316, #FBBF24)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius)",
              fontSize: 16,
              fontWeight: 700,
              fontFamily: "Sora",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading
                ? "none"
                : role === "WHOLESALER"
                  ? "0 4px 16px rgba(26,120,194,0.35)"
                  : "0 4px 16px rgba(249,115,22,0.35)",
              transition: "all 0.3s",
            }}
          >
            {loading
              ? "⏳ Creating account..."
              : `Register as ${role === "WHOLESALER" ? "Wholesaler" : "Shop Owner"} →`}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: 22,
          textAlign: "center",
          fontSize: 13,
          color: "var(--text-muted)"
        }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--primary-btn)",
              fontWeight: 600,
              textDecoration: "none"
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}