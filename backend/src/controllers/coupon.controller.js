const Coupon = require('../models/coupon.model');
const createError = require('http-errors');

// Kupon kontrolü
exports.checkCoupon = async (req, res, next) => {
  try {
    const { code, total } = req.body;

    if (!code) {
      throw createError(400, 'Kupon kodu gerekli');
    }

    if (!total || total <= 0) {
      throw createError(400, 'Geçerli bir sepet tutarı gerekli');
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      throw createError(404, 'Kupon bulunamadı');
    }

    if (!coupon.isValid(total)) {
      throw createError(400, 'Bu kupon kullanılamaz. Lütfen koşulları kontrol edin.');
    }

    const discount = coupon.calculateDiscount(total);

    res.status(200).json({
      success: true,
      data: {
        coupon,
        discount
      },
      message: 'Kupon başarıyla uygulandı'
    });
  } catch (error) {
    if (error.status === 404 || error.status === 400) {
      res.status(error.status).json({
        success: false,
        message: error.message
      });
    } else {
      next(error);
    }
  }
};

// Admin: Tüm kuponları listele
exports.getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json({
      success: true,
      data: coupons
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Kupon oluştur
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Kupon güncelle
exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      throw createError(404, 'Kupon bulunamadı');
    }

    res.status(200).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Kupon sil
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      throw createError(404, 'Kupon bulunamadı');
    }

    res.status(200).json({
      success: true,
      data: null
    });
  } catch (error) {
    next(error);
  }
}; 