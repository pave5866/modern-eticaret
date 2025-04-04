const Product = require('../models/product.model');
const createError = require('http-errors');
const path = require('path');
const parser = require('datauri/parser');
const AppError = require('../utils/appError');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

// Buffer'ı DataURI'ye dönüştür
const formatBuffer = (file) => {
  try {
    if (!file || !file.buffer || !file.originalname) {
      throw new Error('Geçersiz dosya formatı');
    }
    logger.debug('Buffer dönüştürme başladı:', {
      fileName: file.originalname,
      size: file.size,
      mimeType: file.mimetype
    });
    const extName = path.extname(file.originalname).toString();
    const datauri = new parser();
    const result = datauri.format(extName, file.buffer).content;
    logger.debug('Buffer dönüştürme başarılı');
    return result;
  } catch (error) {
    logger.error('Buffer dönüştürme hatası:', error);
    throw new AppError('Dosya formatı dönüştürme hatası: ' + error.message, 500);
  }
};

// Buffer'ı base64'e dönüştürme yardımcı fonksiyonu
const bufferToBase64 = (buffer, mimetype) => {
  try {
    logger.debug('Buffer dönüştürme başladı:', {
      bufferLength: buffer.length,
      mimetype
    });
    
    // Buffer'ı base64'e dönüştür
    const base64 = buffer.toString('base64');
    const dataURI = `data:${mimetype};base64,${base64}`;
    
    logger.debug('Buffer dönüştürme başarılı');
    return dataURI;
  } catch (error) {
    logger.error('Buffer dönüştürme hatası:', { error: error.message });
    throw error;
  }
};

// Tüm ürünleri getir
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Tek ürün getir
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw createError(404, 'Ürün bulunamadı');
    }
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Ürün oluştur
exports.createProduct = async (req, res, next) => {
  try {
    const productData = {
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      price: parseFloat(req.body.price),
      category: req.body.category.trim(),
      stock: parseInt(req.body.stock),
      images: []
    };

    // Resimleri Cloudinary'ye yükle
    if (req.files && req.files.length > 0) {
      logger.info('Resim yükleme başladı:', { fileCount: req.files.length });
      
      const uploadPromises = req.files.map(async (file) => {
        try {
          const dataURI = bufferToBase64(file.buffer, file.mimetype);
          const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'products',
            resource_type: 'auto',
            timeout: 60000,
          });
          
          logger.info('Resim yüklendi:', { url: result.secure_url });
          return result.secure_url;
        } catch (uploadError) {
          logger.error('Cloudinary resim yükleme hatası:', { 
            error: uploadError.message,
            errorDetails: uploadError
          });
          throw new AppError(`Resim yükleme hatası: ${uploadError.message}`, 500);
        }
      });
      
      try {
        productData.images = await Promise.all(uploadPromises);
        logger.info('Tüm resimler yüklendi:', { imageCount: productData.images.length });
      } catch (promiseError) {
        logger.error('Resim yükleme promise hatası:', { error: promiseError.message });
        throw new AppError('Resimler yüklenirken bir hata oluştu', 500);
      }
    } else {
      // Varsayılan resim ekle
      productData.images = ['https://res.cloudinary.com/dlkrduwav/image/upload/v1716066139/default-product_dljmyw.png'];
      logger.info('Varsayılan resim eklendi');
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    logger.error('Ürün oluşturma hatası:', { error: error.message });
    next(error);
  }
};

