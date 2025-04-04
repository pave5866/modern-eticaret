const multer = require('multer');
const path = require('path');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Multer yapılandırması
const storage = multer.memoryStorage();

// Sadece resim dosyalarını kabul et
const fileFilter = (req, file, cb) => {
  try {
    // Sadece belirli dosya tiplerini kabul et
    if (file.mimetype.startsWith('image/')) {
      logger.debug('Dosya kontrolü:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });
      cb(null, true);
    } else {
      cb(new AppError('Sadece resim dosyaları yüklenebilir!', 400), false);
    }
  } catch (error) {
    cb(new AppError('Dosya kontrolü sırasında hata: ' + error.message, 500), false);
  }
};

// Multer hata yakalama middleware'i
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.', 400));
    }
    return next(new AppError('Dosya yükleme hatası: ' + error.message, 400));
  }
  next(error);
};

// Multer middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // max 5MB
    files: 5 // maksimum 5 dosya
  }
});

module.exports = { upload, handleMulterError }; 