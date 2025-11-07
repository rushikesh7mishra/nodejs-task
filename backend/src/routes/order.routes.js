const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const orderController = require('../controllers/order.controller');

router.use(authMiddleware());
router.post('/checkout', orderController.checkout);              
router.post('/razorpay/create', orderController.createRazorpayOrder); 
router.post('/:id/verify', orderController.verifyRazorpayPayment);  
router.post('/:id/pay', orderController.payOrder);                 
router.get('/', orderController.listUserOrders);
router.get('/:id', orderController.getOrder);

module.exports = router;