// Ürün güncelle
exports.updateProduct = async (req, res, next) => {
  try {
    logger.info('Ürün güncelleme başladı:', { productId: req.params.id });
    
    // Önce ürünü bul
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      throw createError(404, 'Ürün bulunamadı');
    }
    
    // Güncelleme verilerini hazırla
    const updateData = {
      name: req.body.name ? req.body.name.trim() : existingProduct.name,
      description: req.body.description ? req.body.description.trim() : existingProduct.description,
      price: req.body.price ? parseFloat(req.body.price) : existingProduct.price,
      category: req.body.category ? req.body.category.trim() : existingProduct.category,
      stock: req.body.stock ? parseInt(req.body.stock) : existingProduct.stock
    };
    
    // Mevcut resimler varsa işle
    let imagesToKeep = [];
    if (req.body.existingImages) {
      try {
        imagesToKeep = JSON.parse(req.body.existingImages);
        logger.info('Korunacak mevcut resimler:', { count: imagesToKeep.length });
      } catch (error) {
        logger.error('Mevcut resimleri ayrıştırma hatası:', { error: error.message });
        imagesToKeep = [];
      }
    }
    
    // Yeni yüklenen resimleri işle
    if (req.files && req.files.length > 0) {
      logger.info('Yeni resim yükleme başladı:', { fileCount: req.files.length });
      
      const uploadPromises = req.files.map(async (file) => {
        try {
          const dataURI = bufferToBase64(file.buffer, file.mimetype);
          const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'products',
            resource_type: 'auto',
            timeout: 60000,
          });
          
          logger.info('Yeni resim yüklendi:', { url: result.secure_url });
          return result.secure_url;
        } catch (uploadError) {
          logger.error('Cloudinary resim yükleme hatası:', { 
            error: uploadError.message,
            errorDetails: uploadError
          });
          throw new AppError(`Resim yükleme hatası: ${uploadError.message}`, 500);
        }
      });
      
      try {
        const newImages = await Promise.all(uploadPromises);
        logger.info('Tüm yeni resimler yüklendi:', { imageCount: newImages.length });
        
        // Mevcut ve yeni resimleri birleştir
        updateData.images = [...imagesToKeep, ...newImages];
      } catch (promiseError) {
        logger.error('Resim yükleme promise hatası:', { error: promiseError.message });
        throw new AppError('Resimler yüklenirken bir hata oluştu', 500);
      }
    } else {
      // Sadece mevcut resimler
      updateData.images = imagesToKeep;
      
      // Eğer hiç resim yoksa varsayılan resim ekle
      if (updateData.images.length === 0) {
        updateData.images = ['https://res.cloudinary.com/dlkrduwav/image/upload/v1716066139/default-product_dljmyw.png'];
        logger.info('Varsayılan resim eklendi');
      }
    }
    
    logger.info('Ürün güncelleniyor:', { 
      productId: req.params.id,
      imageCount: updateData.images.length
    });
    
    // Ürünü güncelle
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    logger.error('Ürün güncelleme hatası:', { error: error.message });
    next(error);
  }
};

// Ürün sil
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      throw createError(404, 'Ürün bulunamadı');
    }
    res.status(200).json({
      success: true,
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Kategorileri getir
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    
    logger.info('Kategoriler başarıyla getirildi', {
      success: true,
      data: categories
    });
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Kategorileri getirme hatası:', { error: error.message });
    next(error);
  }
};

// Ürünleri ara
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice, sort } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtreleme
    const filter = {};
    
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'Tümü') {
      filter.category = category;
    }
    
    if (minPrice && !isNaN(minPrice)) {
      filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    }
    
    if (maxPrice && !isNaN(maxPrice)) {
      filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    }
    
    // Sıralama
    const sortOptions = {};
    if (sort) {
      const [field, direction] = sort.split(':');
      sortOptions[field] = direction === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }
    
    // Sorgu
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    logger.info('Ürün arama sonuçları', {
      query: q,
      total,
      page,
      limit
    });
    
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        pages: totalPages,
        limit
      },
      count: products.length
    });
  } catch (error) {
    logger.error('Ürün arama hatası:', { error: error.message });
    next(error);
  }
};

// Kategoriye göre ürünleri getir
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find({ category: category })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments({ category: category })
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    logger.info('Kategoriye göre ürünler getirildi', {
      category,
      total,
      page
    });
    
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        pages: totalPages,
        limit
      },
      count: products.length
    });
  } catch (error) {
    logger.error('Kategoriye göre ürün getirme hatası:', { error: error.message });
    next(error);
  }
};