import { forwardRef } from 'react'
import { cn } from '../../utils'

export const Input = forwardRef(
  ({ className, type = 'text', error, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            'block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400',
            error &&
              'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  }
) 