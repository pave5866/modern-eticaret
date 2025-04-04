import { forwardRef } from 'react'
import { cn } from '../../utils'

const variants = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-primary-600',
  secondary:
    'bg-gray-600 text-white hover:bg-gray-700 focus-visible:outline-gray-600',
  outline:
    'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800',
  ghost: 'hover:bg-gray-50 dark:hover:bg-gray-800',
  link: 'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600'
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4',
  lg: 'h-11 px-8',
  icon: 'h-10 w-10'
}

const Button = forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      type = 'button',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button 