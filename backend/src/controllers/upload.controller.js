const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const DatauriParser = require('datauri/parser');
const path = require('path');
const fetch = require('node-fetch');

// Buffer'ı DataURI'ye dönüştür
const parser = new DatauriParser();
const formatBuffer = (file) => {
  try {
    const extName = path.extname(file.originalname).toString();
    return parser.format(extName, file.buffer).content;
  } catch (error) {
    logger.error('Buffer formatı dönüştürme hatası:', error);
    throw new AppError('Dosya formatı dönüştürme hatası', 500);
  }
};

// Tek dosya yükleme
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Lütfen bir resim dosyası seçin', 400));
    }

    logger.info('Resim yükleme başladı:', { 
      fileName: req.file.originalname, 
      size: req.file.size, 
      mimetype: req.file.mimetype 
    });

    // Buffer'ı DataURI formatına dönüştür
    const fileUri = formatBuffer(req.file);
    
    // Cloudinary'ye yükle
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: 'products',
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Maksimum boyut
        { quality: 'auto:good' }  // Otomatik kalite optimize
      ]
    });

    logger.info('Resim yükleme başarılı:', { 
      publicId: result.public_id,
      url: result.secure_url
    });

    res.status(201).json({
      success: true,
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resourceType: result.resource_type
      }
    });
  } catch (error) {
    logger.error('Resim yükleme hatası:', { error: error.message });
    next(error);
  }
};

// Çoklu dosya yükleme
exports.uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new AppError('Lütfen en az bir resim dosyası seçin', 400));
    }

    logger.info('Çoklu resim yükleme başladı:', { fileCount: req.files.length });

    // Tüm resimleri yükleme
    const uploadPromises = req.files.map(async (file) => {
      try {
        const fileUri = formatBuffer(file);
        
        const result = await cloudinary.uploader.upload(fileUri, {
          folder: 'products',
          resource_type: 'auto',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto:good' }
          ]
        });
        
        return {
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          resourceType: result.resource_type
        };
      } catch (uploadError) {
        logger.error('Tekil resim yükleme hatası:', { error: uploadError.message });
        throw uploadError; // Promise reject ile hata ilet
      }
    });

    // Tüm promise'ları çalıştır
    const results = await Promise.all(uploadPromises);

    logger.info('Çoklu resim yükleme başarılı:', { 
      count: results.length,
      urls: results.map(r => r.url)
    });

    res.status(201).json({
      success: true,
      data: {
        count: results.length,
        images: results,
        urls: results.map(r => r.url)
      }
    });
  } catch (error) {
    logger.error('Çoklu resim yükleme genel hatası:', { error: error.message });
    next(error);
  }
};

// Base64 resim yükleme
exports.uploadBase64Image = async (req, res, next) => {
  try {
    const { image, name } = req.body;
    
    if (!image) {
      return next(new AppError('Base64 formatında resim gönderilmedi', 400));
    }
    
    // Base64 formatını kontrol et
    if (!image.startsWith('data:image')) {
      return next(new AppError('Geçersiz base64 formatı. data:image ile başlamalı', 400));
    }

    logger.info('Base64 resim yükleme başladı');
    
    // Cloudinary'ye yükle
    const result = await cloudinary.uploader.upload(image, {
      folder: 'products',
      resource_type: 'auto',
      public_id: name ? path.parse(name).name : undefined,
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    logger.info('Base64 resim yükleme başarılı:', { 
      publicId: result.public_id,
      url: result.secure_url
    });

    res.status(201).json({
      success: true,
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resourceType: result.resource_type
      }
    });
  } catch (error) {
    logger.error('Base64 resim yükleme hatası:', { error: error.message });
    next(error);
  }
};

// URL'den resim yükleme
exports.uploadImageFromUrl = async (req, res, next) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return next(new AppError('Resim URL\'i gönderilmedi', 400));
    }

    logger.info('URL\'den resim yükleme başladı:', { url });
    
    // URL geçerliliğini kontrol et
    try {
      const response = await fetch(url, { method: 'HEAD' });
      
      if (!response.ok) {
        return next(new AppError('Geçersiz resim URL\'i. Erişilemiyor.', 400));
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        return next(new AppError('URL bir resme ait değil', 400));
      }
    } catch (fetchError) {
      logger.error('URL doğrulama hatası:', { error: fetchError.message });
      return next(new AppError('URL erişim hatası: ' + fetchError.message, 400));
    }
    
    // Cloudinary'ye yükle
    const result = await cloudinary.uploader.upload(url, {
      folder: 'products',
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    logger.info('URL\'den resim yükleme başarılı:', { 
      publicId: result.public_id,
      url: result.secure_url
    });

    res.status(201).json({
      success: true,
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resourceType: result.resource_type
      }
    });
  } catch (error) {
    logger.error('URL\'den resim yükleme hatası:', { error: error.message });
    next(error);
  }
};

// Resim silme
exports.deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return next(new AppError('Silmek için public_id gerekli', 400));
    }

    logger.info('Resim silme işlemi başladı:', { publicId });
    
    // Resmi Cloudinary'den sil
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result !== 'ok') {
      return next(new AppError('Resim silinemedi: ' + result.result, 400));
    }

    logger.info('Resim silme başarılı:', { publicId, result: result.result });

    res.status(200).json({
      success: true,
      message: 'Resim başarıyla silindi',
      data: { publicId }
    });
  } catch (error) {
    logger.error('Resim silme hatası:', { error: error.message, publicId: req.params.publicId });
    next(error);
  }
};