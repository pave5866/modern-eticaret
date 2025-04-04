import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { productAPI } from '../../services'

// Dummy verileri içe aktaralım
import { DUMMY_DATA } from '../../services/dummyData'

// Debounce fonksiyonu
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function SearchInput() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const navigate = useNavigate()
  const previewRef = useRef(null)
  const queryClient = useQueryClient()

  // Debounced query güncelleme
  useEffect(() => {
    const handler = debounce((value) => {
      setDebouncedQuery(value)
    }, 300)
    handler(query)
    return () => handler.cancel
  }, [query])

  // Arama sonuçlarını önbellekten al veya API'den getir
  const { data: searchResults } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => {
      // Dummy verileri kullan
      if (debouncedQuery.length > 2) {
        const results = DUMMY_DATA.products.filter(product => 
          product.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(debouncedQuery.toLowerCase())
        );
        
        return {
          success: true,
          data: results
        };
      }
      return { success: true, data: [] };
    },
    enabled: debouncedQuery.length > 2,
    staleTime: 1000 * 60 * 5, // 5 dakika önbellek
    cacheTime: 1000 * 60 * 30, // 30 dakika cache
  })

  // Önbelleğe alma stratejisi
  const prefetchNextSearches = useCallback((currentQuery) => {
    // En yaygın sonekleri önceden yükle
    const commonSuffixes = ['s', 'es', 'ing', 'ed']
    commonSuffixes.forEach(suffix => {
      const nextQuery = currentQuery + suffix
      queryClient.prefetchQuery({
        queryKey: ['search', nextQuery],
        queryFn: () => {
          // Dummy verileri kullan
          const results = DUMMY_DATA.products.filter(product => 
            product.name.toLowerCase().includes(nextQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(nextQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(nextQuery.toLowerCase())
          );
          
          return {
            success: true,
            data: results
          };
        },
        staleTime: 1000 * 60 * 5,
      })
    })
  }, [queryClient])

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      prefetchNextSearches(debouncedQuery)
    }
  }, [debouncedQuery, prefetchNextSearches])

  useEffect(() => {
    function handleClickOutside(event) {
      if (previewRef.current && !previewRef.current.contains(event.target)) {
        setIsPreviewOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`)
      setQuery('')
      setIsPreviewOpen(false)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    setIsPreviewOpen(value.length > 2)
  }

  const handleClear = () => {
    setQuery('')
    setDebouncedQuery('')
    setIsPreviewOpen(false)
  }

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`)
    setQuery('')
    setDebouncedQuery('')
    setIsPreviewOpen(false)
  }

  // Arama sonuçlarını grupla
  const groupedResults = searchResults?.data?.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {})

  return (
    <div className="relative" ref={previewRef}>
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Ürün, kategori veya marka ara..."
            className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Ara
        </button>
      </form>

      {/* Arama Önizlemesi */}
      {isPreviewOpen && searchResults?.data?.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(groupedResults).map(([category, products]) => (
              <div key={category} className="p-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                  {category}
                </h3>
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="w-full px-4 py-2 flex items-center space-x-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {product.price.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY'
                        })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 