const Review = require('../models/review.model');
const Product = require('../models/product.model');
const createError = require('http-errors');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Tüm değerlendirmeleri getir
exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'product',
        select: 'name images'
      });
    
    res.status(200).json({
      success: true,
      data: reviews,
      message: 'Tüm değerlendirmeler başarıyla getirildi'
    });
  } catch (error) {
    logger.error(`Değerlendirmeleri getirme hatası: ${error.message}`);
    next(error);
  }
};

// Belirli bir ürüne ait değerlendirmeleri getir
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const reviews = await Review.find({ product: productId })
      .populate({
        path: 'user',
        select: 'name email'
      });
    
    res.status(200).json({
      success: true,
      data: reviews,
      message: 'Ürün değerlendirmeleri başarıyla getirildi'
    });
  } catch (error) {
    logger.error(`Ürün değerlendirmelerini getirme hatası: ${error.message}`);
    next(error);
  }
};

// Yeni değerlendirme oluştur
exports.createReview = async (req, res, next) => {
  try {
    // Değerlendirme verileri
    const { product: productId, rating, review } = req.body;
    
    // Ürün var mı kontrol et
    const product = await Product.findById(productId);
    if (!product) {
      throw createError(404, 'Değerlendirmek istediğiniz ürün bulunamadı');
    }
    
    // Kullanıcı daha önce bu ürüne değerlendirme yapmış mı kontrol et
    const existingReview = await Review.findOne({ 
      product: productId, 
      user: req.user.id 
    });
    
    if (existingReview) {
      throw createError(400, 'Bu ürün için zaten bir değerlendirme yapmışsınız');
    }
    
    // Yeni değerlendirme oluştur
    const newReview = await Review.create({
      product: productId,
      user: req.user.id,
      rating,
      review
    });
    
    res.status(201).json({
      success: true,
      data: newReview,
      message: 'Değerlendirmeniz başarıyla oluşturuldu'
    });
  } catch (error) {
    logger.error(`Değerlendirme oluşturma hatası: ${error.message}`);
    next(error);
  }
};

// Belirli bir değerlendirmeyi getir
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'product',
        select: 'name images'
      });
    
    if (!review) {
      throw createError(404, 'Değerlendirme bulunamadı');
    }
    
    res.status(200).json({
      success: true,
      data: review,
      message: 'Değerlendirme başarıyla getirildi'
    });
  } catch (error) {
    logger.error(`Değerlendirme getirme hatası: ${error.message}`);
    next(error);
  }
};

// Değerlendirme güncelle
exports.updateReview = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    
    const existingReview = await Review.findById(req.params.id);
    
    if (!existingReview) {
      throw createError(404, 'Değerlendirme bulunamadı');
    }
    
    // Kullanıcı kendi değerlendirmesini mi güncelliyor?
    if (existingReview.user.toString() !== req.user.id && req.user.role !== 'admin') {
      throw createError(403, 'Başkasının değerlendirmesini düzenleme yetkiniz yok');
    }
    
    // Değerlendirmeyi güncelle
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, review },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedReview,
      message: 'Değerlendirme başarıyla güncellendi'
    });
  } catch (error) {
    logger.error(`Değerlendirme güncelleme hatası: ${error.message}`);
    next(error);
  }
};

// Değerlendirme sil
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      throw createError(404, 'Değerlendirme bulunamadı');
    }
    
    // Kullanıcı kendi değerlendirmesini mi siliyor?
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      throw createError(403, 'Başkasının değerlendirmesini silme yetkiniz yok');
    }
    
    await Review.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: null,
      message: 'Değerlendirme başarıyla silindi'
    });
  } catch (error) {
    logger.error(`Değerlendirme silme hatası: ${error.message}`);
    next(error);
  }
};