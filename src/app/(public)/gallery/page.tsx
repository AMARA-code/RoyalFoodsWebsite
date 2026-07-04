
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useInView,
} from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface GalleryImage {
  id: string
  url: string
  caption: string
  category: string
  alt_text: string
  sort_order: number
  is_active: boolean
}

// ─── Fallback Data ────────────────────────────────────────────────────────────

const FALLBACK_IMAGES: GalleryImage[] = [
  { id: '1',  url: '/images/restaurant-story.jpg.jpg',                              caption: 'The Éclat Dining Room',   category: 'ambiance', alt_text: 'Éclat dining room',        sort_order: 1,  is_active: true },
  { id: '2',  url: '/images/redd-francisco-o1sdskce8ie-unsplash.jpg',               caption: 'Evening Atmosphere',      category: 'ambiance', alt_text: 'Éclat evening ambiance',    sort_order: 2,  is_active: true },
  { id: '3',  url: '/images/mitili-mitili-vbxpits5isw-unsplash.jpg',                caption: 'Our Heritage',            category: 'ambiance', alt_text: 'Éclat heritage',            sort_order: 3,  is_active: true },
  { id: '4',  url: '/images/dennis-zhang-nsebwyq-uoy-unsplash.jpg',                 caption: 'The Éclat Experience',    category: 'ambiance', alt_text: 'Éclat interior',            sort_order: 4,  is_active: true },
  { id: '5',  url: '/images/whatsapp image 2025-09-07 at 6.27.11 am (1).jpeg',     caption: "Chef's Signature Dish",   category: 'food',     alt_text: 'Grilled chicken signature', sort_order: 5,  is_active: true },
  { id: '6',  url: '/images/whatsapp image 2025-09-12 at 6.04.07 am.jpeg',         caption: 'Chicken Tikka Masala',    category: 'food',     alt_text: 'Chicken tikka masala',      sort_order: 6,  is_active: true },
  { id: '7',  url: '/images/whatsapp image 2025-09-12 at 6.08.42 am.jpeg',         caption: 'Lamb Curry',              category: 'food',     alt_text: 'Lamb curry',                sort_order: 7,  is_active: true },
  { id: '8',  url: '/images/whatsapp image 2025-09-12 at 6.27.52 am.jpeg',         caption: 'Chocolate Lava Cake',     category: 'food',     alt_text: 'Chocolate lava cake',       sort_order: 8,  is_active: true },
  { id: '9',  url: '/images/whatsapp image 2025-09-12 at 6.23.11 am.jpeg',         caption: 'Brownies with Ice Cream', category: 'food',     alt_text: 'Brownies ice cream',        sort_order: 9,  is_active: true },
  { id: '10', url: '/images/whatsapp image 2025-09-12 at 7.54.49 am.jpeg',         caption: 'Fresh Lemonade',          category: 'drinks',   alt_text: 'Fresh lemonade',            sort_order: 10, is_active: true },
  { id: '11', url: '/images/whatsapp image 2025-09-12 at 8.08.21 am.jpeg',         caption: 'Cold Coffee Frappe',      category: 'drinks',   alt_text: 'Cold coffee frappe',        sort_order: 11, is_active: true },
  { id: '12', url: '/images/whatsapp image 2025-09-12 at 8.08.22 am.jpeg',         caption: 'Strawberry Milkshake',    category: 'drinks',   alt_text: 'Strawberry milkshake',      sort_order: 12, is_active: true },
  { id: '13', url: '/images/whatsapp image 2025-09-12 at 8.19.10 am.jpeg',         caption: 'Cappuccino',              category: 'drinks',   alt_text: 'Cappuccino coffee',         sort_order: 13, is_active: true },
  { id: '14', url: '/images/whatsapp image 2025-09-12 at 8.10.17 am.jpeg',         caption: 'Sparkling Water',         category: 'drinks',   alt_text: 'Sparkling water',           sort_order: 14, is_active: true },
]

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'all',      label: 'All',      icon: '✦' },
  { key: 'food',     label: 'Cuisine',  icon: '◈' },
  { key: 'ambiance', label: 'Ambiance', icon: '❋' },
  { key: 'drinks',   label: 'Drinks',   icon: '◇' },
]

// ─── Masonry tile size pattern ────────────────────────────────────────────────

const TILE_PATTERN = [
  { col: 2, row: 2 },
  { col: 1, row: 1 },
  { col: 1, row: 2 },
  { col: 1, row: 1 },
  { col: 1, row: 1 },
  { col: 2, row: 1 },
  { col: 1, row: 1 },
  { col: 1, row: 2 },
  { col: 2, row: 1 },
  { col: 1, row: 1 },
  { col: 1, row: 1 },
  { col: 2, row: 2 },
]

