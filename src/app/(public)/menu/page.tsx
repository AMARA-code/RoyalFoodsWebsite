
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { MenuItem, MenuCategory } from '@/types/database'
import { useCartStore } from '@/store/cartStore'

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="fixed bottom-8 right-8 z-[200] flex items-center gap-3 rounded-xl px-5 py-4 shadow-2xl"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--accent-gold)',
        color: 'var(--text-primary)',
        minWidth: '280px',
      }}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
        style={{ background: 'var(--accent-crimson)', color: '#fff' }}
      >
        ✓
      </span>
      <div>
        <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-sans)', color: 'var(--accent-gold)' }}>
          Added to Cart
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-auto text-lg leading-none opacity-50 hover:opacity-100 transition-opacity"
        style={{ color: 'var(--text-primary)' }}
      >
        x
      </button>
    </motion.div>
  )
}

// ─── Quick-View Modal ─────────────────────────────────────────────────────────
function QuickViewModal({
  item,
  onClose,
  onAddToCart,
}: {
  item: MenuItem
  onClose: () => void
  onAddToCart: (item: MenuItem) => void
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid rgba(201,168,76,0.2)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image */}
          <div className="relative h-72 w-full overflow-hidden">
            <Image
              src={item.image_url ?? '/images/hero-bg.jpg.jpg'}
              alt={item.name}
              fill
              className="object-cover"
              sizes="672px"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, var(--bg-card) 0%, transparent 60%)' }}
            />
            {item.badge && (
              <span
                className="absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase"
                style={{
                  background: item.badge === 'Signature' ? 'var(--accent-gold)' : 'var(--accent-crimson)',
                  color: item.badge === 'Signature' ? '#0a0a0a' : '#fff',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {item.badge}
              </span>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-xl font-light transition-all hover:scale-110"
              style={{
                background: 'rgba(0,0,0,0.6)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              x
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex items-start justify-between gap-4">
              <Link href={`/menu/${item.slug}`} className="group" onClick={onClose}>
                <h2
                  className="text-3xl font-medium leading-tight group-hover:opacity-80 transition-opacity"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
                >
                  {item.name}
                  <span className="ml-2 text-base" style={{ color: 'var(--accent-gold)' }}>↗</span>
                </h2>
              </Link>
              <div className="shrink-0 text-right">
                <span
                  className="text-3xl font-light"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)' }}
                >
                  ${item.price}
                </span>
              </div>
            </div>
            <p
              className="mt-4 text-base leading-relaxed"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}
            >
              {item.description ?? ''}
            </p>
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => { onAddToCart(item); onClose() }}
                className="flex-1 rounded-xl py-4 text-sm font-semibold tracking-widest uppercase transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                style={{
                  background: 'var(--accent-crimson)',
                  color: '#fff',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 4px 24px rgba(139,0,0,0.35)',
                }}
              >
                Add to Cart
              </button>
              <Link
                href={`/menu/${item.slug}`}
                onClick={onClose}
                className="flex items-center justify-center rounded-xl px-6 text-sm font-semibold tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  border: '1px solid var(--accent-gold)',
                  color: 'var(--accent-gold)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Full Details
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Dish Card ────────────────────────────────────────────────────────────────
function DishCard({
  item,
  index,
  onAddToCart,
  onQuickView,
}: {
  item: MenuItem
  index: number
  onAddToCart: (item: MenuItem) => void
  onQuickView: (item: MenuItem) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl cursor-pointer"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(255,255,255,0.05)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      onClick={() => onQuickView(item)}
      whileHover={{ y: -4 }}
    >
      {/* Image */}
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={item.image_url ?? '/images/hero-bg.jpg.jpg'}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'rgba(139,0,0,0.15)' }}
        />
        {item.badge && (
          <div className="absolute top-3 left-3">
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase"
              style={{
                background: item.badge === 'Signature' ? 'var(--accent-gold)' : 'var(--accent-crimson)',
                color: item.badge === 'Signature' ? '#0a0a0a' : '#fff',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {item.badge}
            </span>
          </div>
        )}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <span
            className="rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Quick View
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/menu/${item.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0"
          >
            <h3
              className="text-lg font-medium leading-snug hover:opacity-70 transition-opacity"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
            >
              {item.name}
            </h3>
          </Link>
          <span
            className="shrink-0 text-lg font-light"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)' }}
          >
            ${item.price}
          </span>
        </div>
        <p
          className="mt-2 text-sm leading-relaxed line-clamp-2 flex-1"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}
        >
          {item.description ?? ''}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onAddToCart(item) }}
          className="mt-4 w-full rounded-xl py-3 text-xs font-semibold tracking-widest uppercase transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          style={{
            background: 'transparent',
            border: '1px solid var(--accent-crimson)',
            color: 'var(--accent-crimson)',
            fontFamily: 'var(--font-sans)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-crimson)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--accent-crimson)'
          }}
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  )
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="h-52 shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 rounded shimmer" />
        <div className="h-3 w-full rounded shimmer" />
        <div className="h-3 w-2/3 rounded shimmer" />
        <div className="h-10 w-full rounded-xl shimmer mt-4" />
      </div>
    </div>
  )
}

