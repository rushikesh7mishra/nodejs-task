const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

router.use(authMiddleware('admin'));
router.patch('/orders/:id/status', adminController.updateOrderStatus);

module.exports = router;
