import axios from 'axios';
import logger from '../utils/logger';

// Base API URL - Her zaman FakeStore API kullan
const API_URL = 'https://fakestoreapi.com';

// API çağrıları için Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 saniye timeout
});

// Alternatif API URL'leri
const DUMMY_JSON_URL = 'https://dummyjson.com';
const PLATZI_API_URL = 'https://api.escuelajs.co/api/v1';

// API önbellek (cache) sistemi ekle - API istek sayısını azaltmak için
// Önbellek objesi
const apiCache = {
  data: new Map(),
  
  // Önbelleğe veri ekle/güncelle
  set: (key, data, ttl = 60000) => { // varsayılan 1 dakika
    apiCache.data.set(key, {
      data,
      expires: Date.now() + ttl
    });
  },
  
  // Önbellekten veri al
  get: (key) => {
    const cachedData = apiCache.data.get(key);
    
    // Önbellekte veri yoksa null döndür
    if (!cachedData) return null;
    
    // Süresi geçmiş veriyi temizle ve null döndür
    if (cachedData.expires < Date.now()) {
      apiCache.data.delete(key);
      return null;
    }
    
    // Geçerli veriyi döndür
    return cachedData.data;
  },
  
  // Önbelleği temizle
  clear: () => {
    apiCache.data.clear();
  }
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Auth header ekle
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API fonksiyonlarını içeren obje
export const api = {
  get: (url, config) => axiosInstance.get(url, config),
  post: (url, data, config) => axiosInstance.post(url, data, config),
  put: (url, data, config) => axiosInstance.put(url, data, config),
  delete: (url, config) => axiosInstance.delete(url, config),
  patch: (url, data, config) => axiosInstance.patch(url, data, config)
};

// FakeStore API'yi kullanarak ürünleri getir
export const productAPI = {
  // Tüm ürünleri getir
  getAll: async (params = {}) => {
    // Cache key oluştur
    const cacheKey = `products-all-${JSON.stringify(params)}`;
    
    // Önbellekte var mı kontrol et
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const response = await axiosInstance.get('/products', { params });
      
      // FakeStore veri dönüşümü
      const transformedData = response.data.map(item => ({
        _id: item.id.toString(),
        name: item.title,
        price: item.price * 30, // TL'ye çevir
        description: item.description,
        category: item.category,
        stock: Math.floor(Math.random() * 20) + 5,
        images: [
          item.image,
          `https://fakestoreapi.com/img/${item.id}`
        ],
        createdAt: new Date().toISOString()
      }));
      
      const result = { 
        success: true, 
        data: transformedData, 
        total: transformedData.length 
      };
      
      // Önbelleğe ekle - 5 dakika (300,000ms) süreyle sakla
      apiCache.set(cacheKey, result, 300000);
      
      return result;
    } catch (error) {
      try {
        // FakeStore API başarısız olursa DummyJSON dene
        const dummyAxios = axios.create({
          baseURL: DUMMY_JSON_URL,
          timeout: 10000
        });
        const dummyResponse = await dummyAxios.get('/products', { params: { limit: 20 } });
        
        const dummyData = dummyResponse.data.products.map(item => ({
          _id: item.id.toString(),
          name: item.title,
          price: item.price * 30, // TL'ye çevir
          description: item.description,
          category: item.category,
          stock: item.stock || 10,
          images: item.images.slice(0, 3),
          createdAt: new Date().toISOString()
        }));
        
        const result = { 
          success: true, 
          data: dummyData, 
          total: dummyData.length 
        };
        
        // Önbelleğe ekle - 5 dakika (300,000ms) süreyle sakla
        apiCache.set(cacheKey, result, 300000);
        
        return result;
      } catch (dummyError) {
        throw new Error('Ürünler getirilemedi');
      }
    }
  },
  
  // Ürün detayı getir
  getById: async (id) => {
    // Cache key oluştur
    const cacheKey = `product-${id}`;
    
    // Önbellekte var mı kontrol et
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      const item = response.data;
      
      const result = {
        success: true,
        data: {
          _id: item.id.toString(),
          name: item.title,
          price: item.price * 30, // TL'ye çevir
          description: item.description,
          category: item.category,
          stock: Math.floor(Math.random() * 20) + 5,
          images: [
            item.image,
            `https://fakestoreapi.com/img/${item.id}`
          ],
          createdAt: new Date().toISOString()
        }
      };
      
      // Önbelleğe ekle - 10 dakika (600,000ms) süreyle sakla
      apiCache.set(cacheKey, result, 600000);
      
      return result;
    } catch (error) {
      try {
        // DummyJSON'dan dene
        const dummyAxios = axios.create({
          baseURL: DUMMY_JSON_URL,
          timeout: 10000
        });
        const dummyResponse = await dummyAxios.get(`/products/${id}`);
        const item = dummyResponse.data;
        
        const result = {
          success: true,
          data: {
            _id: item.id.toString(),
            name: item.title,
            price: item.price * 30,
            description: item.description,
            category: item.category,
            stock: item.stock || 10,
            images: item.images.slice(0, 3),
            createdAt: new Date().toISOString()
          }
        };
        
        // Önbelleğe ekle - 10 dakika (600,000ms) süreyle sakla
        apiCache.set(cacheKey, result, 600000);
        
        return result;
      } catch (dummyError) {
        throw new Error('Ürün detayı bulunamadı');
      }
    }
  },
  
  // Kategorileri getir
  getCategories: async () => {
    // Cache key
    const cacheKey = 'categories';
    
    // Önbellekte var mı kontrol et
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const response = await axiosInstance.get('/products/categories');
      
      // Kategorileri Türkçeleştir
      const translatedCategories = response.data.map(cat => {
        const translations = {
          'electronics': 'Elektronik',
          'jewelery': 'Takı ve Mücevher',
          "men's clothing": 'Erkek Giyim',
          "women's clothing": 'Kadın Giyim'
        };
        return translations[cat] || cat;
      });
      
      const result = { 
        success: true, 
        data: translatedCategories 
      };
      
      // Önbelleğe ekle - 30 dakika (1,800,000ms) süreyle sakla
      apiCache.set(cacheKey, result, 1800000);
      
      return result;
    } catch (error) {
      try {
        // DummyJSON kategorilerini dene
        const dummyResponse = await axios.get(`${DUMMY_JSON_URL}/products/categories`);
        
        const translatedDummyCategories = dummyResponse.data.map(cat => {
          const translations = {
            'smartphones': 'Akıllı Telefonlar',
            'laptops': 'Dizüstü Bilgisayarlar',
            'fragrances': 'Parfümler',
            'skincare': 'Cilt Bakımı',
            'groceries': 'Market Ürünleri',
            'home-decoration': 'Ev Dekorasyonu',
            'furniture': 'Mobilya',
            'tops': 'Üst Giyim',
            'womens-dresses': 'Kadın Elbiseleri',
            'womens-shoes': 'Kadın Ayakkabıları',
            'mens-shirts': 'Erkek Gömlekleri',
            'mens-shoes': 'Erkek Ayakkabıları',
            'mens-watches': 'Erkek Saatleri',
            'womens-watches': 'Kadın Saatleri',
            'womens-bags': 'Kadın Çantaları',
            'womens-jewellery': 'Kadın Takıları',
            'sunglasses': 'Güneş Gözlükleri',
            'automotive': 'Otomotiv',
            'motorcycle': 'Motosiklet',
            'lighting': 'Aydınlatma'
          };
          return translations[cat] || cat;
        });
        
        const result = { 
          success: true, 
          data: translatedDummyCategories 
        };
        
        // Önbelleğe ekle - 30 dakika (1,800,000ms) süreyle sakla
        apiCache.set(cacheKey, result, 1800000);
        
        return result;
      } catch (dummyError) {
        // Statik kategoriler döndür
        const result = { 
          success: true, 
          data: ['Elektronik', 'Giyim', 'Aksesuar', 'Ev & Yaşam', 'Kozmetik', 'Spor'] 
        };
        
        // Önbelleğe ekle - 30 dakika süreyle
        apiCache.set(cacheKey, result, 1800000);
        
        return result;
      }
    }
  },
  
  // Kategoriye göre ürünleri getir
  getByCategory: async (category) => {
    // Cache key
    const cacheKey = `products-category-${category}`;
    
    // Önbellekte var mı kontrol et
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    try {
      // İngilizce kategori isimlerine çevir
      const categoryTranslations = {
        'Elektronik': 'electronics',
        'Takı ve Mücevher': 'jewelery',
        'Erkek Giyim': "men's clothing",
        'Kadın Giyim': "women's clothing"
      };
      
      const englishCategory = categoryTranslations[category] || category;
      
      const response = await axios.get(`${API_URL}/products/category/${englishCategory}`);
      
      // FakeStore veri dönüşümü
      const transformedData = response.data.map(item => ({
        _id: item.id.toString(),
        name: item.title,
        price: item.price * 30, // TL'ye çevir
        description: item.description,
        category: category, // Türkçe kategori adı
        stock: Math.floor(Math.random() * 20) + 5,
        images: [
          item.image,
          `https://fakestoreapi.com/img/${item.id}`
        ],
        createdAt: new Date().toISOString()
      }));
      
      const result = { 
        success: true, 
        data: transformedData, 
        total: transformedData.length 
      };
      
      // Önbelleğe ekle - 10 dakika (600,000ms) süreyle sakla
      apiCache.set(cacheKey, result, 600000);
      
      return result;
    } catch (error) {
      try {
        // DummyJSON kategorilerinden dene
        const dummyCategory = category.toLowerCase().replace(/\s+/g, '-');
        const dummyResponse = await axios.get(`${DUMMY_JSON_URL}/products/category/${dummyCategory}`);
        
        const dummyData = dummyResponse.data.products.map(item => ({
          _id: item.id.toString(),
          name: item.title,
          price: item.price * 30,
          description: item.description,
          category: category,
          stock: item.stock || 10,
          images: item.images.slice(0, 3),
          createdAt: new Date().toISOString()
        }));
        
        const result = { 
          success: true, 
          data: dummyData, 
          total: dummyData.length 
        };
        
        // Önbelleğe ekle - 10 dakika (600,000ms) süreyle sakla
        apiCache.set(cacheKey, result, 600000);
        
        return result;
      } catch (dummyError) {
        // Ürün getir ve filtrele
        const allProductsResponse = await productAPI.getAll();
        const filteredProducts = allProductsResponse.data.filter(
          product => product.category.toLowerCase() === category.toLowerCase()
        );
        
        const result = { 
          success: true, 
          data: filteredProducts, 
          total: filteredProducts.length 
        };
        
        // Önbelleğe ekle - 10 dakika süreyle
        apiCache.set(cacheKey, result, 600000);
        
        return result;
      }
    }
  },
  
  // Önbelleği temizle - admin arayüzünden çağrılabilir
  clearCache: () => {
    apiCache.clear();
    return { success: true, message: 'API önbelleği temizlendi' };
  },
  
  // Diğer ürün fonksiyonları - örnek veri döndür
  create: (data) => Promise.resolve({ success: true, data: { ...data, _id: new Date().getTime().toString() } }),
  update: (id, data) => Promise.resolve({ success: true, data: { ...data, _id: id } }),
  delete: (id) => Promise.resolve({ success: true, message: 'Ürün silindi' }),
  search: (params) => productAPI.getAll(params)
};

