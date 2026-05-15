// src/api/orders.js
import api from './index.js';

export const placeOrder        = (data)         => api.post('/orders', data);
export const getMyOrders       = ()             => api.get('/orders/my');
export const getIncomingOrders = (status)       => api.get('/orders/incoming', { params: status ? { status } : {} });
export const getOrder          = (id)           => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status)   => api.patch(`/orders/${id}/status`, { status });
export const downloadInvoice   = (id)           => api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
