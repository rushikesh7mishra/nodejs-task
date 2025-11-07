const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

module.exports = (agenda) => {
  agenda.define('orderTimeout', { concurrency: 5 }, async (job, done) => {
    const { orderId } = job.attrs.data || {};
    if (!orderId) {
      console.warn('orderTimeout called without orderId');
      return done();
    }
    console.log('[orderTimeout] start', orderId);

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const order = await Order.findById(orderId).session(session);
      if (!order) {
        console.log('[orderTimeout] order not found, nothing to do', orderId);
        await session.commitTransaction();
        session.endSession();
        return done();
      }

      if (order.status !== 'PENDING_PAYMENT') {
        console.log('[orderTimeout] order not pending (status=%s), skip', order.status, orderId);
        await session.commitTransaction();
        session.endSession();
        return done();
      }

      order.status = 'CANCELLED';
      order.statusHistory.push({ status: 'CANCELLED', by: null });
      await order.save({ session });

      for (const it of order.items) {
        try {
          const prod = await Product.findById(it.product).session(session);
          if (!prod) {
            console.warn('[orderTimeout] product not found while releasing stock', it.product);
            continue;
          }
          prod.reservedStock = Math.max(0, (prod.reservedStock || 0) - (it.quantity || 0));
          prod.availableStock = (prod.availableStock || 0) + (it.quantity || 0);
          await prod.save({ session });
        } catch (pErr) {
          console.error('[orderTimeout] product release failed for', it.product, pErr);
        }
      }

      await session.commitTransaction();
      session.endSession();

      console.log('[orderTimeout] order auto-cancelled successfully', orderId);
      return done();
    } catch (err) {
      try { await session.abortTransaction(); session.endSession(); } catch (e) { /* ignore */ }
      console.error('[orderTimeout] job failed for', orderId, err);
      return done(err);
    }
  });
};
