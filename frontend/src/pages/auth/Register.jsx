import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  EyeIcon, 
  EyeSlashIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store'
import { showToast } from '../../utils/toast'
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

export default function Register() {
  const navigate = useNavigate()
  const register = useAuthStore(state => state.register)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
    validateField(name, formData[name])
  }

  const validateField = (name, value) => {
    let error = ''
    switch (name) {
      case 'name':
        if (!value) {
          error = 'Ad Soyad gerekli'
        }
        break
      case 'email':
        if (!value) {
          error = 'E-posta adresi gerekli'
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Geçerli bir e-posta adresi girin'
        }
        break
      case 'password':
        if (!value) {
          error = 'Şifre gerekli'
        } else if (value.length < 6) {
          error = 'Şifre en az 6 karakter olmalı'
        }
        break
      case 'confirmPassword':
        if (!value) {
          error = 'Şifre tekrarı gerekli'
        } else if (value !== formData.password) {
          error = 'Şifreler eşleşmiyor'
        }
        break
      default:
        break
    }
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
    return !error
  }

  const validateForm = () => {
    const fields = ['name', 'email', 'password', 'confirmPassword']
    let isValid = true
    
    fields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false
      }
      setTouched(prev => ({
        ...prev,
        [field]: true
      }))
    })

    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      }

      const response = await register(userData)

      if (response.success) {
        showToast.success('Kayıt başarılı! Giriş yapabilirsiniz.')
        navigate('/login')
      } else {
        showToast.error(response.message || 'Kayıt sırasında bir hata oluştu')
      }
    } catch (error) {
      logger.error('Kayıt hatası:', { error: error.message })
      showToast.error('Kayıt sırasında bir hata oluştu')
      
      if (error.response?.status === 400) {
        if (error.response.data.message.includes('email')) {
          setErrors(prev => ({
            ...prev,
            email: error.response.data.message
          }))
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-purple-900 dark:via-gray-900 dark:to-black">
      {/* Animated Background Bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-200 dark:bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-80 h-80 bg-primary-300 dark:bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-primary-400 dark:bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Register Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md mx-4"
      >
        <div className="absolute inset-0 bg-white/80 dark:bg-white/5 backdrop-blur-lg rounded-2xl"></div>
        <motion.div
          variants={itemVariants}
          className="relative bg-white/50 dark:bg-black/30 rounded-2xl p-8 backdrop-blur-sm border border-gray-200 dark:border-white/10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Kayıt Ol</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Yeni bir hesap oluşturun</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ad Soyad"
                  className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 dark:focus:border-purple-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-purple-500 transition-colors"
                />
              </div>
              {touched.name && errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-500 dark:text-red-400"
                >
                  {errors.name}
                </motion.p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="E-posta"
                  className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 dark:focus:border-purple-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-purple-500 transition-colors"
                />
              </div>
              {touched.email && errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-500 dark:text-red-400"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Şifre"
                  className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 dark:focus:border-purple-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-purple-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-500 dark:text-red-400"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Şifre Tekrar"
                  className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 dark:focus:border-purple-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-purple-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-500 dark:text-red-400"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full py-3 rounded-lg text-white font-medium ${
                loading 
                  ? 'bg-primary-400 dark:bg-purple-800/50 cursor-not-allowed' 
                  : 'bg-primary-600 hover:bg-primary-700 dark:bg-purple-600 dark:hover:bg-purple-700'
              } transition-all duration-200`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  KAYIT
                </div>
              ) : (
                'Kayıt Ol'
              )}
            </motion.button>

            {/* Login Link */}
            <p className="text-center text-gray-600 dark:text-gray-400">
              Zaten hesabınız var mı?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-500 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors"
              >
                Giriş Yap
              </Link>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
} 