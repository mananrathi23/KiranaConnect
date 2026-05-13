import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product:          { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity:         { type: Number, required: true, min: 1 },
  priceAtPurchase:  { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  shopOwner:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wholesaler:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // for cron grouping
  items:        { type: [orderItemSchema], required: true, validate: v => v.length > 0 },
  totalAmount:  { type: Number, required: true },
  status:       { type: String, enum: ['PENDING', 'BATCHED', 'DISPATCHED', 'CANCELLED'], default: 'PENDING' },
  batchId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null },
}, { timestamps: true });

// Indexes for cron job and dashboard queries
orderSchema.index({ wholesaler: 1, status: 1 });
orderSchema.index({ shopOwner: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);
