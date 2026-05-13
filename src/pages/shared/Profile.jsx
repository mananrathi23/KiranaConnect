// src/pages/shared/Profile.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as authApi from '../../api/auth.js';

export default function Profile() {
  const { user, logout, refreshUser, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [savePwdLoading, setSavePwdLoading] = useState(false);
  const [msg,      setMsg]      = useState('');
  const [pwdMsg,   setPwdMsg]   = useState('');

  const [form, setForm] = useState({
    name:         user?.name         || '',
    email:        user?.email        || '',
    businessName: user?.businessName || '',
    shopName:     user?.shopName     || '',
    address:      user?.address      || '',
  });
  const [pwdForm, setPwdForm] = useState({ currentPwd: '', newPwd: '', confirmPwd: '' });

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      await authApi.updateProfile(form);
      refreshUser(form);
      setMsg('success');
      setEditing(false);
    } catch (err) { setMsg(err.message); }
    finally { setSaving(false); }
  };

  const handlePwd = async () => {
    if (!pwdForm.currentPwd || !pwdForm.newPwd) { setPwdMsg('Fill all fields'); return; }
    if (pwdForm.newPwd !== pwdForm.confirmPwd)  { setPwdMsg('Passwords do not match'); return; }
    setSavePwdLoading(true); setPwdMsg('');
    try {
      await authApi.updateProfile({ password: pwdForm.newPwd, currentPassword: pwdForm.currentPwd });
      setPwdMsg('success');
      setPwdForm({ currentPwd: '', newPwd: '', confirmPwd: '' });
    } catch (err) { setPwdMsg(err.message); }
    finally { setSavePwdLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const infoRows = user?.role === 'WHOLESALER'
    ? [{ icon: '🏭', label: 'Business Name', value: user.businessName || '—' },
       { icon: '📧', label: 'Email', value: user.email },
       { icon: '🎭', label: 'Role', value: 'Wholesaler' },
       { icon: '📍', label: 'Address', value: user.address || '—' }]
    : [{ icon: '🛒', label: 'Shop Name', value: user?.shopName || '—' },
       { icon: '📧', label: 'Email', value: user?.email },
       { icon: '🎭', label: 'Role', value: 'Shop Owner (Kirana)' },
       { icon: '📍', label: 'Address', value: user?.address || '—' }];

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Profile & Settings</h2>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%',
            background: user?.role === 'WHOLESALER'
              ? 'linear-gradient(135deg, #ADD8E6, #2563EB)'
              : 'linear-gradient(135deg, #F97316, #FBBF24)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, boxShadow: 'var(--shadow-md)' }}>
            {user?.role === 'WHOLESALER' ? '🏭' : '🛒'}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 22 }}>{user?.name}</h3>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              {user?.role === 'WHOLESALER' ? user?.businessName : user?.shopName}
            </div>
            <div style={{ marginTop: 8 }}>
              <span className={`badge ${user?.role === 'WHOLESALER' ? 'badge-blue' : 'badge-pending'}`}>
                {user?.role === 'WHOLESALER' ? '🏭 Wholesaler' : '🛒 Shop Owner'}
              </span>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => { setEditing(e => !e); setMsg(''); }}>
            {editing ? '✕ Cancel' : '✏️ Edit Profile'}
          </button>
        </div>

        {msg === 'success' && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--green-soft)',
            color: 'var(--green)', fontWeight: 600, marginBottom: 16 }}>✅ Profile updated!</div>
        )}
        {msg && msg !== 'success' && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--red-soft)',
            color: 'var(--red)', marginBottom: 16 }}>⚠️ {msg}</div>
        )}

        {!editing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {infoRows.map(row => (
              <div key={row.label} style={{ padding: '14px 16px', background: 'var(--surface-2)',
                borderRadius: 'var(--radius)', border: '1px solid var(--border-2)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.5px', fontFamily: 'Sora', marginBottom: 4 }}>{row.icon} {row.label}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{row.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              {user?.role === 'WHOLESALER' ? (
                <div className="form-group">
                  <label className="form-label">Business Name</label>
                  <input className="form-input" value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Shop Name</label>
                  <input className="form-input" value={form.shopName} onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
              <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Change password */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>🔐 Change Password</h3>
        {pwdMsg === 'success' && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--green-soft)',
            color: 'var(--green)', fontWeight: 600, marginBottom: 14 }}>✅ Password updated!</div>
        )}
        {pwdMsg && pwdMsg !== 'success' && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--red-soft)',
            color: 'var(--red)', marginBottom: 14 }}>⚠️ {pwdMsg}</div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
          {['currentPwd', 'newPwd', 'confirmPwd'].map((field, i) => (
            <div className="form-group" key={field}>
              <label className="form-label">{['Current Password', 'New Password', 'Confirm New Password'][i]}</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={pwdForm[field]} onChange={e => setPwdForm(f => ({ ...f, [field]: e.target.value }))} />
            </div>
          ))}
          <button className="btn btn-primary" style={{ width: 'fit-content' }}
            onClick={handlePwd} disabled={savePwdLoading}>
            {savePwdLoading ? '⏳ Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>⚙️ Preferences</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-2)' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Theme</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Switch between light and dark mode</div>
          </div>
          <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface-2)',
            cursor: 'pointer', color: 'var(--text)', fontWeight: 600, fontSize: 14 }}>
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>

      <button className="btn btn-danger btn-lg" style={{ width: '100%' }} onClick={handleLogout}>
        🚪 Log Out
      </button>
    </div>
  );
}