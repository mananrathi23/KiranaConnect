import cron from 'node-cron';
import Order from '../models/Order.js';
import Batch from '../models/Batch.js';


const batchJob = () => {
  cron.schedule('0 */6 * * *', async () => {
    console.log(`\n[CRON] ⏰ Batch job triggered at ${new Date().toISOString()}`);

    try {
      // Find all PENDING orders
      const pendingOrders = await Order.find({ status: 'PENDING' }).lean();

      if (!pendingOrders.length) {
        console.log('[CRON] No pending orders — nothing to batch.');
        return;
      }

      // Group orders by wholesaler
      const groups = {};
      for (const order of pendingOrders) {
        const wid = order.wholesaler.toString();
        if (!groups[wid]) groups[wid] = [];
        groups[wid].push(order);
      }

      const windowStart = new Date(Date.now() - 6 * 60 * 60 * 1000);

      for (const [wholesalerId, orders] of Object.entries(groups)) {
        // IDEMPOTENCY CHECK — skip if this wholesaler already has an open batch in this window
        const existingBatch = await Batch.findOne({
          wholesaler: wholesalerId,
          status: 'CREATED',
          createdAt: { $gte: windowStart },
        });

        if (existingBatch) {
          console.log(`[CRON] Wholesaler ${wholesalerId} — open batch exists, skipping.`);
          continue;
        }

        // Create the batch document
        const batch = await Batch.create({
          wholesaler: wholesalerId,
          orders: orders.map(o => o._id),
          status: 'CREATED',
        });

        // Update all PENDING orders → BATCHED + set batchId
        await Order.updateMany(
          { _id: { $in: orders.map(o => o._id) } },
          { $set: { status: 'BATCHED', batchId: batch._id } }
        );

        console.log(`[CRON] Batch ${batch._id} created for wholesaler ${wholesalerId} — ${orders.length} orders`);
      }

      console.log('[CRON] ✅ Batch job complete.\n');
    } catch (err) {
      console.error('[CRON] ❌ Error:', err.message);
    }
  });

  console.log('[CRON] Batch job scheduled — fires every 6 hours (0 */6 * * *)');
};

export default batchJob;
