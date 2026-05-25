'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
  useAnimationFrame,
} from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Chef {
  id: string
  name: string
  title: string
  bio: string
  photo_url: string
  speciality: string
  sort_order: number
  is_active: boolean
}

interface GalleryImage {
  id: string
  url: string
  caption: string
  category: string
  alt_text: string
  sort_order: number
  is_active: boolean
}

interface AboutStory {
  founding_year: string
  headline: string
  paragraph_1: string
  paragraph_2: string
  stat_1_number: string
  stat_1_label: string
  stat_2_number: string
  stat_2_label: string
  stat_3_number: string
  stat_3_label: string
  stat_4_number: string
  stat_4_label: string
}

// ─── Fallbacks ────────────────────────────────────────────────────────────────

const FALLBACK_STORY: AboutStory = {
  founding_year: '2020',
  headline: 'Born from a Passion for the Extraordinary',
  paragraph_1:
    'Éclat was born in 2020 from a singular conviction — that dining should be an event, not merely a meal. Founded by Chef Antoine Dubois after years commanding Michelin-starred kitchens across Europe and the Middle East, Éclat set out to bring world-class fine dining to a city hungry for it.',
  paragraph_2:
    'Every element — from the hand-sourced ingredients to the candlelit interiors — was designed with obsessive care. We believe a great restaurant is not just about food; it is about theatre, emotion, and memory. At Éclat, we craft all three.',
  stat_1_number: '5+',
  stat_1_label: 'Years of Excellence',
  stat_2_number: '40+',
  stat_2_label: 'Signature Dishes',
  stat_3_number: '4',
  stat_3_label: 'Master Chefs',
  stat_4_number: '10K+',
  stat_4_label: 'Guests Served',
}

const FALLBACK_CHEFS: Chef[] = [
  { id: '1', name: 'Chef Antoine Dubois', title: 'Executive Chef & Founder', bio: 'With over two decades of culinary mastery honed in the kitchens of Paris, Lyon, and Dubai, Chef Antoine brings the soul of classical French cuisine to every plate at Éclat. His philosophy is simple: impeccable ingredients, fearless technique, and emotion on a plate.', photo_url: '/images/chef-1.jpg', speciality: 'Classical French & Contemporary Fusion', sort_order: 1, is_active: true },
  { id: '2', name: 'Chef Maryam Khalid', title: 'Head Pastry Chef', bio: 'A graduate of Le Cordon Bleu London, Chef Maryam transforms sugar, cream, and chocolate into architectural masterpieces. Her dessert menu has been called edible poetry — each creation balancing texture, temperature, and beauty.', photo_url: '/images/chef-2.jpg', speciality: 'Artisan Pastry & Dessert Architecture', sort_order: 2, is_active: true },
  { id: '3', name: 'Chef Rajan Mehta', title: 'Senior Chef de Cuisine', bio: 'Chef Rajan is the bridge between East and West at Éclat. Trained in Mumbai and refined in Singapore, he weaves bold spice traditions of South Asia into the refined language of modern fine dining.', photo_url: '/images/chef-3.jpg', speciality: 'Modern South Asian & Pan-Asian', sort_order: 3, is_active: true },
  { id: '4', name: 'Chef Sofia Reyes', title: 'Grill & Rotisserie Chef', bio: 'Chef Sofia commands the fire. With expertise built across Buenos Aires steakhouses and Michelin-starred grills in Madrid, she understands meat, flame, and timing like no other.', photo_url: '/images/chef-4.jpg', speciality: 'Fire Cuisine, Grills & Rotisserie', sort_order: 4, is_active: true },
]

const FALLBACK_GALLERY: GalleryImage[] = [
  { id: '1', url: '/images/redd-francisco-o1sdskce8ie-unsplash.jpg', caption: 'The Éclat Dining Room', category: 'ambiance', alt_text: 'Éclat restaurant dining room', sort_order: 1, is_active: true },
  { id: '2', url: '/images/uladzislau-petrushkevich-l_xjkmabq_e-unsplash.jpg', caption: 'Truffle Arancini', category: 'food', alt_text: 'Truffle Arancini', sort_order: 2, is_active: true },
  { id: '3', url: '/images/gina-s-auckland-v0iokbbk9l4-unsplash.jpg', caption: 'Scallop Ceviche', category: 'food', alt_text: 'Scallop Ceviche', sort_order: 3, is_active: true },
  { id: '4', url: '/images/alexandru-bogdan-ghita-ueykqqh4poi-unsplash (1).jpg', caption: 'Beef Steak', category: 'food', alt_text: 'Beef Steak', sort_order: 4, is_active: true },
  { id: '5', url: '/images/restaurant-story.jpg.jpg', caption: 'Our Heritage', category: 'ambiance', alt_text: 'Éclat heritage', sort_order: 5, is_active: true },
]

