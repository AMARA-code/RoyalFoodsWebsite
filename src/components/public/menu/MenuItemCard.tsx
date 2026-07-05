'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import type { MenuItem } from '@/types/database'
import { formatPrice } from '@/lib/utils'
import MenuItemModal from './MenuItemModal'

interface Props {
  item: MenuItem
  index: number
  onAddToCart: () => void
}

export default function MenuItemCard({ item, index, onAddToCart }: Props) {
  const [imgError, setImgError] = useState(false)
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <motion.div
        className="card-eclat overflow-hidden group cursor-pointer"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        onClick={() => setShowModal(true)}
      >
        <div className="relative overflow-hidden" style={{ height: '220px' }}>
          {item.image_url && !imgError ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              onError={() => setImgError(true)}
              sizes="(max-width: 768px) 100vw, 350px"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <span style={{ fontSize: '2rem' }}>🍽️</span>
            </div>
          )}

          {item.badge && (
            <div className="absolute top-3 left-3">
              <span className="badge-crimson">{item.badge}</span>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '8px' }}>
            {item.name}
          </h3>
          {item.description && (
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '13px',
                lineHeight: 1.6,
                marginBottom: '16px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="price-tag">{formatPrice(item.price)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowModal(true)
              }}
              className="btn-crimson py-2 px-4 flex items-center gap-1"
              style={{ fontSize: '11px' }}
            >
              <Plus size={12} />
              Add
            </button>
          </div>
        </div>
      </motion.div>

      {showModal && (
        <MenuItemModal item={item} onClose={() => { setShowModal(false); onAddToCart() }} />
      )}
    </>
  )
}