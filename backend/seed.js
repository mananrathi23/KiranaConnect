import mongoose from 'mongoose';
import 'dotenv/config';
import User from './models/User.js';
import Product from './models/Product.js';

const PASSWORD = '12345678';

// Realistic Jaipur Coordinates [Longitude, Latitude]
const wholesalerCoords = [
  [75.7811, 26.9124], // W1
  [75.7922, 26.9011], // W2
  [75.7745, 26.9234], // W3
  [75.8056, 26.8945], // W4
  [75.7689, 26.8876], // W5
];

const kiranaCoords = [
  [75.7850, 26.9150], // ~500m from W1
  [75.7960, 26.9050], // ~500m from W2
  [75.7710, 26.9200], // ~600m from W3
  [75.8010, 26.8900], // ~800m from W4
  [75.7600, 26.8800], // ~1.2km from W5
];

const categories = ['Staples', 'Dairy', 'Oils', 'Cleaning', 'Snacks', 'Beverages'];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Create Wholesalers
    const wholesalers = [];
    for (let i = 0; i < 5; i++) {
      const email = `wholesaler${i + 1}@kiranaconnect.com`;
      // Delete existing to avoid conflicts
      await User.deleteOne({ email });
      
      const w = await User.create({
        name: `Wholesaler User ${i + 1}`,
        email,
        password: PASSWORD,
        role: 'WHOLESALER',
        businessName: `Mega Distributors ${i + 1}`,
        address: `Sector ${i + 1}, Main Market, Jaipur`,
        location: { type: 'Point', coordinates: wholesalerCoords[i] }
      });
      wholesalers.push(w);
    }
    console.log('✅ Created 5 Wholesalers');

    // 2. Create Kirana Shops
    const kiranas = [];
    for (let i = 0; i < 5; i++) {
      const email = `kirana${i + 1}@kiranaconnect.com`;
      await User.deleteOne({ email });

      const k = await User.create({
        name: `Kirana Owner ${i + 1}`,
        email,
        password: PASSWORD,
        role: 'SHOP_OWNER',
        shopName: `Sharma Kirana Store ${i + 1}`,
        address: `Lane ${i + 1}, Residential Area, Jaipur`,
        khataLimit: 15000 + (i * 5000), // 15k to 35k limits
        location: { type: 'Point', coordinates: kiranaCoords[i] }
      });
      kiranas.push(k);
    }
    console.log('✅ Created 5 Kirana Shops');

    // 3. Delete existing products from these wholesalers just to keep it clean
    await Product.deleteMany({ wholesaler: { $in: wholesalers.map(w => w._id) } });

    // 4. Create Products
    const productsData = [
      { name: 'Aashirvaad Atta (10kg)', cat: 'Staples', price: 380, w: 0 },
      { name: 'India Gate Basmati (5kg)', cat: 'Staples', price: 420, w: 0 },
      { name: 'Amul Taaza Milk (1L) Carton', cat: 'Dairy', price: 65, w: 1 },
      { name: 'Amul Butter (500g)', cat: 'Dairy', price: 230, w: 1 },
      { name: 'Fortune Soyabean Oil (1L)', cat: 'Oils', price: 110, w: 2 },
      { name: 'Saffola Gold (1L)', cat: 'Oils', price: 160, w: 2 },
      { name: 'Surf Excel Matic (2kg)', cat: 'Cleaning', price: 390, w: 3 },
      { name: 'Vim Dishwash Liquid (500ml)', cat: 'Cleaning', price: 95, w: 3 },
      { name: 'Haldiram Bhujia (1kg)', cat: 'Snacks', price: 210, w: 4 },
      { name: 'Lays Classic Salted (Box of 50)', cat: 'Snacks', price: 450, w: 4 },
      { name: 'Coca Cola (2.25L)', cat: 'Beverages', price: 85, w: 0 },
      { name: 'Frooti Mango (1L)', cat: 'Beverages', price: 60, w: 1 },
      { name: 'Tata Salt (1kg)', cat: 'Staples', price: 22, w: 2 },
      { name: 'Dhara Mustard Oil (1L)', cat: 'Oils', price: 130, w: 3 },
      { name: 'Harpic Toilet Cleaner (1L)', cat: 'Cleaning', price: 165, w: 4 },
    ];

    for (const p of productsData) {
      await Product.create({
        name: p.name,
        category: p.cat,
        wholesaler: wholesalers[p.w]._id,
        stock: Math.floor(Math.random() * 500) + 100, // 100 to 600
        minOrderQty: Math.floor(Math.random() * 10) + 5, // 5 to 15
        priceTiers: [
          { minQty: 1, price: p.price },
          { minQty: 20, price: Math.floor(p.price * 0.95) }, // 5% off
          { minQty: 50, price: Math.floor(p.price * 0.90) }, // 10% off
        ]
      });
    }
    console.log(`✅ Created ${productsData.length} Products with Tiered Pricing`);

    console.log('🎉 Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

seedData();
