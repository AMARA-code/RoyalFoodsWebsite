'use client'

import { ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore, selectCartItemCount } from '@/store/cartStore'

export default function CartButton({ onClick }: { onClick: () => void }) {
  const itemCount = useCartStore(selectCartItemCount)

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.button
          onClick={onClick}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 btn-crimson"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
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
        </motion.button>
      )}
    </AnimatePresence>
  )
}