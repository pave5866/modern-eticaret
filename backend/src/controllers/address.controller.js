const Address = require('../models/address.model');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all addresses for current user
exports.getAllAddresses = catchAsync(async (req, res, next) => {
  const addresses = await Address.find({ user: req.user.id });
  
  res.status(200).json({
    success: true,
    addresses
  });
});

// Kullanıcının adreslerini getir
exports.getMyAddresses = catchAsync(async (req, res, next) => {
  const addresses = await Address.find({ user: req.user._id }).sort('-createdAt');

  res.status(200).json({
    success: true,
    data: addresses
  });
});

// Yeni adres oluştur
exports.createAddress = catchAsync(async (req, res, next) => {
  // Gerekli alanları kontrol et
  const requiredFields = ['title', 'fullName', 'phone', 'address', 'city', 'district', 'postalCode'];
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return next(new AppError(`${field} alanı zorunludur`, 400));
    }
  }

  const addressData = {
    ...req.body,
    user: req.user._id
  };

  const address = await Address.create(addressData);

  // İlk adres veya varsayılan olarak işaretlendiyse
  const addressCount = await Address.countDocuments({ user: req.user._id });
  if (addressCount === 1 || req.body.isDefault) {
    await Address.updateMany(
      { user: req.user._id, _id: { $ne: address._id } },
      { $set: { isDefault: false } }
    );
    address.isDefault = true;
    await address.save();
  }

  res.status(201).json({
    success: true,
    data: address
  });
});

// Adres güncelle
exports.updateAddress = catchAsync(async (req, res, next) => {
  const address = await Address.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!address) {
    return next(new AppError('Adres bulunamadı', 404));
  }

  // Varsayılan adres olarak işaretlendiyse diğerlerini güncelle
  if (req.body.isDefault) {
    await Address.updateMany(
      { user: req.user._id, _id: { $ne: address._id } },
      { $set: { isDefault: false } }
    );
  }

  res.status(200).json({
    success: true,
    data: address
  });
});

// Adres sil
exports.deleteAddress = catchAsync(async (req, res, next) => {
  const address = await Address.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!address) {
    return next(new AppError('Adres bulunamadı', 404));
  }

  // Silinen adres varsayılan ise başka bir adresi varsayılan yap
  if (address.isDefault) {
    const firstAddress = await Address.findOne({ user: req.user._id });
    if (firstAddress) {
      firstAddress.isDefault = true;
      await firstAddress.save();
    }
  }

  res.status(200).json({
    success: true,
    message: 'Adres başarıyla silindi'
  });
});

// Adres detayını getir
exports.getAddressDetails = async (req, res, next) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id // Sadece kullanıcının kendi adreslerini görebilmesi için
    });

    if (!address) {
      return next(new AppError('Adres bulunamadı', 404));
    }

    res.status(200).json({
      success: true,
      data: address
    });
  } catch (error) {
    next(error);
  }
};

// Yeni adres ekle
exports.addAddress = async (req, res, next) => {
  try {
    const address = await Address.create({
      ...req.body,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      data: address
    });
  } catch (error) {
    next(error);
  }
}; 