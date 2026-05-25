'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ShoppingCart, Plus, Minus, ArrowLeft,
  ChevronRight, Star, Clock, Users
} from 'lucide-react'
import type { MenuItem } from '@/types/database'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'
import MenuItemCard from '@/components/public/menu/MenuItemCard'

interface CategorySnippet {
  id: string
  name: string
  slug: string
}

interface Props {
  item: MenuItem & { menu_categories: CategorySnippet | null }
  related: MenuItem[]
}

export default function DishDetailClient({ item, related }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [imgError, setImgError] = useState(false)
  const [notes, setNotes] = useState('')
  const addItem = useCartStore(s => s.addItem)
  const cartItems = useCartStore(s => s.items)

  const inCart = cartItems.find(i => i.id === item.id)

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
      })
    }
    toast.success(`${quantity}× ${item.name} added to cart`)
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', paddingTop: '88px' }}>
        <div className="container-eclat py-4">
          <div className="flex items-center gap-2" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/menu" className="hover:text-white transition-colors">Menu</Link>
            <ChevronRight size={12} />
            {item.menu_categories && (
              <>
                <Link href={`/menu#section-${item.menu_categories.slug}`} className="hover:text-white transition-colors">
                  {item.menu_categories.name}
                </Link>
                <ChevronRight size={12} />
              </>
            )}
            <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
          </div>
        </div>
      </div>

      {/* Main detail */}
      <section className="section-py">
        <div className="container-eclat">
          <div className="grid gap-12 items-start" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

            {/* Image */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="relative overflow-hidden rounded" style={{ height: '480px', border: '1px solid var(--border-subtle)' }}>
                {item.image_url && !imgError ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    onError={() => setImgError(true)}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
                    <span style={{ fontSize: '4rem' }}>🍽️</span>
                  </div>
                )}
                {item.badge && (
                  <div className="absolute top-4 left-4">
                    <span className="badge-crimson">{item.badge}</span>
                  </div>
                )}
                {item.is_featured && (
                  <div className="absolute top-4 right-4">
                    <span className="badge-gold flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> Featured
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4" style={{ height: '1px', background: 'linear-gradient(90deg, var(--accent-crimson), transparent)' }} />
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="flex flex-col gap-6">
              {item.menu_categories && (
                <Link href={`/menu#section-${item.menu_categories.slug}`} className="text-label text-accent-gold hover:opacity-80 transition-opacity w-fit">
                  ← {item.menu_categories.name}
                </Link>
              )}

              <div>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, lineHeight: 1.1 }}>
                  {item.name}
                </h1>
                <div style={{ width: '60px', height: '1px', background: 'var(--accent-crimson-light)', marginTop: '16px' }} />
              </div>

              {item.description && (
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '15px' }}>
                  {item.description}
                </p>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="badge-gold">{tag}</span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 py-4" style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="text-center">
                  <Clock size={18} style={{ color: 'var(--accent-gold)', margin: '0 auto 4px' }} />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Prep Time</p>
                  <p style={{ fontSize: '13px', fontWeight: 500 }}>15–20 min</p>
                </div>
                <div className="text-center">
                  <Users size={18} style={{ color: 'var(--accent-gold)', margin: '0 auto 4px' }} />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Serves</p>
                  <p style={{ fontSize: '13px', fontWeight: 500 }}>1–2 people</p>
                </div>
                <div className="text-center">
                  <Star size={18} style={{ color: 'var(--accent-gold)', margin: '0 auto 4px' }} />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rating</p>
                  <p style={{ fontSize: '13px', fontWeight: 500 }}>4.8 / 5</p>
                </div>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="price-tag" style={{ fontSize: '2rem' }}>{formatPrice(item.price)}</span>
                {inCart && (
                  <span style={{ fontSize: '12px', color: 'var(--accent-gold)' }}>{inCart.quantity}× in cart</span>
                )}
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Special instructions (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="E.g. no onions, extra spicy..."
                  rows={2}
                  className="input-eclat"
                  style={{ resize: 'none', fontSize: '13px' }}
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '2px', padding: '0 4px' }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-10 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 500 }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="w-9 h-10 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                    <Plus size={14} />
                  </button>
                </div>
                <button onClick={handleAddToCart} className="btn-crimson flex-1 flex items-center justify-center gap-2">
                  <ShoppingCart size={16} />
                  Add to Cart — {formatPrice(item.price * quantity)}
                </button>
              </div>

              <Link href="/menu" className="flex items-center gap-2 w-fit transition-colors" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                <ArrowLeft size={14} />
                Back to full menu
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="section-py" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="container-eclat">
            <div className="mb-10">
              <span className="text-label text-accent-gold block mb-2">From the same category</span>
              <h2 className="text-heading-lg">You might also enjoy</h2>
              <div className="divider-gold mt-4" style={{ margin: '16px 0 0' }} />
            </div>
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {related.map((r, i) => (
                <MenuItemCard key={r.id} item={r} index={i} onAddToCart={() => {}} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}