// src/api/khata.js
import api from './index.js';

// SHOP_OWNER
export const placeKhataOrder  = (data)    => api.post('/khata', data);
export const getMyKhata        = ()        => api.get('/khata/my');
export const settleByShop      = (id)      => api.patch(`/khata/${id}/settle-by-shop`);

// WHOLESALER
export const getLedger         = ()        => api.get('/khata/ledger');
export const getKhataSummary   = ()        => api.get('/khata/summary');
export const settleKhata       = (id)      => api.patch(`/khata/${id}/settle`);
