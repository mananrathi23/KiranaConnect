import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  wholesaler:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orders:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  status:      { type: String, enum: ['CREATED', 'DISPATCHED'], default: 'CREATED' },
}, { timestamps: true });

batchSchema.index({ wholesaler: 1, status: 1 });

export default mongoose.model('Batch', batchSchema);
