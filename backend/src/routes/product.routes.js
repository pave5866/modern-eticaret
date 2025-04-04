const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, authorize } = require('../middlewares/auth');
const { upload, handleMulterError } = require('../middlewares/upload');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/search', productController.searchProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProduct);

// Protected routes
router.use(protect);
router.use(authorize('admin'));

// Ürün işlemleri
router.post('/', 
  upload.array('images', 5), 
  handleMulterError,
  productController.createProduct
);

router.route('/:id')
  .put(upload.array('images', 5), handleMulterError, productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router; 