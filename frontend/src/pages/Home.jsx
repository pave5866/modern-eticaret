import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { ProductCard, Slider, CategoryCard } from '../components/ui'
import { productAPI } from '../services'
import { motion } from 'framer-motion'

const features = [
  {
    title: 'Ücretsiz Kargo',
    description: '150 TL ve üzeri alışverişlerde ücretsiz kargo imkanı',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
    )
  },
  {
    title: 'Güvenli Ödeme',
    description: '256-bit SSL sertifikası ile güvenli alışveriş',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    )
  },
  {
    title: 'Kolay İade',
    description: '14 gün içinde ücretsiz iade hakkı',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
        />
      </svg>
    )
  },
  {
    title: '7/24 Destek',
    description: 'Müşteri hizmetleri ile kesintisiz iletişim',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
        />
      </svg>
    )
  }
]

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

export default function Home() {
  // Gerçek API'den ürünleri al
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const response = await productAPI.getAll();
        return response;
      } catch (error) {
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5, // 5 dakika
    cacheTime: 1000 * 60 * 30, // 30 dakika
  })

  // Gerçek API'den kategorileri al
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await productAPI.getCategories();
        return response;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 dakika
    cacheTime: 1000 * 60 * 30, // 30 dakika
  })

  // Tüm ürünlerden rastgele 5 farklı ürün seçmek için
  const getRandomFeaturedProducts = (allProducts, count = 5) => {
    if (!allProducts || allProducts.length <= count) return allProducts || [];
    
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  const products = productsData?.success ? productsData.data : []
  // Rastgele 5 farklı öne çıkan ürün seç
  const featuredProducts = getRandomFeaturedProducts(products)
  
  const categories = categoriesData?.success ? 
    categoriesData.data
      .filter(category => category && typeof category === 'string') // Geçersiz kategorileri filtrele
      .map(category => ({
        name: category,
        slug: category.toLowerCase().replace(/ /g, '-').replace(/&/g, 've'),
        href: `/products?category=${category.toLowerCase().replace(/ /g, '-').replace(/&/g, 've')}`
      })) : []

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 lg:py-12">
      {/* Hero Section with Slider */}
      <section className="container mx-auto px-2 sm:px-4 pt-4 sm:pt-8">
        <Slider />
      </section>

      {/* Kategoriler */}
      <section className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-6 sm:mb-8">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2"
          >
            Kategoriler
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-gray-600 dark:text-gray-400"
          >
            İhtiyacınız olan ürünleri kategorilere göre keşfedin
          </motion.p>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {[...Array(4)].map((_, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="aspect-square animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg"
              />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
          >
            {categories.slice(0, 4).map((category) => (
              <motion.div
                key={category.name}
                variants={itemVariants}
                className="aspect-square h-full"
              >
                <CategoryCard category={category} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Henüz kategori bulunmamaktadır.
            </p>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-between text-center h-full p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 mb-3 sm:mb-4">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 lg:py-16">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent"
          >
            Öne Çıkan Ürünler
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link
              to="/products"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base group"
            >
              <span>Tümünü Gör</span>
              <ArrowRightIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(5)].map((_, index) => (
              <motion.div 
                key={index} 
                className="animate-pulse"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 mb-3 sm:mb-4" />
                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </motion.div>
            ))}
          </div>
        ) : productsError ? (
          <motion.div 
            className="text-center py-8 sm:py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-red-500 mb-4">
              <p className="text-base sm:text-lg font-semibold mb-2">Bir hata oluştu</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Ürünler yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
              </p>
            </div>
            <motion.button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sayfayı Yenile
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
          >
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                variants={itemVariants}
                transition={{ delay: index * 0.1 }}
                className="transform transition-transform hover:scale-105"
              >
                <ProductCard key={product._id} product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Newsletter */}
      <section className="bg-gray-100 dark:bg-gray-800 mt-8 sm:mt-12">
        <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Fırsatlardan Haberdar Olun
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
              En yeni ürünler ve kampanyalardan ilk siz haberdar olun.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-4 py-2 text-sm sm:text-base"
              />
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
              >
                Abone Ol
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
} 