const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

/**
 * @route   POST /api/admin/create
 * @desc    Admin kullanıcısı oluştur (Açık endpoint - dikkatli kullanın)
 * @access  Public
 */
router.post(
  '/create',
  [
    body('name', 'İsim gereklidir').not().isEmpty(),
    body('email', 'Geçerli bir e-posta adresi giriniz').isEmail(),
    body('password', 'Şifre en az 6 karakter olmalıdır').isLength({ min: 6 }),
    body('secretKey', 'Güvenlik anahtarı gereklidir').not().isEmpty()
  ],
  async (req, res) => {
    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, secretKey } = req.body;

    // Güvenlik anahtarı kontrolü - bu bir çok güvenli bir yöntem değil, sadece basit bir önlem
    if (secretKey !== 'Kadire5866ModeRn2024') {
      return res.status(401).json({ 
        success: false, 
        error: 'Geçersiz güvenlik anahtarı' 
      });
    }

    try {
      // Kullanıcının var olup olmadığını kontrol et
      let user = await User.findOne({ email });

      if (user) {
        // Kullanıcı var, admin rolüne yükselt
        if (user.role === 'admin') {
          return res.status(400).json({
            success: false,
            error: 'Bu e-posta adresi zaten admin rolüne sahip'
          });
        }

        user.role = 'admin';
        await user.save();

        return res.json({
          success: true,
          message: 'Kullanıcı admin rolüne yükseltildi',
          userId: user.id
        });
      }

      // Yeni admin kullanıcısı oluştur
      user = new User({
        name,
        email,
        password,
        role: 'admin'
      });

      // Şifreyi hash'le
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      return res.json({
        success: true,
        message: 'Admin kullanıcısı başarıyla oluşturuldu',
        userId: user.id
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ 
        success: false, 
        error: 'Sunucu hatası' 
      });
    }
  }
);

/**
 * @route   PUT /api/admin/promote/:id
 * @desc    Kullanıcıyı admin rolüne yükselt
 * @access  Private/Admin
 */
router.put('/promote/:id', auth, async (req, res) => {
  try {
    // Kullanıcının admin olup olmadığını kontrol et
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Bu işlemi yapmak için admin yetkiniz yok'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Kullanıcı zaten admin rolüne sahip'
      });
    }

    user.role = 'admin';
    await user.save();

    res.json({
      success: true,
      message: 'Kullanıcı admin rolüne yükseltildi',
      userId: user.id
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Sunucu hatası' 
    });
  }
});

/**
 * @route   PUT /api/admin/self-promote
 * @desc    Kendinizi admin rolüne yükseltme (Giriş yapmış kullanıcı için)
 * @access  Private
 */
router.put('/self-promote', auth, async (req, res) => {
  try {
    const { secretKey } = req.body;

    // Güvenlik anahtarı kontrolü
    if (secretKey !== 'Kadire5866ModeRn2024') {
      return res.status(401).json({ 
        success: false, 
        error: 'Geçersiz güvenlik anahtarı' 
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Kullanıcı zaten admin rolüne sahip'
      });
    }

    user.role = 'admin';
    await user.save();

    res.json({
      success: true,
      message: 'Kullanıcı admin rolüne yükseltildi',
      userId: user.id
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Sunucu hatası' 
    });
  }
});

module.exports = router;