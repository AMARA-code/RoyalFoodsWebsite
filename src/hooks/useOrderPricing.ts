'use client'

import { useMemo } from 'react'
import { useCartStore, selectCartItems } from '@/store/cartStore'
import { usePublicSettings } from '@/hooks/usePublicSettings'
import { calculateOrderTotals } from '@/lib/pricing'

export function useOrderPricing() {
  const items = useCartStore(selectCartItems)
  const { settings } = usePublicSettings()

  return useMemo(
    () => calculateOrderTotals(items, settings),
    [items, settings]
  )
}
