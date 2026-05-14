import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const wId = (id) => new mongoose.Types.ObjectId(id);

// GET /api/analytics/summary
export const getSummary = async (req, res) => {
  try {
    const [result] = await Order.aggregate([
      { $match: { wholesaler: wId(req.user.id) } },
      { $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        orderCount:   { $sum: 1 },
        avgOrderValue: { $avg: '$totalAmount' },
      }},
    ]);

    const pending    = await Order.countDocuments({ wholesaler: req.user.id, status: 'PENDING' });
    const lowStock   = await Product.countDocuments({ wholesaler: req.user.id, stock: { $lt: 100 } });
    const totalProds = await Product.countDocuments({ wholesaler: req.user.id });

    res.json({
      totalRevenue:  result?.totalRevenue  || 0,
      orderCount:    result?.orderCount    || 0,
      avgOrderValue: Math.round(result?.avgOrderValue || 0),
      pendingOrders: pending,
      lowStockCount: lowStock,
      totalProducts: totalProds,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/analytics/top-products — $lookup aggregation (no N+1)
export const getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { wholesaler: wId(req.user.id) } },
      { $unwind: '$items' },
      { $group: {
        _id:      '$items.product',
        revenue:  { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } },
        orders:   { $sum: 1 },
        totalQty: { $sum: '$items.quantity' },
      }},
      // $lookup instead of N+1 per-product fetch
      { $lookup: {
        from:         'products',
        localField:   '_id',
        foreignField: '_id',
        as:           'product',
        pipeline: [{ $project: { name: 1, category: 1 } }],
      }},
      { $unwind: '$product' },
      { $project: {
        name:     '$product.name',
        category: '$product.category',
        revenue:  1,
        orders:   1,
        totalQty: 1,
      }},
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    // Add percentage relative to top product
    const maxRevenue = topProducts[0]?.revenue || 1;
    const withPercent = topProducts.map(p => ({
      ...p,
      percent: Math.round((p.revenue / maxRevenue) * 100),
    }));

    res.json(withPercent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/analytics/orders-timeline — grouped by date (last 7 days)
export const getOrdersTimeline = async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const timeline = await Order.aggregate([
      { $match: { wholesaler: wId(req.user.id), createdAt: { $gte: since } } },
      { $group: {
        _id:     { $dateToString: { format: '%b %d', date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        count:   { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);
    res.json(timeline.map(d => ({ date: d._id, revenue: d.revenue, count: d.count })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/analytics/revenue-by-category
export const getRevenueByCategory = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $match: { wholesaler: wId(req.user.id) } },
      { $unwind: '$items' },
      { $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'prod',
        pipeline: [{ $project: { category: 1 } }],
      }},
      { $unwind: '$prod' },
      { $group: {
        _id:     '$prod.category',
        revenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } },
      }},
      { $sort: { revenue: -1 } },
    ]);

    const total = data.reduce((s, d) => s + d.revenue, 0) || 1;
    const COLORS = { Staples: '#ADD8E6', Dairy: '#F97316', Oils: '#10B981', Cleaning: '#8B5CF6', Snacks: '#F59E0B', Beverages: '#06B6D4' };

    res.json(data.map(d => ({
      category: d._id,
      revenue:  d.revenue,
      percent:  Math.round((d.revenue / total) * 100),
      color:    COLORS[d._id] || '#94A3B8',
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
