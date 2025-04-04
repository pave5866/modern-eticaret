const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { protect, authorize } = require('../middlewares/auth');

// Public routes (giriş yapmış kullanıcılar için)
router.post('/check', protect, couponController.checkCoupon);

// Admin routes
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(couponController.getAllCoupons)
  .post(couponController.createCoupon);

router.route('/:id')
  .put(couponController.updateCoupon)
  .delete(couponController.deleteCoupon);

module.exports = router; 