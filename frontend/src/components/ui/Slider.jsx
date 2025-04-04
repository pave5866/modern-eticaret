import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { cn } from '../../utils'
import { motion, AnimatePresence } from 'framer-motion'

const slides = [
  {
    id: 1,
    title: 'Yeni Sezon Ürünleri',
    description: 'En yeni ürünlerimizi keşfedin',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
    link: '/products'
  },
  {
    id: 2,
    title: 'İndirim Fırsatları',
    description: 'Kaçırılmayacak fırsatlar için acele edin',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da',
    link: '/products'
  },
  {
    id: 3,
    title: 'Ücretsiz Kargo',
    description: '500 TL ve üzeri alışverişlerde ücretsiz kargo',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f',
    link: '/products'
  }
]

export function Slider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const startAutoPlay = useCallback(() => {
    return setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 10000)
  }, [])

  useEffect(() => {
    const interval = startAutoPlay()
    return () => clearInterval(interval)
  }, [startAutoPlay])

  const handleSlideChange = useCallback((newIndex) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentSlide(newIndex)
    setTimeout(() => setIsAnimating(false), 500) // Animasyon süresi kadar bekle
  }, [isAnimating])

  const prevSlide = useCallback(() => {
    const newIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1
    handleSlideChange(newIndex)
  }, [currentSlide, handleSlideChange])

  const nextSlide = useCallback(() => {
    const newIndex = currentSlide === slides.length - 1 ? 0 : currentSlide + 1
    handleSlideChange(newIndex)
  }, [currentSlide, handleSlideChange])

  const goToSlide = useCallback((index) => {
    handleSlideChange(index)
  }, [handleSlideChange])

  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-lg">
      {/* Slides */}
      <AnimatePresence initial={false} mode="wait">
        {slides.map((slide, index) => (
          index === currentSlide && (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Content */}
              <div className="relative h-full flex items-center justify-center text-center text-white p-4">
                <div>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-4xl md:text-5xl font-bold mb-4"
                  >
                    {slide.title}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="text-lg md:text-xl mb-8"
                  >
                    {slide.description}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Link
                      to={slide.link}
                      className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Alışverişe Başla
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={prevSlide}
        disabled={isAnimating}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors z-10 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeftIcon className="w-8 h-8" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={nextSlide}
        disabled={isAnimating}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors z-10 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRightIcon className="w-8 h-8" />
      </motion.button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={isAnimating}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
              index === currentSlide
                ? 'bg-white scale-110'
                : 'bg-white/50 hover:bg-white/75'
            )}
          />
        ))}
      </div>
    </div>
  )
} 