'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Minus, Plus, Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { MenuItem, MenuCategory } from '@/types/database'
import { useCartStore, selectCartItems } from '@/store/cartStore'
import { usePublicSettings } from '@/hooks/usePublicSettings'
import { formatPrice } from '@/lib/utils'
import MenuItemModal from './MenuItemModal'

function SkeletonCard() {
  return (
    <div className="flex gap-3 p-3 bg-white rounded-2xl border border-gray-100 animate-pulse">
      <div className="w-[110px] h-[110px] rounded-xl bg-gray-100 shrink-0"/>
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 w-3/4 rounded bg-gray-100" />
        <div className="h-5 w-20 rounded bg-gray-100" />
        <div className="h-9 w-28 rounded-lg bg-gray-100" />
      </div>
    </div>
  )
}

function MenuItemCard({
  item,
  promoPercent,
}: {
  item: MenuItem
  promoPercent: number
}) {
  const [showModal, setShowModal] = useState(false)
  const cartItems = useCartStore(selectCartItems)
  const addItem = useCartStore((s) => s.addItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const cartItem = cartItems.find((i) => i.id === item.id)
  const qty = cartItem?.quantity ?? 0
  const hasDiscount = promoPercent > 0
  const salePrice = hasDiscount ? Math.round(item.price * (1 - promoPercent / 100)) : item.price

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        onClick={() => setShowModal(true)}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`View details for ${item.name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setShowModal(true)
          }
        }}
      >
        <article className="flex gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="relative w-[110px] h-[110px] rounded-xl overflow-hidden shrink-0 bg-gray-50">
            <Image
              src={item.image_url ?? '/images/hero-bg.jpg.jpg'}
              alt={item.name}
              fill
              className="object-cover"
              sizes="110px"
            />
          </div>

          <div className="flex-1 flex flex-col min-w-0 py-0.5">
            <h3 className="font-bold text-[#1A2238] text-[15px] leading-snug">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
            )}

            <div className="flex items-center gap-2 mt-2 mb-2">
              {hasDiscount ? (
                <>
                  <span className="text-xs text-gray-400 line-through">{formatPrice(item.price)}</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#D62828] text-white text-xs font-bold">
                    {formatPrice(salePrice)}
                  </span>
                </>
              ) : (
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#D62828] text-white text-xs font-bold">
                  {formatPrice(item.price)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-auto">
              {qty > 0 ? (
                <div
                  className="flex items-center rounded-lg border border-gray-200 overflow-hidden bg-gray-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      updateQuantity(item.id, qty - 1)
                    }}
                    className="w-8 h-8 flex items-center justify-center text-[#1A2238] hover:bg-gray-200 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-7 text-center text-sm font-bold text-[#1A2238]">{qty}</span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      updateQuantity(item.id, qty + 1)
                    }}
                    className="w-8 h-8 flex items-center justify-center text-[#1A2238] hover:bg-gray-200 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    addItem({
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      image_url: item.image_url,
                    })
                  }}
                  className="px-4 py-2 rounded-lg bg-[#1A2238] text-white text-xs font-bold hover:bg-[#2a3450] transition-colors"
                >
                  Add To Cart
                </button>
              )}
            </div>
          </div>
        </article>
      </motion.div>

      {showModal && (
        <MenuItemModal item={item} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}

function CategorySection({
  category,
  items,
  promoPercent,
  hasAnnouncement,
}: {
  category: MenuCategory
  items: MenuItem[]
  promoPercent: number
  hasAnnouncement: boolean
}) {
  if (items.length === 0) return null

  return (
    <section
      id={`cat-${category.slug}`}
      className={`mb-8 ${hasAnnouncement ? 'rf-menu-category-anchor--banner' : 'rf-menu-category-anchor'}`}
    >
      <h2 className="text-xl sm:text-2xl font-bold text-[#1A2238] mb-4">
        {category.name}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} promoPercent={promoPercent} />
        ))}
      </div>
    </section>
  )
}

export default function RoyalFoodsMenu() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [searchCompact, setSearchCompact] = useState(false)
  const [searchPanelOpen, setSearchPanelOpen] = useState(false)
  const filterToolbarRef = useRef<HTMLDivElement>(null)
  const searchSectionRef = useRef<HTMLDivElement>(null)
  const compactSearchInputRef = useRef<HTMLInputElement>(null)
  const { settings } = usePublicSettings()
  const promoPercent = settings.promo.enabled ? settings.promo.percent : 0
  const hasAnnouncement =
    settings.announcement.enabled && Boolean(settings.announcement.text?.trim())

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

        if (catError) throw new Error(catError.message)

        const cats = (catData ?? []) as MenuCategory[]
        if (cats.length === 0) throw new Error('No menu categories found.')

        const { data: itemData, error: itemError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_available', true)
          .order('sort_order', { ascending: true })

        if (itemError) throw new Error(itemError.message)

        setCategories(cats)
        setItems((itemData ?? []) as MenuItem[])
        setActiveCategory(cats[0]?.id ?? '')
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load menu')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (categories.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const slug = entry.target.id.replace('cat-', '')
            const cat = categories.find((c) => c.slug === slug)
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

  useEffect(() => {
    const updateSearchMode = () => {
      const section = searchSectionRef.current
      const filter = filterToolbarRef.current
      if (!section || !filter) return
      const filterBottom = filter.getBoundingClientRect().bottom
      const sectionTop = section.getBoundingClientRect().top
      setSearchCompact(window.scrollY > 8 && sectionTop < filterBottom - 2)
    }

    updateSearchMode()
    window.addEventListener('scroll', updateSearchMode, { passive: true })
    window.addEventListener('resize', updateSearchMode)
    return () => {
      window.removeEventListener('scroll', updateSearchMode)
      window.removeEventListener('resize', updateSearchMode)
    }
  }, [loading, error])

  useEffect(() => {
    if (!searchCompact) setSearchPanelOpen(false)
  }, [searchCompact])

  useEffect(() => {
    if (searchPanelOpen && compactSearchInputRef.current) {
      compactSearchInputRef.current.focus()
    }
  }, [searchPanelOpen])

  const scrollToCategory = useCallback(
    (slug: string) => {
      const el = document.getElementById(`cat-${slug}`)
      if (!el) return

      const filterBottom = filterToolbarRef.current?.getBoundingClientRect().bottom ?? 0
      const searchHeight = searchCompact ? 0 : (searchSectionRef.current?.offsetHeight ?? 0)
      const top = el.getBoundingClientRect().top + window.scrollY - filterBottom - searchHeight
      window.scrollTo({ top, behavior: 'smooth' })
    },
    [searchCompact]
  )

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase()
    if (!q) return true
    return (
      item.name.toLowerCase().includes(q) ||
      (item.description ?? '').toLowerCase().includes(q)
    )
  })

  const itemsByCategory = (catId: string) =>
    filteredItems.filter((i) => i.category_id === catId)

  const visibleCategories = categories.filter((cat) => itemsByCategory(cat.id).length > 0)
  const hasResults = visibleCategories.length > 0

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Fixed category filter — directly below header */}
      <div
        ref={filterToolbarRef}
        className={`fixed left-0 right-0 z-30 bg-[#D62828] shadow-sm ${
          hasAnnouncement ? 'rf-menu-filter-fixed--banner' : 'rf-menu-filter-fixed'
        }`}
      >
        {!loading && !error && visibleCategories.length > 0 ? (
          <div className="max-w-6xl mx-auto px-4 overflow-x-auto scrollbar-none">
            <div className="flex items-center min-w-max h-[var(--rf-menu-filter-h)]">
              {visibleCategories.map((cat) => {
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => scrollToCategory(cat.slug)}
                    className={[
                      'relative px-4 sm:px-5 h-full flex items-center text-sm font-medium whitespace-nowrap transition-colors',
                      isActive ? 'text-white' : 'text-white/75 hover:text-white',
                    ].join(' ')}
                  >
                    {cat.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-white rounded-full" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="h-[var(--rf-menu-filter-h)] animate-pulse" aria-hidden="true" />
        )}
      </div>

      <div className={hasAnnouncement ? 'rf-menu-scroll-area--banner' : 'rf-menu-scroll-area'}>
        <div ref={searchSectionRef} className="bg-[#FAF7F2] border-b border-gray-100 relative z-10">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D62828]" />
              <input
                type="text"
                placeholder="Search for Pizza, Burgers, Shawarma..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl pl-11 pr-4 py-3 text-sm text-[#1A2238] bg-white border border-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-[#D62828] focus:ring-1 focus:ring-[#D62828]/30 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-28">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-lg font-bold text-[#1A2238] mb-2">Could notload menu</p>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-lg bg-[#D62828] text-white font-semibold text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && !hasResults && (
          <div className="text-center py-20">
            <p className="text-lg font-bold text-[#1A2238] mb-2">No items found</p>
            <p className="text-sm text-gray-500">Try a different search term.</p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-4 px-6 py-3 rounded-lg bg-[#D62828] text-white font-semibold text-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {!loading && !error && hasResults &&
          visibleCategories.map((cat) => (
            <CategorySection
              key={cat.id}
              category={cat}
              items={itemsByCategory(cat.id)}
              promoPercent={promoPercent}
              hasAnnouncement={hasAnnouncement}
            />
          ))
        }
        </div>
      </div>

      {/* Fixed search icon — bottom left after scrolling past inline search */}
      {searchCompact && (
        <div className="fixed bottom-5 left-4 z-50 flex flex-col items-start gap-2">
          {searchPanelOpen && (
            <div className="w-[min(calc(100vw-2rem),320px)] rounded-2xl bg-white border border-gray-200 shadow-xl p-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D62828]" />
                <input
                  ref={compactSearchInputRef}
                  type="text"
                  placeholder="Search menu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl pl-9 pr-9 py-2.5 text-sm text-[#1A2238] bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#D62828]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[#1A2238]"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setSearchPanelOpen((open) => !open)}
            className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-colors ${
              searchPanelOpen || search
                ? 'bg-[#D62828] text-white'
                : 'bg-[#1A2238] text-white hover:bg-[#2a3450]'
            }`}
            aria-label={searchPanelOpen ? 'Close search' : 'Search menu'}
          >
            {searchPanelOpen ? <X size={20} /> : <Search size={20} />}
          </button>
        </div>
      )}
    </div>
  )
}