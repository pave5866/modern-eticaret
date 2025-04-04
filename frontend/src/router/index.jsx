import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import {
  Home,
  Products,
  ProductDetail,
  Cart,
  Orders,
  Profile,
  NotFound
} from '../pages'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'products',
        element: <Products />
      },
      {
        path: 'products/:id',
        element: <ProductDetail />
      },
      {
        path: 'cart',
        element: <Cart />
      },
      {
        path: 'orders',
        element: <Orders />
      },
      {
        path: 'profile',
        element: <Profile />
      }
    ]
  }
]) 