// Kullanıcı API - önbellekli
export const userAPI = {
  getAll: async () => {
    // Cache key
    const cacheKey = 'users-all';
    
    // Önbellekte var mı kontrol et
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const response = await axios.get(`${DUMMY_JSON_URL}/users?limit=10`);
      
      const transformedUsers = response.data.users.map(user => ({
        _id: user.id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        avatar: user.image,
        phone: user.phone,
        address: `${user.address.address}, ${user.address.city}`,
        createdAt: new Date().toISOString()
      }));
      
      const result = { 
        success: true, 
        data: transformedUsers 
      };
      
      // Önbelleğe ekle - 1 saat (3,600,000ms) süreyle sakla
      apiCache.set(cacheKey, result, 3600000);
      
      return result;
    } catch (error) {
      // Varsayılan kullanıcılar
      const result = { 
        success: true, 
        data: [
          {
            _id: '1',
            name: 'Ali Yılmaz',
            email: 'ali@example.com',
            avatar: 'https://robohash.org/ali',
            phone: '0555 123 4567',
            address: 'İstanbul, Türkiye',
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            name: 'Ayşe Demir',
            email: 'ayse@example.com',
            avatar: 'https://robohash.org/ayse',
            phone: '0555 987 6543',
            address: 'Ankara, Türkiye',
            createdAt: new Date().toISOString()
          }
        ]
      };
      
      // Önbelleğe ekle - 1 saat süreyle
      apiCache.set(cacheKey, result, 3600000);
      
      return result;
    }
  },
  
  // Diğer kullanıcı fonksiyonları aynı...
  getById: (id) => Promise.resolve({ 
    success: true, 
    data: {
      _id: id,
      name: `Kullanıcı ${id}`,
      email: `user${id}@example.com`,
      avatar: `https://robohash.org/${id}`,
      phone: '0555 123 4567',
      address: 'İstanbul, Türkiye',
      createdAt: new Date().toISOString()
    }
  }),
  create: (data) => Promise.resolve({ success: true, data: { ...data, _id: new Date().getTime().toString() } }),
  update: (id, data) => Promise.resolve({ success: true, data: { ...data, _id: id } }),
  delete: (id) => Promise.resolve({ success: true, message: 'Kullanıcı silindi' })
};

