import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ProductCard, Loading } from '../components/ui'
import { productAPI } from '../services'

export default function CategoryProducts() {
  const { category } = useParams()

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', category],
    queryFn: () => productAPI.getByCategory(category).then((res) => res.data),
    enabled: !!category
  })

  if (isLoading) return <Loading />
  if (error) return <div>Error: {error.message}</div>
  if (!products?.length) return <div className="text-center py-16">Bu kategoride ürün bulunamadı.</div>

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 capitalize">
        {category.replace(/-/g, ' ')}
      </h1>

      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
} 