import mongoose from 'mongoose';
import Khata   from '../models/Khata.js';
import Order   from '../models/Order.js';
import Product from '../models/Product.js';
import User    from '../models/User.js';

// ─────────────────────────────────────────────────────────────
// POST /api/khata/entry  — SHOP_OWNER: place an order on Khata
// ─────────────────────────────────────────────────────────────
export const placeKhataOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { items } = req.body; // [{ product, quantity }]
    if (!items?.length) return res.status(400).json({ message: 'items are required' });

    // 1. Fetch products + validate wholesaler consistency
    const productIds = items.map(i => i.product);
    const products   = await Product.find({ _id: { $in: productIds } }).lean();
    if (products.length !== items.length)
      return res.status(404).json({ message: 'One or more products not found' });

    const wholesalerId = products[0].wholesaler.toString();
    if (products.some(p => p.wholesaler.toString() !== wholesalerId))
      return res.status(400).json({ message: 'All items in a Khata order must belong to the same wholesaler' });

    // 2. Calculate total
    let totalAmount = 0;
    const orderItems = items.map(({ product, quantity }) => {
      const prod = products.find(p => p._id.toString() === product.toString());
      // Pick best tier price for the quantity
      const tiers = [...prod.priceTiers].sort((a, b) => b.minQty - a.minQty);
      const tier  = tiers.find(t => quantity >= t.minQty) || prod.priceTiers[0];
      const priceAtPurchase = tier.price;
      totalAmount += priceAtPurchase * quantity;
      return { product, quantity, priceAtPurchase };
    });

    // 3. Khata credit-limit check
    const shopOwner = await User.findById(req.user.id).lean();
    const existingKhata = await Khata.findOne({ wholesaler: wholesalerId, shopOwner: req.user.id }).lean();
    const currentOutstanding = existingKhata?.totalOutstanding ?? 0;

    if (currentOutstanding + totalAmount > shopOwner.khataLimit) {
      await session.abortTransaction();
      return res.status(402).json({
        message: `Khata limit exceeded. Outstanding: ₹${currentOutstanding}, Limit: ₹${shopOwner.khataLimit}, Order: ₹${totalAmount}`,
        outstanding: currentOutstanding,
        limit: shopOwner.khataLimit,
        orderTotal: totalAmount,
      });
    }

    // 4. Atomic stock decrement for all items
    for (const { product, quantity } of items) {
      const updated = await Product.findOneAndUpdate(
        { _id: product, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { session }
      );
      if (!updated) {
        await session.abortTransaction();
        const p = products.find(pr => pr._id.toString() === product.toString());
        return res.status(409).json({ message: `Insufficient stock for "${p?.name}"` });
      }
    }

    // 5. Create Order with paymentMode: KHATA
    const [order] = await Order.create([{
      shopOwner:   req.user.id,
      wholesaler:  wholesalerId,
      items:       orderItems,
      totalAmount,
      paymentMode: 'KHATA',
      status:      'PENDING',
    }], { session });

    // 6. Upsert Khata doc — create if first order, update if existing
    const note = `Order placed on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    const khata = await Khata.findOneAndUpdate(
      { wholesaler: wholesalerId, shopOwner: req.user.id },
      {
        $inc:  { totalOutstanding: totalAmount },
        $push: { entries: { orderId: order._id, amount: totalAmount, note } },
        $set:  { status: 'OPEN' },
      },
      { upsert: true, new: true, session, setDefaultsOnInsert: true }
    );

    await session.commitTransaction();
    res.status(201).json({ order, khata });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/khata/my  — SHOP_OWNER: my outstanding khata entries
// ─────────────────────────────────────────────────────────────
export const getMyKhata = async (req, res) => {
  try {
    const khatas = await Khata.find({ shopOwner: req.user.id })
      .populate('wholesaler', 'name businessName email')
      .sort({ updatedAt: -1 })
      .lean();
    res.json(khatas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/khata/:id/settle-by-shop  — SHOP_OWNER: REQUEST settlement
// Does NOT clear the balance — Wholesaler must verify first
// ─────────────────────────────────────────────────────────────
export const settleByShop = async (req, res) => {
  try {
    const khata = await Khata.findOne({ _id: req.params.id, shopOwner: req.user.id });
    if (!khata) return res.status(404).json({ message: 'Khata not found' });
    if (khata.totalOutstanding === 0)  return res.status(400).json({ message: 'No outstanding balance to settle' });
    if (khata.status === 'SETTLEMENT_REQUESTED')
      return res.status(400).json({ message: 'Settlement already requested — waiting for wholesaler to verify' });

    // Mark as requested — balance stays until wholesaler confirms
    khata.status                  = 'SETTLEMENT_REQUESTED';
    khata.settlementRequestedAt   = new Date();
    await khata.save();
    res.json({ ...khata.toObject(), message: 'Settlement requested. Awaiting wholesaler verification.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/khata/ledger  — WHOLESALER: all open + pending-settlement khatas
// ─────────────────────────────────────────────────────────────
export const getLedger = async (req, res) => {
  try {
    // Return OPEN and SETTLEMENT_REQUESTED (not yet confirmed by wholesaler)
    const khatas = await Khata.find({
      wholesaler: req.user.id,
      status: { $in: ['OPEN', 'SETTLEMENT_REQUESTED'] },
    })
      .populate('shopOwner', 'name shopName email')
      .sort({ status: -1, totalOutstanding: -1 }) // SETTLEMENT_REQUESTED first, then by amount
      .lean();

    const totalReceivable = khatas.reduce((sum, k) => sum + k.totalOutstanding, 0);
    const pendingCount    = khatas.filter(k => k.status === 'SETTLEMENT_REQUESTED').length;
    res.json({ totalReceivable, pendingCount, khatas });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/khata/:id/settle  — WHOLESALER: VERIFY & CONFIRM settlement
// This is the final step — only wholesaler can clear the balance
// ─────────────────────────────────────────────────────────────
export const settleKhata = async (req, res) => {
  try {
    const khata = await Khata.findOne({ _id: req.params.id, wholesaler: req.user.id });
    if (!khata) return res.status(404).json({ message: 'Khata not found or not yours' });
    if (khata.status === 'SETTLED') return res.status(400).json({ message: 'Already settled' });

    const now = new Date();
    khata.entries.forEach(e => { if (!e.settledAt) e.settledAt = now; });
    khata.totalOutstanding      = 0;
    khata.status                = 'SETTLED';
    khata.settlementRequestedAt = khata.settlementRequestedAt ?? now;
    await khata.save();
    res.json(khata);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/khata/summary  — WHOLESALER: total receivables summary
// ─────────────────────────────────────────────────────────────
export const getKhataSummary = async (req, res) => {
  try {
    const [result] = await Khata.aggregate([
      { $match: { wholesaler: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: {
        _id:                null,
        totalReceivable:    { $sum: '$totalOutstanding' },
        openCount:          { $sum: { $cond: [{ $eq: ['$status', 'OPEN'] }, 1, 0] } },
        pendingSettlement:  { $sum: { $cond: [{ $eq: ['$status', 'SETTLEMENT_REQUESTED'] }, 1, 0] } },
        settledCount:       { $sum: { $cond: [{ $eq: ['$status', 'SETTLED'] }, 1, 0] } },
      }},
    ]);
    res.json(result ?? { totalReceivable: 0, openCount: 0, pendingSettlement: 0, settledCount: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
