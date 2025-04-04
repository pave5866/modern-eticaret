import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Loading } from '../../components/ui'
import { productAPI } from '../../services/api'
import { showToast } from '../../utils'
import logger from '../../utils/logger'

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
  const queryClient = useQueryClient()
  const [selectedCategory, setSelectedCategory] = useState('Tümü')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: []
  })

  // Resim önizleme state'i
  const [imagePreview, setImagePreview] = useState([])

  // Ürünleri getir
  const { data: { data: products = [] } = {}, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const response = await productAPI.getAll()
      return response
    }
  })

  // Ürün ekle/güncelle mutation
  const { mutate: saveProduct, isLoading: isSaving } = useMutation({
    mutationFn: async (data) => {
      if (editingProduct) {
        return productAPI.update(editingProduct._id, data)
      }
      return productAPI.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products'])
      setShowModal(false)
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        images: []
      })
      setImagePreview([])
      showToast.success(editingProduct ? 'Ürün güncellendi' : 'Ürün eklendi')
    },
    onError: (error) => {
      showToast.error(error.message || 'Bir hata oluştu')
    }
  })

  // Ürün sil mutation
  const { mutate: deleteProduct } = useMutation({
    mutationFn: (id) => productAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products'])
      showToast.success('Ürün silindi')
    },
    onError: (error) => {
      showToast.error(error.message || 'Bir hata oluştu')
    }
  })

  // Resim önizlemesini kaldır
  const handleRemoveImage = (index) => {
    const newImages = [...formData.images];
    const removedImage = newImages[index];
    newImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
    
    const newPreviews = [...imagePreview];
    newPreviews.splice(index, 1);
    setImagePreview(newPreviews);
    
    // Eğer blob URL ise, kaynağı serbest bırak
    if (typeof removedImage === 'string' && removedImage.startsWith('blob:')) {
      URL.revokeObjectURL(removedImage);
    }
    
    logger.info('Resim kaldırıldı', { index });
  };

  // Resim seçme işlemi
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Dosya boyutu ve tip kontrolü
    const validFiles = selectedFiles.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== selectedFiles.length) {
      showToast.error('Bazı dosyalar geçersiz. Sadece JPEG, JPG, PNG veya WEBP formatında ve 5MB\'dan küçük dosyalar yükleyebilirsiniz.');
      return;
    }

    const totalImages = formData.images.length + validFiles.length;
    if (totalImages > 5) {
      showToast.error('En fazla 5 resim yükleyebilirsiniz.');
      return;
    }

    // Mevcut oluşturulmuş önizleme URL'lerini serbest bırak
    const currentPreviewUrls = imagePreview.filter(url => url.startsWith('blob:'));
    currentPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    
    // Yeni dosyalardan önizleme URL'leri oluştur
    const previewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    if (editingProduct) {
      // Düzenleme modunda, mevcut string URL'leri koruyalım ve yeni dosyaları ekleyelim
      const existingImageUrls = formData.images.filter(img => typeof img === 'string');
      setFormData(prev => ({
        ...prev,
        images: [...existingImageUrls, ...validFiles]
      }));
      setImagePreview([...existingImageUrls, ...previewUrls]);
    } else {
      // Yeni ürün ekleme modunda
      setFormData(prev => ({
        ...prev,
        images: validFiles
      }));
      setImagePreview(previewUrls);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product);
    
    // Mevcut ürün verilerini formData'ya aktar
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      category: product.category || '',
      stock: product.stock || 0,
      // Mevcut resimler (string URL'ler)
      images: product.images || []
    });
    
    // Resim önizlemelerini ayarla
    setImagePreview(product.images || []);
    
    setShowModal(true);
    
    logger.info('Ürün düzenleme başladı', { 
      productId: product._id,
      imageCount: product.images?.length || 0
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      deleteProduct(id)
    }
  }

  // Form gönderme
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataObj = new FormData();
      
      // Temel bilgileri ekle - boş kontrolü yapalım
      formDataObj.append('name', formData.name ? formData.name.trim() : '');
      formDataObj.append('description', formData.description ? formData.description.trim() : '');
      formDataObj.append('price', formData.price);
      formDataObj.append('category', formData.category ? formData.category.trim() : '');
      formDataObj.append('stock', formData.stock);
      
      // Resimleri ekle
      const fileImages = [];
      const existingImageUrls = [];
      
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach(image => {
          if (image instanceof File) {
            fileImages.push(image);
            formDataObj.append('images', image);
          } else if (typeof image === 'string' && !image.startsWith('blob:')) {
            existingImageUrls.push(image);
          }
        });
      }
      
      // Mevcut resim URL'lerini JSON olarak gönder
      if (existingImageUrls.length > 0) {
        formDataObj.append('existingImages', JSON.stringify(existingImageUrls));
      }

      logger.info('Gönderilen form verisi:', {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        stock: formData.stock,
        newImagesCount: fileImages.length,
        existingImagesCount: existingImageUrls.length
      });

      saveProduct(formDataObj);
    } catch (error) {
      logger.error('Form gönderme hatası:', { error: error.message });
      showToast.error('Form gönderilirken bir hata oluştu');
    }
  };

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    if (selectedCategory !== 'Tümü' && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false
    }
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  }).sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortBy] > b[sortBy] ? 1 : -1
    }
    return a[sortBy] < b[sortBy] ? 1 : -1
  }) : []

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ürünler</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Ürünlerinizi yönetin, ekleyin, düzenleyin veya silin
        </p>
      </div>

      {/* Filtreler ve Arama */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürün ara..."
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              {selectedCategory}
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null)
            setFormData({
              name: '',
              description: '',
              price: '',
              category: '',
              stock: '',
              images: []
            })
            setImagePreview([])
            setShowModal(true)
          }}
          className="inline-flex items-center gap-x-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:bg-primary-500 dark:hover:bg-primary-400"
        >
          <PlusIcon className="h-5 w-5" />
          Yeni Ürün
        </button>
      </div>

      {/* Ürün Tablosu */}
      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/70">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
                >
                  <button
                    onClick={() => handleSort('name')}
                    className="inline-flex items-center gap-x-2 rounded px-2 py-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Ürün
                    {sortBy === 'name' && (
                      sortOrder === 'asc' ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )
                    )}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
                >
                  <button
                    onClick={() => handleSort('category')}
                    className="inline-flex items-center gap-x-2 rounded px-2 py-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Kategori
                    {sortBy === 'category' && (
                      sortOrder === 'asc' ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )
                    )}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
                >
                  <button
                    onClick={() => handleSort('price')}
                    className="inline-flex items-center gap-x-2 rounded px-2 py-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Fiyat
                    {sortBy === 'price' && (
                      sortOrder === 'asc' ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )
                    )}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
                >
                  <button
                    onClick={() => handleSort('stock')}
                    className="inline-flex items-center gap-x-2 rounded px-2 py-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Stok
                    {sortBy === 'stock' && (
                      sortOrder === 'asc' ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )
                    )}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
                >
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-x-4">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {product.category}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    ₺{product.price.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {product.stock}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="inline-flex items-center justify-center rounded-full bg-white p-1.5 text-primary-600 shadow-sm hover:bg-primary-50 hover:text-primary-700 dark:bg-gray-700 dark:text-primary-400 dark:hover:bg-primary-900/30 dark:hover:text-primary-300"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="ml-2 inline-flex items-center justify-center rounded-full bg-white p-1.5 text-red-600 shadow-sm hover:bg-red-50 hover:text-red-700 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowModal(false)}
            />

            <div className="inline-block w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-8 text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:align-middle">
              <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                <button
                  type="button"
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  onClick={() => setShowModal(false)}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Ürün bilgilerini doldurun
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Ürün Adı
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Kategori
                      </label>
                      <input
                        type="text"
                        name="category"
                        id="category"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Fiyat
                      </label>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="stock"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Stok
                      </label>
                      <input
                        type="number"
                        name="stock"
                        id="stock"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({ ...formData, stock: e.target.value })
                        }
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>

                    <div className="col-span-2">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Açıklama
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>

                    <div className="col-span-2">
                      <label
                        htmlFor="images"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Ürün Görselleri
                      </label>
                      <input
                        type="file"
                        name="images"
                        id="images"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-medium
                          file:bg-primary-50 file:text-primary-700
                          dark:file:bg-primary-900/20 dark:file:text-primary-400
                          hover:file:cursor-pointer hover:file:bg-primary-100
                          dark:hover:file:bg-primary-900/30"
                      />
                      <div className="mt-4 grid grid-cols-5 gap-4">
                        {imagePreview.map((url, index) => (
                          <div
                            key={index}
                            className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute right-1 top-1 rounded-full bg-white/80 p-1 text-gray-600 hover:bg-white dark:bg-black/50 dark:text-gray-400 dark:hover:bg-black/70"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-400"
                  >
                    {isSaving ? (
                      <>
                        <Loading className="mr-2 h-4 w-4" />
                        Kaydediliyor...
                      </>
                    ) : (
                      'Kaydet'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 