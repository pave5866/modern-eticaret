import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="relative mb-8">
          {/* 404 Animasyonu */}
          <div className="text-9xl font-bold text-gray-200 dark:text-gray-800">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Sayfa Bulunamadı
            </div>
          </div>
        </div>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
          Ana sayfaya dönerek alışverişe devam edebilirsiniz.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/">
            <Button>
              Ana Sayfaya Dön
            </Button>
          </Link>
          
          <Link to="/products">
            <Button variant="secondary">
              Ürünlere Göz At
            </Button>
          </Link>
        </div>

        {/* İllüstrasyon */}
        <div className="mt-12 max-w-sm mx-auto">
          <svg
            className="w-full h-auto text-gray-400 dark:text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            data-name="Layer 1"
            viewBox="0 0 1120.59226 777.91584"
          >
            <title>404 İllüstrasyon</title>
            <circle cx="212.59226" cy="103" r="64" fill="currentColor"/>
            <path
              d="M563.68016,404.16381c0,151.01141-89.77389,203.73895-200.51559,203.73895S162.649,555.17522,162.649,404.16381,363.16457,61.04208,363.16457,61.04208,563.68016,253.1524,563.68016,404.16381Z"
              transform="translate(-39.70387 -61.04208)"
              fill="currentColor"
            />
            <polygon
              points="316.156 523.761 318.21 397.378 403.674 241.024 318.532 377.552 319.455 320.725 378.357 207.605 319.699 305.687 319.699 305.687 321.359 203.481 384.433 113.423 321.621 187.409 322.658 0 316.138 248.096 316.674 237.861 252.547 139.704 315.646 257.508 309.671 371.654 309.493 368.625 235.565 265.329 309.269 379.328 308.522 393.603 308.388 393.818 308.449 394.99 293.29 684.589 313.544 684.589 315.974 535.005 389.496 421.285 316.156 523.761"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </div>
  )
} 