const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Joi = require('joi');
const { asyncHandler } = require('../utils/asyncHandler');

const itemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required()
});

exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart) return res.json({ items: [] });
  res.json(cart);
});

exports.addOrUpdateItem = asyncHandler(async (req, res) => {
  const { error, value } = itemSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const product = await Product.findById(value.productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [{ product: product._id, quantity: value.quantity }] });
  } else {
    const idx = cart.items.findIndex(i => i.product.toString() === product._id.toString());
    if (idx === -1) {
      cart.items.push({ product: product._id, quantity: value.quantity });
    } else {
      cart.items[idx].quantity = value.quantity;
    }
  }
  await cart.save();
  cart = await cart.populate('items.product');
  res.json(cart);
});

exports.removeItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  cart.items = cart.items.filter(i => i.product.toString() !== productId);
  await cart.save();
  cart = await cart.populate('items.product');
  res.json(cart);
});
