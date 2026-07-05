'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCartStore, selectCartItems } from '@/store/cartStore'
import { useOrderPricing } from '@/hooks/useOrderPricing'
import { formatPrice } from '@/lib/utils'
import { applyDiscount } from '@/lib/promo'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: Props) {
  const items = useCartStore(selectCartItems)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const {
    grandTotal,
    promo,
    discountAmount,
    subtotal,
    deliveryFee,
    freeDeliveryApplied,
  } = useOrderPricing()
  const promoActive = promo.enabled && promo.percent > 0

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

          <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-full max-w-[420px] bg-white border-l border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-[#1A2238]">Your Cart</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                  <ShoppingBag size={48} className="text-gray-300" />
                  <p className="text-gray-500 font-medium">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-lg bg-[#D62828] text-white text-sm font-semibold"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-[#1A2238] mb-0.5">{item.name}</p>
                        <p className="text-sm font-bold text-[#D62828]">
                          {promoActive
                            ? formatPrice(applyDiscount(item.price, promo))
                            : formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-gray-500 hover:bg-gray-50"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-gray-500 hover:bg-gray-50"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 font-medium">
                            {formatPrice(
                              (promoActive
                                ? applyDiscount(item.price, promo)
                                : item.price) * item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[#D62828] hover:text-red-700"
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

            {items.length > 0 && (
              <div className="p-5 border-t border-gray-100 space-y-2 text-sm">
                {promoActive && discountAmount > 0 && (
                  <div className="flex justify-between text-[#D62828]">
                    <span>Discount ({promo.percent}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={freeDeliveryApplied ? 'text-green-600 font-medium' : ''}>
                    {freeDeliveryApplied ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-gray-800 font-semibold">Total</span>
                  <span className="text-lg font-bold text-[#D62828]">{formatPrice(grandTotal)}</span>
                </div>
                <Link
                  href="/order"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#D62828] text-white font-semibold text-sm hover:bg-[#b81f1f] transition-colors"
                >
                  <ShoppingBag size={16} />
                  View Cart →
                </Link>
                <button
                  onClick={onClose}
                  className="w-full mt-2 py-2.5 text-sm text-gray-600 hover:text-[#1A2238] transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
