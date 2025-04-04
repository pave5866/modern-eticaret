import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { Loading } from '../../components/ui'
import { orderAPI } from '../../services/api'
import { showToast } from '../../utils'

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

const orderStatuses = {
  pending: {
    label: 'Beklemede',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  processing: {
    label: 'İşleniyor',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  shipped: {
    label: 'Kargoda',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  },
  delivered: {
    label: 'Teslim Edildi',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  cancelled: {
    label: 'İptal Edildi',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
}

export default function Orders() {
  const queryClient = useQueryClient()
  const [selectedStatus, setSelectedStatus] = useState('Tümü')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showModal, setShowModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Siparişleri getir
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await orderAPI.getAll()
      return response.data
    }
  })

  // Sipariş durumu güncelle mutation
  const { mutate: updateOrderStatus } = useMutation({
    mutationFn: ({ orderId, status }) => orderAPI.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders'])
      showToast.success('Sipariş durumu güncellendi')
    },
    onError: (error) => {
      showToast.error(error.message || 'Bir hata oluştu')
    }
  })

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  const handleStatusChange = (orderId, status) => {
    updateOrderStatus({ orderId, status })
  }

  const filteredOrders = orders?.filter(order => {
    if (selectedStatus !== 'Tümü' && order.status !== selectedStatus) {
      return false
    }
    if (searchQuery && !order._id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  }).sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortBy] > b[sortBy] ? 1 : -1
    }
    return a[sortBy] < b[sortBy] ? 1 : -1
  })

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Siparişler</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tüm siparişleri görüntüleyin ve yönetin
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
              placeholder="Sipariş ID ara..."
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              {selectedStatus === 'Tümü' ? 'Tüm Durumlar' : orderStatuses[selectedStatus]?.label}
            </button>
          </div>
        </div>
      </div>

      {/* Siparişler Tablosu */}
      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  <button
                    onClick={() => handleSort('_id')}
                    className="inline-flex items-center gap-x-2 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Sipariş ID
                    {sortBy === '_id' && (
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
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  <button
                    onClick={() => handleSort('user.email')}
                    className="inline-flex items-center gap-x-2 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Müşteri
                    {sortBy === 'user.email' && (
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
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  <button
                    onClick={() => handleSort('totalAmount')}
                    className="inline-flex items-center gap-x-2 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Toplam Tutar
                    {sortBy === 'totalAmount' && (
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
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  <button
                    onClick={() => handleSort('status')}
                    className="inline-flex items-center gap-x-2 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Durum
                    {sortBy === 'status' && (
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
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders?.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {order._id}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-x-4">
                      <div className="h-8 w-8 flex-shrink-0">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-purple-600">
                          <span className="text-sm font-medium text-white">
                            {order.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {order.user?.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    ₺{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${orderStatuses[order.status]?.color}`}
                    >
                      {Object.entries(orderStatuses).map(([value, { label }]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedOrder && (
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

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Sipariş Detayları
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Sipariş #{selectedOrder._id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Müşteri Adı
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedOrder.user?.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      E-posta
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedOrder.user?.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Toplam Tutar
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      ₺{selectedOrder.totalAmount.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Durum
                    </dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          orderStatuses[selectedOrder.status]?.color
                        }`}
                      >
                        {orderStatuses[selectedOrder.status]?.label}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Sipariş Ürünleri
                </h4>
                <ul className="mt-3 divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedOrder.items?.map((item) => (
                    <li key={item._id} className="flex py-4">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.product.name}
                            </h5>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              ₺{item.price.toLocaleString()}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {item.quantity} adet
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex justify-end gap-x-3">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={() => setShowModal(false)}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 