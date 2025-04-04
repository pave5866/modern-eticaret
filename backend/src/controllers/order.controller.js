const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Kullanıcının siparişlerini getir
exports.getMyOrders = catchAsync(async (req, res, next) => {
  // Kullanıcı kontrolü
  if (!req.user || !req.user._id) {
    return next(new AppError('Lütfen giriş yapın', 401));
  }

  const orders = await Order.find({ user: req.user._id })
    .populate('items.product')
    .sort('-createdAt');

  // Siparişleri formatlayarak gönder
  const formattedOrders = orders.map(order => ({
    _id: order._id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalAmount: order.totalAmount,
    shippingCost: order.shippingCost,
    items: order.items.map(item => ({
      _id: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      product: item.product
    })),
    shippingAddress: order.shippingAddress
  }));

  res.status(200).json({
    success: true,
    data: formattedOrders
  });
});

// Sipariş detayını getir
exports.getOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id // Sadece kullanıcının kendi siparişlerini görebilmesi için
    }).populate('items.product');

    if (!order) {
      return next(new AppError('Sipariş bulunamadı', 404));
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Yeni sipariş oluştur
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount, shippingCost } = req.body;
    
    // Kullanıcı ID'sini ekle
    const userId = req.user._id;
    
    // İsteği kontrol et
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sipariş öğeleri gereklidir'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Teslimat adresi gereklidir'
      });
    }
    
    // Ürünleri kontrol et ve stok güncelle
    for (const item of items) {
      const productId = item.product || item.productId;
      
      if (!productId) {
        logger.error('Ürün ID bulunamadı:', { item });
        return res.status(400).json({
          success: false,
          message: 'Bir ürün için ID bilgisi eksik'
        });
      }
      
      const product = await Product.findById(productId);
      
      if (!product) {
        logger.error(`Ürün bulunamadı: ${productId}`);
        return res.status(404).json({
          success: false,
          message: `Ürün bulunamadı: ${productId}`
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} için yeterli stok yok`
        });
      }
      
      // Stok güncelle
      product.stock -= item.quantity;
      await product.save();
    }
    
    // Sipariş oluştur
    const order = await Order.create({
      user: userId,
      items: items.map(item => ({
        product: item.product || item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      shippingAddress,
      paymentMethod,
      totalAmount,
      shippingCost: shippingCost || 0,
      status: 'processing'
    });
    
    logger.info('Yeni sipariş oluşturuldu:', { orderId: order._id });
    
    res.status(201).json({
      success: true,
      message: 'Sipariş başarıyla oluşturuldu',
      order
    });
  } catch (error) {
    logger.error('Sipariş oluşturma hatası:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Sipariş oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
};

// Admin: Tüm siparişleri getir
exports.getAllOrders = catchAsync(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .populate('items.product')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    orders
  });
});

// Admin: Sipariş durumunu güncelle
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Sipariş bulunamadı', 404));
  }

  if (status) order.status = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  await order.save();

  res.status(200).json({
    success: true,
    order
  });
}); 