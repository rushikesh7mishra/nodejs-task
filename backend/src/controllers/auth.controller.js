const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const Joi = require('joi');
const { asyncHandler } = require('../utils/asyncHandler');

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

exports.register = asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const exists = await User.findOne({ email: value.email });
  if (exists) return res.status(409).json({ message: 'Email already in use' });

  const user = new User(value);
  await user.save();
  const token = jwt.sign({ id: user._id, role: user.role }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
  res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

exports.login = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const user = await User.findOne({ email: value.email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await user.comparePassword(value.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
  res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});
