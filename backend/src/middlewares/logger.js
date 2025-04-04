const Log = require('../models/log.model')
const logger = require('../utils/logger')

// Request başlangıç zamanını kaydet
const startTimer = (req, res, next) => {
  req.startTime = Date.now()
  next()
}

// Log oluştur
const createLog = async (req, res, data = {}) => {
  const endTime = Date.now()
  const duration = endTime - req.startTime

  try {
    const logData = {
      user: req.user?._id,
      action: data.action || getActionFromPath(req.path, req.method),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      method: req.method,
      path: req.path,
      status: res.statusCode,
      requestBody: sanitizeBody(req.body),
      responseBody: res.locals.responseBody,
      error: data.error,
      metadata: data.metadata,
      duration
    }

    await Log.createLog(logData)
  } catch (error) {
    logger.error('Log oluşturma hatası:', { error: error.message })
  }
}

// Response body'yi yakala
const captureResponseBody = (req, res, next) => {
  const oldJson = res.json
  res.json = function(body) {
    res.locals.responseBody = body
    return oldJson.call(this, body)
  }
  next()
}

// İstek tamamlandığında log oluştur
const logOnFinish = (req, res, next) => {
  res.on('finish', () => {
    createLog(req, res)
  })
  next()
}

// Hata durumunda log oluştur
const logError = (error, req, res, next) => {
  createLog(req, res, {
    action: 'system_error',
    error: {
      message: error.message,
      stack: error.stack
    }
  })
  next(error)
}

// Path ve method'a göre action belirle
const getActionFromPath = (path, method) => {
  const pathParts = path.split('/')
  const resource = pathParts[1]
  
  switch (resource) {
    case 'auth':
      if (path.includes('login')) return 'login'
      if (path.includes('logout')) return 'logout'
      if (path.includes('register')) return 'register'
      if (path.includes('password')) {
        if (path.includes('reset')) return 'password_reset'
        if (path.includes('change')) return 'password_change'
      }
      if (path.includes('profile')) return 'profile_update'
      break
      
    case 'products':
      if (method === 'GET') return 'product_view'
      if (method === 'POST') return 'product_create'
      if (method === 'PUT') return 'product_update'
      if (method === 'DELETE') return 'product_delete'
      if (path.includes('review')) return 'product_review'
      break
      
    case 'categories':
      if (method === 'POST') return 'category_create'
      if (method === 'PUT') return 'category_update'
      if (method === 'DELETE') return 'category_delete'
      break
      
    case 'orders':
      if (method === 'POST') return 'order_create'
      if (method === 'PUT') return 'order_update'
      if (path.includes('cancel')) return 'order_cancel'
      if (path.includes('refund')) return 'order_refund'
      break
      
    case 'addresses':
      if (method === 'POST') return 'address_create'
      if (method === 'PUT') return 'address_update'
      if (method === 'DELETE') return 'address_delete'
      break
      
    case 'cart':
      if (method === 'POST') return 'cart_add'
      if (method === 'PUT') return 'cart_update'
      if (method === 'DELETE') return 'cart_remove'
      if (path.includes('clear')) return 'cart_clear'
      break
      
    case 'wishlist':
      if (method === 'POST') return 'wishlist_add'
      if (method === 'DELETE') return 'wishlist_remove'
      break
      
    case 'admin':
      if (path.includes('login')) return 'admin_login'
      return 'admin_action'
      
    case 'settings':
      return 'settings_update'
  }
  
  return 'api_request'
}

// Hassas verileri temizle
const sanitizeBody = (body) => {
  if (!body) return body
  
  const sanitized = { ...body }
  const sensitiveFields = ['password', 'token', 'cardNumber', 'cvv', 'expiryDate']
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[HIDDEN]'
    }
  })
  
  return sanitized
}

// HTTP isteklerini loglama middleware'i
const requestLogger = (req, res, next) => {
  const startTime = Date.now()
  
  // Orijinal res.end fonksiyonunu kaydet
  const originalEnd = res.end
  
  // res.end fonksiyonunu override et
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime
    const statusCode = res.statusCode
    
    // Log verilerini hazırla
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: statusCode,
      responseTime,
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      user: req.user ? req.user._id : null,
      level: statusCode >= 400 ? 'error' : 'info'
    }
    
    // Veritabanına kaydet
    try {
      Log.createLog(logData)
    } catch (error) {
      logger.error('Log oluşturma hatası:', { error: error.message })
    }
    
    // Orijinal res.end fonksiyonunu çağır
    return originalEnd.call(this, chunk, encoding)
  }
  
  next()
}

module.exports = {
  startTimer,
  captureResponseBody,
  logOnFinish,
  logError,
  createLog,
  requestLogger
} 