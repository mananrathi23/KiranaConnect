import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { getPriceForQty } from '../utils/pricingHelper.js';
import { sendOrderConfirmation } from '../utils/emailService.js';
import { generateInvoiceBuffer } from '../utils/invoiceGenerator.js';
import { getIo, getUserSocketId } from '../utils/socket.js';

// POST /api/orders — SHOP_OWNER places order with atomic stock decrement
export const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'items[] is required' });

    // Group items by wholesaler to create separate orders per wholesaler
    const wholesalerMap = {};

    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      if (item.quantity < product.minOrderQty) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Min order for "${product.name}" is ${product.minOrderQty} units` });
      }

      // ATOMIC STOCK DECREMENT — prevents race condition / overselling
      // If result is null → stock < requested qty → 409 Conflict
      const updated = await Product.findOneAndUpdate(
        { _id: product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true, session }
      );

      if (!updated) {
        await session.abortTransaction();
        return res.status(409).json({ message: `Insufficient stock for "${product.name}" (available: ${product.stock})` });
      }

      const wid = product.wholesaler.toString();
      if (!wholesalerMap[wid]) wholesalerMap[wid] = [];
      wholesalerMap[wid].push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: getPriceForQty(product.priceTiers, item.quantity),
        productName: product.name, // Temporary for email
      });
    }

    // Create one order per wholesaler
    const createdOrders = [];
    for (const [wholesalerId, orderItems] of Object.entries(wholesalerMap)) {
      const totalAmount = orderItems.reduce(
        (sum, i) => sum + i.priceAtPurchase * i.quantity, 0
      );
      
      const itemsForDb = orderItems.map(i => ({
        product: i.product,
        quantity: i.quantity,
        priceAtPurchase: i.priceAtPurchase
      }));

      const [order] = await Order.create(
        [{ shopOwner: req.user.id, wholesaler: wholesalerId, items: itemsForDb, totalAmount }],
        { session }
      );
      createdOrders.push({ order, emailItemsList: orderItems });
    }

    await session.commitTransaction();
    
    // Send emails asynchronously after transaction commits
    createdOrders.forEach(({ order, emailItemsList }) => {
      sendOrderConfirmation(req.user.email, order, emailItemsList);
      
      // Emit socket event to the wholesaler
      const wholesalerSocketId = getUserSocketId(order.wholesaler);
      if (wholesalerSocketId) {
        getIo().to(wholesalerSocketId).emit('new_order', {
          message: `New order #${order._id.toString().slice(-6)} received!`,
          orderId: order._id
        });
      }
    });

    res.status(201).json(createdOrders.map(c => c.order));
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

// GET /api/orders/my — SHOP_OWNER order history using $lookup (NO N+1)
export const getMyOrders = async (req, res) => {
  try {
    /**
     * N+1 Problem (naive): loop orders → per order fetch products → N DB calls
     * Solution: Single $lookup aggregation pipeline — one round trip
     */
    const orders = await Order.aggregate([
      { $match: { shopOwner: new mongoose.Types.ObjectId(req.user.id) } },
      { $sort: { createdAt: -1 } },
      // Join wholesaler info
      { $lookup: {
        from: 'users',
        localField: 'wholesaler',
        foreignField: '_id',
        as: 'wholesalerInfo',
        pipeline: [{ $project: { name: 1, businessName: 1, email: 1 } }],
      }},
      { $unwind: { path: '$wholesalerInfo', preserveNullAndEmptyArrays: true } },
      // Join product info for each item
      { $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productDetails',
        pipeline: [{ $project: { name: 1, category: 1 } }],
      }},
      // Merge product name into each item
      { $addFields: {
        items: {
          $map: {
            input: '$items',
            as: 'item',
            in: {
              $mergeObjects: [
                '$$item',
                { productName: {
                  $let: {
                    vars: { p: { $first: { $filter: { input: '$productDetails', as: 'pd', cond: { $eq: ['$$pd._id', '$$item.product'] } } } } },
                    in: '$$p.name'
                  }
                }}
              ]
            }
          }
        }
      }},
      { $project: { productDetails: 0 } },
    ]);

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/incoming — WHOLESALER inbox
export const getIncomingOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const match = { wholesaler: new mongoose.Types.ObjectId(req.user.id) };
    if (status) match.status = status;

    const orders = await Order.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $lookup: {
        from: 'users',
        localField: 'shopOwner',
        foreignField: '_id',
        as: 'shopOwnerInfo',
        pipeline: [{ $project: { name: 1, shopName: 1, email: 1 } }],
      }},
      { $unwind: { path: '$shopOwnerInfo', preserveNullAndEmptyArrays: true } },
      { $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productDetails',
        pipeline: [{ $project: { name: 1, category: 1 } }],
      }},
      { $addFields: {
        items: {
          $map: {
            input: '$items',
            as: 'item',
            in: {
              $mergeObjects: [
                '$$item',
                { productName: {
                  $let: {
                    vars: { p: { $first: { $filter: { input: '$productDetails', as: 'pd', cond: { $eq: ['$$pd._id', '$$item.product'] } } } } },
                    in: '$$p.name'
                  }
                }}
              ]
            }
          }
        }
      }},
      { $project: { productDetails: 0 } },
    ]);

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/:id
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('shopOwner', 'name shopName')
      .populate('wholesaler', 'name businessName')
      .populate('items.product', 'name category');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Auth: must be the shop owner or wholesaler
    const uid = req.user.id;
    if (order.shopOwner._id.toString() !== uid && order.wholesaler._id.toString() !== uid) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/orders/:id/status — WHOLESALER accept/reject/dispatch
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['BATCHED', 'DISPATCHED', 'CANCELLED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, wholesaler: req.user.id },
      { $set: { status } },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Emit socket event to the shop owner
    const shopOwnerSocketId = getUserSocketId(order.shopOwner);
    if (shopOwnerSocketId) {
      getIo().to(shopOwnerSocketId).emit('order_status_update', {
        message: `Your order #${order._id.toString().slice(-6)} is now ${status}`,
        orderId: order._id,
        status: status
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/:id/invoice
export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('shopOwner', 'name shopName')
      .populate('wholesaler', 'name businessName')
      .populate('items.product', 'name category');
      
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Auth: must be the shop owner or wholesaler
    const uid = req.user.id;
    if (order.shopOwner._id.toString() !== uid && order.wholesaler._id.toString() !== uid) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const emailItemsList = order.items.map(item => ({
      productName: item.product.name,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase
    }));

    const pdfBuffer = await generateInvoiceBuffer(order, order.shopOwner.name, emailItemsList);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${order._id}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
