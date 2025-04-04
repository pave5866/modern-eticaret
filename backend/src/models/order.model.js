const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    image: String
  }],
  shippingAddress: {
    title: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    postalCode: String,
    country: {
      type: String,
      default: 'Türkiye'
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Kredi Kartı', 'Havale/EFT', 'Kapıda Ödeme']
  },
  paymentResult: {
    id: String,
    status: String,
    updateTime: String,
    emailAddress: String
  },
  totalAmount: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  trackingNumber: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Sipariş numarası oluşturma
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    this.orderNumber = `${year}${month}${day}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Sipariş durumunu güncelleme
orderSchema.methods.updateStatus = function(status, note) {
  this.status = status
  this.statusHistory.push({
    status,
    note
  })
  return this.save()
}

// Ödeme durumunu güncelleme
orderSchema.methods.updatePaymentStatus = function(status) {
  this.paymentStatus = status
  return this.save()
}

// Kargo takip numarasını güncelleme
orderSchema.methods.updateTrackingNumber = function(trackingNumber) {
  this.trackingNumber = trackingNumber
  return this.save()
}

// Sipariş iptali
orderSchema.methods.cancelOrder = function(note) {
  this.status = 'cancelled'
  this.statusHistory.push({
    status: 'cancelled',
    note
  })
  return this.save()
}

// Sipariş iade
orderSchema.methods.refundOrder = function(note) {
  this.status = 'cancelled'
  this.paymentStatus = 'refunded'
  this.statusHistory.push({
    status: 'cancelled',
    note: note || 'Sipariş iade edildi'
  })
  return this.save()
}

module.exports = mongoose.model('Order', orderSchema); 