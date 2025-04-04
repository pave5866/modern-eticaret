import { useState, useEffect } from 'react'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme')
    const rootTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    setTheme(savedTheme || rootTheme)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  if (!mounted) {
    return (
      <button className="rounded-lg p-2 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors duration-200">
        <span className="sr-only">Temayı değiştir</span>
        <MoonIcon className="h-5 w-5" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg p-2 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors duration-200"
    >
      <span className="sr-only">Temayı değiştir</span>
      {theme === 'dark' ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  )
} 