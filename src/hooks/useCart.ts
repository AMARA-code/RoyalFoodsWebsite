'use client'

import {
  useCartStore,
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
} from '@/store/cartStore'

export function useCart() {
  const items = useCartStore(selectCartItems)
  const total = useCartStore(selectCartTotal)
  const itemCount = useCartStore(selectCartItemCount)
  const addItem = useCartStore((s) => s.addItem)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)

  return {
    items,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isEmpty: items.length === 0,
  }
}
