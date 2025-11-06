const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const cartController = require('../controllers/cart.controller');

router.use(authMiddleware()); // all cart routes require auth
router.get('/', cartController.getCart);
router.post('/', cartController.addOrUpdateItem);
router.delete('/:productId', cartController.removeItem);

module.exports = router;
