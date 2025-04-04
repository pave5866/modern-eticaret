import { Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore, useCartStore } from '../../store'
import { showToast } from '../../utils'
import logger from '../../utils/logger'

export function PrivateRoute({ children, requireAdmin }) {
  const { isAuthenticated, user } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user
  }))
  const location = useLocation()
  const clearCart = useCartStore((state) => state.clearCart)
  const items = useCartStore((state) => state.items)

  // Admin sayfasına geçiş yapıldığında sepet kontrolü
  useEffect(() => {
    if (requireAdmin && user?.role === 'admin' && items.length > 0) {
      clearCart()
      logger.info('Admin sayfasına erişildi, sepet temizlendi')
      showToast.info('Admin arayüzüne geçiş yaptığınız için sepetiniz temizlendi')
    }
  }, [requireAdmin, user, items.length, clearCart])

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" state={{ message: 'Bu sayfaya erişim yetkiniz yok.' }} replace />
  }

  return children
} 