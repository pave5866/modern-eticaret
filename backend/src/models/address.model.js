const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Adres başlığı zorunludur'],
    trim: true
  },
  fullName: {
    type: String,
    required: [true, 'Ad Soyad zorunludur'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Telefon numarası zorunludur'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Adres zorunludur'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'Şehir zorunludur'],
    trim: true
  },
  district: {
    type: String,
    required: [true, 'İlçe zorunludur'],
    trim: true
  },
  postalCode: {
    type: String,
    required: [true, 'Posta kodu zorunludur'],
    trim: true
  },
  country: {
    type: String,
    default: 'Türkiye',
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Yeni bir adres varsayılan olarak işaretlendiğinde diğer adreslerin varsayılan özelliğini kaldır
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Varsayılan adres silindiğinde başka bir adresi varsayılan yap
addressSchema.post('remove', async function() {
  if (this.isDefault) {
    const firstAddress = await this.constructor.findOne({ user: this.user })
    if (firstAddress) {
      firstAddress.isDefault = true
      await firstAddress.save()
    }
  }
});

module.exports = mongoose.model('Address', addressSchema); 