const Order = require('../models/order.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Dashboard istatistiklerini getir
exports.getDashboardStats = catchAsync(async (req, res) => {
  const timeFilter = req.query.timeFilter || 'week'; // week, month, year
  
  let dateFilter = new Date();
  switch (timeFilter) {
    case 'week':
      dateFilter.setDate(dateFilter.getDate() - 7);
      break;
    case 'month':
      dateFilter.setMonth(dateFilter.getMonth() - 1);
      break;
    case 'year':
      dateFilter.setFullYear(dateFilter.getFullYear() - 1);
      break;
  }

  // Toplam satış tutarı ve sipariş sayısı
  const totalSales = await Order.aggregate([
    { $match: { 
      createdAt: { $gte: dateFilter },
      status: { $in: ['completed', 'processing', 'pending'] }
    }},
    { $group: { 
      _id: null,
      total: { $sum: '$totalAmount' },
      count: { $sum: 1 }
    }}
  ]);

  // Önceki periyodun satış tutarı ve sipariş sayısı
  const previousDateFilter = new Date(dateFilter);
  switch (timeFilter) {
    case 'week':
      previousDateFilter.setDate(previousDateFilter.getDate() - 7);
      break;
    case 'month':
      previousDateFilter.setMonth(previousDateFilter.getMonth() - 1);
      break;
    case 'year':
      previousDateFilter.setFullYear(previousDateFilter.getFullYear() - 1);
      break;
  }

  const previousPeriod = await Order.aggregate([
    { $match: { 
      createdAt: { 
        $gte: previousDateFilter,
        $lt: dateFilter
      },
      status: { $in: ['completed', 'processing', 'pending'] }
    }},
    { $group: { 
      _id: null,
      total: { $sum: '$totalAmount' },
      count: { $sum: 1 }
    }}
  ]);

  // Toplam müşteri sayısı - sipariş veren benzersiz kullanıcıları say
  const uniqueCustomers = await Order.aggregate([
    { 
      $match: { 
        createdAt: { $gte: dateFilter },
        status: { $in: ['completed', 'processing', 'pending'] },
        user: { $exists: true, $ne: null } // Kullanıcısı olan siparişler
      }
    },
    {
      $group: {
        _id: '$user', // Benzersiz kullanıcıları grupla
        count: { $sum: 1 }
      }
    },
    {
      $count: 'total'
    }
  ]);

  const totalCustomers = uniqueCustomers.length > 0 ? uniqueCustomers[0].total : 0;

  // Önceki dönem için benzersiz müşteri sayısı
  const previousUniqueCustomers = await Order.aggregate([
    { 
      $match: { 
        createdAt: { $gte: previousDateFilter, $lt: dateFilter },
        status: { $in: ['completed', 'processing', 'pending'] },
        user: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$user',
        count: { $sum: 1 }
      }
    },
    {
      $count: 'total'
    }
  ]);

  const previousCustomers = previousUniqueCustomers.length > 0 ? previousUniqueCustomers[0].total : 0;

  // Son siparişler
  const recentOrders = await Order.find({
    'user.role': { $ne: 'admin' } // Admin siparişlerini hariç tut
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name role')
    .select('user totalAmount createdAt');

  // En çok satan ürünler
  const topProducts = await Order.aggregate([
    { 
      $match: { 
        createdAt: { $gte: dateFilter },
        status: { $in: ['completed', 'processing', 'pending'] },
        'user.role': { $ne: 'admin' } // Admin siparişlerini hariç tut
      }
    },
    { $unwind: '$items' },
    { 
      $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' },
        price: { $first: '$items.price' }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 }
  ]);

  // Ürün detaylarını getir
  const productIds = topProducts.map(p => p._id);
  const productDetails = await Product.find({ _id: { $in: productIds } })
    .select('name images category');

  const topProductsWithDetails = topProducts.map(product => {
    const details = productDetails.find(p => p._id.toString() === product._id.toString());
    return {
      _id: product._id,
      name: details?.name || 'Ürün bulunamadı',
      category: details?.category || '',
      images: details?.images || [],
      totalSold: product.totalSold,
      price: product.price
    };
  });

  // Satış grafiği verileri için zaman aralığı belirle
  let groupBy = { day: { $dayOfMonth: '$createdAt' } };
  let dateFormat = '%d'; // gün formatı
  let dataPoints = 7;
  
  if (timeFilter === 'month') {
    groupBy = { day: { $dayOfMonth: '$createdAt' } };
    dataPoints = 30;
  } else if (timeFilter === 'year') {
    groupBy = { month: { $month: '$createdAt' } };
    dateFormat = '%m'; // ay formatı
    dataPoints = 12;
  }

  // Satış grafiği verilerini topla
  const salesGraph = await Order.aggregate([
    { 
      $match: { 
        createdAt: { $gte: dateFilter },
        status: { $in: ['completed', 'processing', 'pending'] }
      }
    },
    {
      $group: {
        _id: groupBy,
        sales: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
        date: { $first: '$createdAt' }
      }
    },
    { $sort: { 'date': 1 } }
  ]);

  // Verileri Frontend'in kullanacağı formata dönüştür
  const formattedSalesGraph = [];
  
  // Zaman aralığına göre tüm veri noktalarını oluştur
  const now = new Date();
  
  if (timeFilter === 'week') {
    // Hafta için son 7 günü oluştur
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const day = date.getDate();
      
      // API'den gelen veriyi bul
      const dataPoint = salesGraph.find(item => item._id.day === day);
      
      formattedSalesGraph.push({
        label: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
        sales: dataPoint ? dataPoint.sales : 0,
        orders: dataPoint ? dataPoint.orders : 0,
        date: date
      });
    }
  } else if (timeFilter === 'month') {
    // Ay için son 30 günü oluştur
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const day = date.getDate();
      
      // API'den gelen veriyi bul
      const dataPoint = salesGraph.find(item => item._id.day === day);
      
      // Sadece satış olan günleri ekle (dataPoint varsa)
      if (dataPoint && dataPoint.sales > 0) {
        formattedSalesGraph.push({
          label: date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
          sales: dataPoint.sales,
          orders: dataPoint.orders,
          date: date
        });
      } else if (req.query.includeZeroSales === 'true') {
        // Eğer sıfır satışları dahil etme parametresi varsa ekle
        formattedSalesGraph.push({
          label: date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
          sales: 0,
          orders: 0,
          date: date
        });
      }
    }
  } else if (timeFilter === 'year') {
    // Yıl için son 12 ayı oluştur
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      const month = date.getMonth() + 1; // JavaScript'te ay 0-11 arası
      
      // API'den gelen veriyi bul
      const dataPoint = salesGraph.find(item => item._id.month === month);
      
      formattedSalesGraph.push({
        label: date.toLocaleDateString('tr-TR', { month: 'short' }),
        sales: dataPoint ? dataPoint.sales : 0,
        orders: dataPoint ? dataPoint.orders : 0,
        date: date
      });
    }
  }

  // Yüzde değişimlerini hesapla
  const salesChange = previousPeriod.length > 0 && previousPeriod[0]?.total > 0
    ? ((totalSales[0]?.total || 0) - previousPeriod[0].total) / previousPeriod[0].total * 100 
    : (previousPeriod.length === 0 && (totalSales.length > 0 && totalSales[0]?.total > 0)) ? 100 : 0;

  const orderChange = previousPeriod.length > 0 && previousPeriod[0]?.count > 0
    ? ((totalSales[0]?.count || 0) - previousPeriod[0].count) / previousPeriod[0].count * 100
    : (previousPeriod.length === 0 && (totalSales.length > 0 && totalSales[0]?.count > 0)) ? 100 : 0;

  const customerChange = previousCustomers > 0
    ? ((totalCustomers - previousCustomers) / previousCustomers) * 100
    : (previousCustomers === 0 && totalCustomers > 0) ? 100 : 0;

  // Ortalama sipariş tutarı hesaplama
  const averageOrderValue = totalSales.length > 0 && totalSales[0]?.count > 0
    ? totalSales[0].total / totalSales[0].count
    : 0;

  res.status(200).json({
    success: true,
    data: {
      totalSales: totalSales[0]?.total || 0,
      salesChange: parseFloat(salesChange.toFixed(1)),
      totalOrders: totalSales[0]?.count || 0,
      orderChange: parseFloat(orderChange.toFixed(1)),
      totalCustomers,
      customerChange: parseFloat(customerChange.toFixed(1)),
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      recentOrders,
      topProducts: topProductsWithDetails,
      salesGraph: formattedSalesGraph
    }
  });
});

// Veritabanını sıfırla (kullanıcılar hariç)
exports.resetDatabase = catchAsync(async (req, res) => {
  // Sadece admin yetkisi olan kullanıcılar için güvenlik kontrolü
  if (req.user.role !== 'admin') {
    throw new AppError('Bu işlem için yetkiniz yok', 403);
  }

  // Koleksiyonları sıfırla
  await Promise.all([
    Order.deleteMany({}),
    Product.deleteMany({}),
  ]);

  res.status(200).json({
    success: true,
    message: 'Veritabanı başarıyla sıfırlandı (kullanıcılar hariç)'
  });
}); 