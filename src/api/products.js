// src/api/products.js
import api from './index.js';

// SHOP_OWNER — Redis cached list
export const getAllProducts = async () => {
  const res = await api.get('/products');
  // Backend returns { source, products } — we only need the array
  return Array.isArray(res) ? res : res.products ?? [];
};

// WHOLESALER — own products
export const getMyProducts  = ()       => api.get('/products/my');
export const getProduct     = (id)     => api.get(`/products/${id}`);
export const createProduct  = (data)   => api.post('/products', data);
export const updateProduct  = (id, data) => api.patch(`/products/${id}`, data);
export const updateStock    = (id, stock) => api.patch(`/products/${id}/stock`, { stock });
export const deleteProduct  = (id)     => api.delete(`/products/${id}`);
