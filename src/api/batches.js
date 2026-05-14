// src/api/batches.js
import api from './index.js';

export const getBatches      = ()   => api.get('/batches');
export const getNextDispatch = ()   => api.get('/batches/next-dispatch');
export const getBatch        = (id) => api.get(`/batches/${id}`);
export const dispatchBatch   = (id) => api.patch(`/batches/${id}/dispatch`);
