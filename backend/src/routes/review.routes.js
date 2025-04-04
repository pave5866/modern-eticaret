const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect, restrictTo } = require('../middlewares/auth');

// Tüm değerlendirmeleri getir
router.get('/', reviewController.getAllReviews);

// Belirli bir ürüne ait değerlendirmeleri getir
router.get('/product/:productId', reviewController.getProductReviews);

// Yeni değerlendirme oluştur (oturum gerektirir)
router.post('/', protect, reviewController.createReview);

// Belirli bir değerlendirmeyi getir
router.get('/:id', reviewController.getReview);

// Değerlendirme güncelle (yalnızca değerlendirmeyi yazan kullanıcı veya admin)
router.put('/:id', protect, reviewController.updateReview);

// Değerlendirme sil (yalnızca değerlendirmeyi yazan kullanıcı veya admin)
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;