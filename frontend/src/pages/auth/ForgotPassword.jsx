import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { showToast } from '../../utils/toast'

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

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)

  const validateEmail = (value) => {
    if (!value) {
      return 'E-posta adresi gerekli'
    }
    if (!/\S+@\S+\.\S+/.test(value)) {
      return 'Geçerli bir e-posta adresi girin'
    }
    return ''
  }

  const handleChange = (e) => {
    setEmail(e.target.value)
    if (error) {
      setError('')
    }
  }

  const handleBlur = () => {
    setTouched(true)
    setError(validateEmail(email))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationError = validateEmail(email)
    if (validationError) {
      setError(validationError)
      setTouched(true)
      return
    }

    setLoading(true)

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      setIsEmailSent(true)
      showToast.success('Şifre sıfırlama bağlantısı gönderildi')
    } catch (error) {
      showToast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-purple-900 dark:via-gray-900 dark:to-black">
        {/* Animated Background Bubbles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-200 dark:bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-20 w-80 h-80 bg-primary-300 dark:bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-20 w-80 h-80 bg-primary-400 dark:bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Success Container */}
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
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20 mb-8">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Email Gönderildi</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Şifre sıfırlama bağlantısı {email} adresine gönderildi. Lütfen email
                kutunuzu kontrol edin.
              </p>

              <div className="flex flex-col gap-4">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3 rounded-lg text-white font-medium bg-primary-600 hover:bg-primary-700 dark:bg-purple-600 dark:hover:bg-purple-700 transition-all duration-200"
                  >
                    Giriş Sayfasına Dön
                  </motion.button>
                </Link>

                <button
                  onClick={() => setIsEmailSent(false)}
                  className="text-sm text-primary-600 hover:text-primary-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                >
                  Farklı bir email adresi dene
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-purple-900 dark:via-gray-900 dark:to-black">
      {/* Animated Background Bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-200 dark:bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-80 h-80 bg-primary-300 dark:bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-primary-400 dark:bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Form Container */}
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Şifremi Unuttum</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="E-posta"
                  className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 dark:focus:border-purple-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-purple-500 transition-colors"
                />
              </div>
              {touched && error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-500 dark:text-red-400"
                >
                  {error}
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
                  GÖNDERİLİYOR
                </div>
              ) : (
                'Şifre Sıfırlama Bağlantısı Gönder'
              )}
            </motion.button>

            {/* Login Link */}
            <p className="text-center text-gray-600 dark:text-gray-400">
              Şifrenizi hatırladınız mı?{' '}
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