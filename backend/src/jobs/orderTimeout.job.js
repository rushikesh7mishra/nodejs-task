const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

module.exports = (agenda) => {
  agenda.define('orderTimeout', { concurrency: 5 }, async job => {
    const { orderId } = job.attrs.data || {};
    if (!orderId) return;
    console.log('orderTimeout job running for', orderId);

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        await session.commitTransaction();
        session.endSession();
        return;
      }
      if (order.status !== 'PENDING_PAYMENT') {
        await session.commitTransaction();
        session.endSession();
        return;
      }

      // cancel order and release reserved stock
      order.status = 'CANCELLED';
      order.statusHistory.push({ status: 'CANCELLED', by: null });
      await order.save({ session });

      for (const it of order.items) {
        const prod = await Product.findById(it.product).session(session);
        if (!prod) continue;
        prod.reservedStock -= it.quantity;
        prod.availableStock += it.quantity;
        await prod.save({ session });
      }

      await session.commitTransaction();
      session.endSession();
      console.log('Order auto-cancelled', orderId);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error('orderTimeout job error', err);
      throw err;
    }
  });
};
