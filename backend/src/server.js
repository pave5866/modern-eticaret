const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const pino = require('pino');

// Env config
dotenv.config();

// Logger oluştur
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

const app = express();

// CORS options
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use(cookieParser());

// Routes
app.use('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

// Örnek ürün rotası
app.use('/api/products', (req, res) => {
  const dummyProducts = [
    { 
      _id: '1', 
      name: 'Kablosuz Kulaklık',
      price: 999.99,
      description: 'Yüksek kaliteli ses deneyimi sunan kablosuz kulaklık.',
      category: 'Elektronik',
      stock: 15,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?q=80&w=1000&auto=format&fit=crop'
      ],
      createdAt: new Date().toISOString()
    },
    { 
      _id: '2', 
      name: 'Bluetooth Hoparlör',
      price: 799.99,
      description: 'Taşınabilir bluetooth hoparlör, 10 saat pil ömrü.',
      category: 'Elektronik',
      stock: 10,
      images: [
        'https://images.unsplash.com/photo-1589003077984-894e133dabab?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1000&auto=format&fit=crop'
      ],
      createdAt: new Date().toISOString()
    },
    { 
      _id: '3', 
      name: 'Akıllı Saat', 
      price: 1999.99,
      description: 'Fitness takibi, kalp ritmi ölçümü ve bildirimler.',
      category: 'Elektronik',
      stock: 8,
      images: [
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop'
      ],
      createdAt: new Date().toISOString()
    },
    { 
      _id: '4', 
      name: 'Modern Koltuk', 
      price: 3499.99,
      description: 'Şık ve modern tasarım, yüksek konfor.',
      category: 'Ev & Yaşam',
      stock: 5,
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1000&auto=format&fit=crop'
      ],
      createdAt: new Date().toISOString()
    },
    { 
      _id: '5', 
      name: 'Pamuklu T-Shirt', 
      price: 199.99,
      description: '100% pamuk, nefes alabilir kumaş.',
      category: 'Giyim',
      stock: 50,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=1000&auto=format&fit=crop'
      ],
      createdAt: new Date().toISOString()
    },
    { 
      _id: '6', 
      name: 'Tasarım Kitaplık', 
      price: 1599.99,
      description: 'Modern tasarım, geniş depolama alanı.',
      category: 'Ev & Yaşam',
      stock: 3,
      images: [
        'https://images.unsplash.com/photo-1588279102918-da99252b3ede?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1591129841117-3adfd313e34f?q=80&w=1000&auto=format&fit=crop'
      ],
      createdAt: new Date().toISOString()
    },
    { 
      _id: '7', 
      name: 'Ahşap Masa', 
      price: 2299.99,
      description: 'Doğal ahşap, dayanıklı ve şık.',
      category: 'Ev & Yaşam',
      stock: 7,
      images: [
        'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1577140917170-285929fb55b7?q=80&w=1000&auto=format&fit=crop'
      ],
      createdAt: new Date().toISOString()
    },
    { 
      _id: '8', 
      name: 'Nemlendirici Krem', 
      price: 149.99,
      description: 'Cilt bakımı için günlük nemlendirici.',
      category: 'Kozmetik',
      stock: 20,
      images: [
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?q=80&w=1000&auto=format&fit=crop'
      ],
      createdAt: new Date().toISOString()
    },
    { 
      _id: '9', 
      name: 'Yoga Matı', 
      price: 299.99,
      description: 'Profesyonel yoga ve pilates matı.',
      category: 'Spor',
      stock: 12,
      images: [
        'https://images.unsplash.com/photo-1599447292180-45fd84092ef4?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop'
      ],
      createdAt: new Date().toISOString()
    },
    { 
      _id: '10', 
      name: 'Oyuncak Araba', 
      price: 99.99,
      description: 'Uzaktan kumandalı yarış arabası.',
      category: 'Oyuncak',
      stock: 15,
      images: [
        'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1536919822732-ab087c88e3ab?q=80&w=1000&auto=format&fit=crop'
      ],
      createdAt: new Date().toISOString()
    }
  ];
  
  // Kategori filtreleme ve sayfalama için URL parametrelerini kontrol et
  const { category, limit = 15, skip = 0 } = req.query;
  let filteredProducts = [...dummyProducts];
  
  // Kategori filtreleme
  if (category) {
    filteredProducts = filteredProducts.filter(
      p => p.category && p.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Sayfalama
  const startIndex = parseInt(skip);
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.status(200).json({ 
    success: true, 
    data: paginatedProducts,
    total: filteredProducts.length
  });
});

// Örnek kategoriler rotası
app.use('/api/products/categories', (req, res) => {
  const categories = [
    'Elektronik',
    'Giyim',
    'Kitap',
    'Ev & Yaşam',
    'Kozmetik',
    'Spor',
    'Oyuncak'
  ];
  
  res.status(200).json({ success: true, data: categories });
});

// Dinamik rota importları
const routePath = path.join(__dirname, 'routes');
const fs = require('fs');
try {
  fs.readdirSync(routePath).forEach(file => {
    if (file.endsWith('.routes.js') || file.endsWith('.route.js')) {
      const route = require(path.join(routePath, file));
      app.use('/api', route);
      logger.info(`Route yüklendi: ${file}`);
    }
  });
} catch (error) {
  logger.error(`Rotalar yüklenirken hata oluştu: ${error.message}`);
}

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
  .then(() => {
    logger.info('MongoDB bağlantısı başarılı');
  })
  .catch((err) => {
    logger.error(`MongoDB bağlantı hatası: ${err.message}`);
    logger.info('MongoDB yerine dummy veriler kullanılıyor.');
  });

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ status: 'error', message: 'Sayfa bulunamadı' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Sunucu hatası'
  });
});

// Port ayarı
const PORT = process.env.PORT || 5000;

// Sunucuyu başlat
app.listen(PORT, () => {
  logger.info(`Sunucu ${PORT} portunda çalışıyor`);
  logger.info(`API erişim adresi: http://localhost:${PORT}/api/health`);
});

module.exports = app; 