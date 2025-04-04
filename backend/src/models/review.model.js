const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Değerlendirme bir ürüne ait olmalıdır']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Değerlendirme bir kullanıcıya ait olmalıdır']
    },
    rating: {
      type: Number,
      required: [true, 'Değerlendirme puanı gereklidir'],
      min: 1,
      max: 5
    },
    review: {
      type: String,
      required: [true, 'Değerlendirme metni gereklidir'],
      trim: true
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

// Her ürün ve kullanıcı kombinasyonu için sadece bir değerlendirme olabilir
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Ürünün ortalama puanını hesaplayan statik metod
reviewSchema.statics.calcAverageRatings = async function(productId) {
  const stats = await this.aggregate([
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

  // Eğer bu ürüne ait değerlendirmeler varsa
  if (stats.length > 0) {
    await this.model('Product').findByIdAndUpdate(productId, {
      ratings: stats[0].avgRating,
      numReviews: stats[0].nRating
    });
  } else {
    // Eğer değerlendirme yoksa
    await this.model('Product').findByIdAndUpdate(productId, {
      ratings: 0,
      numReviews: 0
    });
  }
};

// Yeni değerlendirme oluşturulduğunda ürünün ortalama puanını güncelle
reviewSchema.post('save', function() {
  // this.constructor ile şema statik metoduna erişim
  this.constructor.calcAverageRatings(this.product);
});

// Değerlendirme silindiğinde veya güncellendiğinde ürünün ortalama puanını güncelle
reviewSchema.post(/^findOneAnd/, async function(doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.product);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;