'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  type Variants,
} from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  status: 'draft' | 'published'
  published_at: string | null
  category?: string
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const EASE = [0.25, 0.1, 0.25, 1] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE },
  },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7 } },
}

// ─── Static Fallback Posts ────────────────────────────────────────────────────

const FALLBACK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'An Evening of Wine & Culinary Artistry',
    slug: 'wine-and-culinary-artistry',
    excerpt:
      'Join us for an exclusive wine pairing dinner where our master sommelier guides you through a curated selection of world-class wines matched with our signature dishes.',
    featured_image: '/images/redd-francisco-o1sdskce8ie-unsplash.jpg',
    status: 'published',
    published_at: '2026-04-15T18:00:00Z',
    category: 'Event',
  },
  {
    id: '2',
    title: 'The Art of the Perfect Steak — Chef\'s Masterclass',
    slug: 'art-of-perfect-steak-masterclass',
    excerpt:
      'Our Executive Chef opens his kitchen for an intimate masterclass on the science and craft behind our legendary Beef Steak with Mushroom Sauce. Limited to 12 guests.',
    featured_image: '/images/stefan-cruceru-lnda2thz58c-unsplash.jpg',
    status: 'published',
    published_at: '2026-03-28T10:00:00Z',
    category: 'Masterclass',
  },
  {
    id: '3',
    title: 'Ramadan Iftar Buffet — Reservations Now Open',
    slug: 'ramadan-iftar-buffet-2026',
    excerpt:
      'Celebrate the holy month with Éclat\'s exclusive Iftar experience. A lavish spread of traditional and contemporary dishes served at sunset in our private dining room.',
    featured_image: '/images/mitili-mitili-vbxpits5isw-unsplash.jpg',
    status: 'published',
    published_at: '2026-03-10T17:00:00Z',
    category: 'Event',
  },
  {
    id: '4',
    title: 'Spring Menu Launch — New Seasonal Creations',
    slug: 'spring-menu-launch-2026',
    excerpt:
      'As the season turns, so does our menu. Discover our spring 2026 additions — lighter preparations, vibrant flavours, and ingredients at the peak of their season.',
    featured_image: '/images/dennis-zhang-nsebwyq-uoy-unsplash.jpg',
    status: 'published',
    published_at: '2026-02-20T09:00:00Z',
    category: 'News',
  },
  {
    id: '5',
    title: 'Valentine\'s Night — A Table for Two',
    slug: 'valentines-night-2026',
    excerpt:
      'An intimate seven-course tasting menu for couples, accompanied by live piano, candlelight, and a complimentary bottle of sparkling rosé. An evening to remember.',
    featured_image: '/images/mustafa-fatemi-zefhrvdf3nm-unsplash (1).jpg',
    status: 'published',
    published_at: '2026-02-01T12:00:00Z',
    category: 'Event',
  },
  {
    id: '6',
    title: 'Behind the Plate — Stories from Our Kitchen',
    slug: 'behind-the-plate-kitchen-stories',
    excerpt:
      'A rare look into the daily rituals, inspirations, and relentless pursuit of perfection that drives every chef at Éclat. From dawn prep to the final garnish.',
    featured_image: '/images/whatsapp image 2025-09-07 at 6.10.44 am.jpeg',
    status: 'published',
    published_at: '2026-01-15T08:00:00Z',
    category: 'Story',
  },
]

// ─── Category colours ─────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<string, string> = {
  Event:      'badge-crimson',
  Masterclass:'badge-gold',
  News:       'badge-gold',
  Story:      'badge-gold',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ─── Gold Divider ─────────────────────────────────────────────────────────────

function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-4">
      <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--accent-gold)]" />
      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
      <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--accent-gold)]" />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════════════════

function BlogHero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={ref} className="relative h-[60vh] min-h-[480px] overflow-hidden flex items-center justify-center">
      {/* Parallax bg */}
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        <Image
          src="/images/event.jpg"
          alt="Éclat Events"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[var(--bg-primary)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-crimson)]/10 via-transparent to-transparent" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 text-center px-4"
      >
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="flex flex-col items-center gap-5"
        >
          <motion.span variants={fadeUp} className="text-label text-accent-gold tracking-[0.35em]">
            Stories & Occasions
          </motion.span>
          <motion.div variants={fadeIn} className="divider-gold" />
          <motion.h1 variants={fadeUp} className="text-display text-[var(--text-primary)]">
            Events &{' '}
            <span className="italic text-[var(--accent-gold)]">Journal</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light tracking-widest max-w-md">
            Exclusive evenings, culinary masterclasses & stories from our kitchen
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILTER BAR
// ═══════════════════════════════════════════════════════════════════════════════

