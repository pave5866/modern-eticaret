import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items
        const existingItem = items.find(item => item.id === product.id)

        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          })
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] })
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.id !== productId) })
      },
      updateQuantity: (productId, quantity) => {
        set({
          items: get().items.map(item =>
            item.id === productId ? { ...item, quantity } : item
          )
        })
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      }
    }),
    {
      name: 'cart-storage'
    }
  )
) 