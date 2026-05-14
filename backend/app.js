import express  from 'express';
import cors     from 'cors';
import 'dotenv/config';

import authRoutes      from './routes/authRoutes.js';
import productRoutes   from './routes/productRoutes.js';
import orderRoutes     from './routes/orderRoutes.js';
import batchRoutes     from './routes/batchRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import khataRoutes     from './routes/khataRoutes.js';

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// Routes
app.use('/api/auth',      authRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/batches',   batchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/khata',     khataRoutes);

// 404 handler
app.use((_, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

export default app;
