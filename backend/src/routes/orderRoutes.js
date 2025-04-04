const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createOrder,
  getOrders,
  getOrder,
  deleteOrder
} = require('../controllers/orderController');

router.route('/')
  .post(protect, createOrder)
  .get(protect, getOrders);

router.route('/:id')
  .get(protect, getOrder)
  .delete(protect, deleteOrder);

module.exports = router; 