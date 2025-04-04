import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button, Loading, ProductCard } from '../components/ui'
import { productAPI } from '../services/api'
import { useCartStore, useAuthStore } from '../store'
import { useState } from 'react'
import { showToast } from '../utils'

export default function ProductDetail() {
  const { id } = useParams()
  const addItem = useCartStore((state) => state.addItem)
  const { user } = useAuthStore()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Gerçek API'den ürün bilgisini al
  const { data: productData, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        const response = await productAPI.getById(id);
        
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Ürün bulunamadı');
        }
        
        return response.data;
      } catch (error) {
        throw error
      }
    }
  })

  // Ürün yoksa benzer ürünleri getirme
  const product = productData;

  // Gerçek API'den benzer ürünleri al
  const { data: similarProducts, isLoading: isSimilarLoading } = useQuery({
    queryKey: ['products', product?.category],
    queryFn: async () => {
      try {
        const response = await productAPI.getByCategory(product.category);
        
        if (!response.success) {
          throw new Error('Benzer ürünler getirilemedi');
        }
        
        // Mevcut ürünü filtrele ve sadece 4 tanesini göster
        const filteredProducts = response.data
          .filter(p => p._id !== product._id)
          .slice(0, 4);
        
        return filteredProducts;
      } catch (error) {
        return [];
      }
    },
    enabled: !!product?.category,
  })

  const handleAddToCart = () => {
    // Admin kontrolü
    if (user?.role === 'admin') {
      showToast.error('Admin kullanıcılar sepete ürün ekleyemez')
      return
    }

    product && addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      images: product.images,
      category: product.category
    })
    showToast.success('Ürün sepete eklendi')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-red-500">
          Bir hata oluştu: {error.message}
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-gray-500">
          Ürün bulunamadı
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        {/* Ürün Görseli */}
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg">
          {product?.images?.length > 0 ? (
            <div className="relative h-full">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="h-full w-full object-contain object-center p-8"
              />
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        currentImageIndex === index
                          ? 'bg-primary-600'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Resim ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100">
              <p className="text-gray-500">Resim bulunamadı</p>
            </div>
          )}
        </div>

        {/* Ürün Bilgileri */}
        <div className="mt-8 lg:mt-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {product?.name}
          </h1>
          
          <div className="mt-4">
            <h2 className="sr-only">Ürün bilgileri</h2>
            <p className="text-3xl tracking-tight text-gray-900 dark:text-gray-100">
              {product?.price ? product.price.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY'
              }) : '₺0,00'}
            </p>
          </div>

          <div className="mt-4">
            <h2 className="sr-only">Ürün açıklaması</h2>
            <p className="text-base text-gray-700 dark:text-gray-300">
              {product?.description}
            </p>
          </div>

          <div className="mt-8">
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
            >
              Sepete Ekle
            </Button>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Kategori
            </h2>
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                {product?.category}
              </span>
            </div>
          </div>

          {/* Ürün Özellikleri */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Özellikler
            </h2>
            <div className="mt-4 space-y-6">
              <ul className="list-disc space-y-2 pl-4 text-sm">
                <li className="text-gray-600 dark:text-gray-400">
                  Orijinal ürün garantisi
                </li>
                <li className="text-gray-600 dark:text-gray-400">
                  Aynı gün kargo
                </li>
                <li className="text-gray-600 dark:text-gray-400">
                  14 gün içinde ücretsiz iade
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Benzer Ürünler */}
      {similarProducts && similarProducts.length > 0 ? (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Benzer Ürünler</h2>
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {similarProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        product?.category && !isSimilarLoading && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Benzer Ürünler</h2>
            <p className="text-gray-500">Bu kategoride başka ürün bulunamadı.</p>
          </div>
        )
      )}
    </div>
  )
} 