// ─── Hero Slider Data ─────────────────────────────────────────────────────────

const SLIDES = [
  {
    image: '/images/hero-bg.jpg.jpg',
    eyebrow: 'The Art of Fine Dining',
    title: 'Where Every',
    titleItalic: 'Moment',
    titleEnd: 'Matters',
    subtitle: 'An uncompromising pursuit of culinary excellence, crafted with obsessive intention.',
    tag: 'Est. 2020',
  },
  {
    image: '/images/redd-francisco-o1sdskce8ie-unsplash.jpg',
    eyebrow: 'The Ambiance',
    title: 'Theatre of',
    titleItalic: 'Taste &',
    titleEnd: 'Emotion',
    subtitle: 'Step into a world designed to delight every sense — architecture, light, and sound in perfect harmony.',
    tag: 'Ambiance',
  },
  {
    image: '/images/restaurant-story.jpg.jpg',
    eyebrow: 'Our Heritage',
    title: 'Born from',
    titleItalic: 'Passion',
    titleEnd: '& Purpose',
    subtitle: 'Founded in 2020, Éclat was built on a singular conviction: dining is not a meal — it is a memory.',
    tag: 'Our Story',
  },
  {
    image: '/images/alexandru-bogdan-ghita-ueykqqh4poi-unsplash (1).jpg',
    eyebrow: 'The Craft',
    title: 'Flavours',
    titleItalic: 'Forged',
    titleEnd: 'in Fire',
    subtitle: 'Every plate is the result of years of mastery, precision, and an unquenchable love for the craft.',
    tag: 'Cuisine',
  },
]

// ─── Slide Progress ───────────────────────────────────────────────────────────

function SlideProgress({
  current,
  total,
  onSelect,
}: {
  current: number
  total: number
  onSelect: (i: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className="group relative w-px h-12 flex items-center justify-center"
          aria-label={`Go to slide ${i + 1}`}
        >
          <div className="w-px h-full bg-white/15 transition-all duration-300 group-hover:bg-white/30" />
          {i === current && (
            <motion.div
              className="absolute top-0 left-0 w-px origin-top"
              style={{ background: 'var(--accent-gold)', height: '100%' }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 5.5, ease: 'linear' }}
            />
          )}
          {i < current && (
            <div
              className="absolute top-0 left-0 w-px h-full"
              style={{ background: 'var(--accent-gold)' }}
            />
          )}
        </button>
      ))}
    </div>
  )
}

// ─── 3D Tilt Card ─────────────────────────────────────────────────────────────

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 })
  const glareX = useTransform(x, [-0.5, 0.5], ['0%', '100%'])
  const glareOpacity = useSpring(0, { stiffness: 200, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
    glareOpacity.set(0.15)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    glareOpacity.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className={`relative ${className}`}
    >
      {children}
      <motion.div
        style={{
          opacity: glareOpacity,
          background: `radial-gradient(circle at ${glareX} 30%, rgba(201,168,76,0.4), transparent 60%)`,
          pointerEvents: 'none',
        }}
        className="absolute inset-0 z-20 rounded-[inherit]"
      />
    </motion.div>
  )
}

// ─── Magnetic Button ──────────────────────────────────────────────────────────

function MagneticButton({
  children,
  className,
  href,
}: {
  children: React.ReactNode
  className?: string
  href: string
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 20 })
  const sy = useSpring(y, { stiffness: 300, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3)
  }
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.a>
  )
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedStat({
  number,
  label,
  delay = 0,
}: {
  number: string
  label: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [displayed, setDisplayed] = useState('0')

  useEffect(() => {
    if (!inView) return
    const raw = number.replace(/[^0-9]/g, '')
    const suffix = number.replace(/[0-9]/g, '')
    const end = parseInt(raw) || 0
    if (end === 0) {
      setDisplayed(number)
      return
    }
    const duration = 2000
    const startTime = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(eased * end)
      setDisplayed(current + suffix)
      if (progress < 1) requestAnimationFrame(animate)
      else setDisplayed(end + suffix)
    }
    const t = setTimeout(() => requestAnimationFrame(animate), delay * 1000)
    return () => clearTimeout(t)
  }, [inView, number, delay])

  return (
    <div ref={ref} className="text-center group">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay, type: 'spring', stiffness: 200 }}
        className="text-5xl xl:text-7xl mb-3 leading-none"
        style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)' }}
      >
        {displayed}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
        className="text-[10px] tracking-[0.3em] uppercase"
        style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}
      >
        {label}
      </motion.div>
    </div>
  )
}