// ─── Floating Particle ────────────────────────────────────────────────────────

function FloatingParticle({ delay, x, duration }: { delay: number; x: number; duration: number }) {
  return (
    <motion.div
      className="absolute w-px bg-gradient-to-t from-transparent via-[var(--accent-gold)] to-transparent pointer-events-none"
      style={{ left: `${x}%`, bottom: '-10%', height: '60px', opacity: 0.3 }}
      animate={{ y: [0, -800], opacity: [0, 0.6, 0], scaleY: [0.5, 1.5, 0.5] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
    />
  )
}

// ─── 3D Tilt Card ─────────────────────────────────────────────────────────────

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [glowX, setGlowX] = useState(50)
  const [glowY, setGlowY] = useState(50)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    setRotateY(((x - cx) / cx) * 12)
    setRotateX(((cy - y) / cy) * 10)
    setGlowX((x / rect.width) * 100)
    setGlowY((y / rect.height) * 100)
  }

  const handleMouseLeave = () => { setRotateX(0); setRotateY(0); setGlowX(50); setGlowY(50) }

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={className} style={{ perspective: '1000px' }}>
      <motion.div
        animate={{ rotateX, rotateY }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.5 }}
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
        className="relative w-full h-full"
      >
        {children}
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(201,168,76,0.15) 0%, transparent 60%)`,
            opacity: rotateX !== 0 || rotateY !== 0 ? 1 : 0,
          }}
        />
      </motion.div>
    </div>
  )
}

// ─── Magnetic Button ──────────────────────────────────────────────────────────

function MagneticButton({
  children, onClick, className, 'aria-label': ariaLabel,
}: {
  children: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
  className?: string
  'aria-label'?: string
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setPos({ x: (e.clientX - cx) * 0.35, y: (e.clientY - cy) * 0.35 })
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </motion.button>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  images, currentIndex, onClose, onPrev, onNext, onNavigate,
}: {
  images: GalleryImage[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onNavigate: (i: number) => void
}) {
  const img = images[currentIndex]
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') { setDirection(-1); onPrev() }
      if (e.key === 'ArrowRight') { setDirection(1); onNext() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onPrev, onNext])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0, scale: 0.9, rotateY: dir > 0 ? 15 : -15 }),
    center: { x: 0, opacity: 1, scale: 1, rotateY: 0 },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0, scale: 0.9, rotateY: dir > 0 ? -15 : 15 }),
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)' }}
        animate={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(0,0,0,0.92)' }}
        exit={{ backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)' }}
        className="absolute inset-0"
      />

      {/* Corner frames */}
      {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((cls, i) => (
        <motion.div
          key={i}
          initial={{ width: 0, height: 0, opacity: 0 }}
          animate={{ width: 60, height: 60, opacity: 1 }}
          exit={{ width: 0, height: 0, opacity: 0 }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
          className={`absolute ${cls} border-[var(--accent-gold)] m-6`}
        />
      ))}

      <MagneticButton onClick={onClose} aria-label="Close" className="absolute top-8 right-8 z-20 w-12 h-12 flex items-center justify-center border border-[var(--accent-gold)]/40 text-white/60 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)] transition-colors duration-300 text-2xl backdrop-blur-sm bg-black/20">
        ×
      </MagneticButton>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 left-1/2 -translate-x-1/2 text-[var(--text-secondary)] text-[10px] tracking-[0.4em] uppercase"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
      </motion.div>

      <div className="relative z-10 max-w-5xl w-full mx-20 max-h-[80vh]" onClick={(e) => e.stopPropagation()} style={{ perspective: '1200px' }}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={img.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="relative" style={{ boxShadow: '0 0 80px rgba(201,168,76,0.15), 0 40px 80px rgba(0,0,0,0.6)' }}>
              <motion.div
                className="absolute -inset-[1px] pointer-events-none z-10"
                style={{ background: 'linear-gradient(90deg, var(--accent-gold), transparent, var(--accent-gold), transparent)', backgroundSize: '200% 100%' }}
                animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <img src={img.url} alt={img.alt_text} className="w-full h-auto object-contain relative z-0" style={{ maxHeight: '70vh', display: 'block' }} />
            </div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-5 flex items-center justify-between px-1">
              <div>
                <p className="text-[var(--text-primary)] text-lg" style={{ fontFamily: 'var(--font-serif)' }}>{img.caption}</p>
                <p className="text-[var(--accent-gold)] text-[9px] tracking-[0.4em] uppercase mt-1" style={{ fontFamily: 'var(--font-sans)' }}>{img.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-px w-16 bg-gradient-to-l from-[var(--accent-gold)]/60 to-transparent" />
                <span className="text-[var(--accent-gold)] text-xs">✦</span>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <MagneticButton onClick={(e) => { e.stopPropagation(); setDirection(-1); onPrev() }} aria-label="Previous" className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 border border-[var(--accent-gold)]/30 flex items-center justify-center text-white/60 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)] transition-all duration-300 text-xl backdrop-blur-sm bg-black/20">←</MagneticButton>
      <MagneticButton onClick={(e) => { e.stopPropagation(); setDirection(1); onNext() }} aria-label="Next" className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 border border-[var(--accent-gold)]/30 flex items-center justify-center text-white/60 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)] transition-all duration-300 text-xl backdrop-blur-sm bg-black/20">→</MagneticButton>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {images.map((im, i) => (
          <motion.button key={im.id} onClick={(e) => { e.stopPropagation(); onNavigate(i) }} whileHover={{ scale: 1.3 }} className={`transition-all duration-300 relative overflow-hidden ${i === currentIndex ? 'ring-1 ring-[var(--accent-gold)]' : ''}`} style={{ width: i === currentIndex ? 40 : 28, height: i === currentIndex ? 28 : 20, opacity: i === currentIndex ? 1 : 0.4 }}>
            <img src={im.url} alt={im.alt_text} className="absolute inset-0 w-full h-full object-cover" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Masonry Tile ─────────────────────────────────────────────────────────────

function GalleryTile({ image, index, colSpan, rowSpan, onClick }: {
  image: GalleryImage; index: number; colSpan: number; rowSpan: number; onClick: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [hovered, setHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })
    setTilt({ x: ((y - 50) / 50) * -8, y: ((x - 50) / 50) * 8 })
  }

  const tileVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 60, rotateX: 15, filter: 'blur(8px)' },
    visible: {
      opacity: 1, scale: 1, y: 0, rotateX: 0, filter: 'blur(0px)',
      transition: { duration: 0.8, delay: (index % 6) * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  }

  return (
    <motion.div
      ref={ref}
      variants={tileVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }) }}
      className="group relative overflow-hidden cursor-pointer bg-[var(--bg-card)]"
      style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}`, perspective: '800px', transformStyle: 'preserve-3d' }}
    >
      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y, scale: hovered ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, mass: 0.8 }}
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.img
          src={image.url}
          alt={image.alt_text}
          animate={{ scale: hovered ? 1.12 : 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.3 }} style={{ background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(201,168,76,0.2) 0%, transparent 55%)` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <motion.div animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        <motion.div animate={{ opacity: hovered ? 0 : 1 }} transition={{ duration: 0.3 }} className="absolute top-3 left-3">
          <span className="text-[var(--accent-gold)]/70 text-[8px] tracking-[0.3em] uppercase px-2 py-1 border border-[var(--accent-gold)]/20 bg-black/30 backdrop-blur-sm" style={{ fontFamily: 'var(--font-sans)' }}>{image.category}</span>
        </motion.div>
        <motion.div animate={{ y: hovered ? 0 : 24, opacity: hovered ? 1 : 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-x-0 bottom-0 p-5">
          <motion.div animate={{ scaleX: hovered ? 1 : 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="h-px bg-gradient-to-r from-[var(--accent-gold)] to-transparent mb-3 origin-left" />
          <div className="text-[var(--accent-gold)] text-[8px] tracking-[0.35em] uppercase mb-1.5" style={{ fontFamily: 'var(--font-sans)' }}>{image.category}</div>
          <p className="text-white text-sm font-light leading-snug" style={{ fontFamily: 'var(--font-serif)' }}>{image.caption}</p>
        </motion.div>
        <motion.div animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.6, rotate: hovered ? 0 : -45 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="absolute top-4 right-4 w-9 h-9 border border-white/40 bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/80 text-sm">⤢</motion.div>
        <motion.div initial={{ x: '-100%', skewX: '-15deg' }} animate={hovered ? { x: '250%' } : { x: '-100%' }} transition={{ duration: 0.65, ease: 'easeOut' }} className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none" />
      </motion.div>
    </motion.div>
  )
}

// ─── Scroll Marquee ───────────────────────────────────────────────────────────

function ScrollMarquee() {
  const items = ['Éclat', '✦', 'Fine Dining', '◈', 'Crafted Moments', '❋', 'Premium Experience', '◇']
  return (
    <div className="overflow-hidden py-6 border-y border-[var(--accent-gold)]/10">
      <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="flex gap-12 whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className={`text-sm tracking-[0.3em] uppercase ${item.match(/[✦◈❋◇]/) ? 'text-[var(--accent-gold)]' : 'text-[var(--text-secondary)]'}`} style={{ fontFamily: 'var(--font-sans)' }}>{item}</span>
        ))}
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO — redesigned: centered, clean, premium
// ═══════════════════════════════════════════════════════════════════════════════

function GalleryHero({ imageCount }: { imageCount: number }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const bgY      = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const bgScale  = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const opacity  = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%'])

  const [particles, setParticles] = useState<{ x: number; delay: number; duration: number }[]>([])
  useEffect(() => {
    setParticles(Array.from({ length: 14 }, () => ({
      x: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 5 + Math.random() * 5,
    })))
  }, [])

  return (
    <section ref={heroRef} className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">

      {/* Parallax background */}
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0 origin-center">
        <img
          src="/images/cuisen-3.jpg"
          alt="Éclat Gallery"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[var(--bg-primary)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      {/* Crimson tint */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(139,0,0,0.12) 0%, transparent 60%)' }} />

      {/* Animated top rule */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 inset-x-0 h-[2px] origin-left"
        style={{ background: 'linear-gradient(90deg, var(--accent-crimson) 0%, var(--accent-gold) 40%, transparent 100%)' }}
      />

      {/* Scan line */}
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-gold)]/30 to-transparent pointer-events-none z-10"
        animate={{ y: ['-100vh', '100vh'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
      />

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {particles.map((p, i) => <FloatingParticle key={i} x={p.x} delay={p.delay} duration={p.duration} />)}
      </div>

      {/* ── Centered hero content ── */}
      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-20 flex flex-col items-center text-center px-6 max-w-3xl mx-auto"
      >
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex items-center gap-4 mb-6"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="h-px w-10 bg-[var(--accent-gold)] origin-left"
          />
          <span
            className="text-[var(--accent-gold)] text-[9px] tracking-[0.5em] uppercase"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Visual Journey · Est. 2020
          </span>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="h-px w-10 bg-[var(--accent-gold)] origin-right"
          />
        </motion.div>

        {/* Main heading — clean centered serif */}
        <div className="overflow-hidden mb-2">
          <motion.h1
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(3.5rem,8vw,7rem)] leading-[1] font-light text-[var(--text-primary)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Our Gallery
          </motion.h1>
        </div>

        {/* Italic accent line */}
        <div className="overflow-hidden mb-6">
          <motion.p
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(1.5rem,3.5vw,2.8rem)] leading-snug font-light italic text-[var(--accent-gold)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            &amp; Stories
          </motion.p>
        </div>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--accent-gold)]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--accent-gold)]" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-md mb-10"
          style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, letterSpacing: '0.05em' }}
        >
          Every frame a chapter. Every dish a canvas. Browse moments crafted with passion at Éclat Fine Dining.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex items-center gap-8 justify-center"
        >
          {[
            { num: imageCount, label: 'Moments' },
            { num: '4',        label: 'Master Chefs' },
            { num: '5★',       label: 'Experience' },
          ].map(({ num, label }, i) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span
                className="text-[var(--accent-gold)] text-2xl font-light"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {typeof num === 'number' ? String(num).padStart(2, '0') : num}
              </span>
              <span
                className="text-[var(--text-muted)] text-[9px] tracking-[0.3em] uppercase"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {label}
              </span>
              {i < 2 && <div className="hidden sm:block h-6 w-px bg-[var(--accent-gold)]/20 mt-1" />}
            </div>
          ))}
        </motion.div>
         
      </motion.div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>(FALLBACK_IMAGES)
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    async function fetchImages() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('gallery_images')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')
        if (data && data.length > 0) setImages(data)
      } catch (err) {
        console.error('Gallery fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchImages()
  }, [])

  const filtered = activeCategory === 'all' ? images : images.filter((img) => img.category === activeCategory)

  const openLightbox  = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const prevImage = useCallback(() => setLightboxIndex((i) => i === null ? 0 : (i - 1 + filtered.length) % filtered.length), [filtered.length])
  const nextImage = useCallback(() => setLightboxIndex((i) => i === null ? 0 : (i + 1) % filtered.length), [filtered.length])

  const counts = {
    all:      images.length,
    food:     images.filter((i) => i.category === 'food').length,
    ambiance: images.filter((i) => i.category === 'ambiance').length,
    drinks:   images.filter((i) => i.category === 'drinks').length,
  }

  return (
    <main className="bg-[var(--bg-primary)] min-h-screen overflow-x-hidden">

      {/* HERO */}
      <GalleryHero imageCount={images.length} />

      {/* MARQUEE */}
      <ScrollMarquee />

      {/* FILTER BAR */}
      <div className="sticky top-[72px] z-40 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--accent-gold)]/10">
        <div className="container-eclat">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-1">
              {CATEGORIES.map((cat, i) => (
                <motion.button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  whileTap={{ scale: 0.94 }}
                  className={`relative px-5 py-2.5 text-[10px] tracking-[0.25em] uppercase transition-colors duration-300 flex items-center gap-2.5 ${activeCategory === cat.key ? 'text-[var(--accent-gold)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                  style={{ fontFamily: 'var(--font-sans)' }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  {activeCategory === cat.key && (
                    <motion.div layoutId="filter-pill" className="absolute inset-0 border border-[var(--accent-gold)]/40" style={{ background: 'rgba(201,168,76,0.06)' }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                  )}
                  <motion.span className="relative z-10" animate={{ rotate: activeCategory === cat.key ? 360 : 0 }} transition={{ duration: 0.6 }}>{cat.icon}</motion.span>
                  <span className="relative z-10 hidden sm:inline">{cat.label}</span>
                  <motion.span animate={{ scale: activeCategory === cat.key ? 1.1 : 1 }} className="relative z-10 text-[var(--text-secondary)] text-[9px]">{counts[cat.key as keyof typeof counts]}</motion.span>
                </motion.button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={filtered.length} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-[var(--text-secondary)] text-[10px] tracking-[0.3em] uppercase hidden md:flex items-center gap-2" style={{ fontFamily: 'var(--font-sans)' }}>
                <span className="text-[var(--accent-gold)]">✦</span>
                {filtered.length} {filtered.length === 1 ? 'image' : 'images'}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* MASONRY GRID */}
      <section className="section-py">
        <div className="container-eclat">
          {loading ? (
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: '200px' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.1 }} className="bg-[var(--bg-card)]" style={{ gridColumn: `span ${TILE_PATTERN[i % TILE_PATTERN.length].col}`, gridRow: `span ${TILE_PATTERN[i % TILE_PATTERN.length].row}` }} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={activeCategory} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: '200px' }}>
                {filtered.map((img, i) => {
                  const pattern = TILE_PATTERN[i % TILE_PATTERN.length]
                  return <GalleryTile key={img.id} image={img} index={i} colSpan={pattern.col} rowSpan={pattern.row} onClick={() => openLightbox(i)} />
                })}
              </motion.div>
            </AnimatePresence>
          )}
          {!loading && filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} className="text-[var(--accent-gold)] text-5xl mb-6 inline-block" style={{ fontFamily: 'var(--font-serif)' }}>✦</motion.div>
              <p className="text-[var(--text-secondary)] text-sm tracking-widest uppercase" style={{ fontFamily: 'var(--font-sans)' }}>No images in this category yet</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CLOSING BAND */}
      <section className="relative py-36 overflow-hidden">
        <motion.div initial={{ scale: 1.1 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0">
          <img src="/images/restaurant-story.jpg.jpg" alt="Éclat" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/85" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)]" />
        </motion.div>

        {[...Array(3)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full pointer-events-none" style={{ width: [200, 130, 80][i], height: [200, 130, 80][i], left: `${15 + i * 30}%`, top: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)', filter: 'blur(20px)' }} animate={{ y: [0, -30, 0], scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 4 + i, repeat: Infinity, delay: i * 1.2, ease: 'easeInOut' }} />
        ))}

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }} className="relative z-10 container-eclat text-center">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="text-[var(--accent-gold)] text-2xl mb-8 inline-block">✦</motion.div>
          <div className="overflow-hidden mb-4">
            <motion.h2 initial={{ y: '100%' }} whileInView={{ y: '0%' }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="text-[clamp(2.5rem,6vw,5rem)] font-light" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>Experience it in Person</motion.h2>
          </div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="text-[var(--text-secondary)] text-sm mb-10 max-w-md mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-sans)', fontWeight: 300 }}>
            No photograph can capture the full sensory theatre of an evening at Éclat. Reserve your table.
          </motion.p>
          <div className="flex flex-wrap justify-center gap-5">
            <TiltCard><a href="/reservations" className="btn-crimson block">Reserve a Table</a></TiltCard>
            <TiltCard><a href="/menu" className="btn-outline block">View Menu</a></TiltCard>
          </div>
        </motion.div>
      </section>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox images={filtered} currentIndex={lightboxIndex} onClose={closeLightbox} onPrev={prevImage} onNext={nextImage} onNavigate={setLightboxIndex} />
        )}
      </AnimatePresence>
    </main>
  )
}