// Sipariş API - önbellekli
export const orderAPI = {
  getAll: async () => {
    // Cache key
    const cacheKey = 'orders-all';
    
    // Önbellekte var mı kontrol et
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const response = await axios.get(`${DUMMY_JSON_URL}/carts?limit=5`);
      
      const transformedOrders = response.data.carts.map(cart => ({
        _id: cart.id.toString(),
        user: {
          _id: cart.userId.toString(),
          name: `Müşteri ${cart.userId}`
        },
        products: cart.products.map(product => ({
          product: {
            _id: product.id.toString(),
            name: product.title,
            price: product.price * 30
          },
          quantity: product.quantity
        })),
        total: cart.total * 30,
        status: ['Hazırlanıyor', 'Kargoda', 'Tamamlandı', 'İptal Edildi'][Math.floor(Math.random() * 4)],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      const result = {
        success: true,
        data: transformedOrders
      };
      
      // Önbelleğe ekle - 15 dakika (900,000ms) süreyle sakla
      apiCache.set(cacheKey, result, 900000);
      
      return result;
    } catch (error) {
      // Varsayılan siparişler
      // Diğer kodlar...
    }
  },
  
  // Diğer sipariş fonksiyonları aynı...
};

// Adres API - örnek veriler
export const addressAPI = {
  getAll: () => Promise.resolve({ 
    success: true, 
    data: [
      {
        _id: '1',
        title: 'Ev Adresi',
        address: 'Örnek Mahallesi, 123. Sokak No:4',
        city: 'İstanbul',
        district: 'Kadıköy',
        zipCode: '34700',
        isDefault: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        title: 'İş Adresi',
        address: 'İş Merkezi, 456. Cadde No:10, Kat:5',
        city: 'İstanbul',
        district: 'Şişli',
        zipCode: '34394',
        isDefault: false,
        createdAt: new Date().toISOString()
      }
    ]
  }),
  getById: (id) => Promise.resolve({ 
    success: true, 
    data: {
      _id: id,
      title: 'Adres',
      address: 'Örnek Adres',
      city: 'İstanbul',
      district: 'Kadıköy',
      zipCode: '34700',
      isDefault: true,
      createdAt: new Date().toISOString()
    }
  }),
  create: (data) => Promise.resolve({ success: true, data: { ...data, _id: new Date().getTime().toString() } }),
  update: (id, data) => Promise.resolve({ success: true, data: { ...data, _id: id } }),
  delete: (id) => Promise.resolve({ success: true, message: 'Adres silindi' }),
  getMyAddresses: () => addressAPI.getAll()
};

// Admin API - örnek veriler
export const adminAPI = {
  getDashboardStats: () => Promise.resolve({ 
    success: true, 
    data: {
      userCount: 10,
      productCount: 20,
      orderCount: 5,
      totalSales: 9999.99,
      recentOrders: [
        {
          _id: '1',
          user: {
            _id: '1',
            name: 'Ali Yılmaz'
          },
          total: 999.99,
          status: 'Tamamlandı',
          createdAt: new Date().toISOString()
        }
      ],
      topProducts: [
        {
          _id: '1',
          name: 'Kablosuz Kulaklık',
          price: 999.99,
          stock: 15,
          sales: 10
        }
      ]
    }
  }),
  resetDatabase: () => Promise.resolve({ success: true, message: 'Veritabanı sıfırlandı' })
};

// İnceleme API - örnek veriler
export const reviewAPI = {
  getProductReviews: () => Promise.resolve({ 
    success: true, 
    data: [
      {
        _id: '1',
        user: {
          _id: '1',
          name: 'Ali Yılmaz'
        },
        product: {
          _id: '1',
          name: 'Ürün Örneği'
        },
        rating: 5,
        comment: 'Harika bir ürün!',
        createdAt: new Date().toISOString()
      }
    ]
  }),
  addReview: (data) => Promise.resolve({ success: true, data: { ...data, _id: new Date().getTime().toString() } }),
  updateReview: (id, data) => Promise.resolve({ success: true, data: { ...data, _id: id } }),
  deleteReview: (id) => Promise.resolve({ success: true, message: 'İnceleme silindi' })
};

// Log API - önbelleğe al ve gönder
const logQueue = [];
export const logAPI = {
  log: (level, message, meta = {}) => {
    const logItem = { level, message, meta, timestamp: new Date().toISOString() };
    logQueue.push(logItem);
    return Promise.resolve({ success: true });
  },
  debug: (message, meta = {}) => logAPI.log('debug', message, meta),
  info: (message, meta = {}) => logAPI.log('info', message, meta),
  warn: (message, meta = {}) => logAPI.log('warn', message, meta),
  error: (message, meta = {}) => logAPI.log('error', message, meta)
};

// Ayarlar API - örnek veriler
export const settingsAPI = {
  getAll: async () => {
      return {
        success: true,
        data: {
          general: {
            siteName: 'Modern E-Ticaret',
            siteDescription: 'Modern E-Ticaret uygulaması'
          },
          shipping: {
            freeShippingThreshold: 1000,
            defaultShippingFee: 50
          },
          payment: {
            currency: 'TRY',
            paymentMethods: ['Kredi Kartı', 'Havale', 'Kapıda Ödeme']
          },
          contact: {
            email: 'info@example.com',
            phone: '+90 555 123 4567',
            address: 'İstanbul, Türkiye'
          },
          social: {
            instagram: 'https://instagram.com/example',
            facebook: 'https://facebook.com/example',
            twitter: 'https://twitter.com/example'
          }
        }
      };
  },
  
  update: async (section, data) => {
      return {
        success: true,
        message: `${section} ayarları güncellendi`,
        data: data
      };
  }
};

// Axios Instance ve servislerini dışa aktar
export default {
  get: api.get,
  post: api.post,
  put: api.put,
  delete: api.delete,
  patch: api.patch,
  productAPI,
  userAPI,
  orderAPI,
  logAPI,
  addressAPI,
  adminAPI,
  reviewAPI,
  settingsAPI
};