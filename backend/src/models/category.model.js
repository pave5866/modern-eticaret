const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Kategori adı zorunludur'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: String,
  image: String,
  parent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    default: null
  },
  ancestors: [{
    _id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    }
  }],
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
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
})

// Alt kategorileri getir
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
})

// Slug oluştur
categorySchema.pre('save', function(next) {
  if (!this.isModified('name')) return next()
  
  this.slug = this.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  
  next()
})

// Atalarını güncelle
categorySchema.pre('save', async function(next) {
  if (!this.isModified('parent')) return next()
  
  if (!this.parent) {
    this.ancestors = []
    return next()
  }

  try {
    const parent = await this.constructor.findById(this.parent)
    if (!parent) return next()

    this.ancestors = [
      ...parent.ancestors,
      {
        _id: parent._id,
        name: parent.name,
        slug: parent.slug
      }
    ]
    next()
  } catch (error) {
    next(error)
  }
})

// Alt kategorileri getir
categorySchema.methods.getChildren = async function() {
  return await this.constructor.find({ parent: this._id })
}

// Tüm alt kategorileri getir (recursive)
categorySchema.methods.getAllChildren = async function() {
  const children = await this.getChildren()
  let allChildren = [...children]

  for (let child of children) {
    const grandChildren = await child.getAllChildren()
    allChildren = [...allChildren, ...grandChildren]
  }

  return allChildren
}

// Kategoriyi taşı
categorySchema.methods.moveTo = async function(newParentId) {
  this.parent = newParentId
  return await this.save()
}

// Sırasını güncelle
categorySchema.methods.updateOrder = async function(newOrder) {
  this.order = newOrder
  return await this.save()
}

// Durumunu güncelle
categorySchema.methods.updateStatus = async function(isActive) {
  this.isActive = isActive
  return await this.save()
}

module.exports = mongoose.model('Category', categorySchema) 