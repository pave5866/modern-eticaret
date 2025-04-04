const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../middlewares/auth');
const logger = require('../utils/logger');

/**
 * @route   POST /api/admin/create
 * @desc    Admin kullanıcısı oluştur
 * @access  Public
 */
router.post('/create', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    logger.info('Admin kullanıcısı oluşturma isteği alındı', { email });
    
    // Kullanıcı var mı kontrol et
    let user = await User.findOne({ email });
    
    if (user) {
      // Kullanıcı varsa ve admin değilse, admin yap
      if (user.role !== 'admin') {
        logger.info('Mevcut kullanıcı admin rolüne güncelleniyor', { email });
        
        user.role = 'admin';
        await user.save();
        
        return res.status(200).json({
          success: true,
          message: 'Kullanıcı admin rolüne yükseltildi',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }
      
      // Kullanıcı zaten admin
      logger.info('Kullanıcı zaten admin rolüne sahip', { email });
      
      return res.status(200).json({
        success: true,
        message: 'Kullanıcı zaten admin rolüne sahip',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
    
    // Kullanıcı yoksa yeni admin oluştur
    logger.info('Yeni admin kullanıcısı oluşturuluyor', { email });
    
    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });
    
    await user.save();
    
    // Token oluştur
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'modern-ecommerce-secret-jwt',
      { expiresIn: '30d' }
    );
    
    logger.info('Admin kullanıcısı başarıyla oluşturuldu', { id: user._id, email });
    
    res.status(201).json({
      success: true,
      message: 'Admin kullanıcısı başarıyla oluşturuldu',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    logger.error('Admin kullanıcısı oluşturma hatası', { error: err.message, stack: err.stack });
    
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: err.message
    });
  }
});

/**
 * @route   PUT /api/admin/promote/:id
 * @desc    Kullanıcıyı admin yap
 * @access  Private/Admin
 */
router.put('/promote/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const userId = req.params.id;
    logger.info('Kullanıcıyı admin yapma isteği', { userId });
    
    const user = await User.findById(userId);
    
    if (!user) {
      logger.warn('Admin yapma hatası: Kullanıcı bulunamadı', { userId });
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }
    
    if (user.role === 'admin') {
      logger.info('Kullanıcı zaten admin', { userId });
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı zaten admin rolüne sahip'
      });
    }
    
    user.role = 'admin';
    await user.save();
    
    logger.info('Kullanıcı başarıyla admin yapıldı', { userId });
    
    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla admin yapıldı',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    logger.error('Admin yapma hatası', { error: err.message, stack: err.stack });
    
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: err.message
    });
  }
});

/**
 * @route   PUT /api/admin/self-promote
 * @desc    Kendini admin yap
 * @access  Public
 */
router.put('/self-promote', async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info('Kullanıcının kendini admin yapma isteği', { email });
    
    // Kullanıcıyı bul
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      logger.warn('Self-promote hatası: Kullanıcı bulunamadı', { email });
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }
    
    // Master şifre kontrolü
    let isPasswordValid = false;
    
    // Master şifre kontrolü (acil durum için)
    if (password === process.env.MASTER_PASSWORD) {
      logger.info('Self-promote: Master şifre kullanıldı', { email });
      isPasswordValid = true;
    } else {
      // Normal şifre doğrulama - bcrypt ile doğrudan karşılaştırma
      const bcrypt = require('bcryptjs');
      isPasswordValid = await bcrypt.compare(password, user.password);
      logger.info('Self-promote: Şifre doğrulama sonucu:', { isPasswordValid });
    }
    
    if (!isPasswordValid) {
      logger.warn('Self-promote hatası: Geçersiz şifre', { email });
      return res.status(401).json({
        success: false,
        message: 'Geçersiz şifre'
      });
    }
    
    if (user.role === 'admin') {
      logger.info('Kullanıcı zaten admin', { email });
      
      // Token oluştur
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'modern-ecommerce-secret-jwt',
        { expiresIn: '30d' }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Kullanıcı zaten admin rolüne sahip',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    }
    
    // Kullanıcıyı admin yap
    user.role = 'admin';
    await user.save();
    
    logger.info('Kullanıcı başarıyla admin yapıldı', { email });
    
    // Token oluştur
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'modern-ecommerce-secret-jwt',
      { expiresIn: '30d' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla admin yapıldı',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    logger.error('Self-promote hatası', { error: err.message, stack: err.stack });
    
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: err.message
    });
  }
});

module.exports = router;