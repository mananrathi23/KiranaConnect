import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPwd, role, businessName, shopName, address } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required' });
    }
    if (password !== confirmPwd) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (role === 'WHOLESALER' && !businessName) {
      return res.status(400).json({ message: 'businessName is required for wholesalers' });
    }
    if (role === 'SHOP_OWNER' && !shopName) {
      return res.status(400).json({ message: 'shopName is required for shop owners' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role, businessName, shopName, address });
    const token = signToken(user);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        shopName: user.shopName,
        address: user.address,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        shopName: user.shopName,
        address: user.address,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/auth/profile — update name/email/businessName/shopName/address/password
export const updateProfile = async (req, res) => {
  try {
    const { name, email, businessName, shopName, address, password, currentPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name)         user.name         = name;
    if (email)        user.email        = email;
    if (businessName) user.businessName = businessName;
    if (shopName)     user.shopName     = shopName;
    if (address)      user.address      = address;

    if (password) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password required' });
      const ok = await user.comparePassword(currentPassword);
      if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });
      user.password = password;
    }

    await user.save();
    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, businessName: user.businessName,
      shopName: user.shopName, address: user.address,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
