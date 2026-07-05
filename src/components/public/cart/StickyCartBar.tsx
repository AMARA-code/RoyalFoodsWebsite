'use client'

import { useRouter } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import { useCartStore, selectCartItemCount } from '@/store/cartStore'
import { useOrderPricing } from '@/hooks/useOrderPricing'
import { formatPrice } from '@/lib/utils'

export default function StickyCartBar() {
  const router = useRouter()
  const itemCount = useCartStore(selectCartItemCount)
  const { grandTotal } = useOrderPricing()

  if (itemCount <= 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-lg">
      <div className="flex items-center gap-3 bg-[var(--accent-crimson)] rounded-2xl px-4 py-3 shadow-lg">
        <div className="relative shrink-0">
          <ShoppingBag size={22} className="text-white" />
          <span className="absolute -top-1.5 -right-1.5 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center rounded-full bg-white text-[var(--accent-crimson)] text-[10px] font-bold">
            {itemCount}
          </span>
        </div>

        <span className="flex-1 text-white font-bold text-base">
          {formatPrice(grandTotal)}
        </span>

        <button
          type="button"
          onClick={() => router.push('/order')}
          className="bg-white/20 hover:bg-white/30 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
        >
          View Cart →
        </button>
      </div>
    </div>
  )
}
