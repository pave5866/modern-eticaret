import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore, useCartStore } from '../store'
import { Button } from '../components/ui'
import { showToast } from '../utils'
import logger from '../utils/logger'
import { orderAPI } from '../services/api'
import {
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  HomeIcon,
  PlusIcon,
  TagIcon,
  ArrowLeftIcon,
  BanknotesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
}

const steps = [
  { id: 1, title: 'Adres Seçimi', icon: MapPinIcon },
  { id: 2, title: 'Ödeme Bilgileri', icon: CreditCardIcon },
  { id: 3, title: 'Sipariş Onayı', icon: ShieldCheckIcon }
]

export default function CartPayment() {
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAuthStore()
  const { items, clearCart } = useCartStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('Kredi Kartı')
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Sepet hesaplamaları
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
  const shippingCost = subtotal > 500 ? 0 : 44.99
  const total = subtotal + shippingCost

  useEffect(() => {
    const checkAuthAndCart = async () => {
      try {
        setLoading(true)
        setError(null)

        // Token kontrolü
        if (!token || !isAuthenticated) {
          showToast.error('Lütfen önce giriş yapın')
          navigate('/login', { state: { from: '/cart/odeme' } })
          return
        }

        // Sepet kontrolü
        if (!items || items.length === 0) {
          showToast.error('Sepetiniz boş')
          navigate('/cart')
          return
        }

        // Adresleri getir
        await fetchAddresses()
      } catch (err) {
        setError(err.message)
        showToast.error(err.message)
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndCart()
  }, [isAuthenticated, token, items, navigate])

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Adresler alınamadı')
      }

      const data = await response.json()
      setAddresses(data.addresses || [])
    } catch (err) {
      throw new Error('Adresler yüklenirken bir hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={() => navigate('/cart')}>Sepete Dön</Button>
      </div>
    )
  }

  const handleNextStep = () => {
    // Adres kontrolü
    if (currentStep === 1 && !selectedAddress) {
      showToast.error('Lütfen bir teslimat adresi seçin');
      return;
    }

    // Ödeme bilgileri kontrolü
    if (currentStep === 2) {
      if (paymentMethod === 'Kredi Kartı') {
        if (!cardInfo.number || !cardInfo.expiry || !cardInfo.cvv || !cardInfo.name) {
          showToast.error('Lütfen tüm kart bilgilerini doldurun');
          return;
        }
      }
    }

    setCurrentStep(prev => prev + 1)
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmitOrder = async () => {
    setLoading(true)
    try {
      // Adres kontrolü
      if (!selectedAddress) {
        showToast.error('Lütfen bir teslimat adresi seçin');
        setLoading(false);
        setCurrentStep(1); // 1. adıma geri dön (adres seçimi)
        return;
      }

      // Adres alanlarının dolu olduğundan emin ol
      const requiredFields = ['address', 'city'];
      const missingFields = requiredFields.filter(field => !selectedAddress[field]);
      
      if (missingFields.length > 0) {
        showToast.error(`Adres bilgileriniz eksik. Lütfen ${missingFields.join(', ')} alanlarını doldurun.`);
        setLoading(false);
        setCurrentStep(1);
        return;
      }

      // API isteği yapılandırması
      const orderData = {
        items: items.map(item => ({
          product: item.id,
          name: item.name,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
          image: item.image || item.images?.[0] || null
        })),
        totalAmount: parseFloat(total),
        shippingCost: parseFloat(shippingCost),
        shippingAddress: {
          title: selectedAddress.title || 'Ev Adresi',
          fullName: selectedAddress.fullName || selectedAddress.name || 'Müşteri',
          phone: selectedAddress.phone || '5555555555',
          address: selectedAddress.address || '',
          city: selectedAddress.city || '',
          district: selectedAddress.district || selectedAddress.city || '',
          postalCode: selectedAddress.postalCode || '00000',
          country: 'Türkiye'
        },
        paymentMethod,
        cardInfo: paymentMethod === 'Kredi Kartı' ? {
          number: cardInfo.number.replace(/\s/g, ''),
          expiry: cardInfo.expiry,
          cvv: cardInfo.cvv,
          name: cardInfo.name.toUpperCase()
        } : undefined
      };

      // fetch yerine orderAPI kullanımı
      logger.info('Sipariş gönderiliyor:', { orderTotal: orderData.totalAmount, itemCount: orderData.items.length });
      const response = await orderAPI.create(orderData);

      if (response.success) {
        showToast.success('Siparişiniz başarıyla oluşturuldu');
        clearCart();
        navigate('/orders');
      } else {
        // API'den dönen hata mesajlarını kullan
        const errorMessage = response.error || response.message || 'Sipariş oluşturulurken bir hata oluştu';
        
        // Kullanıcıya anlamlı hata mesajı göster
        showToast.error(errorMessage);
        
        // Oturum hatası ise login sayfasına yönlendir
        if (response.status === 401) {
          setTimeout(() => {
            navigate('/login', { state: { from: '/cart-payment' } });
          }, 1500);
        }
      }
    } catch (error) {
      logger.error('Sipariş hatası:', { error: error.message });
      showToast.error('Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  // Kart numarası formatı (4 haneli gruplar)
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

  // Son kullanma tarihi formatı (MM/YY)
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '')
    }
    return v
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Sepete Dön</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            Ödeme
          </h1>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          variants={itemVariants}
          className="mb-8"
        >
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="mt-2 text-sm font-medium">{step.title}</span>
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-5 left-full w-full h-0.5 -translate-y-1/2 ${
                      currentStep > step.id
                        ? 'bg-primary-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Adres Seçimi */}
            {currentStep === 1 && (
              <motion.div 
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-6">
                  <MapPinIcon className="w-6 h-6 text-primary-600" />
                  <h2 className="text-lg font-semibold">Teslimat Adresi</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => setSelectedAddress(address)}
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                        selectedAddress?._id === address._id
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/25'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {address.type === 'home' ? (
                          <HomeIcon className="w-5 h-5 text-primary-600 shrink-0" />
                        ) : (
                          <BuildingOfficeIcon className="w-5 h-5 text-primary-600 shrink-0" />
                        )}
                        <div>
                          <h3 className="font-medium">{address.title}</h3>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-300 mt-1">
                            {address.fullName || address.name || 'Müşteri'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {address.address}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {address.city}, {address.district}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => navigate('/profile?tab=addresses')}
                    className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-gray-600 dark:text-gray-400 hover:border-primary-600 hover:text-primary-600 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Yeni Adres Ekle
                  </button>
                </div>
              </motion.div>
            )}

            {/* Ödeme Bilgileri */}
            {currentStep === 2 && (
              <motion.div 
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-6">
                  <CreditCardIcon className="w-6 h-6 text-primary-600" />
                  <h2 className="text-lg font-semibold">Ödeme Yöntemi</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    {['Kredi Kartı', 'Havale/EFT', 'Kapıda Ödeme'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                          paymentMethod === method
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/25'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {method === 'Kredi Kartı' ? (
                            <CreditCardIcon className="w-5 h-5" />
                          ) : method === 'Havale/EFT' ? (
                            <BanknotesIcon className="w-5 h-5" />
                          ) : (
                            <TruckIcon className="w-5 h-5" />
                          )}
                          <span>{method}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'Kredi Kartı' && (
                    <div className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Kart Numarası
                        </label>
                        <input
                          type="text"
                          value={cardInfo.number}
                          onChange={(e) => setCardInfo({ ...cardInfo, number: formatCardNumber(e.target.value) })}
                          maxLength="19"
                          placeholder="0000 0000 0000 0000"
                          className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800"
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
                            onChange={(e) => setCardInfo({ ...cardInfo, expiry: formatExpiry(e.target.value) })}
                            maxLength="5"
                            placeholder="MM/YY"
                            className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            CVV
                          </label>
                          <input
                            type="text"
                            value={cardInfo.cvv}
                            onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                            maxLength="3"
                            placeholder="000"
                            className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800"
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
                          onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value.toUpperCase() })}
                          placeholder="AD SOYAD"
                          className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'Havale/EFT' && (
                    <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/25 rounded-lg">
                      <h3 className="font-medium mb-2">Banka Hesap Bilgileri</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Banka: Ziraat Bankası<br />
                        Hesap Sahibi: E-Ticaret A.Ş.<br />
                        IBAN: TR00 0000 0000 0000 0000 0000 00
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'Kapıda Ödeme' && (
                    <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/25 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Kapıda ödeme seçeneğinde +14.99₺ hizmet bedeli uygulanmaktadır.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Sipariş Onayı */}
            {currentStep === 3 && (
              <motion.div 
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-6">
                  <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
                  <h2 className="text-lg font-semibold">Sipariş Özeti</h2>
                </div>

                <div className="space-y-6">
                  {/* Teslimat Bilgileri */}
                  <div>
                    <h3 className="font-medium mb-2">Teslimat Adresi</h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-start gap-3">
                        {selectedAddress?.type === 'home' ? (
                          <HomeIcon className="w-5 h-5 text-primary-600 shrink-0" />
                        ) : (
                          <BuildingOfficeIcon className="w-5 h-5 text-primary-600 shrink-0" />
                        )}
                        <div>
                          <h4 className="font-medium">{selectedAddress?.title}</h4>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-300 mt-1">
                            {selectedAddress?.fullName || selectedAddress?.name || 'Müşteri'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {selectedAddress?.address}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {selectedAddress?.city}, {selectedAddress?.district}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ödeme Bilgileri */}
                  <div>
                    <h3 className="font-medium mb-2">Ödeme Yöntemi</h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-2">
                        {paymentMethod === 'Kredi Kartı' ? (
                          <>
                            <CreditCardIcon className="w-5 h-5 text-primary-600" />
                            <span>**** **** **** {cardInfo.number.slice(-4)}</span>
                          </>
                        ) : paymentMethod === 'Havale/EFT' ? (
                          <>
                            <BanknotesIcon className="w-5 h-5 text-primary-600" />
                            <span>Havale/EFT</span>
                          </>
                        ) : (
                          <>
                            <TruckIcon className="w-5 h-5 text-primary-600" />
                            <span>Kapıda Ödeme</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ürünler */}
                  <div>
                    <h3 className="font-medium mb-2">Ürünler</h3>
                    <div className="space-y-4">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-4">
                            <img src={item.images[0]} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {item.quantity} adet × {item.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                              </p>
                            </div>
                          </div>
                          <span className="font-medium">
                            {(item.price * item.quantity).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <motion.div variants={itemVariants} className="flex justify-between gap-4">
              {currentStep > 1 && (
                <Button
                  onClick={handlePrevStep}
                  className="flex-1 py-3"
                  variant="outline"
                >
                  Geri
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button
                  onClick={handleNextStep}
                  className="flex-1 py-3"
                >
                  Devam Et
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitOrder}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600"
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
              )}
            </motion.div>
          </div>

          {/* Sipariş Özeti */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-6 lg:sticky lg:top-4"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">Sipariş Özeti</h2>
              <ShieldCheckIcon className="w-6 h-6 text-green-500" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Ara Toplam</span>
                <span>{subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Kargo</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-500 flex items-center gap-1">
                      <TruckIcon className="w-4 h-4" />
                      Ücretsiz
                    </span>
                  ) : (
                    shippingCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                  )}
                </span>
              </div>

              {paymentMethod === 'Kapıda Ödeme' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Kapıda Ödeme Ücreti</span>
                  <span>14.99₺</span>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Toplam</span>
                  <span className="text-xl font-bold text-primary-600">
                    {(total + (paymentMethod === 'Kapıda Ödeme' ? 14.99 : 0)).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                </div>
              </div>
            </div>

            {shippingCost > 0 && (
              <div className="p-4 bg-primary-50 dark:bg-primary-900/25 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {freeShippingRemaining.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} daha alışveriş yapın, kargo bedava!
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
} 