const mongoose = require('mongoose');
const crypto = require('crypto');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { asyncHandler } = require('../utils/asyncHandler');
const { getAgenda } = require('../jobs/agenda');
const razor = require('../services/razorpay.service');
const config = require('../config');
const { sendOrderConfirmation } = require('../services/email.service');

// Checkout: reserve stock and create order atomically
exports.checkout = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  console.log('[checkout] start for', userId);

  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    console.log('[checkout] cart empty for', userId);
    return res.status(400).json({ message: 'Cart is empty' });
  }
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    console.warn('[checkout] transactions not available, proceeding without session:', err.message);
    session = null;
  }

  try {
    for (const item of cart.items) {
      if (!item.product || !item.product._id) throw new Error('Cart item missing product reference');
      const prodQuery = Product.findById(item.product._id);
      const prod = session ? await prodQuery.session(session) : await prodQuery;
      if (!prod) throw new Error(`Product not found: ${item.product._id}`);
      if (prod.availableStock < item.quantity) throw new Error(`Insufficient stock for ${prod.name}`);

      prod.availableStock -= item.quantity;
      prod.reservedStock += item.quantity;
      if (session) await prod.save({ session });
      else await prod.save();
    }

    const items = cart.items.map(i => ({
      product: i.product._id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity
    }));
    const totalAmount = items.reduce((s, it) => s + (it.price * it.quantity), 0);

    const order = new Order({
      user: userId,
      items,
      totalAmount,
      status: 'PENDING_PAYMENT',
      statusHistory: [{ status: 'PENDING_PAYMENT', by: userId }]
    });

    if (session) await order.save({ session });
    else await order.save();

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    try {
      const agenda = getAgenda();
      if (agenda && typeof agenda.schedule === 'function') {
        await agenda.schedule('in 15 minutes', 'orderTimeout', { orderId: order._id.toString() });
        console.log('[checkout] scheduled orderTimeout for', order._id.toString());
      } else {
        console.warn('[checkout] agenda not ready — skipped scheduling for', order._id.toString());
      }
    } catch (jobErr) {
      console.error('[checkout] failed to schedule job (non-fatal):', jobErr);
    }

    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    console.log('[checkout] success orderId', order._id.toString());
    res.status(201).json({ orderId: order._id, status: order.status, totalAmount });
  } catch (err) {
    try {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
    } catch (e) {
      console.error('[checkout] error aborting transaction', e);
    }
    console.error('[checkout] failed:', err);
    return res.status(500).json({ message: err.message || 'Checkout failed' });
  }
});

exports.payOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user.toString() !== userId && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  if (order.status !== 'PENDING_PAYMENT') return res.status(400).json({ message: 'Order not in PENDING_PAYMENT' });

  const paymentSuccess = true; 

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    console.warn('[payOrder] transactions not available, proceeding without session:', err.message);
    session = null;
  }

  try {
    const payment = new Payment({
      order: order._id,
      amount: order.totalAmount,
      transactionId: `txn_${Date.now()}`,
      status: paymentSuccess ? 'SUCCESS' : 'FAILED'
    });
    if (session) await payment.save({ session });
    else await payment.save();

    if (paymentSuccess) {
      for (const it of order.items) {
        const prodQuery = Product.findById(it.product);
        const prod = session ? await prodQuery.session(session) : await prodQuery;
        if (!prod) throw new Error(`Product not found during payment finalize: ${it.product}`);
        if (prod.reservedStock < it.quantity) throw new Error(`Reserved stock mismatch for ${prod.name}`);

        prod.reservedStock -= it.quantity;
        if (session) await prod.save({ session });
        else await prod.save();
      }

      order.status = 'PAID';
      order.statusHistory.push({ status: 'PAID', by: userId });
      if (session) await order.save({ session });
      else await order.save();

      if (session) {
        await session.commitTransaction();
        session.endSession();
      }

      try {
        const agenda = getAgenda();
        if (agenda && typeof agenda.cancel === 'function') {
          await agenda.cancel({ name: 'orderTimeout', 'data.orderId': order._id.toString() });
          console.log('[payOrder] cancelled job for', order._id.toString());
        } else {
          console.warn('[payOrder] agenda not ready — could not cancel job for', order._id.toString());
        }
      } catch (cancelErr) {
        console.error('[payOrder] agenda.cancel failed (non-fatal):', cancelErr);
      }

      sendOrderConfirmation(order).catch(err => console.error('Email send failed', err));

      return res.json({ message: 'Payment successful', orderId: order._id });
    } else {
      order.status = 'CANCELLED';
      order.statusHistory.push({ status: 'CANCELLED', by: userId });
      if (session) await order.save({ session });
      else await order.save();

      for (const it of order.items) {
        const prodQuery = Product.findById(it.product);
        const prod = session ? await prodQuery.session(session) : await prodQuery;
        if (!prod) continue;
        prod.reservedStock -= it.quantity;
        prod.availableStock += it.quantity;
        if (session) await prod.save({ session });
        else await prod.save();
      }

      if (session) {
        await session.commitTransaction();
        session.endSession();
      }
      return res.status(402).json({ message: 'Payment failed, order cancelled' });
    }
  } catch (err) {
    try {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
    } catch (e) {
      console.error('[payOrder] error aborting transaction', e);
    }
    console.error('[payOrder] failed:', err);
    return res.status(500).json({ message: err.message || 'Payment processing failed' });
  }
});