// ─── Floating Orb Background ──────────────────────────────────────────────────

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, var(--accent-gold), transparent 70%)' }}
      />
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 0.9, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, var(--accent-crimson), transparent 70%)' }}
      />
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        className="absolute top-2/3 left-1/2 w-64 h-64 rounded-full opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, var(--accent-gold), transparent 70%)' }}
      />
    </div>
  )
}

// ─── Chef 3D Card ─────────────────────────────────────────────────────────────

function ChefCard3D({ chef, index }: { chef: Chef; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [flipped, setFlipped] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80, rotateY: -15 }}
      animate={inView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
      transition={{ duration: 0.9, delay: index * 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1200 }}
      className="cursor-pointer"
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full aspect-[3/4]"
      >
        {/* Front face */}
        <div className="absolute inset-0 overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
          <Image
            src={chef.photo_url}
            alt={chef.name}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-[var(--accent-gold)]/60" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-[var(--accent-gold)]/60" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-[var(--accent-gold)]/60" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-[var(--accent-gold)]/60" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div
              className="text-[var(--accent-gold)] text-[9px] tracking-[0.25em] uppercase mb-1"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {chef.speciality}
            </div>
            <h3
              className="text-white text-xl leading-tight mb-0.5"
              style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
            >
              {chef.name}
            </h3>
            <p
              className="text-white/50 text-[10px] tracking-widest uppercase"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {chef.title}
            </p>
            <div className="flex items-center gap-1.5 mt-3">
              <div className="w-1 h-1 rounded-full bg-[var(--accent-gold)] animate-pulse" />
              <span
                className="text-[var(--accent-gold)]/60 text-[9px] tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Tap to discover
              </span>
            </div>
          </div>
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0 bg-[var(--bg-card)] border border-[var(--accent-gold)]/20 p-6 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--accent-gold)]/30" />
            <span className="text-[var(--accent-gold)] text-base">✦</span>
            <div className="h-px flex-1 bg-[var(--accent-gold)]/30" />
          </div>
          <div>
            <div
              className="text-[var(--accent-gold)] text-[9px] tracking-[0.25em] uppercase mb-3"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {chef.speciality}
            </div>
            <h3
              className="text-[var(--text-primary)] text-2xl mb-1"
              style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
            >
              {chef.name}
            </h3>
            <p
              className="text-[var(--text-secondary)] text-[10px] tracking-widest uppercase mb-5"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {chef.title}
            </p>
            <p
              className="text-[var(--text-secondary)] text-sm leading-relaxed"
              style={{ fontFamily: 'var(--font-sans)', fontWeight: 300 }}
            >
              {chef.bio}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--accent-gold)]/30" />
            <span
              className="text-[var(--text-secondary)] text-[9px] tracking-widest uppercase"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Éclat
            </span>
            <div className="h-px flex-1 bg-[var(--accent-gold)]/30" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Marquee Strip ────────────────────────────────────────────────────────────

