const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', ProductController.list);
router.post('/', authMiddleware('admin'), ProductController.create); // admin only
router.patch('/:id', authMiddleware('admin'), ProductController.update);

module.exports = router;
