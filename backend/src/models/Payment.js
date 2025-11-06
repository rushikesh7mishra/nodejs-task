const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  amount: Number,
  transactionId: String,
  status: { type: String, enum: ['SUCCESS','FAILED','PENDING'], default: 'PENDING' },
  meta: {}
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
