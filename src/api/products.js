// src/api/products.js
import api from './index.js';

// SHOP_OWNER — geo-filtered + Redis cached list
// Reads saved coordinates from localStorage (stored by AuthContext on login/register)
export const getAllProducts = async (radius = 10000) => {
  const stored = JSON.parse(localStorage.getItem('kc_user') || '{}');
  const coords = stored?.location?.coordinates; // [lng, lat] in GeoJSON order
  const params = {};
  if (coords && coords[0] !== 0 && coords[1] !== 0) {
    params.lng    = coords[0];
    params.lat    = coords[1];
    params.radius = radius;
  }
  const res = await api.get('/products', { params });
  // Backend returns { source, products, radius } — we only need the array
  return Array.isArray(res) ? res : res.products ?? [];
};

// Same as above but caller provides explicit radius (for Browse page slider)
export const getProductsWithRadius = (radius) => getAllProducts(radius);

// WHOLESALER — own products
export const getMyProducts  = ()       => api.get('/products/my');
export const getProduct     = (id)     => api.get(`/products/${id}`);
export const createProduct  = (data)   => api.post('/products', data);
export const updateProduct  = (id, data) => api.patch(`/products/${id}`, data);
export const updateStock    = (id, stock) => api.patch(`/products/${id}/stock`, { stock });
export const deleteProduct  = (id)     => api.delete(`/products/${id}`);