exports.listUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  res.json(order);
});

exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

  const items = cart.items.map(i => ({
    product: i.product._id,
    name: i.product.name,
    price: i.product.price,
    quantity: i.quantity
  }));
  const totalAmount = items.reduce((s, it) => s + (it.price * it.quantity), 0);
  const amountPaise = Math.round(totalAmount * 100);

  const order = new Order({
    user: userId,
    items,
    totalAmount,
    status: 'PENDING_PAYMENT',
    statusHistory: [{ status: 'PENDING_PAYMENT', by: userId }]
  });
  await order.save();


  const options = {
    amount: amountPaise,
    currency: 'INR',
    receipt: order._id.toString(),
    payment_capture: 1
  };

  const rOrder = await razor.orders.create(options);

  res.json({
    orderId: order._id.toString(),
    razorpayOrderId: rOrder.id,
    amount: rOrder.amount,
    currency: rOrder.currency,
    key: config.RAZORPAY_KEY_ID 
  });
});

exports.verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    return res.status(400).json({ message: 'Missing payment verification parameters' });
  }
  const generatedSignature = crypto
    .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ message: 'Invalid signature - verification failed' });
  }
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (order.status === 'PAID') return res.json({ message: 'Order already paid' });

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    session = null;
  }

  try {
    for (const it of order.items) {
      const prodQuery = Product.findById(it.product);
      const prod = session ? await prodQuery.session(session) : await prodQuery;
      if (!prod) throw new Error(`Product not found during payment finalize: ${it.product}`);
      if (prod.availableStock < it.quantity && prod.reservedStock < it.quantity) {
        throw new Error(`Insufficient stock for ${prod.name} during finalize`);
      }
      if (prod.reservedStock >= it.quantity) {
        prod.reservedStock -= it.quantity;
      } else {
        prod.availableStock -= it.quantity;
      }
      if (session) await prod.save({ session });
      else await prod.save();
    }

    order.status = 'PAID';
    order.statusHistory.push({ status: 'PAID', by: req.user.id });
    if (session) await order.save({ session }); else await order.save();

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }
    try {
      const agenda = getAgenda();
      if (agenda && typeof agenda.cancel === 'function') {
        await agenda.cancel({ name: 'orderTimeout', 'data.orderId': order._id.toString() });
      }
    } catch (err) {
      console.warn('Failed to cancel agenda job (non-fatal)', err);
    }

    const payment = new Payment({
      order: order._id,
      amount: order.totalAmount,
      transactionId: razorpay_payment_id,
      status: 'SUCCESS',
      meta: { razorpay_order_id }
    });
    await payment.save();

    sendOrderConfirmation(order).catch(e => console.error('Email failed', e));

    return res.json({ message: 'Payment verified and order paid', orderId: order._id });
  } catch (err) {
    try { if (session) { await session.abortTransaction(); session.endSession(); } } catch (e) { /* ignore */ }
    console.error('verifyRazorpayPayment failed', err);
    return res.status(500).json({ message: err.message || 'Payment finalize failed' });
  }
});