function MarqueeStrip() {
  const items = [
    'Fine Dining',
    '✦',
    'Est. 2020',
    '◈',
    'Culinary Excellence',
    '✦',
    'Crafted with Passion',
    '◈',
    'Theatre of Taste',
    '✦',
    'Éclat',
    '◈',
  ]
  const doubled = [...items, ...items]
  const x = useMotionValue(0)

  useAnimationFrame(() => {
    const current = x.get()
    const reset = -50 * items.length
    x.set(current <= reset ? 0 : current - 0.4)
  })

  return (
    <div className="overflow-hidden border-y border-[var(--accent-gold)]/15 py-4 bg-[var(--bg-secondary)]">
      <motion.div style={{ x }} className="flex gap-8 whitespace-nowrap w-max">
        {doubled.map((item, i) => (
          <span
            key={i}
            className={`text-sm tracking-[0.2em] uppercase flex-shrink-0 ${
              item === '✦' || item === '◈'
                ? 'text-[var(--accent-gold)]'
                : 'text-[var(--text-secondary)]'
            }`}
            style={{ fontFamily: 'var(--font-sans)', minWidth: '100px', textAlign: 'center' }}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const [story, setStory] = useState<AboutStory>(FALLBACK_STORY)
  const [chefs, setChefs] = useState<Chef[]>(FALLBACK_CHEFS)
  const [gallery, setGallery] = useState<GalleryImage[]>(FALLBACK_GALLERY)
  const [loading, setLoading] = useState(true)

  // ── Hero slider state ──
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const dragStartX = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const goTo = useCallback(
    (index: number, dir?: number) => {
      setDirection(dir ?? (index > current ? 1 : -1))
      setCurrent(index)
    },
    [current],
  )

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length, 1)
  }, [current, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, -1)
  }, [current, goTo])

  // Auto-advance
  useEffect(() => {
    timerRef.current = setTimeout(next, 5500)
    return () => clearTimeout(timerRef.current)
  }, [current, next])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const slide = SLIDES[current]

  // Story section scroll
  const storyRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: storyScroll } = useScroll({
    target: storyRef,
    offset: ['start end', 'end start'],
  })
  const storyY1 = useTransform(storyScroll, [0, 1], ['-8%', '8%'])
  const storyY2 = useTransform(storyScroll, [0, 1], ['8%', '-8%'])

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()
        const [chefsRes, galleryRes, settingsRes] = await Promise.all([
          supabase.from('chefs').select('*').eq('is_active', true).order('sort_order'),
          supabase
            .from('gallery_images')
            .select('*')
            .eq('is_active', true)
            .order('sort_order')
            .limit(5),
          supabase
            .from('site_settings')
            .select('key, value')
            .eq('key', 'about_story')
            .maybeSingle(),
        ])
        if (chefsRes.data?.length) setChefs(chefsRes.data as Chef[])
        if (galleryRes.data?.length) setGallery(galleryRes.data as GalleryImage[])
        const settingsData = settingsRes.data as { key: string; value: unknown } | null
        if (settingsData?.value) {
          const val = settingsData.value
          setStory(typeof val === 'string' ? JSON.parse(val) : (val as AboutStory))
        }
      } catch (err) {
        console.error('About fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const values = [
    {
      roman: 'I',
      title: 'Culinary Excellence',
      desc: 'Every dish emerges from an obsessive pursuit of perfection — in sourcing, technique, and presentation.',
    },
    {
      roman: 'II',
      title: 'Seasonal Integrity',
      desc: 'Our menus evolve with the seasons. We cook what nature offers at its finest, nothing more, nothing less.',
    },
    {
      roman: 'III',
      title: 'Theatre of Dining',
      desc: 'Dinner at Éclat is a performance. From the moment you arrive to the final course, every detail is choreographed.',
    },
    {
      roman: 'IV',
      title: 'Gracious Hospitality',
      desc: 'We believe every guest deserves to feel like the most important person in the room. Always.',
    },
  ]

  // Slide variants
  const imageVariants = {
    enter: (d: number) => ({ x: d > 0 ? '8%' : '-8%', opacity: 0, scale: 1.08 }),
    center: { x: '0%', opacity: 1, scale: 1.05 },
    exit: (d: number) => ({ x: d > 0 ? '-6%' : '6%', opacity: 0, scale: 1 }),
  }

  const textVariants = {
    enter: (d: number) => ({ y: d > 0 ? 40 : -40, opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: (d: number) => ({ y: d > 0 ? -30 : 30, opacity: 0 }),
  }

  return (
    <main className="bg-[var(--bg-primary)] min-h-screen overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════════════
          HERO — Full-screen cinematic slider
      ══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ height: 'calc(100vh - 80px)', minHeight: 560, maxHeight: 780 }}
        onMouseDown={e => {
          dragStartX.current = e.clientX
        }}
        onMouseUp={e => {
          const delta = e.clientX - dragStartX.current
          if (Math.abs(delta) > 60) delta < 0 ? next() : prev()
        }}
      >
        {/* ── BACKGROUND SLIDER ── */}
        <div className="absolute inset-0">
          <AnimatePresence custom={direction} mode="sync">
            <motion.div
              key={current}
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={slide.image}
                alt={slide.eyebrow}
                fill
                className="object-cover object-center"
                priority
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>

          {/* Cinematic overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          {/* Subtle grain */}
          <div
            className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '256px 256px',
            }}
          />
        </div>

        {/* ── TOP GOLD BAR ── */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-0 left-0 h-[2px] w-full origin-left z-20"
          style={{
            background:
              'linear-gradient(90deg, var(--accent-gold), var(--accent-crimson) 40%, transparent)',
          }}
        />

        {/* ── MAIN CONTENT ── */}
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex-1 flex items-center">
            <div className="container-eclat w-full">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">

                {/* LEFT — Text content */}
                <div className="max-w-3xl">

                  {/* Eyebrow */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`eyebrow-${current}`}
                      custom={direction}
                      variants={textVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-4 mb-4"
                    >
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="h-px w-10 origin-left"
                        style={{ background: 'var(--accent-gold)' }}
                      />
                      <span
                        className="text-[10px] tracking-[0.5em] uppercase"
                        style={{ fontFamily: 'var(--font-sans)', color: 'var(--accent-gold)' }}
                      >
                        {slide.eyebrow}
                      </span>
                      <div
                        className="h-px w-4 opacity-40"
                        style={{ background: 'var(--accent-gold)' }}
                      />
                      <span
                        className="text-[10px] tracking-[0.35em] uppercase opacity-50"
                        style={{ fontFamily: 'var(--font-sans)', color: 'white' }}
                      >
                        Fine Dining · Est. {story.founding_year}
                      </span>
                    </motion.div>
                  </AnimatePresence>

                  {/* Headline */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`title-${current}`}
                      custom={direction}
                      variants={textVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                      className="mb-4"
                    >
                      <h1
                        className="leading-[0.88] font-light tracking-tight"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                          color: 'white',
                        }}
                      >
                        <span className="block">{slide.title}</span>
                        <span
                          className="block pl-6 md:pl-14"
                          style={{ color: 'var(--accent-gold)', fontStyle: 'italic' }}
                        >
                          {slide.titleItalic}
                        </span>
                        <span className="block">{slide.titleEnd}</span>
                      </h1>
                    </motion.div>
                  </AnimatePresence>

                  {/* Divider */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="h-px w-24 origin-left mb-4"
                    style={{ background: 'linear-gradient(90deg, var(--accent-gold), transparent)' }}
                  />

                  {/* Subtitle */}
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={`sub-${current}`}
                      custom={direction}
                      variants={textVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                      className="text-white/60 text-base leading-relaxed max-w-lg mb-6"
                      style={{ fontFamily: 'var(--font-sans)', fontWeight: 300 }}
                    >
                      {slide.subtitle}
                    </motion.p>
                  </AnimatePresence>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.8 }}
                    className="flex flex-wrap gap-3 mb-6"
                  >
                    <a
                      href="/reservations"
                      className="btn-crimson inline-block"
                      style={{ minWidth: 180, textAlign: 'center' }}
                    >
                      Reserve a Table
                    </a>
                    <a
                      href="/menu"
                      className="btn-outline inline-block"
                      style={{ minWidth: 160, textAlign: 'center' }}
                    >
                      Our Menu
                    </a>
                  </motion.div>

                  {/* Stats row */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 1 }}
                    className="flex gap-10"
                  >
                    {[
                      { n: story.stat_3_number, l: story.stat_3_label },
                      { n: story.stat_4_number, l: story.stat_4_label },
                      { n: '4', l: 'Master Chefs' },
                    ].map((s, i) => (
                      <div key={i} className="relative">
                        {i > 0 && (
                          <div className="absolute -left-5 top-0 bottom-0 w-px bg-white/10" />
                        )}
                        <div
                          className="text-xl md:text-2xl leading-none mb-0.5"
                          style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)' }}
                        >
                          {s.n}
                        </div>
                        <div
                          className="text-[9px] tracking-[0.25em] uppercase text-white/40"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          {s.l}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* RIGHT — Vertical progress + nav */}
                <div className="hidden lg:flex flex-col items-center gap-6">
                  <button
                    onClick={prev}
                    aria-label="Previous slide"
                    className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/50 hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-all duration-300"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M7 1L1 7L7 13"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <SlideProgress
                    current={current}
                    total={SLIDES.length}
                    onSelect={(i) => goTo(i)}
                  />

                  <button
                    onClick={next}
                    aria-label="Next slide"
                    className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/50 hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-all duration-300"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M7 1L13 7L7 13"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Slide counter */}
                  <div
                    className="text-[10px] tracking-[0.2em] text-white/30 mt-2"
                    style={{ fontFamily: 'var(--font-sans)', writingMode: 'vertical-rl' }}
                  >
                    {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── BOTTOM THUMBNAIL BAR ── */}
          <div className="relative z-10 border-t border-white/[0.06]">
            <div className="container-eclat">
              <div className="flex items-stretch h-14">

                {/* Slide thumbnails */}
                <div className="flex gap-0 flex-1 overflow-hidden">
                  {SLIDES.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`relative flex-1 overflow-hidden transition-all duration-500 ${
                        i === current ? 'flex-[2]' : 'opacity-50 hover:opacity-70'
                      }`}
                      aria-label={s.eyebrow}
                    >
                      <Image
                        src={s.image}
                        alt={s.eyebrow}
                        fill
                        className="object-cover"
                        sizes="15vw"
                      />
                      <div className="absolute inset-0 bg-black/50" />
                      {i === current && (
                        <div
                          className="absolute inset-0 border-t-2"
                          style={{ borderColor: 'var(--accent-gold)' }}
                        />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
                        <span
                          className="text-[8px] tracking-[0.25em] uppercase text-white/70 line-clamp-1"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          {s.eyebrow}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Right info block */}
                <div
                  className="hidden md:flex items-center gap-6 px-8 border-l border-white/[0.06]"
                  style={{ minWidth: 220 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`tag-${current}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div
                        className="text-[9px] tracking-[0.3em] uppercase mb-1"
                        style={{ fontFamily: 'var(--font-sans)', color: 'var(--accent-gold)' }}
                      >
                        {slide.tag}
                      </div>
                      <div
                        className="text-white/50 text-[11px] tracking-[0.1em]"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        Éclat Fine Dining
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      border: '1px dashed rgba(201,168,76,0.3)',
                      flexShrink: 0,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCROLL HINT ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="absolute bottom-[76px] left-10 md:left-20 z-20 hidden lg:flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-10"
            style={{ background: 'linear-gradient(to bottom, var(--accent-gold), transparent)' }}
          />
          <span
            className="text-[8px] tracking-[0.35em] uppercase"
            style={{
              fontFamily: 'var(--font-sans)',
              color: 'rgba(201,168,76,0.5)',
              writingMode: 'vertical-rl',
            }}
          >
            Scroll
          </span>
        </motion.div>

        {/* ── MOBILE DOTS ── */}
        <div className="absolute bottom-[76px] left-1/2 -translate-x-1/2 flex gap-2 lg:hidden z-20">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all duration-300"
              style={{
                width: i === current ? 24 : 6,
                height: 6,
                borderRadius: 3,
                background:
                  i === current ? 'var(--accent-gold)' : 'rgba(255,255,255,0.3)',
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* ── DECORATIVE FRAME CORNERS ── */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-white/10 pointer-events-none hidden lg:block z-10" />
        <div className="absolute top-8 right-20 w-12 h-12 border-t border-r border-white/10 pointer-events-none hidden lg:block z-10" />
        <div className="absolute bottom-[58px] left-8 w-12 h-12 border-b border-l border-white/10 pointer-events-none hidden lg:block z-10" />
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          MARQUEE
      ══════════════════════════════════════════════════════════════════ */}
      <MarqueeStrip />

      {/* ══════════════════════════════════════════════════════════════════
          STORY — Stacked editorial layout
      ══════════════════════════════════════════════════════════════════ */}
      <section ref={storyRef} className="section-py relative overflow-hidden">
        <FloatingOrbs />

        <div className="container-eclat relative z-10">
          <div
            className="absolute -top-10 -left-6 text-[20rem] font-bold leading-none select-none pointer-events-none opacity-[0.025]"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)' }}
          >
            01
          </div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="h-px w-16 bg-[var(--accent-gold)]" />
            <span
              className="text-[var(--accent-gold)] text-[10px] tracking-[0.35em] uppercase"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Our Heritage
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2rem,6vw,5rem)] leading-tight font-light mb-16 max-w-4xl"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
          >
            {story.headline}
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr_1fr] gap-8 lg:gap-6 items-start">

            {/* Left col */}
            <motion.div style={{ y: storyY1 }} className="lg:pt-24 space-y-8">
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-[var(--text-secondary)] leading-relaxed text-[15px]"
                style={{ fontFamily: 'var(--font-sans)', fontWeight: 300 }}
              >
                {story.paragraph_1}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="border-l-2 border-[var(--accent-gold)] pl-5"
              >
                <div
                  className="text-4xl mb-1"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)' }}
                >
                  {story.stat_1_number}
                </div>
                <div
                  className="text-[10px] tracking-[0.2em] uppercase"
                  style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}
                >
                  {story.stat_1_label}
                </div>
              </motion.div>
            </motion.div>

            {/* Center col — tall image */}
            <TiltCard>
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[3/4] overflow-hidden"
                style={{ transform: 'translateZ(20px)' }}
              >
                <Image
                  src="/images/restaurant-story.jpg.jpg"
                  alt="Éclat story"
                  fill
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div
                  className="absolute bottom-6 left-6 right-6 text-center"
                  style={{ transform: 'translateZ(30px)' }}
                >
                  <div
                    className="inline-block border border-[var(--accent-gold)]/40 px-6 py-3 backdrop-blur-sm"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                  >
                    <span
                      className="text-[var(--accent-gold)] text-[9px] tracking-[0.35em] uppercase block mb-1"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Fine Dining Since
                    </span>
                    <span
                      className="text-white text-3xl"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {story.founding_year}
                    </span>
                  </div>
                </div>
              </motion.div>
            </TiltCard>

            {/* Right col */}
            <motion.div style={{ y: storyY2 }} className="lg:pt-40 space-y-8">
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-[var(--text-secondary)] leading-relaxed text-[15px]"
                style={{ fontFamily: 'var(--font-sans)', fontWeight: 300 }}
              >
                {story.paragraph_2}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col gap-3"
              >
                <MagneticButton href="/menu" className="btn-crimson text-center inline-block">
                  Explore Our Menu
                </MagneticButton>
                <MagneticButton href="/reservations" className="btn-outline text-center inline-block">
                  Reserve a Table
                </MagneticButton>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          STATS — Dark band with animated counters
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[var(--bg-secondary)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-crimson)] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-gold)]/40 to-transparent" />

        <div className="container-eclat relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-6">
            <AnimatedStat number={story.stat_1_number} label={story.stat_1_label} delay={0} />
            <AnimatedStat number={story.stat_2_number} label={story.stat_2_label} delay={0.15} />
            <AnimatedStat number={story.stat_3_number} label={story.stat_3_label} delay={0.3} />
            <AnimatedStat number={story.stat_4_number} label={story.stat_4_label} delay={0.45} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          PHILOSOPHY — Roman numeral cards
      ══════════════════════════════════════════════════════════════════ */}
      <section className="section-py relative overflow-hidden">
        <FloatingOrbs />

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-bold leading-none select-none pointer-events-none opacity-[0.015] whitespace-nowrap"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)' }}
        >
          ÉCLAT
        </div>

        <div className="container-eclat relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div
              className="text-[var(--accent-gold)] text-[10px] tracking-[0.35em] uppercase mb-3"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              — What We Stand For
            </div>
            <h2
              className="text-[clamp(2rem,5vw,4rem)] font-light"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
            >
              Our Philosophy
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--accent-gold)]/10">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                whileHover={{ backgroundColor: 'rgba(201,168,76,0.04)' }}
                className="bg-[var(--bg-primary)] p-10 group relative overflow-hidden transition-colors duration-300"
              >
                <div
                  className="absolute -top-4 -right-2 text-[8rem] font-bold leading-none select-none opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)' }}
                >
                  {v.roman}
                </div>

                <div
                  className="text-[var(--accent-gold)] text-xs tracking-[0.3em] uppercase mb-4"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {v.roman}
                </div>
                <h3
                  className="text-[var(--text-primary)] text-2xl mb-4"
                  style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}
                >
                  {v.title}
                </h3>
                <p
                  className="text-[var(--text-secondary)] text-sm leading-relaxed"
                  style={{ fontFamily: 'var(--font-sans)', fontWeight: 300 }}
                >
                  {v.desc}
                </p>

                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                  className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-gold)]/40 to-transparent origin-left"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          CHEFS — 3D flip cards
      ══════════════════════════════════════════════════════════════════ */}
      <section className="section-py bg-[var(--bg-secondary)] relative overflow-hidden">
        <div
          className="absolute -bottom-10 -right-6 text-[20rem] font-bold leading-none select-none pointer-events-none opacity-[0.025]"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)' }}
        >
          02
        </div>

        <div className="container-eclat relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 mb-3"
              >
                <div className="h-px w-10 bg-[var(--accent-gold)]" />
                <span
                  className="text-[var(--accent-gold)] text-[10px] tracking-[0.35em] uppercase"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  The Artisans
                </span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-[clamp(2rem,5vw,4rem)] font-light"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
              >
                Meet Our Chefs
              </motion.h2>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-[var(--text-secondary)] text-sm max-w-xs md:text-right"
              style={{ fontFamily: 'var(--font-sans)', fontWeight: 300 }}
            >
              Tap any card to reveal the story behind the craft.
            </motion.p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] bg-[var(--bg-elevated)] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {chefs.map((chef, i) => (
                <ChefCard3D key={chef.id} chef={chef} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          GALLERY STRIP
      ══════════════════════════════════════════════════════════════════ */}
      <section className="section-py relative overflow-hidden">
        <FloatingOrbs />

        <div
          className="absolute -top-10 right-0 text-[20rem] font-bold leading-none select-none pointer-events-none opacity-[0.025]"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)' }}
        >
          03
        </div>

        <div className="container-eclat relative z-10 mb-10">
          <div className="flex items-end justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div
                className="text-[var(--accent-gold)] text-[10px] tracking-[0.35em] uppercase mb-3"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                — A Glimpse Inside
              </div>
              <h2
                className="text-[clamp(2rem,5vw,4rem)] font-light"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
              >
                The Éclat Experience
              </h2>
            </motion.div>
            <Link href="/gallery" className="btn-outline hidden md:inline-flex">
              Full Gallery →
            </Link>
          </div>
        </div>

        <div className="container-eclat relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 auto-rows-[160px]">
            {gallery.map((img, i) => {
              const isWide = i === 0 || i === 3
              const isTall = i === 1
              return (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, zIndex: 10 }}
                  className={`group relative overflow-hidden cursor-pointer ${isWide ? 'col-span-2' : ''} ${isTall ? 'row-span-2' : ''}`}
                  style={{ transition: 'transform 0.4s ease' }}
                >
                  <Image
                    src={img.url}
                    alt={img.alt_text}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4"
                  >
                    <span
                      className="text-white text-xs tracking-widest uppercase"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      {img.caption}
                    </span>
                  </motion.div>

                  <motion.div
                    initial={{ x: '-100%', opacity: 0 }}
                    whileHover={{ x: '200%', opacity: 0.15 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 pointer-events-none"
                  />
                </motion.div>
              )
            })}
          </div>

          <div className="flex justify-center mt-6 md:hidden">
            <Link href="/gallery" className="btn-outline">
              Full Gallery →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          CTA — Full-bleed cinematic close
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-40 overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <Image
            src="/images/redd-francisco-o1sdskce8ie-unsplash.jpg"
            alt="Éclat"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="absolute inset-10 border border-[var(--accent-gold)]/15 pointer-events-none hidden md:block"
        />
        <div className="absolute inset-[42px] border border-[var(--accent-gold)]/5 pointer-events-none hidden md:block" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative z-10 text-center max-w-2xl mx-auto px-6"
        >
          <div className="flex items-center justify-center gap-5 mb-8">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[var(--accent-gold)]/60" />
            <span className="text-[var(--accent-gold)] text-xl">✦</span>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[var(--accent-gold)]/60" />
          </div>

          <h2
            className="text-[clamp(2.5rem,6vw,5rem)] font-light leading-tight mb-6"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
          >
            Ready to Experience
            <br />
            <span style={{ color: 'var(--accent-gold)', fontStyle: 'italic' }}>Éclat?</span>
          </h2>

          <p
            className="text-[var(--text-secondary)] mb-10 leading-relaxed max-w-md mx-auto"
            style={{ fontFamily: 'var(--font-sans)', fontWeight: 300 }}
          >
            Reserve your table and let us create an evening you will never forget.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <MagneticButton href="/reservations" className="btn-crimson inline-block">
              Reserve a Table
            </MagneticButton>
            <MagneticButton href="/menu" className="btn-gold inline-block">
              Browse Menu
            </MagneticButton>
          </div>
        </motion.div>
      </section>

    </main>
  )
}