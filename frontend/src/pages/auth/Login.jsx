import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  EyeIcon, 
  EyeSlashIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store'
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

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [networkError, setNetworkError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    
    // Form değiştiğinde network hatası temizle
    if (networkError) {
      setNetworkError(null)
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
    const fields = ['email', 'password']
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

    // Network hatası temizle
    setNetworkError(null)
    setIsSubmitting(true)
    
    try {
      const response = await login({ ...formData, rememberMe });
      
      // Yanıt kontrol edelim ve güvenli bir yapı oluşturalım
      let userData;
      
      if (response?.data?.success && response?.data?.data?.user) {
        userData = response.data.data.user;
      } else if (response?.data?.user) {
        userData = response.data.user;
      }
      
      if (userData) {
        showToast.success('Başarıyla giriş yapıldı');
        
        // Admin kullanıcıları için /admin sayfasına yönlendir
        if (userData.role === 'admin') {
          navigate('/admin');
          return;
        }
        
        const redirectTo = location.state?.from || '/';
        const message = location.state?.message;
        if (message) {
          showToast.info(message);
        }
        navigate(redirectTo);
      } else {
        throw new Error('Kullanıcı bilgileri alınamadı');
      }
    } catch (error) {
      // Network hatasını ayıklayalım
      if (error.message && error.message.includes('Network Error')) {
        setNetworkError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
      } else if (error.response?.status === 401) {
        setNetworkError('E-posta veya şifre hatalı.');
      } else if (error.response?.status === 500) {
        setNetworkError('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      } else if (error.response?.data?.message) {
        setNetworkError(error.response.data.message);
      } else {
        setNetworkError(error.message || 'Giriş yapılamadı. Lütfen tekrar deneyin.');
      }
      
      // Hata oluştuğunda toast mesajı göster
      showToast.error(
        error.response?.data?.message || 
        error.message || 
        'Giriş yapılamadı'
      );
    } finally {
      setIsSubmitting(false);
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

      {/* Login Container */}
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Hoşgeldiniz</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Devam etmek için giriş yapın</p>
          </div>

          {/* Network Error Alert */}
          {networkError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50"
            >
              <div className="flex items-start">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-300">{networkError}</p>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="email"
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
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="şifre"
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

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-black/20 text-primary-500 dark:text-purple-500 focus:ring-primary-500 dark:focus:ring-purple-500"
                />
                <label htmlFor="remember-me" className="ml-2 text-gray-600 dark:text-gray-400">
                  Beni Hatırla
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-primary-600 hover:text-primary-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
              >
                Şifrenizi mi unuttunuz?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full py-3 rounded-lg text-white font-medium ${
                isSubmitting 
                  ? 'bg-primary-400 dark:bg-purple-800/50 cursor-not-allowed' 
                  : 'bg-primary-600 hover:bg-primary-700 dark:bg-purple-600 dark:hover:bg-purple-700'
              } transition-all duration-200`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  GİRİŞ
                </div>
              ) : (
                'Giriş Yap'
              )}
            </motion.button>

            {/* Register Link */}
            <p className="text-center text-gray-600 dark:text-gray-400">
              Hesabınız yok mu?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-500 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors"
              >
                Kayıt Ol
              </Link>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}