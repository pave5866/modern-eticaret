const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');

// Tüm sepet işlemleri için kimlik doğrulama gerekli
router.use(protect);

// Sepet işlemleri
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Kullanıcı sepeti getirildi' });
});

router.post('/add', (req, res) => {
  res.status(200).json({ message: 'Ürün sepete eklendi' });
});

router.put('/update', (req, res) => {
  res.status(200).json({ message: 'Sepet güncellendi' });
});

router.delete('/remove/:productId', (req, res) => {
  res.status(200).json({ message: `${req.params.productId} ID'li ürün sepetten kaldırıldı` });
});

router.delete('/clear', (req, res) => {
  res.status(200).json({ message: 'Sepet temizlendi' });
});

module.exports = router; 