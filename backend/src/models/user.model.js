const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const logger = require('../utils/logger');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim alanı zorunludur'],
    trim: true,
    minlength: [2, 'İsim en az 2 karakter olmalıdır'],
    maxlength: [50, 'İsim en fazla 50 karakter olabilir']
  },
  email: {
    type: String,
    required: [true, 'Email alanı zorunludur'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Geçerli bir email adresi giriniz']
  },
  password: {
    type: String,
    required: [true, 'Şifre alanı zorunludur'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  addresses: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Address'
  }],
  orders: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Order'
  }],
  cart: {
    items: [{
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      }
    }],
    totalAmount: {
      type: Number,
      default: 0
    }
  },
  wishlist: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }],
  notifications: [{
    title: String,
    message: String,
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error']
    },
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    language: {
      type: String,
      default: 'tr'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Şifre hashleme middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Şifre karşılaştırma metodu - Basitleştirilmiş
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    logger.error('Şifre karşılaştırma hatası:', error.message);
    return false;
  }
};

// Password reset token oluşturma
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 dakika
  
  return resetToken;
};

// Sepete ürün ekleme
userSchema.methods.addToCart = function(product, quantity = 1) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.product.toString() === product._id.toString();
  });

  if (cartProductIndex >= 0) {
    this.cart.items[cartProductIndex].quantity += quantity;
  } else {
    this.cart.items.push({
      product: product._id,
      quantity: quantity
    });
  }

  // Toplam tutarı güncelle
  this.cart.totalAmount = this.cart.items.reduce((total, item) => {
    return total + (item.quantity * product.price);
  }, 0);

  return this.save();
};

// Sepetten ürün çıkarma
userSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.product.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;

  // Toplam tutarı güncelle
  this.cart.totalAmount = this.cart.items.reduce((total, item) => {
    return total + (item.quantity * item.product.price);
  }, 0);

  return this.save();
};

// Sepeti temizleme
userSchema.methods.clearCart = function() {
  this.cart = { items: [], totalAmount: 0 };
  return this.save();
};

// İstek listesine ürün ekleme/çıkarma
userSchema.methods.toggleWishlist = function(productId) {
  const index = this.wishlist.indexOf(productId);
  if (index > -1) {
    this.wishlist.splice(index, 1);
  } else {
    this.wishlist.push(productId);
  }
  return this.save();
};

// Bildirim ekleme
userSchema.methods.addNotification = function(notification) {
  this.notifications.push(notification);
  return this.save();
};

// Bildirimleri okundu olarak işaretleme
userSchema.methods.markNotificationsAsRead = function() {
  this.notifications = this.notifications.map(notification => {
    notification.read = true;
    return notification;
  });
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;