const Order = require('../models/Order');
const { asyncHandler } = require('../utils/asyncHandler');

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const valid = ['SHIPPED','DELIVERED','CANCELLED','PAID'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status' });

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (order.status === 'PENDING_PAYMENT' && status === 'DELIVERED') {
    return res.status(400).json({ message: 'Cannot deliver unpaid order' });
  }

  order.status = status;
  order.statusHistory.push({ status, by: req.user.id });
  await order.save();

  res.json(order);
});
