const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', ProductController.list);
router.get('/:id', ProductController.get); 
router.post('/', authMiddleware('admin'), ProductController.create); 
router.put('/:id', authMiddleware('admin'), ProductController.update); 
router.delete('/:id', authMiddleware('admin'), ProductController.remove); 

module.exports = router;
