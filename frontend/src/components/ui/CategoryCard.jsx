import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  DevicePhoneMobileIcon, 
  ComputerDesktopIcon,
  SparklesIcon,
  HeartIcon,
  ShoppingBagIcon,
  CakeIcon,
  HomeIcon,
  BeakerIcon,
  DeviceTabletIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  SunIcon,
  UserIcon,
  ClockIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'

const categoryIcons = {
  'elektronik': ComputerDesktopIcon,
  'takı-ve-mücevher': SparklesIcon,
  'takı-ve-mucevher': SparklesIcon,
  'erkek-giyim': ShoppingBagIcon,
  'kadın-giyim': ShoppingBagIcon,
  'beauty': BeakerIcon,
  'fragrances': SparklesIcon,
  'furniture': HomeIcon,
  'groceries': CakeIcon,
  'home-decoration': HomeIcon,
  'kitchen-accessories': WrenchScrewdriverIcon,
  'laptops': ComputerDesktopIcon,
  'mens-shirts': ShoppingBagIcon,
  'mens-shoes': ShoppingBagIcon,
  'mens-watches': ClockIcon,
  'mobile-accessories': PhoneIcon,
  'motorcycle': TruckIcon,
  'skin-care': HeartIcon,
  'smartphones': DevicePhoneMobileIcon,
  'sports-accessories': ShoppingBagIcon,
  'sunglasses': SunIcon,
  'tablets': DeviceTabletIcon,
  'tops': ShoppingBagIcon,
  'vehicle': TruckIcon,
  'womens-bags': ShoppingBagIcon,
  'womens-dresses': ShoppingBagIcon,
  'womens-jewellery': SparklesIcon,
  'womens-shoes': ShoppingBagIcon,
  'womens-watches': ClockIcon
}

const gradients = {
  'elektronik': 'from-blue-500 to-purple-500',
  'takı-ve-mücevher': 'from-amber-500 to-yellow-500',
  'takı-ve-mucevher': 'from-amber-500 to-yellow-500',
  'erkek-giyim': 'from-gray-500 to-slate-500',
  'kadın-giyim': 'from-rose-500 to-pink-500',
  'beauty': 'from-pink-500 to-rose-500',
  'fragrances': 'from-purple-500 to-indigo-500',
  'furniture': 'from-amber-500 to-orange-500',
  'groceries': 'from-green-500 to-emerald-500',
  'home-decoration': 'from-blue-500 to-cyan-500',
  'kitchen-accessories': 'from-red-500 to-pink-500',
  'laptops': 'from-blue-500 to-indigo-500',
  'mens-shirts': 'from-gray-500 to-slate-500',
  'mens-shoes': 'from-orange-500 to-amber-500',
  'mens-watches': 'from-slate-500 to-gray-500',
  'mobile-accessories': 'from-purple-500 to-pink-500',
  'motorcycle': 'from-red-500 to-orange-500',
  'skin-care': 'from-pink-500 to-rose-500',
  'smartphones': 'from-blue-500 to-purple-500',
  'sports-accessories': 'from-green-500 to-emerald-500',
  'sunglasses': 'from-amber-500 to-yellow-500',
  'tablets': 'from-indigo-500 to-purple-500',
  'tops': 'from-pink-500 to-rose-500',
  'vehicle': 'from-gray-500 to-slate-500',
  'womens-bags': 'from-purple-500 to-pink-500',
  'womens-dresses': 'from-rose-500 to-pink-500',
  'womens-jewellery': 'from-amber-500 to-yellow-500',
  'womens-shoes': 'from-pink-500 to-rose-500',
  'womens-watches': 'from-indigo-500 to-blue-500'
}

