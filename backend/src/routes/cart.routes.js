const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const cartController = require('../controllers/cart.controller');

router.use(authMiddleware());
router.get('/', cartController.getCart);
router.post('/', cartController.addOrUpdateItem);
router.put('/item/:itemId', cartController.updateItemQuantity);
router.delete('/item/:itemId', cartController.removeItem);

module.exports = router;
