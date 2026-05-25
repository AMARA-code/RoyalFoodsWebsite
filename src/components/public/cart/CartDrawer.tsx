'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCartStore, selectCartItems, selectCartTotal } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: Props) {
  const items = useCartStore(selectCartItems)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const total = useCartStore(selectCartTotal)

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
            style={{
              width: 'min(420px, 100vw)',
              background: 'var(--bg-secondary)',
              borderLeft: '1px solid var(--border-subtle)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-6"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>
                  Your Cart
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded transition-colors"
                style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                  <ShoppingBag size={48} style={{ color: 'var(--border-default)' }} />
                  <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-serif)', fontSize: '1.3rem' }}>
                    Your cart is empty
                  </p>
                  <button onClick={onClose} className="btn-gold" style={{ fontSize: '11px' }}>
                    Browse Menu
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 rounded"
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div className="flex-1">
                        <p style={{ fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>
                          {item.name}
                        </p>
                        <p className="price-tag" style={{ fontSize: '1rem' }}>
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        {/* Quantity */}
                        <div
                          className="flex items-center gap-2"
                          style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '2px',
                            padding: '2px 4px',
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            style={{ color: 'var(--text-muted)', padding: '2px 4px' }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: '13px', minWidth: '16px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{ color: 'var(--text-muted)', padding: '2px 4px' }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Subtotal + remove */}
                        <div className="flex items-center gap-3">
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            style={{ color: 'var(--accent-crimson-light)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                className="p-6"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <div className="flex justify-between items-center mb-4">
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total</span>
                  <span className="price-tag">{formatPrice(total)}</span>
                </div>
                <Link
                  href="/order"
                  onClick={onClose}
                  className="btn-crimson w-full flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={16} />
                  Proceed to Checkout
                </Link>
                <button
                  onClick={onClose}
                  className="btn-outline w-full mt-3 flex items-center justify-center"
                  style={{ fontSize: '12px' }}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}