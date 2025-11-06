const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

exports.authMiddleware = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
      const token = auth.split(' ')[1];
      const payload = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(payload.id);
      if (!user) return res.status(401).json({ message: 'Unauthorized' });
      if (requiredRole && user.role !== requiredRole) return res.status(403).json({ message: 'Forbidden' });
      req.user = { id: user._id.toString(), role: user.role };
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
};
