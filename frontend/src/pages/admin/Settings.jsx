import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  CogIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  TruckIcon,
  EnvelopeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { Loading } from '../../components/ui'
import { showToast } from '../../utils'
import { cn } from '../../utils'
import { settingsAPI } from '../../services/api'

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

const mockSettings = {
  general: {
    storeName: 'Modern E-Ticaret',
    storeEmail: 'info@example.com',
    storePhone: '+90 555 123 4567',
    storeAddress: 'İstanbul, Türkiye',
    storeCurrency: 'TRY',
    storeLanguage: 'tr'
  },
  shipping: {
    freeShippingThreshold: 500,
    defaultShippingFee: 29.99,
    internationalShipping: false,
    shippingMethods: ['Standart', 'Express']
  },
  payment: {
    currency: 'TRY',
    currencySymbol: '₺',
    paymentMethods: ['Kredi Kartı', 'Havale/EFT', 'Kapıda Ödeme'],
    taxRate: 18
  }
}

const settingsSections = [
  {
    id: 'general',
    title: 'Genel Ayarlar',
    icon: CogIcon,
    description: 'Mağaza bilgileri ve temel ayarlar',
    className: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'
  },
  {
    id: 'shipping',
    title: 'Kargo',
    icon: TruckIcon,
    description: 'Kargo ve teslimat ayarları',
    className: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'
  },
  {
    id: 'payment',
    title: 'Ödeme',
    icon: CurrencyDollarIcon,
    description: 'Ödeme yöntemleri ve para birimi',
    className: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'
  }
]

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(mockSettings)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => new Promise((resolve) => setTimeout(() => resolve(mockSettings), 1000))
  })

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      showToast.success('Ayarlar başarıyla kaydedildi')
    } catch (error) {
      showToast.error('Bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loading />
      </div>
    )
  }

  const renderSettingFields = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mağaza Adı
              </label>
              <input
                type="text"
                value={formData.general.storeName}
                onChange={(e) => handleChange('general', 'storeName', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                E-posta
              </label>
              <input
                type="email"
                value={formData.general.storeEmail}
                onChange={(e) => handleChange('general', 'storeEmail', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.general.storePhone}
                onChange={(e) => handleChange('general', 'storePhone', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Adres
              </label>
              <input
                type="text"
                value={formData.general.storeAddress}
                onChange={(e) => handleChange('general', 'storeAddress', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
          </div>
        )
      case 'shipping':
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ücretsiz Kargo Limiti
              </label>
              <div className="mt-1 flex rounded-lg shadow-sm">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 sm:text-sm">
                  ₺
                </span>
                <input
                  type="number"
                  value={formData.shipping.freeShippingThreshold}
                  onChange={(e) =>
                    handleChange('shipping', 'freeShippingThreshold', parseFloat(e.target.value))
                  }
                  className="block w-full rounded-none rounded-r-lg border border-gray-300 bg-white py-2 px-3 focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Varsayılan Kargo Ücreti
              </label>
              <div className="mt-1 flex rounded-lg shadow-sm">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 sm:text-sm">
                  ₺
                </span>
                <input
                  type="number"
                  value={formData.shipping.defaultShippingFee}
                  onChange={(e) =>
                    handleChange('shipping', 'defaultShippingFee', parseFloat(e.target.value))
                  }
                  className="block w-full rounded-none rounded-r-lg border border-gray-300 bg-white py-2 px-3 focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Yurtdışı Kargo
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Yurtdışına kargo gönderimi
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleChange(
                    'shipping',
                    'internationalShipping',
                    !formData.shipping.internationalShipping
                  )
                }
                className={cn(
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  formData.shipping.internationalShipping
                    ? 'bg-primary-600 dark:bg-primary-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    formData.shipping.internationalShipping ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          </div>
        )
      case 'payment':
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Para Birimi
              </label>
              <select
                value={formData.payment.currency}
                onChange={(e) => handleChange('payment', 'currency', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="TRY">Türk Lirası (₺)</option>
                <option value="USD">Amerikan Doları ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                KDV Oranı (%)
              </label>
              <input
                type="number"
                value={formData.payment.taxRate}
                onChange={(e) => handleChange('payment', 'taxRate', parseFloat(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Mağaza ayarlarınızı yönetin ve özelleştirin
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sol Menü */}
        <nav className="space-y-2">
          {settingsSections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex w-full items-center gap-x-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors duration-200',
                  activeSection === section.id
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-500'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <div>
                  <div>{section.title}</div>
                  <div className="text-xs font-normal text-gray-500 dark:text-gray-400">
                    {section.description}
                  </div>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Sağ İçerik */}
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
            <form onSubmit={handleSubmit}>
              <div className="p-6">{renderSettingFields()}</div>
              <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-400"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 