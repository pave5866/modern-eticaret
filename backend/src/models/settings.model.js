const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  general: {
    storeName: {
      type: String,
      required: [true, 'Mağaza adı gereklidir'],
      trim: true
    },
    storeEmail: {
      type: String,
      required: [true, 'E-posta adresi gereklidir'],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir e-posta adresi giriniz']
    },
    storePhone: {
      type: String,
      required: [true, 'Telefon numarası gereklidir']
    },
    storeAddress: {
      type: String,
      required: [true, 'Adres gereklidir']
    },
    storeCurrency: {
      type: String,
      enum: ['TRY', 'USD', 'EUR'],
      default: 'TRY'
    },
    storeLanguage: {
      type: String,
      enum: ['tr', 'en'],
      default: 'tr'
    }
  },
  appearance: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    primaryColor: {
      type: String,
      default: '#6366F1'
    },
    secondaryColor: {
      type: String,
      default: '#A855F7'
    },
    borderRadius: {
      type: String,
      enum: ['rounded', 'square'],
      default: 'rounded'
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    }
  },
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    orderNotifications: {
      type: Boolean,
      default: true
    },
    stockNotifications: {
      type: Boolean,
      default: true
    },
    marketingNotifications: {
      type: Boolean,
      default: false
    }
  },
  shipping: {
    freeShippingThreshold: {
      type: Number,
      default: 500
    },
    defaultShippingFee: {
      type: Number,
      default: 29.99
    },
    internationalShipping: {
      type: Boolean,
      default: false
    },
    shippingMethods: {
      type: [String],
      default: ['Standart', 'Express']
    }
  },
  payment: {
    currency: {
      type: String,
      enum: ['TRY', 'USD', 'EUR'],
      default: 'TRY'
    },
    currencySymbol: {
      type: String,
      enum: ['₺', '$', '€'],
      default: '₺'
    },
    paymentMethods: {
      type: [String],
      default: ['Kredi Kartı', 'Havale/EFT', 'Kapıda Ödeme']
    },
    taxRate: {
      type: Number,
      default: 18
    }
  },
  security: {
    twoFactorAuth: {
      type: Boolean,
      default: false
    },
    passwordExpiry: {
      type: Number,
      default: 90
    },
    sessionTimeout: {
      type: Number,
      default: 30
    },
    ipWhitelist: {
      type: [String],
      default: []
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema); 