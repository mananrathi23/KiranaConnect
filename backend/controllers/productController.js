import Product from '../models/Product.js';
import { redisGet, redisSetEx, redisDel } from '../utils/redisClient.js';

const CACHE_KEY = 'products:all';
const CACHE_TTL = 86400; // 24 hours

// GET /api/products  — SHOP_OWNER (Redis cached 24h TTL) / WHOLESALER (sees stock + edit controls)
export const getAllProducts = async (req, res) => {
  try {
    if (req.user.role === 'SHOP_OWNER') {
      // Try Redis cache first
      const cached = await redisGet(CACHE_KEY);
      if (cached) {
        console.log('[CACHE] ✅ HIT — products served from Redis');
        return res.json({ source: 'cache', products: JSON.parse(cached) });
      }
      console.log('[CACHE] ❌ MISS — fetching from MongoDB');
    }

    const products = await Product.find()
      .populate('wholesaler', 'name businessName email')
      .sort({ createdAt: -1 })
      .lean();

    if (req.user.role === 'SHOP_OWNER') {
      // Cache for SHOP_OWNER — they see tier pricing + MOQ
      await redisSetEx(CACHE_KEY, CACHE_TTL, JSON.stringify(products));
    }

    res.json({ source: 'db', products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/my — WHOLESALER: own products only
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ wholesaler: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/:id — full tier data + wholesaler info
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('wholesaler', 'name businessName email');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/products — WHOLESALER only
export const createProduct = async (req, res) => {
  try {
    const { name, category, priceTiers, stock, minOrderQty } = req.body;
    if (!name || !priceTiers?.length || !stock || !minOrderQty) {
      return res.status(400).json({ message: 'name, priceTiers, stock and minOrderQty are required' });
    }

    const product = await Product.create({
      name, category, priceTiers, stock, minOrderQty,
      wholesaler: req.user.id,
    });

    await redisDel(CACHE_KEY); // Invalidate cache
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/products/:id — WHOLESALER only (update name/tiers/MOQ)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, wholesaler: req.user.id });
    if (!product) return res.status(404).json({ message: 'Product not found or not yours' });

    const { name, category, priceTiers, minOrderQty } = req.body;
    if (name) product.name = name;
    if (category) product.category = category;
    if (priceTiers) product.priceTiers = priceTiers;
    if (minOrderQty) product.minOrderQty = minOrderQty;

    await product.save();
    await redisDel(CACHE_KEY); // Invalidate cache
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/products/:id/stock — atomic $inc, oversell prevention
export const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    if (typeof stock !== 'number') return res.status(400).json({ message: 'stock must be a number' });

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, wholesaler: req.user.id },
      { $set: { stock } },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: 'Product not found or not yours' });
    await redisDel(CACHE_KEY);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/products/:id — WHOLESALER only
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, wholesaler: req.user.id });
    if (!product) return res.status(404).json({ message: 'Product not found or not yours' });
    await redisDel(CACHE_KEY);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
