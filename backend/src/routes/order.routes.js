const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, authorize } = require('../middlewares/auth');

// Protected routes - Kullanıcı işlemleri
router.use(protect);

router.route('/')
  .get(orderController.getMyOrders)
  .post(orderController.createOrder);

router.get('/:id', orderController.getOrderDetails);

// Admin routes
router.use(authorize('admin'));

router.get('/admin/orders', orderController.getAllOrders);
router.put('/admin/orders/:id', orderController.updateOrderStatus);

module.exports = router; 