// src/api/analytics.js
import api from './index.js';

export const getSummary          = () => api.get('/analytics/summary');
export const getTopProducts      = () => api.get('/analytics/top-products');
export const getOrdersTimeline   = () => api.get('/analytics/orders-timeline');
export const getRevenueByCategory= () => api.get('/analytics/revenue-by-category');
