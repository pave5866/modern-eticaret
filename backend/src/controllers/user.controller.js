const User = require('../models/user.model');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const logger = require('../utils/logger');

// Profil bilgilerini getir
exports.getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// Profil güncelle
exports.updateProfile = catchAsync(async (req, res) => {
  const { name, email } = req.body;

  // Email değiştiriliyorsa, yeni email'in başka bir kullanıcı tarafından kullanılmadığından emin ol
  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Bu email adresi zaten kullanılıyor', 400);
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});

// Şifre güncelle
exports.updatePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Şifre kontrolü - bcrypt ile doğrudan karşılaştırma
  const bcrypt = require('bcryptjs');
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  
  if (!isPasswordValid) {
    throw new AppError('Mevcut şifreniz yanlış', 401);
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Şifreniz başarıyla güncellendi'
  });
});

// Admin: Tüm kullanıcıları getir
exports.getAllUsers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Filtreleme seçenekleri
  const filter = {};
  if (req.query.role && req.query.role !== 'Tümü') {
    filter.role = req.query.role;
  }
  if (req.query.search) {
    filter.$or = [
      { email: { $regex: req.query.search, $options: 'i' } },
      { name: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Sıralama seçenekleri
  const sort = {};
  if (req.query.sortBy) {
    sort[req.query.sortBy] = req.query.sortOrder === 'desc' ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  // Sadece gerekli alanları seç
  const projection = {
    password: 0,
    notifications: 0,
    cart: 0,
    wishlist: 0,
    settings: 0,
    __v: 0
  };

  // Promise.all ile paralel sorgu
  const [total, users] = await Promise.all([
    User.countDocuments(filter).lean(),
    User.find(filter, projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()
  ]);

  // Cache-Control header'ı ekle
  res.set('Cache-Control', 'private, max-age=10');

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Admin: Yeni kullanıcı oluştur
exports.createUser = catchAsync(async (req, res) => {
  const user = await User.create(req.body);
  
  res.status(201).json({
    success: true,
    data: user
  });
});

// Admin: Kullanıcı detayı getir
exports.getUser = catchAsync(async (req, res, next) => {
  // 'me' özel durumu için profil bilgilerini getir
  if (req.params.id === 'me') {
    if (!req.user) {
      return next(new AppError('Lütfen giriş yapın', 401));
    }
    
    logger.info('Kullanıcı kendi profilini istiyor', { userId: req.user.id });
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return next(new AppError('Kullanıcı bulunamadı', 404));
    }
    
    return res.status(200).json({
      success: true,
      data: user
    });
  }
  
  // Normal ID ile kullanıcı bilgisi getir
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new AppError('Kullanıcı bulunamadı', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// Admin: Kullanıcı güncelle
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('Kullanıcı bulunamadı', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// Admin: Kullanıcı sil
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('Kullanıcı bulunamadı', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Kullanıcı başarıyla silindi'
  });
});