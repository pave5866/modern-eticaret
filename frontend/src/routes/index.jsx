import { createBrowserRouter } from 'react-router-dom'
import RootLayout from '../layouts/RootLayout'
import AdminLayout from '../layouts/AdminLayout'
import { PrivateRoute } from '../components/auth'

// Pages
import {
  Home,
  Products,
  ProductDetail,
  Cart,
  Profile,
  About,
  Contact,
  FAQ,
  NotFound,
  CategoryProducts
} from '../pages'

// Auth Pages
import { Login, Register, ForgotPassword } from '../pages/auth'

// Admin Pages
import {
  Dashboard,
  AdminProducts,
  Users,
  Orders,
  Settings
} from '../pages/admin'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products', element: <Products /> },
      { path: 'products/:id', element: <ProductDetail /> },
      { path: 'category/:category', element: <CategoryProducts /> },
      { path: 'cart', element: <Cart /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'faq', element: <FAQ /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      {
        path: 'profile',
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        )
      },
      { path: '*', element: <NotFound /> }
    ]
  },
  {
    path: '/admin',
    element: (
      <PrivateRoute requireAdmin>
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'users', element: <Users /> },
      { path: 'orders', element: <Orders /> },
      { path: 'settings', element: <Settings /> }
    ]
  }
])

export default router 