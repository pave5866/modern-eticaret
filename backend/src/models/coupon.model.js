const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Kupon kodu gerekli'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Kupon açıklaması gerekli']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'İndirim tipi gerekli']
  },
  discountAmount: {
    type: Number,
    required: [true, 'İndirim miktarı gerekli'],
    min: [0, 'İndirim miktarı 0\'dan küçük olamaz']
  },
  minPurchaseAmount: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  usageLimit: {
    type: Number
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Kupon kullanılabilir mi kontrolü
couponSchema.methods.isValid = function(purchaseAmount) {
  const now = new Date();

  if (!this.isActive) return false;
  if (this.endDate && now > this.endDate) return false;
  if (now < this.startDate) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  if (purchaseAmount < this.minPurchaseAmount) return false;

  return true;
};

// İndirim miktarını hesapla
couponSchema.methods.calculateDiscount = function(purchaseAmount) {
  let discount = 0;

  if (this.discountType === 'percentage') {
    discount = (purchaseAmount * this.discountAmount) / 100;
    if (this.maxDiscountAmount) {
      discount = Math.min(discount, this.maxDiscountAmount);
    }
  } else {
    discount = this.discountAmount;
  }

  return Math.min(discount, purchaseAmount);
};

module.exports = mongoose.model('Coupon', couponSchema); 