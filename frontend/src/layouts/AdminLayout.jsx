import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store'
import { cn } from '../utils'
import { ThemeToggle } from '../components/theme'

const navigation = [
  { name: 'Dashboard', to: '/admin', icon: ChartBarIcon },
  { name: 'Ürünler', to: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Kullanıcılar', to: '/admin/users', icon: UserGroupIcon },
  { name: 'Ayarlar', to: '/admin/settings', icon: Cog6ToothIcon }
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-gray-900/80 lg:hidden',
          sidebarOpen ? 'block' : 'hidden'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between gap-x-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6">
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</span>
          </Link>
          <button
            type="button"
            className="rounded-md p-2.5 text-gray-700 bg-transparent hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 lg:hidden focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex h-[calc(100vh-4rem)] flex-1 flex-col bg-white dark:bg-gray-800">
          <div className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-x-3 rounded-lg px-4 py-2 text-sm font-medium',
                    isActive
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  )
                }
              >
                <item.icon className="h-6 w-6 shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-4">
            <div className="mb-4 flex items-center gap-x-4 px-4">
              <div className="h-10 w-10 flex-shrink-0">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-purple-600">
                  <span className="font-medium text-white">
                    {user?.name?.split(' ')[0]?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-x-3 rounded-lg px-4 py-2 text-sm font-medium text-red-600 bg-white hover:bg-gray-50 dark:bg-transparent dark:text-red-400 dark:hover:bg-gray-700/50"
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6 shrink-0" />
              Çıkış Yap
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 h-16 shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex h-16 items-center gap-x-4 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="rounded-md p-2.5 text-gray-700 bg-transparent hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 lg:hidden focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1 items-center gap-x-4 lg:gap-x-6">
                <div className="flex flex-1"></div>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                  <ThemeToggle />
                  <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-700" />
                  <Link
                    to="/"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Mağazaya Git
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  )
} 