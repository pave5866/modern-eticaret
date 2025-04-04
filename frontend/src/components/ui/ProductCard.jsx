import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRightIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { useCartStore } from '../../store'
import { showToast } from '../../utils'
import { useAuthStore } from '../../store'
import { useState } from 'react'

// Placeholder resmi
const PLACEHOLDER_IMAGE = 'https://cdn.pixabay.com/photo/2016/07/28/17/01/box-1548715_960_720.jpg';

export function ProductCard({ product }) {
  const { addItem } = useCartStore()
  const { user } = useAuthStore()
  const [imgSrc, setImgSrc] = useState(null)
  const [imgError, setImgError] = useState(false)

  if (!product) return null;

  const {
    _id,
    name,
    price,
    images,
    category
  } = product;

  // Resim URL kontrolü
  const imageUrl = !imgError && images && images.length > 0 && images[0] ? images[0] : PLACEHOLDER_IMAGE;
  
  // Fiyat formatı
  const formattedPrice = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  }).format(price);

  const handleAddToCart = (e) => {
    e.preventDefault()
    
    if (user?.role === 'admin') {
      showToast.error('Admin kullanıcılar sepete ürün ekleyemez')
      return
    }

    // Sepette ürünler varsa ve admin hesabına geçildiyse (yanlış state durumu)
    // sepeti temizle ve uyarı göster
    const cartItems = useCartStore.getState().items
    if (user?.role === 'admin' && cartItems.length > 0) {
      const clearCart = useCartStore.getState().clearCart
      clearCart()
      showToast.warning('Admin hesabına geçiş yapıldığı için sepetiniz temizlendi')
      return
    }

    addItem({
      id: _id,
      name: name,
      price: price,
      images: images,
      category: category
    })
    showToast.success('Ürün sepete eklendi')
  }

  const handleImageError = () => {
    setImgError(true) // Hata durumunu kaydet
  }

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="aspect-h-4 aspect-w-3 bg-gray-200 dark:bg-gray-800 sm:aspect-none group-hover:opacity-75 h-48 sm:h-52">
        <motion.img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover object-center sm:h-full sm:w-full"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
          loading="lazy"
          onError={handleImageError}
        />
      </div>
      <div className="flex flex-1 flex-col space-y-2 p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
          <Link to={`/products/${_id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {name}
          </Link>
        </h3>
        <div className="flex flex-1 flex-col justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{category}</p>
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {formattedPrice}
            </p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="focus:ring-2 focus:ring-primary-500 rounded-full p-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
              onClick={handleAddToCart}
            >
              <ShoppingCartIcon className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
} 