const FILTERS = ['All', 'Event', 'Masterclass', 'News', 'Story']

function FilterBar({
  active,
  onChange,
}: {
  active: string
  onChange: (f: string) => void
}) {
  return (
    <div className="sticky top-[72px] z-30 bg-[var(--bg-primary)]/95 backdrop-blur-md border-b border-[var(--border-subtle)]">
      <div className="container-eclat">
        <div className="flex items-center gap-3 py-4 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => onChange(f)}
              className={[
                'flex-shrink-0 px-5 py-2 text-label tracking-[0.15em] rounded-sm border transition-all duration-200',
                active === f
                  ? 'bg-[var(--accent-crimson)] border-[var(--accent-crimson)] text-[var(--text-primary)]'
                  : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURED POST (first/hero card)
// ═══════════════════════════════════════════════════════════════════════════════

function FeaturedPost({ post }: { post: BlogPost }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.article
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className="group grid grid-cols-1 lg:grid-cols-2 gap-0 card-eclat overflow-hidden mb-10"
    >
      {/* Image */}
      <motion.div variants={fadeIn} className="relative h-72 lg:h-auto min-h-[320px] overflow-hidden">
        {post.featured_image ? (
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--bg-elevated)] flex items-center justify-center">
            <span className="text-[var(--text-muted)] text-label tracking-widest">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
        {/* Featured badge */}
        <div className="absolute top-5 left-5">
          <span className="badge-gold">Featured</span>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        variants={stagger}
        className="flex flex-col justify-center gap-5 p-8 lg:p-12"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          {post.category && (
            <span className={CATEGORY_STYLES[post.category] ?? 'badge-gold'}>
              {post.category}
            </span>
          )}
          {post.published_at && (
            <span className="text-label text-[var(--text-muted)] tracking-[0.15em]">
              {formatDate(post.published_at)}
            </span>
          )}
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="text-heading-lg text-[var(--text-primary)] leading-tight group-hover:text-[var(--accent-gold)] transition-colors duration-300"
        >
          {post.title}
        </motion.h2>

        <motion.div variants={fadeUp}>
          <div className="divider-gold !mx-0 !my-0 w-14 h-px bg-gradient-to-r from-[var(--accent-gold)] to-transparent" />
        </motion.div>

        {post.excerpt && (
          <motion.p
            variants={fadeUp}
            className="text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light leading-relaxed line-clamp-4"
          >
            {post.excerpt}
          </motion.p>
        )}

        <motion.div variants={fadeUp}>
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-label text-accent-gold tracking-[0.15em] hover:gap-4 transition-all duration-300 group/link"
          >
            Read More
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </motion.div>
    </motion.article>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST CARD (grid items)
// ═══════════════════════════════════════════════════════════════════════════════

function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.article
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      transition={{ delay: index * 0.1 }}
      className="group card-eclat overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        {post.featured_image ? (
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--bg-elevated)] flex items-center justify-center">
            <CalendarIcon />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category badge */}
        {post.category && (
          <div className="absolute top-4 left-4">
            <span className={CATEGORY_STYLES[post.category] ?? 'badge-gold'}>
              {post.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-6 flex-1">
        {/* Date */}
        {post.published_at && (
          <span className="text-label text-[var(--text-muted)] tracking-[0.15em]">
            {formatDate(post.published_at)}
          </span>
        )}

        {/* Title */}
        <h3 className="text-heading-md text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent-gold)] transition-colors duration-300 line-clamp-2">
          {post.title}
        </h3>

        {/* Gold line */}
        <div className="w-10 h-px bg-gradient-to-r from-[var(--accent-gold)] to-transparent" />

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light leading-relaxed line-clamp-3 flex-1">
            {post.excerpt}
          </p>
        )}

        {/* Read more */}
        <div className="pt-3 border-t border-[var(--border-subtle)] mt-auto">
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-label text-accent-gold tracking-[0.15em] hover:gap-3 transition-all duration-300"
          >
            Read More
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

function CalendarIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════════

function EmptyState({ filter }: { filter: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-5 py-24 text-center"
    >
      <CalendarIcon />
      <div>
        <p className="text-heading-md text-[var(--text-primary)] mb-2">No {filter === 'All' ? '' : filter + ' '}posts yet</p>
        <p className="text-sm text-[var(--text-muted)] font-[var(--font-sans)] font-light">
          Check back soon — new stories and events are coming.
        </p>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEWSLETTER CTA BAND
// ═══════════════════════════════════════════════════════════════════════════════

function NewsletterBand() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="section-py bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)]">
      <div className="container-eclat">
        <motion.div
          ref={ref}
          variants={stagger}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="max-w-xl mx-auto flex flex-col items-center text-center gap-6"
        >
          <motion.span variants={fadeUp} className="text-label text-accent-gold tracking-[0.3em]">
            Never Miss an Event
          </motion.span>
          <motion.h2 variants={fadeUp} className="text-heading-lg text-[var(--text-primary)]">
            Subscribe to Our{' '}
            <span className="italic text-[var(--accent-gold)]">Newsletter</span>
          </motion.h2>
          <GoldDivider />
          <motion.p variants={fadeUp} className="text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light leading-relaxed">
            Be the first to know about exclusive dinners, chef's table evenings, and seasonal menu launches.
          </motion.p>

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 text-[var(--accent-gold)] bg-[var(--accent-gold-muted)] border border-[var(--border-gold)] px-6 py-4 rounded-sm w-full justify-center"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-sm font-[var(--font-sans)]">You're subscribed. Welcome to Éclat.</span>
            </motion.div>
          ) : (
            <motion.form variants={fadeUp} onSubmit={handleSubmit} className="flex w-full gap-3" noValidate>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input-eclat flex-1"
                disabled={status === 'loading'}
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                disabled={status === 'loading' || !email.trim()}
                className="btn-crimson flex-shrink-0 disabled:opacity-50"
              >
                {status === 'loading' ? '…' : 'Subscribe'}
              </button>
            </motion.form>
          )}
          {status === 'error' && (
            <p className="text-xs text-red-400 font-[var(--font-sans)]">Something went wrong. Please try again.</p>
          )}
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════════════════════════════

function BlogSkeleton() {
  return (
    <div className="space-y-8">
      <div className="card-eclat overflow-hidden grid grid-cols-1 lg:grid-cols-2 h-72">
        <div className="shimmer h-full" />
        <div className="p-8 space-y-4">
          <div className="shimmer h-4 w-24 rounded" />
          <div className="shimmer h-8 w-3/4 rounded" />
          <div className="shimmer h-3 w-full rounded" />
          <div className="shimmer h-3 w-5/6 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card-eclat overflow-hidden">
            <div className="shimmer h-52" />
            <div className="p-6 space-y-3">
              <div className="shimmer h-3 w-20 rounded" />
              <div className="shimmer h-5 w-3/4 rounded" />
              <div className="shimmer h-3 w-full rounded" />
              <div className="shimmer h-3 w-4/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')

  // Fetch from Supabase, fall back to static data
  useEffect(() => {
    async function fetchPosts() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, featured_image, status, published_at')
          .eq('status', 'published')
          .order('published_at', { ascending: false })

        if (error) throw error

        if (data && data.length > 0) {
          // Assign category from title heuristic (admin sets category via tags in Phase 5)
          const mapped = data.map((p: BlogPost) => ({
            ...p,
            category: p.category ?? 'News',
          }))
          setPosts(mapped)
        } else {
          // No posts in DB yet — use fallback
          setPosts(FALLBACK_POSTS)
        }
      } catch {
        // DB not available — use fallback
        setPosts(FALLBACK_POSTS)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Filter
  const filtered = activeFilter === 'All'
    ? posts
    : posts.filter(p => p.category === activeFilter)

  const [featured, ...rest] = filtered

  return (
    <>
      <BlogHero />
      <FilterBar active={activeFilter} onChange={setActiveFilter} />

      <section className="section-py bg-[var(--bg-primary)]">
        <div className="container-eclat">

          {/* Section header */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="flex flex-col items-center text-center gap-4 mb-12"
          >
            <motion.span variants={fadeUp} className="text-label text-accent-gold tracking-[0.3em]">
              {activeFilter === 'All' ? 'Latest Stories' : activeFilter + 's'}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-heading-xl text-[var(--text-primary)]">
              {activeFilter === 'All'
                ? <>From Our <span className="italic text-[var(--accent-gold)]">Kitchen & Calendar</span></>
                : <span className="italic text-[var(--accent-gold)]">{activeFilter} Posts</span>
              }
            </motion.h2>
            <GoldDivider />
          </motion.div>

          {/* Content */}
          {loading ? (
            <BlogSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState filter={activeFilter} />
          ) : (
            <>
              {/* Featured post */}
              {featured && <FeaturedPost post={featured} />}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post, i) => (
                    <PostCard key={post.id} post={post} index={i} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <NewsletterBand />
    </>
  )
}