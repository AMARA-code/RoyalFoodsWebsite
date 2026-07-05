'use client'

import { ShoppingCart } from 'lucide-react'
import { useCartStore, selectCartItemCount } from '@/store/cartStore'

export default function CartButton({ onClick }: { onClick: () => void }) {
  const itemCount = useCartStore(selectCartItemCount)

  if (itemCount <= 0) return null

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 btn-crimson"
      style={{
        borderRadius: '2px',
        boxShadow: '0 8px 32px rgba(139,0,0,0.4)',
      }}
    >
      <ShoppingCart size={18} />
      <span>Cart</span>
      <span
        style={{
          background: 'rgba(255,255,255,0.25)',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 700,
        }}
      >
        {itemCount}
      </span>
    </button>
  )
}