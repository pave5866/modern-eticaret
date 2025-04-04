const AppError = require('../utils/appError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Hata detaylarını logla
  logger.error('ERROR 💥', { 
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    status: err.status || 'error',
    isOperational: err.isOperational || false
  });

  // Operasyonel, güvenilir hatalar: istemciye mesaj gönder
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message
    });
  }
  
  // Programlama veya diğer bilinmeyen hatalar: detayları gizle
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Bir şeyler yanlış gitti!'
  });
};

module.exports = errorHandler; 