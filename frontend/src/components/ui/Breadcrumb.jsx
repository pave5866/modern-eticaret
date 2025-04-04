import { Link, useLocation } from 'react-router-dom'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'

const routeNames = {
  products: 'Ürünler',
  cart: 'Sepet',
  profile: 'Profil',
  contact: 'İletişim',
  about: 'Hakkımızda',
  faq: 'SSS',
  login: 'Giriş Yap',
  register: 'Kayıt Ol',
  'forgot-password': 'Şifremi Unuttum'
}

export function Breadcrumb() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  // Eğer ana sayfadaysak breadcrumb gösterme
  if (pathnames.length === 0) return null

  return (
    <nav className="container mx-auto px-4 py-4">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link
            to="/"
            className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <HomeIcon className="h-4 w-4" />
          </Link>
        </li>

        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
          const isLast = index === pathnames.length - 1

          // Ürün detay sayfası için özel durum
          if (name.match(/^\d+$/)) {
            name = 'Ürün Detay'
          }

          return (
            <li key={name} className="flex items-center">
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              {isLast ? (
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {routeNames[name] || name}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {routeNames[name] || name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
} 