import { Outlet } from 'react-router-dom'
import { Navbar } from '../navbar'
import { Footer } from '../footer'
import { BackToTop } from '../ui'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
} 