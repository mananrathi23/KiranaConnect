import mongoose from 'mongoose';

const khataEntrySchema = new mongoose.Schema({
  orderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount:     { type: Number, required: true },
  note:       { type: String, default: '' },
  settledAt:  { type: Date, default: null },
}, { timestamps: true });

const khataSchema = new mongoose.Schema({
  wholesaler:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopOwner:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalOutstanding: { type: Number, default: 0, min: 0 },
  // OPEN → SETTLEMENT_REQUESTED (shop pays) → SETTLED (wholesaler confirms)
  status:           { type: String, enum: ['OPEN', 'SETTLEMENT_REQUESTED', 'SETTLED'], default: 'OPEN' },
  settlementRequestedAt: { type: Date, default: null }, // when shop owner clicked "Settle"
  entries:          { type: [khataEntrySchema], default: [] },
}, { timestamps: true });

// One ledger doc per (wholesaler ↔ shopOwner) pair
khataSchema.index({ wholesaler: 1, shopOwner: 1 }, { unique: true });
// Fast lookups for Wholesaler ledger view
khataSchema.index({ wholesaler: 1, status: 1 });
// Fast lookups for Shop Owner Khata view
khataSchema.index({ shopOwner: 1 });

export default mongoose.model('Khata', khataSchema);
