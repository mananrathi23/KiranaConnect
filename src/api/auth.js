// src/api/auth.js
import api from './index.js';

export const register = (data)    => api.post('/auth/register', data);
export const login    = (data)    => api.post('/auth/login', data);
export const updateProfile = (data) => api.patch('/auth/profile', data);