// ─── Category Section ─────────────────────────────────────────────────────────
function CategorySection({
  category,
  items,
  onAddToCart,
  onQuickView,
}: {
  category: MenuCategory
  items: MenuItem[]
  onAddToCart: (item: MenuItem) => void
  onQuickView: (item: MenuItem) => void
}) {
  if (items.length === 0) return null

  return (
    <section id={`cat-${category.slug}`} className="scroll-mt-32">
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="mb-10 flex items-center gap-6"
      >
        <div>
          <p
            className="text-xs font-semibold tracking-[0.3em] uppercase mb-1"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--accent-crimson)' }}
          >
            {category.icon && <>{category.icon} &nbsp;</>}Eclat Presents
          </p>
          <h2
            className="text-4xl md:text-5xl font-light"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
          >
            {category.name}
          </h2>
          {category.description && (
            <p
              className="mt-2 text-sm"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}
            >
              {category.description}
            </p>
          )}
        </div>
        <div
          className="ml-auto hidden md:block h-px flex-1 max-w-xs"
          style={{ background: 'linear-gradient(to right, var(--accent-gold), transparent)' }}
        />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item, idx) => (
          <DishCard
            key={item.id}
            item={item}
            index={idx}
            onAddToCart={onAddToCart}
            onQuickView={onQuickView}
          />
        ))}
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [signatureOnly, setSignatureOnly] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [toast, setToast] = useState<string | null>(null)
  const [quickViewItem, setQuickViewItem] = useState<MenuItem | null>(null)
  const stickyNavRef = useRef<HTMLDivElement>(null)

  const { scrollY } = useScroll()
  const parallaxY = useTransform(scrollY, [0, 600], [0, 180])

  // ── Fetch from Supabase ──
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const supabase = createClient()

        const { data: catData, error: catError } = await supabase
          .from('menu_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (catError) throw new Error(`Categories: ${catError.message}`)

        const cats = (catData ?? []) as MenuCategory[]
        if (cats.length === 0) throw new Error('No categories found in the database.')

        const { data: itemData, error: itemError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_available', true)
          .order('sort_order', { ascending: true })

        if (itemError) throw new Error(`Items: ${itemError.message}`)

        const menuItems = (itemData ?? []) as MenuItem[]
        if (menuItems.length === 0) throw new Error('No menu items found in the database.')

        setCategories(cats)
        setItems(menuItems)
        setActiveCategory(cats[0].id)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred.'
        setError(message)
        console.error('[MenuPage] Fetch error:', message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // ── Active category on scroll ──
  useEffect(() => {
    if (categories.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('cat-', '')
            const cat = categories.find((c) => c.slug === id)
            if (cat) setActiveCategory(cat.id)
          }
        })
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    categories.forEach((cat) => {
      const el = document.getElementById(`cat-${cat.slug}`)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [categories, items])

  const scrollToCategory = useCallback((slug: string) => {
    const el = document.getElementById(`cat-${slug}`)
    if (el) {
      const offset = (stickyNavRef.current?.offsetHeight ?? 64) + 80
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }, [])

  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = useCallback(
    (item: MenuItem) => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
      })
      setToast(`${item.name} — $${item.price}`)
    },
    [addItem]
  )

  // ── Filter ──
  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.description ?? '').toLowerCase().includes(q)
    const matchSignature = !signatureOnly || item.badge === 'Signature'
    return matchSearch && matchSignature
  })

  const itemsByCategory = (catId: string) =>
    filteredItems.filter((i) => i.category_id === catId)

  const hasResults = categories.some((cat) => itemsByCategory(cat.id).length > 0)

  // Only show categories that have items matching current filters
  const visibleCategories = categories.filter((cat) => itemsByCategory(cat.id).length > 0)

  // ── Render ──
  return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden flex items-center justify-center">
        <motion.div style={{ y: parallaxY }} className="absolute inset-0 scale-110">
          <Image
            src="/images/redd-francisco-o1sdskce8ie-unsplash.jpg"
            alt="Eclat Restaurant ambiance"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.7) 60%, var(--bg-primary) 100%)',
            }}
          />
        </motion.div>

        <div className="relative z-10 text-center px-6">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-xs font-semibold tracking-[0.4em] uppercase mb-5"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--accent-gold)' }}
          >
            Curated for the Discerning Palate
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-7xl md:text-9xl font-light leading-none"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
          >
            Our Menu
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mx-auto mt-6 h-px w-32"
            style={{ background: 'var(--accent-gold)' }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-5 text-base max-w-md mx-auto"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}
          >
            {loading
              ? 'Loading our menu...'
              : error
              ? 'Unable to load menu right now.'
              : `${items.length} dishes crafted with passion, plated with precision.`}
          </motion.p>
        </div>
      </section>

      {/* ── Sticky Category Nav (only when data loaded) ── */}
      {!loading && !error && visibleCategories.length > 0 && (
        <div
          ref={stickyNavRef}
          className="sticky top-0 z-40"
          style={{
            background: 'rgba(17,17,17,0.9)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(201,168,76,0.15)',
          }}
        >
          {/* Category pills */}
          <div className="container-eclat overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1 py-4 min-w-max mx-auto md:justify-center">
              {visibleCategories.map((cat) => {
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.slug)}
                    className="relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wider uppercase transition-all duration-200 whitespace-nowrap"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      background: isActive ? 'var(--accent-crimson)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      border: isActive
                        ? '1px solid var(--accent-crimson)'
                        : '1px solid transparent',
                    }}
                  >
                    {cat.icon && <span>{cat.icon}</span>}
                    <span>{cat.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Search + Filter Bar */}
          <div className="container-eclat pb-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto">
              <div className="relative w-full">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl pl-11 pr-4 py-3 text-sm transition-all focus:outline-none"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-gold)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  }}
                />
              </div>
              <button
                onClick={() => setSignatureOnly((v) => !v)}
                className="shrink-0 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap"
                style={{
                  background: signatureOnly ? 'var(--accent-gold)' : 'var(--bg-elevated)',
                  color: signatureOnly ? '#0a0a0a' : 'var(--text-secondary)',
                  border: `1px solid ${signatureOnly ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)'}`,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <span>Signature Only</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Menu Content ── */}
      <div className="container-eclat section-py space-y-24">

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <h3
              className="text-2xl font-light mb-3"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
            >
              Could not load menu
            </h3>
            <p
              className="text-sm mb-2 max-w-md"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}
            >
              {error}
            </p>
            <p
              className="text-xs mb-8"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', opacity: 0.6 }}
            >
              Please check your Supabase connection and ensure the tables are seeded.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl px-6 py-3 text-xs font-semibold tracking-wider uppercase transition-all hover:scale-105"
              style={{
                background: 'var(--accent-crimson)',
                color: '#fff',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* No search results */}
        {!loading && !error && !hasResults && (search || signatureOnly) && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <h3
              className="text-2xl font-light mb-3"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
            >
              No dishes found
            </h3>
            <p
              className="text-sm"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}
            >
              Try adjusting your search or clearing the filters.
            </p>
            <button
              onClick={() => { setSearch(''); setSignatureOnly(false) }}
              className="mt-6 rounded-xl px-6 py-3 text-xs font-semibold tracking-wider uppercase transition-all hover:scale-105"
              style={{
                background: 'var(--accent-crimson)',
                color: '#fff',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Actual menu */}
        {!loading && !error && hasResults &&
          visibleCategories.map((cat) => (
            <CategorySection
              key={cat.id}
              category={cat}
              items={itemsByCategory(cat.id)}
              onAddToCart={handleAddToCart}
              onQuickView={setQuickViewItem}
            />
          ))
        }
      </div>

      {/* ── CTA Banner ── */}
      {!loading && !error && (
        <section
          className="relative overflow-hidden py-24"
          style={{
            background: 'var(--bg-secondary)',
            borderTop: '1px solid rgba(201,168,76,0.1)',
            borderBottom: '1px solid rgba(201,168,76,0.1)',
          }}
        >
          <div className="container-eclat text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-semibold tracking-[0.4em] uppercase mb-4"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--accent-crimson)' }}
            >
              Reserve Your Table
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-light"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
            >
              Ready to Dine?
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/reservations"
                className="rounded-xl px-8 py-4 text-sm font-semibold tracking-widest uppercase transition-all hover:scale-105 hover:shadow-xl"
                style={{
                  background: 'var(--accent-crimson)',
                  color: '#fff',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 4px 24px rgba(139,0,0,0.3)',
                }}
              >
                Make a Reservation
              </Link>
              <Link
                href="/order"
                className="rounded-xl px-8 py-4 text-sm font-semibold tracking-widest uppercase transition-all hover:scale-105"
                style={{
                  border: '1px solid var(--accent-gold)',
                  color: 'var(--accent-gold)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Order Online
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Quick View Modal ── */}
      {quickViewItem && (
        <QuickViewModal
          item={quickViewItem}
          onClose={() => setQuickViewItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </main>
  )
}
