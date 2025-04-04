import { Link, useNavigate } from 'react-router-dom'
import { useCartStore, useAuthStore } from '../store'
import { Button } from '../components/ui'
import { showToast } from '../utils'
import { addressAPI, orderAPI } from '../services/api'
import { 
  TrashIcon, 
  ShoppingCartIcon, 
  ArrowRightIcon,
  InformationCircleIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  LockClosedIcon,
  GiftIcon,
  TagIcon,
  ChevronDownIcon,
  HeartIcon,
  ShareIcon,
  XMarkIcon,
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  PlusIcon,
  BanknotesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import axios from 'axios'
import logger from '../utils/logger'

// Dummy verileri içe aktaralım
import { DUMMY_DATA } from '../services/dummyData'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
}

export default function Cart() {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const { isAuthenticated, token, user } = useAuthStore()
  const [showCoupon, setShowCoupon] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [showMoreInput, setShowMoreInput] = useState({})
  
  // Yeni state'ler
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('Kredi Kartı')
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })
  const [loading, setLoading] = useState(false)
  const [addressLoading, setAddressLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Admin kullanıcı kontrolü
  useEffect(() => {
    if (user?.role === 'admin' && items.length > 0) {
      clearCart();
      showToast.warning('Admin hesabı ile sepet kullanılamaz. Sepetiniz temizlendi.');
    }
  }, [user, items.length, clearCart]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = total > 500 ? 0 : 44.99
  const freeShippingRemaining = 500 - total
  const finalTotal = total + shippingCost - discount
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long'
  })

  useEffect(() => {
    if (isAuthenticated && showAddressModal) {
      fetchAddresses()
    }
  }, [isAuthenticated, showAddressModal])

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true)
      
      // Dummy adres verileri
      const dummyAddresses = [
        {
          _id: '1',
          title: 'Ev Adresim',
          fullName: 'Müşteri Adı',
          phone: '0555 123 4567',
          city: 'İstanbul',
          district: 'Kadıköy',
          address: 'Örnek Mahallesi, Örnek Sokak No:1 D:2',
          isDefault: true
        },
        {
          _id: '2',
          title: 'İş Adresim',
          fullName: 'Müşteri Adı',
          phone: '0555 123 4567',
          city: 'İstanbul',
          district: 'Şişli',
          address: 'İş Mahallesi, Ofis Sokak No:10 Kat:5',
          isDefault: false
        }
      ];
      
      setAddresses(dummyAddresses);
      
      if (dummyAddresses.length > 0) {
        const defaultAddress = dummyAddresses.find(addr => addr.isDefault) || dummyAddresses[0];
        setSelectedAddress(defaultAddress);
      }
    } catch (error) {
      logger.error('Adres getirme hatası:', error);
      showToast.error('Adresler yüklenirken bir hata oluştu');
    } finally {
      setAddressLoading(false);
    }
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      showToast.error('Lütfen önce giriş yapın')
      navigate('/login', { state: { from: '/cart' } })
      return
    }

    if (items.length === 0) {
      showToast.error('Sepetiniz boş')
      return
    }

    setShowAddressModal(true)
  }

  const handleAddressSelect = (address) => {
    setSelectedAddress(address)
    setShowAddressModal(false)
    setShowPaymentModal(true)
  }

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '')
    }
    return v
  }

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (method === 'Kredi Kartı') {
      setCardInfo({
        number: '4242 4242 4242 4242',
        expiry: '12/25',
        cvv: '123',
        name: 'JOHN DOE'
      });
    }
  };

  useEffect(() => {
    if (showPaymentModal && paymentMethod === 'Kredi Kartı') {
      setCardInfo({
        number: '4242 4242 4242 4242',
        expiry: '12/25',
        cvv: '123',
        name: 'JOHN DOE'
      });
    }
  }, [showPaymentModal]);

  const handleSubmitOrder = async () => {
    try {
      setIsSubmitting(true);
      
      if (!selectedAddress) {
        showToast.error('Lütfen bir teslimat adresi seçin');
        return;
      }
      
      if (!paymentMethod) {
        showToast.error('Lütfen bir ödeme yöntemi seçin');
        return;
      }
      
      // Sipariş verisini oluştur
      const orderData = {
        addressId: selectedAddress._id,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        paymentMethod,
        totalAmount: finalTotal,
        shippingCost,
        discount
      };
      
      // Dummy sipariş yanıtı
      const dummyResponse = {
        success: true,
        order: {
          _id: 'dummy-order-' + Date.now(),
          orderNumber: 'ORD' + Math.floor(100000 + Math.random() * 900000),
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        message: 'Siparişiniz başarıyla oluşturuldu'
      };
      
      // Sepeti temizle
      clearCart();
      
      // Kullanıcıyı sipariş başarılı sayfasına yönlendir
      navigate('/order-success', { 
        state: { 
          orderNumber: dummyResponse.order.orderNumber,
          orderId: dummyResponse.order._id 
        } 
      });
      
      showToast.success('Siparişiniz başarıyla oluşturuldu');
    } catch (error) {
      logger.error('Sipariş oluşturma hatası:', error);
      showToast.error('Sipariş oluşturulurken bir hata meydana geldi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity)
    }
  }

  const handleRemoveItem = (itemId) => {
    const item = items.find(i => i.id === itemId)
    if (item) {
      removeItem(itemId)
    }
  }

  const handleApplyCoupon = async () => {
    try {
      if (!couponCode.trim()) {
        showToast.error('Lütfen bir kupon kodu girin');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/coupons/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          code: couponCode,
          total: total 
        })
      });

      const data = await response.json();

      if (data.success) {
        setDiscount(data.data.discount);
        setAppliedCoupon(data.data.coupon);
        showToast.success('İndirim kuponu başarıyla uygulandı');
        setShowCoupon(false);
      } else {
        showToast.error(data.message || 'Bu kupon kodu geçersiz');
        setCouponCode('');
      }
    } catch (error) {
      showToast.error('Bu kupon kodu geçersiz');
      setCouponCode('');
    }
  };

  // Yeni adres ekleme fonksiyonu
  const handleAddNewAddress = () => {
    setShowAddressModal(false)
    navigate('/profile', { 
      state: { 
        returnUrl: '/cart',
        openAddressForm: true 
      }
    })
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-2 sm:px-4">
        <motion.div 
          key="empty-cart-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="text-center max-w-lg mx-auto w-full"
        >
          <motion.div 
            key="empty-cart-icon-container"
            className="mb-6 sm:mb-8 relative"
            initial={{ rotate: -10 }}
            animate={{ rotate: [0, -5, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative inline-block">
              <ShoppingCartIcon className="mx-auto h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 text-gray-400" />
              <motion.div
                key="empty-cart-badge"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -top-2 -right-2 w-5 sm:w-6 h-5 sm:h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm"
              >
                0
              </motion.div>
            </div>
          </motion.div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            Sepetiniz Boş
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto">
            Sepetinizde henüz ürün bulunmamaktadır. Hemen alışverişe başlayın!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105 group"
            >
              <ShoppingCartIcon className="h-4 sm:h-5 w-4 sm:w-5 mr-2 transition-transform group-hover:scale-110" />
              Alışverişe Başla
            </Link>
            <Link
              to="/products?featured=true"
              className="inline-flex items-center justify-center px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full font-medium transition-all duration-300"
            >
              <HeartIcon className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
              Öne Çıkanlar
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <motion.div 
        key="cart-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8 lg:py-12"
      >
        {/* Header */}
        <motion.div 
          key="cart-header"
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4"
        >
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Alışveriş Sepetim
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              {items.length} ürün
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                if (window.confirm('Sepetinizi temizlemek istediğinize emin misiniz?')) {
                  clearCart()
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-white hover:bg-gray-50 dark:bg-transparent dark:hover:bg-gray-800/80 border border-red-200 dark:border-red-800/50 rounded-lg transition-all duration-200"
            >
              <TrashIcon className="h-4 w-4" />
              Sepeti Temizle
            </button>
            <Link 
              to="/products"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium group text-xs sm:text-sm md:text-base"
            >
              <ArrowRightIcon className="h-3.5 sm:h-4 md:h-5 w-3.5 sm:w-4 md:w-5 mr-1.5 sm:mr-2 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
              Alışverişe Devam Et
            </Link>
          </div>
        </motion.div>

        {/* Free Shipping Progress */}
        {freeShippingRemaining > 0 && (
          <motion.div 
            key="shipping-progress"
            variants={itemVariants}
            className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="rounded-full bg-primary-100 dark:bg-primary-900/40 p-2 sm:p-3 shrink-0">
                <TruckIcon className="h-5 sm:h-6 w-5 sm:w-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2 text-xs sm:text-sm md:text-base">
                  Ücretsiz Kargoya Az Kaldı!
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                  <span className="font-medium text-primary-600">{freeShippingRemaining.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span> değerinde ürün daha ekleyin, kargo bedava!
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                  <motion.div
                    key="shipping-progress-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${(total / 500) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-primary-600 h-1.5 sm:h-2 rounded-full relative"
                  >
                    <span className="absolute -right-1 -top-1 w-3 sm:w-4 h-3 sm:h-4 bg-primary-600 rounded-full shadow-lg" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Cart Items */}
          <motion.div 
            key="cart-items-list"
            variants={itemVariants} 
            className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6"
          >
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={`cart-item-${item.id}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6">
                    <div className="relative group">
                      <div className="overflow-hidden rounded-lg aspect-square w-full sm:w-28 md:w-32">
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <Link 
                        to={`/products/${item.id}`}
                        className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link 
                            to={`/products/${item.id}`}
                            className="font-medium text-sm sm:text-base md:text-lg hover:text-primary-600 transition-colors duration-200 block"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
                            {item.category}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-500 hover:text-red-500 transition-colors duration-200 p-0.5 sm:p-1 bg-white dark:bg-transparent dark:text-gray-300"
                        >
                          <TrashIcon className="h-3.5 sm:h-4 md:h-5 w-3.5 sm:w-4 md:w-5" />
                        </button>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 sm:mt-4 gap-3 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={showMoreInput[item.id] ? "more" : item.quantity}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "more") {
                                setShowMoreInput(prev => ({ ...prev, [item.id]: true }));
                                handleQuantityChange(item.id, 11);
                              } else {
                                setShowMoreInput(prev => ({ ...prev, [item.id]: false }));
                                handleQuantityChange(item.id, parseInt(val));
                              }
                            }}
                            className="rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800 pr-6 sm:pr-8 md:pr-10 text-xs sm:text-sm md:text-base focus:ring-primary-500 focus:border-primary-500"
                          >
                            {[...Array(10)].map((_, i) => (
                              <option key={`quantity-${item.id}-${i + 1}`} value={i + 1}>
                                {i + 1} Adet
                              </option>
                            ))}
                            <option key={`quantity-${item.id}-more`} value="more">10+ Adet</option>
                          </select>
                          {showMoreInput[item.id] && (
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "") {
                                  setShowMoreInput(prev => ({ ...prev, [item.id]: false }));
                                  handleQuantityChange(item.id, 1);
                                } else {
                                  const numVal = parseInt(val);
                                  if (numVal > 0) {
                                    handleQuantityChange(item.id, numVal);
                                  }
                                }
                              }}
                              min="1"
                              className="w-20 rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-xs sm:text-sm md:text-base focus:ring-primary-500 focus:border-primary-500"
                            />
                          )}
                          <span className="text-xs sm:text-sm text-gray-500">
                            × {item.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".").replace(".", ",").replace(/,(\d{2})$/, ",$1")} ₺
                          </span>
                        </div>
                        <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          {(item.price * item.quantity).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".").replace(".", ",").replace(/,(\d{2})$/, ",$1")} ₺
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            key="order-summary"
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 sticky top-4 space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold">Sipariş Özeti</h2>
              <ShieldCheckIcon className="h-5 sm:h-6 w-5 sm:w-6 text-green-500" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600 dark:text-gray-400">Ara Toplam</span>
                <span className="font-medium">
                  {total.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                  })}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                    <TagIcon className="h-3 sm:h-4 w-3 sm:w-4" />
                    İndirim ({appliedCoupon.code})
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    -{discount.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY'
                    })}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600 dark:text-gray-400">Kargo</span>
                <span className="font-medium">
                  {shippingCost === 0 ? (
                    <span className="text-green-500 flex items-center gap-1">
                      <TruckIcon className="h-3 sm:h-4 w-3 sm:w-4" />
                      Ücretsiz
                    </span>
                  ) : (
                    shippingCost.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY'
                    })
                  )}
                </span>
              </div>

              {/* Coupon Section */}
              {isAuthenticated && (
                <div className="pt-4">
                  <button
                    onClick={() => setShowCoupon(!showCoupon)}
                    className="flex items-center justify-between w-full text-xs sm:text-sm text-black dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 bg-white dark:bg-transparent"
                  >
                    <span className="flex items-center gap-2">
                      <TagIcon className="h-4 sm:h-5 w-4 sm:w-5 text-black dark:text-gray-200" />
                      İndirim Kuponu
                    </span>
                    <ChevronDownIcon className={`h-4 sm:h-5 w-4 sm:w-5 text-black dark:text-gray-200 transition-transform duration-200 ${showCoupon ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showCoupon && (
                      <motion.div
                        key="coupon-input"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2 mt-4">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Kupon kodunu girin"
                            className="flex-1 rounded-lg border-gray-200 bg-white text-black dark:text-gray-200 dark:bg-gray-800 text-xs sm:text-sm focus:ring-primary-500 focus:border-primary-500 uppercase dark:border-gray-700"
                          />
                          <button 
                            onClick={handleApplyCoupon}
                            className="px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg text-xs sm:text-sm hover:bg-primary-700 transition-colors duration-200"
                          >
                            Uygula
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-base sm:text-lg">Toplam</span>
                <span className="text-xl sm:text-2xl font-bold text-primary-600">
                  {finalTotal.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                  })}
                </span>
              </div>
            </div>

            <Button 
              onClick={handleCheckout} 
              className="w-full flex items-center justify-center gap-2 py-3 sm:py-4 text-base sm:text-lg rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 transform hover:scale-[1.02] transition-all duration-200"
            >
              {isAuthenticated ? (
                <>
                  Siparişi Tamamla
                  <LockClosedIcon className="h-4 sm:h-5 w-4 sm:w-5" />
                </>
              ) : (
                <>
                  Giriş Yap ve Devam Et
                  <ArrowRightIcon className="h-4 sm:h-5 w-4 sm:w-5" />
                </>
              )}
            </Button>

            {/* Additional Info */}
            <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <TruckIcon className="h-4 sm:h-5 w-4 sm:w-5" />
                <p>Tahmini Teslimat: <span className="font-medium text-gray-900 dark:text-white">{estimatedDelivery}</span></p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <CreditCardIcon className="h-4 sm:h-5 w-4 sm:w-5" />
                <p>Güvenli Ödeme</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <GiftIcon className="h-4 sm:h-5 w-4 sm:w-5" />
                <p>Hediye Paketi Seçeneği</p>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <InformationCircleIcon className="h-4 sm:h-5 w-4 sm:w-5 text-primary-600" />
                  Siparişi tamamlamak için giriş yapmanız gerekmektedir
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Adres Seçimi Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-6 h-6 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Teslimat Adresi Seçin</h2>
                </div>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 p-1.5 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.length > 0 ? (
                  addresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => handleAddressSelect(address)}
                      className="cursor-pointer rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 transition-colors hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10"
                    >
                      <div className="flex items-start gap-3">
                        {address.type === 'home' ? (
                          <HomeIcon className="w-5 h-5 text-primary-600 shrink-0" />
                        ) : (
                          <BuildingOfficeIcon className="w-5 h-5 text-primary-600 shrink-0" />
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{address.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {address.address}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {address.city}, {address.district}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Henüz kayıtlı adresiniz bulunmamaktadır.</p>
                  </div>
                )}

                <button
                  onClick={handleAddNewAddress}
                  className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-gray-700 dark:text-gray-300 hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 transition-colors bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/10 w-full"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Yeni Adres Ekle</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ödeme Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <CreditCardIcon className="w-6 h-6 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ödeme Yöntemi</h2>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 p-1.5 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  {['Kredi Kartı', 'Havale/EFT', 'Kapıda Ödeme'].map((method) => (
                    <button
                      key={method}
                      onClick={() => handlePaymentMethodChange(method)}
                      className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                        paymentMethod === method
                          ? 'border-primary-600 bg-primary-50 text-primary-600 dark:bg-primary-900/25 dark:text-primary-400'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-primary-600 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-primary-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {method === 'Kredi Kartı' ? (
                          <CreditCardIcon className={`w-5 h-5 ${
                            paymentMethod === method 
                              ? 'text-primary-600 dark:text-primary-400' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        ) : method === 'Havale/EFT' ? (
                          <BanknotesIcon className={`w-5 h-5 ${
                            paymentMethod === method 
                              ? 'text-primary-600 dark:text-primary-400' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        ) : (
                          <TruckIcon className={`w-5 h-5 ${
                            paymentMethod === method 
                              ? 'text-primary-600 dark:text-primary-400' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        )}
                        <span>{method}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Kredi kartı form alanları */}
                {paymentMethod === 'Kredi Kartı' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Kart Numarası
                      </label>
                      <input
                        type="text"
                        value={cardInfo.number}
                        readOnly
                        className="w-full rounded-lg border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 cursor-not-allowed"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Son Kullanma Tarihi
                        </label>
                        <input
                          type="text"
                          value={cardInfo.expiry}
                          readOnly
                          className="w-full rounded-lg border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 cursor-not-allowed"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cardInfo.cvv}
                          readOnly
                          className="w-full rounded-lg border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Kart Üzerindeki İsim
                      </label>
                      <input
                        type="text"
                        value={cardInfo.name}
                        readOnly
                        className="w-full rounded-lg border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'Havale/EFT' && (
                  <div className="p-4 bg-primary-50/50 dark:bg-primary-900/10 rounded-lg border border-primary-100 dark:border-primary-800">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Banka Hesap Bilgileri</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Banka: Ziraat Bankası<br />
                      Hesap Sahibi: E-Ticaret A.Ş.<br />
                      IBAN: TR00 0000 0000 0000 0000 0000 00
                    </p>
                  </div>
                )}

                {paymentMethod === 'Kapıda Ödeme' && (
                  <div className="p-4 bg-primary-50/50 dark:bg-primary-900/10 rounded-lg border border-primary-100 dark:border-primary-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Kapıda ödeme seçeneğinde +14.99₺ hizmet bedeli uygulanmaktadır.
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleSubmitOrder}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600"
                >
                  {loading ? (
                    'Sipariş Oluşturuluyor...'
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Siparişi Onayla
                      <CheckCircleIcon className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}