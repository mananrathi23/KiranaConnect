import mongoose from 'mongoose';
import Batch from '../models/Batch.js';
import Order from '../models/Order.js';
import { sendBatchDispatchNotification } from '../utils/emailService.js';

// GET /api/batches — WHOLESALER: all their batches
export const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find({ wholesaler: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'orders',
        select: 'totalAmount items status shopOwner',
        populate: [
          { path: 'shopOwner', select: 'name shopName' },
          { path: 'items.product', select: 'name category' },
        ],
      });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/batches/next-dispatch — countdown + pending orders
export const getNextDispatch = async (req, res) => {
  try {
    const query = req.user.role === 'WHOLESALER'
      ? { wholesaler: req.user.id, status: 'PENDING' }
      : { shopOwner: req.user.id, status: 'PENDING' };

    const pendingOrders = await Order.find(query)
      .populate('items.product', 'name')
      .populate(req.user.role === 'WHOLESALER' ? 'shopOwner' : 'wholesaler', 'name shopName businessName')
      .sort({ createdAt: -1 });

    // Next 6-hour window
    const now = new Date();
    const nextHour = (Math.ceil(now.getHours() / 6) * 6) % 24;
    const nextDispatch = new Date(now);
    nextDispatch.setHours(nextHour, 0, 0, 0);
    if (nextDispatch <= now) nextDispatch.setDate(nextDispatch.getDate() + 1);

    res.json({ nextDispatch, pendingOrders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/batches/:id — batch detail
export const getBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate({
      path: 'orders',
      populate: [
        { path: 'shopOwner', select: 'name shopName' },
        { path: 'items.product', select: 'name category' },
      ],
    });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/batches/:id/dispatch — WHOLESALER dispatch a batch
export const dispatchBatch = async (req, res) => {
  try {
    const batch = await Batch.findOneAndUpdate(
      { _id: req.params.id, wholesaler: req.user.id, status: 'CREATED' },
      { $set: { status: 'DISPATCHED' } },
      { new: true }
    ).populate({
      path: 'orders',
      populate: { path: 'shopOwner', select: 'name email' }
    });
    if (!batch) return res.status(404).json({ message: 'Batch not found or already dispatched' });

    await Order.updateMany(
      { batchId: batch._id },
      { $set: { status: 'DISPATCHED' } }
    );

    // Send dispatch emails asynchronously
    const shopOwners = new Map();
    batch.orders.forEach(order => {
      if (order.shopOwner && order.shopOwner.email) {
        shopOwners.set(order.shopOwner._id.toString(), order.shopOwner);
      }
    });

    shopOwners.forEach((owner) => {
      sendBatchDispatchNotification(owner.email, owner.name, batch);
    });

    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
