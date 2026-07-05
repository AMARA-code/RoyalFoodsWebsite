'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Minus, Plus } from 'lucide-react'
import type { MenuItem } from '@/types/database'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

interface Props {
  item: MenuItem
  onClose: () => void
}

export default function MenuItemModal({ item, onClose }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [instructions, setInstructions] = useState('')
  const addItem = useCartStore(s => s.addItem)
  const updateQuantity = useCartStore(s => s.updateQuantity)

  const handleAddToCart = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      instructions: instructions.trim() || undefined,
    })

    if (quantity > 1) {
      updateQuantity(item.id, quantity)
    }

    toast.success(`${item.name} added to cart`)
    onClose()
  }

  const total = item.price * quantity

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden relative grid grid-cols-1 md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition z-10"
        >
          <X size={18} />
        </button>

        {/* Image side */}
        <div className="relative bg-gray-50 flex items-center justify-center min-h-[280px] md:min-h-[420px]">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-contain p-6"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <span style={{ fontSize: '3rem' }}>🍽️</span>
          )}
        </div>

        {/* Details side */}
        <div className="p-6 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h2>
          <p className="text-xl font-semibold text-gray-800 mb-6">
            {formatPrice(item.price)}
          </p>

          {item.description && (
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {item.description}
            </p>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Any special requests?"
              rows={3}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div className="mt-auto flex items-center gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition"
            >
              <span>{formatPrice(total)}</span>
              <span className="opacity-50">|</span>
              <span>Add To Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}