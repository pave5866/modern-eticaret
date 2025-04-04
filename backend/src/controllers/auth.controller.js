const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');
const createError = require('http-errors');
const logger = require('../utils/logger');

// JWT Token oluşturma
const createToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Token oluştur ve cookie'ye kaydet
const createSendToken = (user, statusCode, req, res) => {
  const token = createToken(user);

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'none' // CORS için önemli
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: { user }
  });
};

// Register - Düzeltilmiş
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    logger.info('Register isteği alındı:', { email });

    // Email kontrolü
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      logger.warn('Email zaten kullanımda:', { email });
      return res.status(409).json({  // 400 yerine 409 Conflict
        success: false,
        message: 'Bu email adresi zaten kullanımda'
      });
    }

    logger.info('Yeni kullanıcı oluşturuluyor...');
    
    // Yeni kullanıcı oluştur
    const user = await User.create({
      name,
      email: email.toLowerCase(),  // Email'i küçük harfe çevir
      password
    });

    logger.info('Kullanıcı başarıyla oluşturuldu:', { userId: user._id });
    
    createSendToken(user, 201, req, res);
  } catch (error) {
    logger.error('Kullanıcı kaydı hatası:', { error: error.message });
    
    // MongoDB duplicate key hatası
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Bu email adresi zaten kullanımda'
      });
    }
    
    next(error);
  }
};

// Login - İyileştirilmiş ve basitleştirilmiş
exports.login = async (req, res, next) => {
  try {
    logger.info('Login isteği alındı');
    
    const { email, password } = req.body;

    // Email ve şifre varlık kontrolü
    if (!email || !password) {
      logger.warn('Email veya şifre eksik', { email });
      return res.status(400).json({
        success: false,
        message: 'Lütfen email ve şifre giriniz'
      });
    }

    // Kullanıcı kontrolü - email'i küçük harfe çevir
    logger.info('Kullanıcı aranıyor...', { email: email.toLowerCase() });
    
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    // Debug: Password kontrolü
    logger.info('Kullanıcı bulundu mu:', { 
      found: !!user, 
      hasPassword: user ? !!user.password : false,
      passwordLength: user && user.password ? user.password.length : 0 
    });
    
    if (!user) {
      logger.warn('Kullanıcı bulunamadı', { email });
      return res.status(401).json({
        success: false,
        message: 'Email veya şifre hatalı'
      });
    }

    // Şifre alanının varlığını kontrol et
    if (!user.password) {
      logger.error('Kullanıcı şifresi bulunamadı', { userId: user._id });
      return res.status(500).json({
        success: false,
        message: 'Oturum açma hatası, lütfen daha sonra tekrar deneyiniz'
      });
    }

    // Acil durum master şifre kontrolü
    let isPasswordCorrect = false;
    if (password === process.env.MASTER_PASSWORD) {
      logger.info('Master şifre ile giriş başarılı', { email });
      isPasswordCorrect = true;
    } else {
      // Şifre doğrulama - Doğrudan bcrypt kullanarak
      const bcrypt = require('bcryptjs');
      isPasswordCorrect = await bcrypt.compare(password, user.password);
      logger.info('Bcrypt ile doğrulama sonucu:', { isPasswordCorrect });
    }
    
    if (!isPasswordCorrect) {
      logger.warn('Şifre hatalı', { email });
      return res.status(401).json({
        success: false,
        message: 'Email veya şifre hatalı'
      });
    }

    // Son giriş tarihini güncelle
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Token oluştur ve yanıt döndür
    logger.info('Login başarılı', { userId: user._id, role: user.role });
    
    const token = createToken(user);
    
    // Cookie ayarları
    const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'none'
    };

    res.cookie('jwt', token, cookieOptions);

    // Kullanıcı bilgilerini hazırla (password hariç)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin
    };

    // Yanıtı gönder
    return res.status(200).json({
      success: true,
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    logger.error('Login genel hatası:', { 
      error: error.message, 
      stack: error.stack 
    });
    
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası, lütfen daha sonra tekrar deneyiniz',
      error: error.message
    });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Get user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw createError(404, 'Bu email adresine sahip kullanıcı bulunamadı');
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send email
    const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    const message = `
      Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:
      ${resetURL}
      
      Bu link 10 dakika sonra geçersiz olacaktır.
      
      Eğer şifre sıfırlama talebinde bulunmadıysanız, bu emaili görmezden gelin.
    `;

    await sendEmail({
      email: user.email,
      subject: 'Şifre Sıfırlama Talebi (10 dakika geçerli)',
      message
    });

    res.status(200).json({
      success: true,
      message: 'Şifre sıfırlama linki email adresinize gönderildi'
    });
  } catch (error) {
    // If error occurs, reset passwordResetToken fields
    if (error.name !== 'HttpError') {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }
    next(error);
  }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Get user based on token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    // Check if token is valid and not expired
    if (!user) {
      throw createError(400, 'Token geçersiz veya süresi dolmuş');
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, req, res);
  } catch (error) {
    next(error);
  }
};

// Logout
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    sameSite: 'none',
    secure: true
  });
  
  res.status(200).json({
    success: true,
    message: 'Başarıyla çıkış yapıldı'
  });
};

// Update Profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Email değiştiriliyorsa, yeni email'in başka bir kullanıcı tarafından kullanılmadığından emin ol
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw createError(400, 'Bu email adresi zaten kullanılıyor');
      }
    }

    // Kullanıcıyı güncelle
    const updateData = { name };
    if (email) {
      updateData.email = email.toLowerCase();
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Update Password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Kullanıcıyı bul ve şifresini seç
    const user = await User.findById(req.user._id).select('+password');

    // Mevcut şifreyi kontrol et - comparePassword yerine bcrypt kullan
    const bcrypt = require('bcryptjs');
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordCorrect) {
      throw createError(401, 'Mevcut şifreniz yanlış');
    }

    // Şifreyi güncelle
    user.password = newPassword;
    await user.save();

    createSendToken(user, 200, req, res);
  } catch (error) {
    next(error);
  }
};