// Lokal kategori resimleri - FakeStore API'ye uyumlu
const categoryImages = {
  'elektronik': 'https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg',
  'takı ve mücevher': 'https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg',
  'erkek giyim': 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
  'kadın giyim': 'https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg',
  'akıllı telefonlar': 'https://dummyjson.com/image/i/products/1/1.jpg',
  'dizüstü bilgisayarlar': 'https://dummyjson.com/image/i/products/6/1.png',
  'parfümler': 'https://dummyjson.com/image/i/products/11/1.jpg',
  'cilt bakımı': 'https://dummyjson.com/image/i/products/16/1.png',
  'market ürünleri': 'https://dummyjson.com/image/i/products/21/1.png',
  'ev dekorasyonu': 'https://dummyjson.com/image/i/products/26/1.jpg',
  'mobilya': 'https://dummyjson.com/image/i/products/31/1.jpg',
  'üst giyim': 'https://dummyjson.com/image/i/products/36/1.jpg',
  'kadın elbiseleri': 'https://dummyjson.com/image/i/products/41/1.jpg',
  'kadın ayakkabıları': 'https://dummyjson.com/image/i/products/46/1.jpg',
  'erkek gömlekleri': 'https://dummyjson.com/image/i/products/51/1.jpg',
  'erkek ayakkabıları': 'https://dummyjson.com/image/i/products/56/1.jpg',
  'erkek saatleri': 'https://dummyjson.com/image/i/products/61/1.jpg',
  'kadın saatleri': 'https://dummyjson.com/image/i/products/66/1.jpg',
  'kadın çantaları': 'https://dummyjson.com/image/i/products/71/1.jpg',
  'kadın takıları': 'https://dummyjson.com/image/i/products/76/1.jpg',
  'güneş gözlükleri': 'https://dummyjson.com/image/i/products/81/1.jpg',
  'otomotiv': 'https://dummyjson.com/image/i/products/86/1.jpg',
  'motosiklet': 'https://dummyjson.com/image/i/products/91/1.jpg',
  'aydınlatma': 'https://dummyjson.com/image/i/products/96/1.jpg',
  // Varsayılan görsel ve ek kategoriler
  'giyim': 'https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg',
  'kitap': 'https://cdn.pixabay.com/photo/2015/11/19/21/10/glasses-1052010_960_720.jpg',
  'ev & yaşam': 'https://cdn.pixabay.com/photo/2017/08/02/01/01/living-room-2569325_960_720.jpg',
  'kozmetik': 'https://cdn.pixabay.com/photo/2016/06/03/13/57/digital-marketing-1433427_960_720.jpg',
  'spor': 'https://cdn.pixabay.com/photo/2014/11/17/13/17/crossfit-534615_960_720.jpg',
  'oyuncak': 'https://cdn.pixabay.com/photo/2016/12/14/12/30/girl-1906187_960_720.jpg',
  'aksesuar': 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg',
  'default': 'https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg'
}

export function CategoryCard({ category }) {
  const [imgError, setImgError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Kategori değeri yoksa veya ismi yoksa varsayılan değerler kullan
  const name = category?.name || 'Kategori'
  const slug = category?.slug || 'kategori'
  const href = category?.href || '/products'
  
  // Türkçe karakterleri düzeltme
  const normalizedName = name.replace(/&/g, 've')
  
  // Kategori resmi için - önce küçük harfe çevir
  const imageKey = (name || '').toLowerCase().trim()
  
  // Kategori resmi URL'i - Önce image map'te ara, yoksa default kullan
  const imageUrl = categoryImages[imageKey] || categoryImages['default']

  // İkon ve gradient seçimi için slug kullan
  const Icon = categoryIcons[slug] || SparklesIcon
  const gradient = gradients[slug] || 'from-gray-500 to-gray-700'
  
  // Resim yükleme hatası
  const handleImageError = () => {
    setImgError(true)
  }
  
  // Resim yüklendiğinde
  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  // Komponent mount olduğunda resim ön yükleme
  useEffect(() => {
    const img = new Image()
    img.src = imageUrl
    img.onload = handleImageLoad
    img.onerror = handleImageError
    
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [imageUrl])

  return (
    <Link
      to={href}
      className="block h-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <motion.div
        className="relative h-full w-full overflow-hidden aspect-square"
        whileHover={{ scale: 1.05 }}
      >
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 to-black/0" />
        
        {/* Resim veya Yükleme İndikatörü */}
        {!imageLoaded && !imgError ? (
          <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : imgError ? (
          <div className={`h-full w-full flex items-center justify-center bg-gradient-to-br ${gradient}`}>
            <Icon className="h-12 w-12 text-white" />
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={normalizedName}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}
        
        <div className="absolute bottom-0 left-0 z-20 p-3 w-full">
          <h3 className="text-center font-medium text-white text-sm sm:text-base md:text-lg drop-shadow-md">
            {normalizedName}
          </h3>
        </div>
      </motion.div>
    </Link>
  )
} 