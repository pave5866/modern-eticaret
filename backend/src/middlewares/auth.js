const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

// Kullanıcı girişi kontrolü
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Token'ı header'dan al
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Lütfen giriş yapın', 401));
  }

  try {
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'modern-ecommerce-secret-jwt');

    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('Bu token\'a sahip kullanıcı artık mevcut değil', 401));
    }

    // Kullanıcıyı request'e ekle
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Geçersiz token', 401));
  }
});

// Rol bazlı yetkilendirme
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Bu işlem için yetkiniz yok', 403));
    }
    next();
  };
};