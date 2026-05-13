// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kc_user')); } catch { return null; }
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('kc_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kc_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  // Returns user object; throws on error
  const login = async (email, password) => {
    const { token, user: u } = await authApi.login({ email, password });
    localStorage.setItem('kc_token', token);
    localStorage.setItem('kc_user',  JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (formData) => {
    const { token, user: u } = await authApi.register(formData);
    localStorage.setItem('kc_token', token);
    localStorage.setItem('kc_user',  JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('kc_token');
    localStorage.removeItem('kc_user');
    setUser(null);
  };

  // Update local user after profile save
  const refreshUser = (updated) => {
    const merged = { ...user, ...updated };
    localStorage.setItem('kc_user', JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
