'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, Plus } from 'lucide-react'
import type { MenuItem } from '@/types/database'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

interface Props {
  item: MenuItem
  index: number
  onAddToCart: () => void
}

export default function MenuItemCard({ item, index, onAddToCart }: Props) {
  const [imgError, setImgError] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  const handleAdd = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
    })
    toast.success(`${item.name} added to cart`)
    onAddToCart()
  }

  return (
    <motion.div
      className="card-eclat overflow-hidden group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
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

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3"
          style={{ background: 'rgba(10,10,10,0.6)' }}
        >
          <Link
            href={`/menu/${item.slug}`}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            <Eye size={16} />
          </Link>
          <button
            onClick={handleAdd}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent-crimson)', color: '#fff' }}
          >
            <Plus size={16} />
          </button>
        </div>

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
          <div className="flex items-center gap-2">
            <Link
              href={`/menu/${item.slug}`}
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              Details
            </Link>
            <button
              onClick={handleAdd}
              className="btn-crimson py-2 px-4"
              style={{ fontSize: '11px' }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}