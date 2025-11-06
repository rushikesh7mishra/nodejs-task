const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const orderController = require('../controllers/order.controller');

router.use(authMiddleware());
router.post('/checkout', orderController.checkout);                // existing
router.post('/razorpay/create', orderController.createRazorpayOrder); // NEW
router.post('/:id/verify', orderController.verifyRazorpayPayment);  // NEW (verify after client payment)
router.post('/:id/pay', orderController.payOrder);                 // keep existing mock for compatibility
router.get('/', orderController.listUserOrders);
router.get('/:id', orderController.getOrder);

module.exports = router;
