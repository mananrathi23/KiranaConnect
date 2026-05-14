import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, index: true },
  password:     { type: String, required: true, select: false }, // never returned in response
  role:         { type: String, enum: ['WHOLESALER', 'SHOP_OWNER'], required: true },
  businessName: { type: String }, // WHOLESALER only
  shopName:     { type: String }, // SHOP_OWNER only
  address:      { type: String },
  khataLimit:   { type: Number, default: 5000 }, // max credit in ₹ for SHOP_OWNER
  // GeoJSON Point — coordinates: [longitude, latitude] (MongoDB order)
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password helper
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// 2dsphere index enables $geoNear, $near, $geoWithin queries
userSchema.index({ location: '2dsphere' });

// Never return password
userSchema.set('toJSON', {
  transform: (_, obj) => { delete obj.password; return obj; }
});

export default mongoose.model('User', userSchema);
