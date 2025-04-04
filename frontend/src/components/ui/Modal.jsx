import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '.'

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  footer
}) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={`relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:p-6 ${
                  size === 'sm'
                    ? 'sm:max-w-sm sm:w-full'
                    : size === 'md'
                    ? 'sm:max-w-lg sm:w-full'
                    : size === 'lg'
                    ? 'sm:max-w-xl sm:w-full'
                    : size === 'xl'
                    ? 'sm:max-w-2xl sm:w-full'
                    : size === '2xl'
                    ? 'sm:max-w-3xl sm:w-full'
                    : size === '3xl'
                    ? 'sm:max-w-4xl sm:w-full'
                    : size === '4xl'
                    ? 'sm:max-w-5xl sm:w-full'
                    : size === '5xl'
                    ? 'sm:max-w-6xl sm:w-full'
                    : size === '6xl'
                    ? 'sm:max-w-7xl sm:w-full'
                    : 'sm:max-w-lg sm:w-full'
                }`}
              >
                {showCloseButton && (
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      type="button"
                      className="rounded-md bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      onClick={onClose}
                    >
                      <span className="sr-only">Kapat</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                )}
                {title && (
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                    {title}
                  </Dialog.Title>
                )}
                <div className="mt-2">{children}</div>
                {footer && <div className="mt-5 sm:mt-6">{footer}</div>}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 