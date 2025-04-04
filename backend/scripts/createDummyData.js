const mongoose = require('mongoose');
const Product = require('../src/models/product.model');
const Category = require('../src/models/category.model');
const User = require('../src/models/user.model');
const Order = require('../src/models/order.model');
const logger = require('../src/utils/logger');
require('dotenv').config();

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('MongoDB bağlantısı başarılı');
    createDummyData();
  })
  .catch(error => {
    logger.error('MongoDB bağlantı hatası:', error);
    process.exit(1);
  });

const categories = [
  { name: 'Elektronik', slug: 'elektronik', description: 'Elektronik ürünler' },
  { name: 'Giyim', slug: 'giyim', description: 'Giyim ürünleri' },
  { name: 'Kitap', slug: 'kitap', description: 'Kitaplar' },
  { name: 'Ev & Yaşam', slug: 'ev-yasam', description: 'Ev ve yaşam ürünleri' },
  { name: 'Kozmetik', slug: 'kozmetik', description: 'Kozmetik ürünleri' },
  { name: 'Spor', slug: 'spor', description: 'Spor ekipmanları' },
  { name: 'Oyuncak', slug: 'oyuncak', description: 'Oyuncaklar' },
];

const products = [
  {
    name: 'Kablosuz Kulaklık',
    slug: 'kablosuz-kulaklik',
    price: 999.99,
    description: 'Yüksek kaliteli ses deneyimi sunan kablosuz kulaklık.',
    category: 'Elektronik',
    stock: 15,
    images: [
      'https://res.cloudinary.com/dlkrduwav/image/upload/v1716065896/headphones_1_eesk0k.jpg',
    ],
    featured: true
  },
  {
    name: 'Bluetooth Hoparlör',
    slug: 'bluetooth-hoparlor',
    price: 799.99,
    description: 'Taşınabilir bluetooth hoparlör, 10 saat pil ömrü.',
    category: 'Elektronik',
    stock: 10,
    images: [
      'https://res.cloudinary.com/dlkrduwav/image/upload/v1716066033/speaker_xjjr3i.jpg',
    ],
    featured: true
  },
  {
    name: 'Akıllı Saat',
    slug: 'akilli-saat',
    price: 1999.99,
    description: 'Fitness takibi, kalp ritmi ölçümü ve bildirimler.',
    category: 'Elektronik',
    stock: 8,
    images: [
      'https://res.cloudinary.com/dlkrduwav/image/upload/v1716066082/smartwatch_yjskbo.jpg',
    ],
    featured: true
  },
  {
    name: 'Pamuklu T-shirt',
    slug: 'pamuklu-tshirt',
    price: 149.99,
    description: '100% organik pamuklu t-shirt.',
    category: 'Giyim',
    stock: 25,
    images: [
      'https://res.cloudinary.com/dlkrduwav/image/upload/v1716066141/tshirt_gzl6qy.jpg',
    ],
    featured: false
  },
  {
    name: 'Kot Pantolon',
    slug: 'kot-pantolon',
    price: 299.99,
    description: 'Slim fit kot pantolon.',
    category: 'Giyim',
    stock: 20,
    images: [
      'https://res.cloudinary.com/dlkrduwav/image/upload/v1716066216/jeans_qxrtck.jpg',
    ],
    featured: false
  },
  {
    name: 'Dünya Klasikleri Seti',
    slug: 'dunya-klasikleri-seti',
    price: 499.99,
    description: '10 kitaplık dünya klasikleri seti.',
    category: 'Kitap',
    stock: 5,
    images: [
      'https://res.cloudinary.com/dlkrduwav/image/upload/v1716066276/books_vu45jr.jpg',
    ],
    featured: false
  },
  {
    name: 'Yoga Matı',
    slug: 'yoga-mati',
    price: 199.99,
    description: 'Profesyonel yoga matı, kaymaz yüzey.',
    category: 'Spor',
    stock: 12,
    images: [
      'https://res.cloudinary.com/dlkrduwav/image/upload/v1716066345/yoga_mat_sdxtiq.jpg',
    ],
    featured: false
  },
  {
    name: 'Cilt Bakım Seti',
    slug: 'cilt-bakim-seti',
    price: 599.99,
    description: 'Doğal içerikli cilt bakım seti.',
    category: 'Kozmetik',
    stock: 8,
    images: [
      'https://res.cloudinary.com/dlkrduwav/image/upload/v1716066425/skincare_acavdz.jpg',
    ],
    featured: false
  },
  {
    name: 'Ahşap Mutfak Seti',
    slug: 'ahsap-mutfak-seti',
    price: 899.99,
    description: 'El yapımı ahşap mutfak gereçleri seti.',
    category: 'Ev & Yaşam',
    stock: 6,
    images: [
      'https://res.cloudinary.com/dlkrduwav/image/upload/v1716066482/kitchen_tools_ckwxpk.jpg',
    ],
    featured: true
  },
  {
    name: 'Eğitici Oyuncak Seti',
    slug: 'egitici-oyuncak-seti',
    price: 349.99,
    description: '3-6 yaş arası çocuklar için eğitici oyuncak seti.',
    category: 'Oyuncak',
    stock: 10,
    images: [
      'https://res.cloudinary.com/dlkrduwav/image/upload/v1716066538/toys_gq8nws.jpg',
    ],
    featured: false
  },
];

async function createDummyData() {
  try {
    // Tüm mevcut verileri temizle
    logger.info('Tüm verileri silme işlemi başlatılıyor...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});
    // User silme işlemini atla (admin kullanıcıları korumak için)
    logger.info('Tüm veriler silindi');

    // Kategorileri oluştur
    const createdCategories = await Category.insertMany(categories);
    logger.info(`${createdCategories.length} kategori başarıyla eklendi`);

    // Kategori adlarını ID'lerle eşleştir
    const categoryMap = {};
    createdCategories.forEach(category => {
      categoryMap[category.name] = category._id;
    });

    // Ürünleri ekle
    const productsWithCategoryIds = products.map(product => ({
      ...product,
      category: categoryMap[product.category]
    }));

    const createdProducts = await Product.insertMany(productsWithCategoryIds);
    logger.info(`${createdProducts.length} ürün başarıyla eklendi`);

    mongoose.connection.close();
    logger.info('Veritabanı bağlantısı kapatıldı');
    process.exit(0);
  } catch (error) {
    logger.error('Dummy veri oluşturma hatası:', error);
    mongoose.connection.close();
    process.exit(1);
  }
} 