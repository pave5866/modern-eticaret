import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store'
import { showToast } from '../utils'
import { orderAPI } from '../services'

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

export default function Orders() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      showToast.error('Lütfen önce giriş yapın')
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    fetchOrders()
  }, [isAuthenticated, navigate, location])

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll()

      if (response.success && response.orders) {
        const formattedOrders = response.orders.map(order => ({
          _id: order._id,
          createdAt: order.createdAt,
          status: order.status || 'Tamamlandı',
          totalAmount: parseFloat(order.totalAmount || 0),
          items: Array.isArray(order.items) ? order.items.map(item => ({
            _id: item._id,
            name: item.name || 'Ürün',
            price: parseFloat(item.price || 0),
            quantity: parseInt(item.quantity || 1),
            images: Array.isArray(item.images) && item.images.length > 0 
              ? item.images 
              : ['/placeholder.png']
          })) : []
        }))

        setOrders(formattedOrders)
      } else {
        setOrders([])
      }
    } catch (error) {
      showToast.error('Siparişleriniz yüklenirken bir hata oluştu')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = async (orderId) => {
    try {
      if (window.confirm('Bu siparişi silmek istediğinize emin misiniz?')) {
        const response = await orderAPI.deleteOrder(orderId)
        if (response.success) {
          showToast.success('Sipariş başarıyla silindi')
          fetchOrders()
        } else {
          showToast.error('Sipariş silinirken bir hata oluştu')
        }
      }
    } catch (error) {
      showToast.error('Sipariş silinirken bir hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 p-6 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-8"
    >
      <motion.h1
        variants={itemVariants}
        className="text-2xl sm:text-3xl font-bold mb-8 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent"
      >
        Siparişlerim
      </motion.h1>

      {orders.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="text-center py-12"
        >
          <p className="text-gray-600 dark:text-gray-400">
            Henüz hiç siparişiniz bulunmuyor.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order._id}
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              {/* Sipariş Başlığı */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Sipariş #{order._id}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {order.status}
                  </span>
                  <button
                    onClick={() => handleDeleteOrder(order._id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-white dark:bg-transparent p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Sipariş Ürünleri */}
              <div className="space-y-4 mb-6">
                {order.items.map((item) => (
                  <div 
                    key={item._id}
                    className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 group"
                  >
                    <Link 
                      to={`/products/dummy_${item._id}`}
                      className="absolute inset-0 z-10"
                    />
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 cursor-pointer group-hover:bg-gray-50 dark:group-hover:bg-gray-700 transition-all duration-300">
                      <div className="w-24 h-24 overflow-hidden rounded-md flex-shrink-0">
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-primary-600 transition-colors duration-300">{item.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400">Adet: {item.quantity}</p>
                        <p className="text-gray-600 dark:text-gray-400">Fiyat: {(item.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sipariş Toplamı */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 dark:text-white">Toplam</span>
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {order.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
} 