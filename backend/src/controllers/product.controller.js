const Product = require('../models/Product');
const Joi = require('joi');
const { asyncHandler } = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const products = await Product.find().lean();
  res.json(products);
});

const schema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  price: Joi.number().positive().required(),
  availableStock: Joi.number().integer().min(0).required()
});

exports.create = asyncHandler(async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const p = new Product(value);
  await p.save();
  res.status(201).json(p);
});

exports.get = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const p = await Product.findById(id).lean();
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});


exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const upd = await Product.findByIdAndUpdate(id, value, { new: true, runValidators: true });
  if (!upd) return res.status(404).json({ message: 'Not found' });
  res.json(upd);
});

exports.remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true, message: 'Deleted', id: deleted._id });
});
