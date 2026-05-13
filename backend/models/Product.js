import mongoose from 'mongoose';

const priceTierSchema = new mongoose.Schema({
  minQty: { type: Number, required: true },
  price:  { type: Number, required: true },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  category:    { type: String, required: true, enum: ['Staples', 'Dairy', 'Oils', 'Cleaning', 'Snacks', 'Beverages'], default: 'Staples' },
  wholesaler:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  priceTiers:  { type: [priceTierSchema], required: true, validate: v => v.length > 0 },
  stock:       { type: Number, required: true, min: 0, default: 0 },
  minOrderQty: { type: Number, required: true, min: 1 },
}, { timestamps: true });

// Index for faster product listing by wholesaler
productSchema.index({ wholesaler: 1 });

export default mongoose.model('Product', productSchema);
