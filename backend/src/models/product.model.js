const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ürün adı gereklidir'],
      trim: true,
      maxlength: [100, 'Ürün adı 100 karakterden fazla olamaz']
    },
    description: {
      type: String,
      required: [true, 'Ürün açıklaması gereklidir'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Ürün fiyatı gereklidir'],
      min: [0, 'Fiyat 0 veya daha yüksek olmalıdır']
    },
    category: {
      type: String,
      required: [true, 'Ürün kategorisi gereklidir'],
      trim: true
    },
    stock: {
      type: Number,
      required: [true, 'Ürün stoğu gereklidir'],
      min: [0, 'Stok 0 veya daha yüksek olmalıdır'],
      default: 0
    },
    images: {
      type: [String],
      default: ["https://res.cloudinary.com/dlkrduwav/image/upload/v1647812345/placeholder_kq1tnu.png"]
    },
    ratings: {
      type: Number,
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual tanımı yorum satırına alındı
/*
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false
});
*/

// Statik metotlar
productSchema.statics.calcAverageRatings = async function(productId) {
  const stats = await this.model('Review').aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(productId, {
      ratings: stats[0].avgRating,
      numReviews: stats[0].nRating
    });
  } else {
    await this.findByIdAndUpdate(productId, {
      ratings: 0,
      numReviews: 0
    });
  }
};

// Pre-find hook devre dışı bırakıldı
/*
productSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'reviews',
    select: 'rating review user'
  });
  next();
});
*/

// Indexes
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;