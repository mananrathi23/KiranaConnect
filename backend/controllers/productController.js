import Product from '../models/Product.js';
import User    from '../models/User.js';
import { redisGet, redisSetEx, redisDel } from '../utils/redisClient.js';

const CACHE_TTL    = 86400;          // 24 hours
const CACHE_KEY_ALL = 'products:all'; // base cache key — always invalidated on writes

// Snap lat/lng to 2 decimal places (~1.1km grid) so nearby users share a cache bucket
const bucketKey = (lat, lng, radius) =>
  `products:lat:${Number(lat).toFixed(2)}:lng:${Number(lng).toFixed(2)}:r:${radius}`;

// GET /api/products  — SHOP_OWNER (geo-filtered + Redis cached) / WHOLESALER (all their products)
export const getAllProducts = async (req, res) => {
  try {
    if (req.user.role === 'SHOP_OWNER') {
      const { lat, lng, radius = 10000 } = req.query; // radius in metres (default 10 km)
      const hasLocation = lat && lng;

      const CACHE_KEY = hasLocation
        ? bucketKey(lat, lng, radius)
        : 'products:all';

      // 1. Try Redis cache first
      const cached = await redisGet(CACHE_KEY);
      if (cached) {
        console.log(`[CACHE] ✅ HIT — ${CACHE_KEY}`);
        return res.json({ source: 'cache', products: JSON.parse(cached), radius: Number(radius) });
      }
      console.log(`[CACHE] ❌ MISS — fetching from MongoDB`);

      let products;

      if (hasLocation) {
        // 2a. Find all WHOLESALER users within `radius` metres using $geoNear
        const nearbyWholesalers = await User.aggregate([
          {
            $geoNear: {
              near:          { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
              distanceField: 'dist.calculated',   // adds dist.calculated (metres) to each doc
              maxDistance:   Number(radius),       // metres
              spherical:     true,
              query:         { role: 'WHOLESALER' },
            },
          },
          { $project: { _id: 1, name: 1, businessName: 1, 'dist.calculated': 1 } },
        ]);

        const wholesalerIds = nearbyWholesalers.map(w => w._id);
        console.log(`[GEO] Found ${wholesalerIds.length} wholesalers within ${radius}m of [${lat},${lng}]`);

        // 2b. Fetch products belonging to those wholesalers
        products = await Product.find({ wholesaler: { $in: wholesalerIds } })
          .populate('wholesaler', 'name businessName email location')
          .sort({ createdAt: -1 })
          .lean();

        // Attach distance info to each product for display
        const distMap = {};
        nearbyWholesalers.forEach(w => { distMap[w._id.toString()] = Math.round(w.dist.calculated); });
        products = products.map(p => ({
          ...p,
          wholesalerDistance: distMap[p.wholesaler._id.toString()] ?? null,
        }));
      } else {
        // 2b. No location — return all products (fallback)
        products = await Product.find()
          .populate('wholesaler', 'name businessName email location')
          .sort({ createdAt: -1 })
          .lean();
      }

      // 3. Cache the result
      await redisSetEx(CACHE_KEY, CACHE_TTL, JSON.stringify(products));
      return res.json({ source: 'db', products, radius: Number(radius) });
    }

    // WHOLESALER role — just return all products (no geo filter needed)
    const products = await Product.find()
      .populate('wholesaler', 'name businessName email')
      .sort({ createdAt: -1 })
      .lean();
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

    await redisDel(CACHE_KEY_ALL); // Invalidate base cache (geo-bucket caches expire via TTL)
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
    await redisDel(CACHE_KEY_ALL); // Invalidate base cache
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
    await redisDel(CACHE_KEY_ALL);
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
    await redisDel(CACHE_KEY_ALL);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
