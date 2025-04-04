import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Dialog } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  UserIcon,
  HomeIcon,
  ShoppingBagIcon,
  InformationCircleIcon,
  PhoneIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { ThemeToggle } from '../theme'
import { useAuthStore, useCartStore } from '../../store'

const navigation = {
  pages: [
    { name: 'Ana Sayfa', href: '/', icon: HomeIcon },
    { name: 'Ürünler', href: '/products', icon: ShoppingBagIcon },
    { name: 'Hakkımızda', href: '/about', icon: InformationCircleIcon },
    { name: 'İletişim', href: '/contact', icon: PhoneIcon },
    { name: 'SSS', href: '/faq', icon: QuestionMarkCircleIcon }
  ]
}

const navVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

const mobileMenuVariants = {
  hidden: { opacity: 0, x: "100%" },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: {
      duration: 0.2
    }
  }
}

const linkVariants = {
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore()
  const cartItems = useCartStore((state) => state.items)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <motion.div 
      className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 ${
        isScrolled ? 'shadow-lg backdrop-blur-lg bg-white/90 dark:bg-gray-900/90' : ''
      } transition-all duration-300`}
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2.5 bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Ana menüyü aç</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Logo */}
            <div className="ml-4 flex lg:ml-0">
              <Link 
                to="/" 
                className="flex items-center space-x-2 group"
                aria-label="Home"
              >
                <motion.span 
                  className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent group-hover:to-primary-600 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  E-Commerce
                </motion.span>
              </Link>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex lg:items-center lg:justify-center lg:space-x-6">
              {navigation.pages.map((page) => {
                const Icon = page.icon
                return (
                  <motion.div
                    key={page.name}
                    whileHover="hover"
                    whileTap="tap"
                    variants={linkVariants}
                  >
                    <Link
                      to={page.href}
                      className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive(page.href)
                          ? 'text-primary-600 dark:text-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'text-gray-700 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      aria-current={isActive(page.href) ? 'page' : undefined}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{page.name}</span>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              <motion.div 
                className="flow-root"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ThemeToggle />
              </motion.div>

              <motion.div 
                className="flow-root"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/cart"
                  className="group -m-2 flex items-center p-2 relative"
                  aria-label="Shopping cart"
                >
                  <ShoppingCartIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-500 dark:text-gray-300 dark:group-hover:text-white transition-colors duration-200" />
                  {cartItems.length > 0 && (
                    <motion.span 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center text-xs font-medium text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      {cartItems.length}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              <motion.div 
                className="flow-root"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isAuthenticated ? (
                  <Link
                    to="/profile"
                    className="group -m-2 flex items-center p-2"
                    aria-label="User profile"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                      {user?.name?.split(' ')[0]?.charAt(0)?.toUpperCase() || 'K'}
                    </div>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="group -m-2 flex items-center p-2"
                    aria-label="Login"
                  >
                    <UserIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-500 dark:text-gray-300 dark:group-hover:text-white transition-colors duration-200" />
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <Dialog
            as={motion.div}
            className="lg:hidden"
            open={mobileMenuOpen}
            onClose={setMobileMenuOpen}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div 
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <Dialog.Panel
              as={motion.div}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xs overflow-y-auto bg-white dark:bg-gray-900 px-6 py-6 shadow-xl"
              variants={mobileMenuVariants}
            >
              <div className="flex items-center justify-between">
                <Link 
                  to="/" 
                  className="flex items-center space-x-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                    E-Commerce
                  </span>
                </Link>
                <button
                  type="button"
                  className="rounded-md p-2.5 bg-transparent text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Kapat</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-700">
                  <div className="space-y-2 py-6">
                    {navigation.pages.map((page) => {
                      const Icon = page.icon
                      return (
                        <motion.div
                          key={page.name}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link
                            to={page.href}
                            className={`-mx-3 flex items-center space-x-2 rounded-lg px-3 py-2 text-base font-semibold leading-7 transition-colors duration-200 ${
                              isActive(page.href)
                                ? 'text-primary-600 dark:text-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'text-gray-700 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                            aria-current={isActive(page.href) ? 'page' : undefined}
                          >
                            <Icon className="h-6 w-6" />
                            <span>{page.name}</span>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                  
                  <div className="py-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tema</span>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 