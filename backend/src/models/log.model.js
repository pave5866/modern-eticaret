const mongoose = require('mongoose')
const logger = require('../utils/logger')

const logSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true,
    enum: [
      // Auth işlemleri
      'login',
      'logout',
      'register',
      'password_reset',
      'password_change',
      'profile_update',
      
      // Ürün işlemleri
      'product_view',
      'product_create',
      'product_update',
      'product_delete',
      'product_review',
      
      // Kategori işlemleri
      'category_create',
      'category_update',
      'category_delete',
      
      // Sipariş işlemleri
      'order_create',
      'order_update',
      'order_cancel',
      'order_refund',
      
      // Adres işlemleri
      'address_create',
      'address_update',
      'address_delete',
      
      // Sepet işlemleri
      'cart_add',
      'cart_update',
      'cart_remove',
      'cart_clear',
      
      // Favori işlemleri
      'wishlist_add',
      'wishlist_remove',
      
      // Admin işlemleri
      'admin_login',
      'admin_action',
      'settings_update',
      
      // Sistem işlemleri
      'system_error',
      'api_error',
      'payment_error',
      'api_request',
      'api_response'
    ]
  },
  ip: String,
  userAgent: String,
  method: String,
  path: String,
  status: Number,
  requestBody: mongoose.Schema.Types.Mixed,
  responseBody: mongoose.Schema.Types.Mixed,
  error: {
    message: String,
    stack: String
  },
  metadata: mongoose.Schema.Types.Mixed,
  duration: Number,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60 // 30 gün sonra otomatik sil
  }
}, {
  timestamps: true
})

// İndexler
logSchema.index({ action: 1, createdAt: -1 })
logSchema.index({ user: 1, createdAt: -1 })
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }) // 30 gün sonra otomatik sil

// Log oluştur
logSchema.statics.createLog = async function(data) {
  try {
    const log = new this(data)
    await log.save()
    return log
  } catch (error) {
    logger.error('Log oluşturma hatası:', { error: error.message })
    // Hata olsa bile işlemi devam ettir
    return null
  }
}

// Kullanıcı loglarını getir
logSchema.statics.getUserLogs = async function(userId, options = {}) {
  const query = { user: userId }
  
  if (options.action) {
    query.action = options.action
  }
  
  if (options.startDate) {
    query.createdAt = { $gte: options.startDate }
  }
  
  if (options.endDate) {
    query.createdAt = { ...query.createdAt, $lte: options.endDate }
  }
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 100)
    .select(options.select || '-requestBody -responseBody')
}

// Hata loglarını getir
logSchema.statics.getErrorLogs = async function(options = {}) {
  const query = {
    action: { $in: ['system_error', 'api_error', 'payment_error'] }
  }
  
  if (options.startDate) {
    query.createdAt = { $gte: options.startDate }
  }
  
  if (options.endDate) {
    query.createdAt = { ...query.createdAt, $lte: options.endDate }
  }
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 100)
}

// Admin işlem loglarını getir
logSchema.statics.getAdminLogs = async function(options = {}) {
  const query = {
    action: { $in: ['admin_login', 'admin_action'] }
  }
  
  if (options.startDate) {
    query.createdAt = { $gte: options.startDate }
  }
  
  if (options.endDate) {
    query.createdAt = { ...query.createdAt, $lte: options.endDate }
  }
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 100)
    .populate('user', 'name email')
}

module.exports = mongoose.model('Log', logSchema) 