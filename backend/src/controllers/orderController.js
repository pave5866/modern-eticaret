const Order = require('../models/Order');

// Yeni sipariş oluştur
exports.createOrder = async (req, res) => {
  try {
    const order = new Order({
      user: req.user._id,
      ...req.body
    });
    await order.save();
    res.status(201).json({
      success: true,
      data: order,
      message: 'Sipariş başarıyla oluşturuldu'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Kullanıcının siparişlerini getir
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Belirli bir siparişi getir
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Sipariş bulunamadı'
      });
    }
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Siparişi sil
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Sipariş bulunamadı'
      });
    }
    res.json({
      success: true,
      message: 'Sipariş başarıyla silindi'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}; 