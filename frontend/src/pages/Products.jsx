import { useState, useEffect, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { ProductCard, Loading } from '../components/ui'
import { productAPI } from '../services'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FunnelIcon, 
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  TagIcon
} from '@heroicons/react/24/outline'

const ITEMS_PER_PAGE = 15
const DEBOUNCE_DELAY = 300 // 300ms debounce

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

export default function Products() {
  // Form state - kullanıcının seçtiği değerler
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('default')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Uygulanan filtreler
  const [appliedFilters, setAppliedFilters] = useState({
    category: '',
    priceRange: { min: '', max: '' },
    searchQuery: '',
    sortBy: 'default'
  })
  
  const { ref: loadMoreRef, inView } = useInView()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()

  // Debounce fonksiyonu
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Filtreleri uygula - debounce ile
  const applyFilters = useCallback(
    debounce((newFilters) => {
      setAppliedFilters(newFilters);
    }, DEBOUNCE_DELAY),
    []
  );

  // Kategori değiştiğinde
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    
    // Kategori değiştiğinde otomatik olarak önbelleği temizleyelim
    queryClient.invalidateQueries(['products', newCategory]);
    
    // Yeni filtreleri uygula
    applyFilters({
      ...appliedFilters,
      category: newCategory
    });

    // Değişikliğin anlık olarak görünmesi için UI'ı zorla yenileyelim
    // ve sayfa başına dönelim
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fiyat aralığı değiştiğinde
  const handlePriceChange = (field, value) => {
    const newPriceRange = { ...priceRange, [field]: value };
    setPriceRange(newPriceRange);
    applyFilters({
      ...appliedFilters,
      priceRange: newPriceRange
    });
  };

  // Arama sorgusu değiştiğinde
  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    applyFilters({
      ...appliedFilters,
      searchQuery: newQuery
    });
  };

  // Sıralama değiştiğinde
  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    applyFilters({
      ...appliedFilters,
      sortBy: newSortBy
    });
  };

  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      setSelectedCategory(category)
      setAppliedFilters(prev => ({
        ...prev,
        category
      }))
    }
  }, [searchParams])

  // Gerçek API'den kategorileri al
  const { data: categoriesData } = useQuery({
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

  const categories = categoriesData?.success ? categoriesData.data
    .filter(category => category && typeof category === 'string')
    .map(category => ({
      name: category,
      slug: category.toLowerCase().replace(/ /g, '-').replace(/&/g, 've')
    })) : []

  // Gerçek API'den ürünleri al
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    refetch
  } = useInfiniteQuery({
    queryKey: ['products', appliedFilters.category],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        let response;
        
        // Kategori filtresi varsa, o kategoriye göre ürünleri getir
        if (appliedFilters.category) {
          const categoryName = categories.find(cat => cat.slug === appliedFilters.category)?.name || appliedFilters.category;
          response = await productAPI.getByCategory(
            categoryName, 
            ITEMS_PER_PAGE, 
            pageParam * ITEMS_PER_PAGE
          );
        } else {
          // Tüm ürünleri getir
          response = await productAPI.getAll({ limit: ITEMS_PER_PAGE, skip: pageParam * ITEMS_PER_PAGE });
        }
        
        return {
          success: response.success,
          data: response.data || [],
          skip: pageParam * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
          total: response.total || (response.data?.length || 0)
        };
      } catch (error) {
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.success || !lastPage?.data) return undefined;
      if (!Array.isArray(lastPage.data) || lastPage.data.length === 0) return undefined;
      if (typeof lastPage.skip !== 'number' || typeof lastPage.limit !== 'number' || typeof lastPage.total !== 'number') return undefined;
      
      const nextSkip = lastPage.skip + lastPage.limit;
      return nextSkip < lastPage.total ? nextSkip / ITEMS_PER_PAGE : undefined;
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage])

  // Filtreleme ve sıralama fonksiyonları
  const filterProducts = (products) => {
    if (!products) return []

    let filtered = [...products]

    // Kategori filtresi
    if (appliedFilters.category && appliedFilters.category !== '') {
      // Seçilen kategori slug'ının orijinal adını bulalım
      const selectedCategoryObj = categories.find(cat => cat.slug === appliedFilters.category);
      const categoryName = selectedCategoryObj ? selectedCategoryObj.name : appliedFilters.category;
      
      filtered = filtered.filter(product => 
        product.category && 
        (product.category.toLowerCase().trim() === categoryName.toLowerCase().trim() || 
         product.category.toLowerCase().trim() === appliedFilters.category.toLowerCase().trim())
      )
    }

    // Fiyat aralığı filtresi
    if (appliedFilters.priceRange.min !== '') {
      filtered = filtered.filter((product) => product.price >= Number(appliedFilters.priceRange.min))
    }
    if (appliedFilters.priceRange.max !== '') {
      filtered = filtered.filter((product) => product.price <= Number(appliedFilters.priceRange.max))
    }

    // Arama filtresi
    if (appliedFilters.searchQuery) {
      const query = appliedFilters.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          (product.name && product.name.toLowerCase().includes(query)) ||
          (product.description && product.description.toLowerCase().includes(query)) ||
          (product.category && product.category.toLowerCase().includes(query))
      )
    }

    // Sıralama
    switch (appliedFilters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        break
    }

    return filtered
  }

  const products = data?.pages?.flatMap((page) => page.data || []) || []
  const filteredProducts = Array.isArray(products) ? filterProducts(products) : []

  // Filtreleri sıfırla
  const handleReset = () => {
    setSelectedCategory('')
    setPriceRange({ min: '', max: '' })
    setSortBy('default')
    setSearchQuery('')
    setAppliedFilters({
      category: '',
      priceRange: { min: '', max: '' },
      searchQuery: '',
      sortBy: 'default'
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 lg:py-16 min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 lg:py-16 min-h-screen flex flex-col items-center justify-center">
        <div className="text-center text-red-500 mb-3 sm:mb-4">
          <p className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">Bir hata oluştu</p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Ürünler yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
        >
          Sayfayı Yenile
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 lg:py-12 mt-12 sm:mt-16">
      {/* Mobile Filter Button */}
      <div className={`${showFilters ? 'hidden' : 'block'} sticky top-[4.5rem] z-40 -mx-2 sm:-mx-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2 sm:px-4 py-2 sm:py-3 lg:hidden`}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm sm:text-base transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <FunnelIcon className="h-4 sm:h-5 w-4 sm:w-5" />
          Filtreleri Göster
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
        {/* Filters */}
        <AnimatePresence>
          {(showFilters || window.innerWidth >= 1024) && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className={`
                lg:w-72 space-y-4 sm:space-y-6 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700
                ${showFilters ? 'fixed inset-0 z-50 overflow-y-auto lg:static lg:inset-auto' : 'fixed lg:sticky top-[7rem] sm:top-[7.5rem] lg:top-24 left-0 right-0 lg:left-auto lg:right-auto h-[calc(100vh-7rem)] sm:h-[calc(100vh-7.5rem)] lg:h-[calc(100vh-6rem)] overflow-y-auto z-30'}
                mx-0 lg:mx-0
              `}
            >
              {/* Close Button for Mobile */}
              {showFilters && (
                <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4 lg:hidden">
                  <h2 className="text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2 text-gray-900 dark:text-white">
                    <AdjustmentsHorizontalIcon className="h-4 sm:h-5 w-4 sm:w-5" />
                    Filtreler
                  </h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1.5 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              )}

              {!showFilters && (
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2 text-gray-900 dark:text-white">
                    <AdjustmentsHorizontalIcon className="h-4 sm:h-5 w-4 sm:w-5" />
                    Filtreler
                  </h2>
                  <button
                    onClick={handleReset}
                    className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-md transition-colors"
                  >
                    <XMarkIcon className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    Sıfırla
                  </button>
                </div>
              )}

              {/* Filter Content */}
              <div className={`space-y-4 sm:space-y-6 ${showFilters ? 'mt-4' : ''}`}>
                {/* Category Filter */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                    <TagIcon className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    Kategori
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 sm:p-3 text-xs sm:text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-500 dark:focus:ring-primary-500 transition-colors duration-200"
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </motion.div>

                {/* Price Range Filter */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Fiyat Aralığı
                  </label>
                  <div className="flex gap-2 sm:gap-3">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => handlePriceChange('min', e.target.value)}
                        placeholder="Min"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 sm:p-3 text-xs sm:text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-500 dark:focus:ring-primary-500 transition-colors duration-200"
                      />
                      <span className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs sm:text-sm">₺</span>
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => handlePriceChange('max', e.target.value)}
                        placeholder="Max"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 sm:p-3 text-xs sm:text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-500 dark:focus:ring-primary-500 transition-colors duration-200"
                      />
                      <span className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs sm:text-sm">₺</span>
                    </div>
                  </div>
                </motion.div>

                {/* Search Filter */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                    <MagnifyingGlassIcon className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    Ürün Ara
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Ürün adı veya açıklama..."
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 sm:p-3 pl-9 sm:pl-10 text-xs sm:text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-500 dark:focus:ring-primary-500 transition-colors duration-200"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 sm:h-4 w-3.5 sm:w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                </motion.div>

                {/* Sort Filter */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                    <ArrowsUpDownIcon className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    Sıralama
                  </label>
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 sm:p-3 text-xs sm:text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-500 dark:focus:ring-primary-500 transition-colors duration-200"
                  >
                    <option value="default">Varsayılan</option>
                    <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
                    <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
                    <option value="name-asc">İsim (A-Z)</option>
                    <option value="name-desc">İsim (Z-A)</option>
                  </select>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1"
        >
          {/* Products Count */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Tüm Ürünler
              </h2>
              <span className="px-2 py-1 text-xs sm:text-sm font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full">
                {filteredProducts.length} Ürün
              </span>
            </div>
            {appliedFilters.searchQuery && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                "{appliedFilters.searchQuery}" için {filteredProducts.length} sonuç bulundu
              </p>
            )}
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {filteredProducts.map((product, index) => (
              <motion.div key={`${product._id}-${index}`} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

          {/* Load More */}
          {hasNextPage && (
            <div
              ref={loadMoreRef}
              className="flex justify-center mt-4 sm:mt-6 lg:mt-8"
            >
              {isFetchingNextPage ? (
                <Loading />
              ) : (
                <button
                  onClick={() => fetchNextPage()}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  Daha Fazla Yükle
                </button>
              )}
            </div>
          )}

          {/* No Results */}
          {filteredProducts.length === 0 && !isLoading && (
            <div className="text-center py-8 sm:py-12">
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                Aradığınız kriterlere uygun ürün bulunamadı.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
} 