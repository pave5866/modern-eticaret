const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middlewares/auth');
const uploadController = require('../controllers/upload.controller');
const logger = require('../utils/logger');

// Multer storage konfigürasyonu (geçici olarak memory storage kullanılıyor)
const storage = multer.memoryStorage();

// Sadece belirli dosya tiplerini kabul et
const fileFilter = (req, file, cb) => {
  // İzin verilen mimetype'lar
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Desteklenmeyen dosya formatı. Sadece JPEG, PNG, WEBP veya GIF yükleyebilirsiniz.'), false);
  }
};

// Multer upload konfigürasyonu
const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB sınırı
  }
});

// Tek dosya yükleme için middleware
const singleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      logger.error('Resim yükleme hatası:', { error: err.message });
      return res.status(400).json({
        success: false,
        message: err.message || 'Dosya yükleme hatası'
      });
    }
    next();
  });
};

// Çoklu dosya yükleme için middleware
const multipleUpload = (req, res, next) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      logger.error('Çoklu resim yükleme hatası:', { error: err.message });
      return res.status(400).json({
        success: false,
        message: err.message || 'Dosya yükleme hatası'
      });
    }
    next();
  });
};

// Middlewares
router.use(protect); // Tüm upload rotaları için authentication gerekli

// Dosya yükleme rotaları
router.post('/image', singleUpload, uploadController.uploadImage);
router.post('/images', multipleUpload, uploadController.uploadMultipleImages);
router.post('/base64', uploadController.uploadBase64Image);
router.post('/url', uploadController.uploadImageFromUrl);

// Dosya silme (sadece admin ve dosya sahibi)
router.delete('/image/:publicId', uploadController.deleteImage);

module.exports = router;