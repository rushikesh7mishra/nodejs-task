const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const Joi = require('joi');
const { asyncHandler } = require('../utils/asyncHandler');

const itemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required()
});

// GET /cart
exports.getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product').lean();
  if (!cart) return res.json({ items: [] });
  res.json(cart);
});

// POST /cart
exports.addOrUpdateItem = asyncHandler(async (req, res) => {
  const { error, value } = itemSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const product = await Product.findById(value.productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = new Cart({
      user: req.user.id,
      items: [{ product: product._id, quantity: value.quantity }]
    });
  } else {
    const idx = cart.items.findIndex(i => i.product && i.product.toString() === product._id.toString());
    if (idx === -1) {
      cart.items.push({ product: product._id, quantity: value.quantity });
    } else {
      cart.items[idx].quantity = value.quantity;
    }
  }
  await cart.save();
  cart = await Cart.findById(cart._id).populate('items.product');
  res.json(cart);
});

// PUT /cart/item/:itemId
exports.updateItemQuantity = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  if (!mongoose.Types.ObjectId.isValid(itemId)) return res.status(400).json({ message: 'Invalid item id' });
  if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ message: 'Invalid quantity' });

  const cart = await Cart.findOneAndUpdate(
    { 'items._id': itemId, user: req.user.id },
    { $set: { 'items.$.quantity': quantity } },
    { new: true }
  ).populate('items.product');

  if (!cart) return res.status(404).json({ message: 'Cart item not found' });
  res.json(cart);
});

// DELETE /cart/item/:itemId
exports.removeItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(itemId)) return res.status(400).json({ message: 'Invalid item id' });

  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { $pull: { items: { _id: itemId } } },
    { new: true }
  ).populate('items.product');

  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  res.json(cart);
});
