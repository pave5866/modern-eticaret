import { useState } from 'react'
import { Button } from '.'

export default function AddressForm({ onSubmit, initialData, loading }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    fullName: initialData?.fullName || '',
    phone: initialData?.phone || '',
    city: initialData?.city || '',
    district: initialData?.district || '',
    address: initialData?.address || '',
    postalCode: initialData?.postalCode || '',
    isDefault: initialData?.isDefault || false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-lg mx-auto">
      <div className="w-full">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Adres Başlığı
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors duration-200"
          required
        />
      </div>

      <div className="w-full">
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Ad Soyad
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors duration-200"
          required
        />
      </div>

      <div className="w-full">
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Telefon
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors duration-200"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            İl
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors duration-200"
            required
          />
        </div>

        <div>
          <label
            htmlFor="district"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            İlçe
          </label>
          <input
            type="text"
            id="district"
            name="district"
            value={formData.district}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors duration-200"
            required
          />
        </div>
      </div>

      <div className="w-full">
        <label
          htmlFor="postalCode"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Posta Kodu
        </label>
        <input
          type="text"
          id="postalCode"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors duration-200"
          required
          maxLength="5"
          pattern="[0-9]{5}"
          placeholder="34000"
        />
      </div>

      <div className="w-full">
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Açık Adres
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors duration-200"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label
          htmlFor="isDefault"
          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
        >
          Varsayılan adres olarak kaydet
        </label>
      </div>

      <div className="flex justify-end gap-4 pt-2">
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full sm:w-auto transition-all duration-200 hover:scale-105"
        >
          {loading ? 'Kaydediliyor...' : initialData ? 'Güncelle' : 'Kaydet'}
        </Button>
      </div>
    </form>
  )
} 