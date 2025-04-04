const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');

// Public routes - tüm kategorileri ve belirli kategorileri alma
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Tüm kategoriler listelendi' });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ message: `${req.params.id} ID'li kategori getirildi` });
});

// Protected routes - Sadece admin
router.use(protect);
router.use(authorize('admin'));

// Admin kategori işlemleri
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Yeni kategori oluşturuldu' });
});

router.put('/:id', (req, res) => {
  res.status(200).json({ message: `${req.params.id} ID'li kategori güncellendi` });
});

router.delete('/:id', (req, res) => {
  res.status(200).json({ message: `${req.params.id} ID'li kategori silindi` });
});

module.exports = router; 