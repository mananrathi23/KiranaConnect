import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css'; // Importing the CSS

export default function Profile() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdSaved, setPwdSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const infoRows = user?.role === 'WHOLESALER'
    ? [
        { icon: '🏭', label: 'Business Name', value: user.businessName || '—' },
        { icon: '📧', label: 'Email', value: user.email },
        { icon: '🎭', label: 'Role', value: 'Wholesaler' },
        { icon: '📅', label: 'Member Since', value: 'Jan 2025' },
      ]
    : [
        { icon: '🛒', label: 'Shop Name', value: user?.shopName || '—' },
        { icon: '📧', label: 'Email', value: user?.email },
        { icon: '🎭', label: 'Role', value: 'Shop Owner (Kirana)' },
        { icon: '📅', label: 'Member Since', value: 'Jan 2025' },
      ];

  // Dynamic background for avatar
  const avatarStyle = {
    background: user?.role === 'WHOLESALER'
      ? 'linear-gradient(135deg, #ADD8E6, #2563EB)'
      : 'linear-gradient(135deg, #F97316, #FBBF24)'
  };

  return (
    <div className="page-container profile-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Profile & Settings</h2>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="card profile-card">
        <div className="profile-header-flex">
          <div className="profile-avatar" style={avatarStyle}>
            {user?.avatar}
          </div>

          <div className="profile-name-info">
            <h3 className="profile-name">{user?.name}</h3>
            <div className="profile-subtext">
              {user?.role === 'WHOLESALER' ? user?.businessName : user?.shopName}
            </div>
            <div className="profile-badge-wrapper">
              <span className={`badge ${user?.role === 'WHOLESALER' ? 'badge-blue' : 'badge-pending'}`}>
                {user?.role === 'WHOLESALER' ? '🏭 Wholesaler' : '🛒 Shop Owner'}
              </span>
            </div>
          </div>

          <button className="btn btn-outline btn-sm" onClick={() => setEditing(e => !e)}>
            {editing ? '✕ Cancel' : '✏️ Edit Profile'}
          </button>
        </div>

        {!editing ? (
          <div className="info-grid">
            {infoRows.map(row => (
              <div key={row.label} className="info-item">
                <div className="info-label">
                  {row.icon} {row.label}
                </div>
                <div className="info-value">{row.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="profile-form-stack">
            {saved && (
              <div className="success-alert">
                ✅ Profile updated successfully!
              </div>
            )}
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{user?.role === 'WHOLESALER' ? 'Business Name' : 'Shop Name'}</label>
                <input className="form-input" defaultValue={user?.role === 'WHOLESALER' ? user.businessName : user?.shopName} />
              </div>
            </div>
            <div className="btn-group">
              <button className="btn btn-primary" onClick={handleSave}>💾 Save Changes</button>
              <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 className="section-title">🔐 Change Password</h3>
        {pwdSaved && (
          <div className="success-alert" style={{ marginBottom: 14 }}>
            ✅ Password updated!
          </div>
        )}
        <div className="pwd-form-container">
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" placeholder="Min. 8 characters" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{ width: 'fit-content' }}
            onClick={() => { setPwdSaved(true); setCurrentPwd(''); setNewPwd(''); setTimeout(() => setPwdSaved(false), 2000); }}>
            Update Password
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 className="section-title">⚙️ Preferences</h3>
        <div className="pref-row pref-row-border">
          <div>
            <div className="pref-label">Theme</div>
            <div className="pref-desc">Switch between light and dark mode</div>
          </div>
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
        <div className="pref-row">
          <div>
            <div className="pref-label">Notifications</div>
            <div className="pref-desc">Batch dispatch alerts</div>
          </div>
          <div className="custom-switch">
            <div className="switch-handle" />
          </div>
        </div>
      </div>

      {/* Logout */}
      <button className="btn btn-danger btn-lg" style={{ width: '100%' }} onClick={handleLogout}>
        🚪 Log Out
      </button>
    </div>
  );
}