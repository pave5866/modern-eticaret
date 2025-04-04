import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Loading, Modal, AddressForm } from '../components/ui'
import { useAuthStore } from '../store'
import { orderAPI, addressAPI, userAPI } from '../services/api'
import { showToast, logger } from '../utils'
import { cn } from '../utils'
import {
  UserCircleIcon,
  ShoppingBagIcon,
  MapPinIcon,
  ArrowRightIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

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

const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
}

// Fiyat formatı için yardımcı fonksiyon
const formatPrice = (price) => {
  return parseFloat(price).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, token, logout, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false)
  const [isDeleteAddressModalOpen, setIsDeleteAddressModalOpen] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState(null)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }

    const { state } = window.history.state || {}
    if (state?.openAddressForm) {
      setShowAddressForm(true)
    }

    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const userResponse = await userAPI.getProfile()
      if (userResponse.success) {
        setFormData(prev => ({
          ...prev,
          name: userResponse.user?.name || '',
          email: userResponse.user?.email || ''
        }))
      }
      await Promise.all([
        fetchOrders(),
        fetchAddresses()
      ])
    } catch (error) {
      logger.error('Veri yükleme hatası:', { error: error.message })
      showToast.error('Bilgiler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getUserOrders()
      
      if (response.success) {
        const formattedOrders = response.data.map(order => ({
          _id: order._id,
          orderNumber: order.orderNumber || `S-${Math.floor(Math.random() * 10000)}`,
          createdAt: order.createdAt ? new Date(order.createdAt) : null,
          createdAtFormatted: order.createdAt ? 
            (() => {
              try {
                return new Date(order.createdAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
              } catch (e) {
                return '1 Mart 2023';
              }
            })() : '1 Mart 2023',
          totalAmount: parseFloat(order.totalAmount || 0),
          shippingCost: parseFloat(order.shippingCost || 0),
          paymentMethod: order.paymentMethod || 'Kredi Kartı',
          items: Array.isArray(order.items) ? order.items.map(item => ({
            _id: item._id,
            name: item.name || 'Ürün Adı',
            price: parseFloat(item.price || 0),
            quantity: parseInt(item.quantity || 1),
            product: item.product,
            productId: item.productId || item.product?._id
          })) : []
        }))
        
        setOrders(formattedOrders)
        logger.info('Siparişler başarıyla yüklendi:', { orderCount: formattedOrders.length })
      } else {
        logger.error('Sipariş yükleme başarısız:', { error: response.error })
        setOrders([])
        showToast.error(response.error || 'Siparişler yüklenirken bir hata oluştu')
      }
    } catch (error) {
      logger.error('Sipariş yükleme hatası:', { error: error.message })
      setOrders([])
      showToast.error('Siparişler yüklenirken bir hata oluştu')
    }
  }

  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAll()
      if (response.success) {
        setAddresses(response.addresses || [])
      } else {
        showToast.error(response.error || 'Adresler yüklenemedi')
      }
    } catch (error) {
      logger.error('Adresler yüklenirken hata:', { error: error.message })
      showToast.error('Adresler yüklenemedi')
    }
  }

  const handleAddressSubmit = async (addressData) => {
    try {
      setLoading(true)
      
      // Gerekli alanları kontrol et
      const requiredFields = ['title', 'fullName', 'phone', 'address', 'city', 'district', 'postalCode'];
      for (const field of requiredFields) {
        if (!addressData[field]) {
          throw new Error(`${field} alanı zorunludur`);
        }
      }

      // Posta kodu formatını kontrol et
      if (!/^\d{5}$/.test(addressData.postalCode)) {
        throw new Error('Posta kodu 5 haneli sayı olmalıdır');
      }

      const formattedData = {
        title: addressData.title.trim(),
        fullName: addressData.fullName.trim(),
        phone: addressData.phone.trim(),
        postalCode: addressData.postalCode.trim(),
        city: addressData.city.trim(),
        district: addressData.district.trim(),
        address: addressData.address.trim(),
        isDefault: addressData.isDefault || false
      }

      if (editingAddress) {
        const response = await addressAPI.update(editingAddress._id, formattedData)
        if (response.success) {
          showToast.success('Adres başarıyla güncellendi')
        } else {
          throw new Error(response.error || 'Adres güncellenirken bir hata oluştu')
        }
      } else {
        const response = await addressAPI.create(formattedData)
        if (response.success) {
          showToast.success('Adres başarıyla eklendi')
        } else {
          throw new Error(response.error || 'Adres eklenirken bir hata oluştu')
        }
      }

      // Adresleri yeniden yükle
      await fetchAddresses()
      setShowAddressForm(false)
      setEditingAddress(null)

      // Eğer sepetten gelindiyse, sepete geri dön
      const { state } = window.history.state || {}
      if (state?.returnUrl) {
        navigate(state.returnUrl)
      }
    } catch (error) {
      logger.error('Adres kaydetme hatası:', { error: error.message })
      showToast.error('Adres kaydedilemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAddress = async (addressId) => {
    try {
      setSelectedAddressId(addressId);
      setIsDeleteAddressModalOpen(true);
    } catch (error) {
      logger.error('Address delete error:', { error: error.message })
      showToast.error('Adres silinemedi')
    }
  }

  const confirmDeleteAddress = async () => {
    try {
      const response = await addressAPI.delete(selectedAddressId)
      if (response.success) {
        showToast.success('Adres silindi')
        fetchAddresses()
      } else {
        showToast.error(response.error || 'Adres silinemedi')
      }
    } catch (error) {
      logger.error('Address delete error:', { error: error.message })
      showToast.error('Adres silinemedi')
    } finally {
      setIsDeleteAddressModalOpen(false)
      setSelectedAddressId(null)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          showToast.error('Yeni şifreler eşleşmiyor')
          return
        }
        
        if (!formData.currentPassword) {
          showToast.error('Mevcut şifrenizi girmelisiniz')
          return
        }
      }

      const updateData = {
        name: formData.name,
        email: formData.email
      }

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      await updateUser(updateData)
      showToast.success('Profil başarıyla güncellendi')
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error) {
      showToast.error(error.message || 'Profil güncellenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await orderAPI.deleteOrder(orderId)
      if (response.success) {
        showToast.success('Sipariş silindi')
        fetchOrders()
      } else {
        showToast.error(response.error || 'Sipariş silinemedi')
      }
    } catch (error) {
      logger.error('Sipariş silme hatası:', { error: error.message })
      showToast.error('Sipariş silinemedi')
    }
    setIsDeleteModalOpen(false)
    setSelectedOrderId(null)
  }

  const handleDeleteAllOrders = async () => {
    try {
      const response = await orderAPI.deleteAllOrders()
      if (response.success) {
        showToast.success('Tüm siparişler silindi')
        fetchOrders()
      } else {
        showToast.error(response.error || 'Siparişler silinemedi')
      }
    } catch (error) {
      logger.error('Toplu sipariş silme hatası:', { error: error.message })
      showToast.error('Siparişler silinemedi')
    }
    setIsDeleteAllModalOpen(false)
  }

  const tabs = [
    { id: 'profile', name: 'Profil Bilgileri', icon: UserCircleIcon },
    { id: 'orders', name: 'Siparişlerim', icon: ShoppingBagIcon },
    { id: 'addresses', name: 'Adreslerim', icon: MapPinIcon },
  ]

  const renderProfileTab = () => (
    <motion.div
      variants={itemVariants}
      className="space-y-6"
    >
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-sm shadow-lg transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800/50">
        <div className="border-b border-gray-200 bg-gray-50/50 px-4 sm:px-6 py-3 sm:py-4 dark:border-gray-700 dark:bg-gray-800/30">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-medium text-white">
                {formData.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-medium bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Kişisel Bilgiler
            </h3>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ad Soyad
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-white/50 px-4 py-2 text-gray-700 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-black/20 dark:text-gray-300 transition-colors duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-white/50 px-4 py-2 text-gray-700 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-black/20 dark:text-gray-300 transition-colors duration-200"
              required
            />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-base sm:text-lg font-medium mb-4">Şifre Değiştir</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-white/50 px-4 py-2 text-gray-700 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-black/20 dark:text-gray-300 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-white/50 px-4 py-2 text-gray-700 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-black/20 dark:text-gray-300 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Yeni Şifre Tekrar
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-white/50 px-4 py-2 text-gray-700 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-black/20 dark:text-gray-300 transition-colors duration-200"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleLogout}
              className="w-full sm:w-auto bg-white hover:bg-gray-100 text-red-600 border border-gray-300 dark:bg-red-600 dark:hover:bg-red-700 dark:text-white dark:border-red-600"
            >
              Çıkış Yap
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Kaydediliyor...' : 'Bilgileri Güncelle'}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  )

  const renderOrdersTab = () => (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-sm shadow-lg transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800/50">
        <div className="border-b border-gray-200 bg-gray-50/50 px-4 sm:px-6 py-3 sm:py-4 dark:border-gray-700 dark:bg-gray-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-base sm:text-lg font-medium bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Siparişlerim
          </h3>
          {orders && orders.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDeleteAllModalOpen(true)}
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              Tüm Siparişleri Sil
            </Button>
          )}
        </div>
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center">
              <Loading />
            </div>
          ) : !Array.isArray(orders) || orders.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Henüz bir sipariş vermediniz.
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div
                  key={order._id || order.id}
                  variants={itemVariants}
                  className="rounded-lg border border-gray-200 bg-white/30 p-4 backdrop-blur-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/30"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Sipariş #{order.orderNumber}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {order.createdAtFormatted}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="inline-flex items-center justify-center rounded-md bg-red-50 px-3 py-1.5 text-xs sm:text-sm font-medium text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors duration-200"
                        onClick={() => {
                          setSelectedOrderId(order._id || order.id)
                          setIsDeleteModalOpen(true)
                        }}
                      >
                        <TrashIcon className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                        Sil
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Toplam Tutar:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Ödeme Yöntemi:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {order.paymentMethod}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Ürün Sayısı:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {order.items?.length || 0} ürün
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Sipariş Özeti
                    </h4>
                    <div className="space-y-2">
                      {order.items?.map((item) => (
                        <div
                          key={item._id || item.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-lg bg-gray-50/50 p-2 dark:bg-gray-800/30"
                        >
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                            <img
                              src={item.product?.images?.[0] || '/placeholder.png'}
                              alt={item.product?.name}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/products/${item.product?._id || item.productId}`}
                              className="text-sm font-medium text-gray-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-400 line-clamp-1"
                            >
                              {item.product?.name || item.name}
                            </Link>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {item.quantity} adet x {formatPrice(item.price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedOrderId(null)
        }}
        title="Siparişi Sil"
      >
        <div className="p-4 text-center sm:p-6">
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            Bu siparişi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false)
                setSelectedOrderId(null)
              }}
              className="w-full sm:w-auto bg-white text-gray-800 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteOrder(selectedOrderId)}
              className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              Siparişi Sil
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        title="Tüm Siparişleri Sil"
      >
        <div className="p-4 text-center sm:p-6">
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            Tüm siparişlerinizi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteAllModalOpen(false)}
              className="w-full sm:w-auto bg-white text-gray-800 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllOrders}
              className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              Tümünü Sil
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )

  const renderAddressesTab = () => (
    <motion.div
      variants={itemVariants}
      className="space-y-6"
    >
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-sm shadow-lg transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800/50">
        <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/30 flex items-center justify-between">
          <h3 className="text-lg font-medium bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Adreslerim
          </h3>
          <Button
            size="sm"
            onClick={() => {
              setShowAddressForm(true)
              setEditingAddress(null)
            }}
            className="flex items-center gap-2"
          >
            <PencilSquareIcon className="h-4 w-4" />
            Yeni Adres Ekle
          </Button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center">
              <Loading />
            </div>
          ) : !Array.isArray(addresses) || addresses.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Henüz bir adres eklenmemiş.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {addresses.map((address) => (
                <motion.div
                  key={address._id || address.id}
                  variants={itemVariants}
                  className="rounded-lg border border-gray-200 bg-white/30 p-4 backdrop-blur-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/30"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                        {address.title}
                        {address.isDefault && (
                          <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                            Varsayılan
                          </span>
                        )}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {address.fullName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <button
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200 bg-white dark:bg-transparent p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => {
                          setEditingAddress(address)
                          setShowAddressForm(true)
                        }}
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 bg-white dark:bg-transparent p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => handleDeleteAddress(address._id || address.id)}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <p>{address.address}</p>
                    <p>{address.district} / {address.city}</p>
                    <p>{address.phone}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showAddressForm}
        onClose={() => {
          setShowAddressForm(false)
          setEditingAddress(null)
        }}
        title={editingAddress ? 'Adres Düzenle' : 'Yeni Adres Ekle'}
      >
        <AddressForm
          onSubmit={handleAddressSubmit}
          initialData={editingAddress}
          loading={loading}
        />
      </Modal>

      <Modal
        open={isDeleteAddressModalOpen}
        onClose={() => {
          setIsDeleteAddressModalOpen(false)
          setSelectedAddressId(null)
        }}
        title="Adresi Sil"
      >
        <div className="p-4 text-center sm:p-6">
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            Bu adresi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteAddressModalOpen(false)
                setSelectedAddressId(null)
              }}
              className="w-full sm:w-auto bg-white text-gray-800 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAddress}
              className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              Adresi Sil
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 py-12 dark:from-purple-900 dark:via-gray-900 dark:to-black">
      {/* Animated Background Bubbles */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary-200 mix-blend-multiply blur-xl opacity-20 animate-blob dark:bg-purple-500"></div>
        <div className="absolute top-0 -right-20 h-80 w-80 rounded-full bg-primary-300 mix-blend-multiply blur-xl opacity-20 animate-blob animation-delay-2000 dark:bg-yellow-500"></div>
        <div className="absolute -bottom-40 left-20 h-80 w-80 rounded-full bg-primary-400 mix-blend-multiply blur-xl opacity-20 animate-blob animation-delay-4000 dark:bg-pink-500"></div>
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl space-y-6 sm:space-y-8"
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Hesabım
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Hesap bilgilerinizi yönetin
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-2 sm:gap-4"
          >
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                variants={tabVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 rounded-xl px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg"
                    : "bg-white/50 text-gray-700 hover:bg-white/80 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-800/80"
                )}
              >
                <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{tab.name}</span>
                {activeTab === tab.id && (
                  <ArrowRightIcon className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'orders' && renderOrdersTab()}
            {activeTab === 'addresses' && renderAddressesTab()}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
} 