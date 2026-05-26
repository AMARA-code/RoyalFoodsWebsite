'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  type Variants,
} from 'framer-motion'

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: 'easeOut' as const } },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const } },
}

const slideRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const } },
}

// ─── Section Wrapper with InView trigger ─────────────────────────────────────

function RevealSection({
  children,
  className = '',
  variants = stagger,
}: {
  children: React.ReactNode
  className?: string
  variants?: Variants
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
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

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <motion.span variants={fadeUp} className="text-label text-accent-gold tracking-[0.3em] block">
      {text}
    </motion.span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <section ref={ref} className="relative h-screen min-h-[700px] overflow-hidden flex items-center justify-center">
      {/* Parallax Background */}
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        <Image
          src="/images/ambiance.jpg"
          alt="Éclat Fine Dining"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[var(--bg-primary)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      </motion.div>

      {/* Animated grain texture */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        style={{ opacity }}
      >
        {mounted && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="flex flex-col items-center gap-6"
          >
            {/* Label */}
            <motion.span
              variants={fadeUp}
              className="text-label text-accent-gold tracking-[0.4em]"
            >
              Est. 2020 · Fine Dining
            </motion.span>

            {/* Gold line */}
            <motion.div variants={fadeIn} className="divider-gold" />

            {/* Main title */}
            <motion.h1
              variants={fadeUp}
              className="text-display text-[var(--text-primary)]"
            >
              Exquisite Culinary
              <br />
              <span className="italic text-[var(--accent-gold)]">Excellence</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="text-base md:text-lg text-[var(--text-secondary)] font-[var(--font-sans)] font-light tracking-widest max-w-md"
            >
              Where every meal is a masterpiece
            </motion.p>

            {/* Buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link href="/menu" className="btn-crimson">
                Explore Menu
              </Link>
              <Link href="/reservations" className="btn-gold">
                Reserve a Table
              </Link>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATS BAR
// ═══════════════════════════════════════════════════════════════════════════════

const STATS = [
  { value: '40+', label: 'Signature Dishes' },
  { value: '5★', label: 'Dining Experience' },
  { value: '4', label: 'Master Chefs' },
  { value: '2020', label: 'Est. Year' },
]

function StatsBar() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="bg-[var(--bg-secondary)] border-y border-[var(--border-subtle)]">
      <div className="container-eclat">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--border-subtle)]"
        >
          {STATS.map(({ value, label }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="flex flex-col items-center justify-center py-8 px-4 gap-1"
            >
              <span
                className="text-heading-lg text-[var(--accent-gold)]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {value}
              </span>
              <span className="text-label text-[var(--text-muted)] tracking-[0.2em]">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABOUT SECTION
// ═══════════════════════════════════════════════════════════════════════════════

function AboutSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="section-py-lg bg-[var(--bg-primary)]">
      <div className="container-eclat">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Image side */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            className="relative"
          >
            {/* Main image */}
            <div className="relative h-[500px] rounded-sm overflow-hidden">
              <Image
                src="/images/restaurant-story.jpg.jpg"
                alt="The Éclat Experience"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Floating accent card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="absolute -bottom-6 -right-6 bg-[var(--bg-card)] border border-[var(--border-gold)] p-6 rounded-sm shadow-[var(--shadow-elevated)]"
            >
              <div className="text-center">
                <p className="text-heading-md text-[var(--accent-gold)]" style={{ fontFamily: 'var(--font-serif)' }}>
                  Since 2020
                </p>
                <p className="text-label text-[var(--text-muted)] tracking-[0.2em] mt-1">
                  Crafting Excellence
                </p>
              </div>
            </motion.div>

            {/* Gold corner accent */}
            <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[var(--accent-gold)] opacity-60 rounded-tl-sm" />
            <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[var(--accent-gold)] opacity-60 rounded-br-sm" />
          </motion.div>

          {/* Text side */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            className="flex flex-col gap-6"
          >
            <SectionLabel text="Our Story" />
            <motion.h2 variants={fadeUp} className="text-heading-xl text-[var(--text-primary)]">
              The Éclat{' '}
              <span className="italic text-[var(--accent-gold)]">Experience</span>
            </motion.h2>
            <GoldDivider />
            <motion.p variants={fadeUp} className="text-[var(--text-secondary)] font-[var(--font-sans)] font-light leading-relaxed">
              At Éclat, we believe dining is an art form. Our master chefs craft each dish with precision,
              using only the finest ingredients sourced from around the world. Every plate that leaves
              our kitchen is a testament to our unwavering commitment to culinary excellence.
            </motion.p>
            <motion.p variants={fadeUp} className="text-[var(--text-secondary)] font-[var(--font-sans)] font-light leading-relaxed">
              Our elegant atmosphere, impeccable service, and innovative cuisine create an unforgettable
              experience for discerning guests. From intimate dinners to grand celebrations, Éclat sets
              the stage for life's most precious moments.
            </motion.p>

            {/* Feature list */}
            <motion.ul variants={stagger} className="space-y-3 mt-2">
              {[
                'Finest seasonal ingredients, locally and globally sourced',
                'Award-winning master chefs with decades of expertise',
                'Intimate ambiance crafted for unforgettable moments',
              ].map((item) => (
                <motion.li
                  key={item}
                  variants={fadeUp}
                  className="flex items-start gap-3 text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] flex-shrink-0" />
                  {item}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div variants={fadeUp} className="mt-2">
              <Link href="/about" className="btn-gold">
                Our Story
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURED DISHES
// ═══════════════════════════════════════════════════════════════════════════════

const FEATURED_DISHES = [
  {
    name: 'Garlic Bread',
    description: 'Crispy bread topped with garlic butter and herbs.',
    price: '$89',
    badge: 'Signature',
    image: '/images/whatsapp image 2025-09-12 at 5.33.24 am.jpeg',
    href: '/menu',
  },
  {
    name: 'Grilled Chicken with Herbs',
    description: 'Tender chicken breast seasoned with fresh herbs.',
    price: '$125',
    badge: 'Signature',
    image: '/images/whatsapp image 2025-09-07 at 6.27.11 am (1).jpeg',
    href: '/menu',
  },
  {
    name: 'Brownies with Ice Cream',
    description: 'Fudgy chocolate brownies served with a scoop of vanilla.',
    price: '$32',
    badge: "Chef's Pick",
    image: '/images/whatsapp image 2025-09-12 at 6.23.11 am.jpeg',
    href: '/menu',
  },
]

function DishCard({ dish, index }: { dish: typeof FEATURED_DISHES[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      transition={{ delay: index * 0.15 }}
      className="group card-eclat overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={dish.image}
          alt={dish.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Badge */}
        {dish.badge && (
          <span className="absolute top-4 right-4 badge-gold">{dish.badge}</span>
        )}
        {/* Price overlay on hover */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'rgba(10,10,10,0.5)' }}
        >
          <span className="price-tag">{dish.price}</span>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-6 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-heading-md text-[var(--text-primary)] leading-tight">{dish.name}</h3>
          <span className="price-tag flex-shrink-0">{dish.price}</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light leading-relaxed">
          {dish.description}
        </p>
        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <Link
            href={dish.href}
            className="text-label text-accent-gold tracking-[0.15em] hover:text-[var(--accent-gold-hover)] transition-colors flex items-center gap-2 group/link"
          >
            View Details
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              className="transition-transform group-hover/link:translate-x-1"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

function FeaturedDishes() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section-py bg-[var(--bg-secondary)]">
      <div className="container-eclat">
        {/* Header */}
        <motion.div
          ref={ref}
          variants={stagger}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="flex flex-col items-center text-center gap-4 mb-14"
        >
          <SectionLabel text="Culinary Artistry" />
          <motion.h2 variants={fadeUp} className="text-heading-xl text-[var(--text-primary)]">
            Signature{' '}
            <span className="italic text-[var(--accent-gold)]">Creations</span>
          </motion.h2>
          <GoldDivider />
          <motion.p variants={fadeUp} className="text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light max-w-lg">
            A taste of our culinary artistry — each dish crafted with passion, precision, and the finest ingredients.
          </motion.p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_DISHES.map((dish, i) => (
            <DishCard key={dish.name} dish={dish} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex justify-center mt-12"
        >
          <Link href="/menu" className="btn-crimson">
            View Full Menu
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERIENCE SECTION (full-width cinematic band)
// ═══════════════════════════════════════════════════════════════════════════════

function ExperienceSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])
  const inView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="relative h-[420px] overflow-hidden flex items-center justify-center">
      {/* Parallax bg */}
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        <Image
          src="/images/redd-francisco-o1sdskce8ie-unsplash.jpg"
          alt="Éclat ambiance"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-crimson)]/10 to-transparent" />
      </motion.div>

      {/* Content */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        className="relative z-10 text-center px-4 max-w-2xl mx-auto flex flex-col items-center gap-6"
      >
        <SectionLabel text="An Invitation" />
        <motion.h2 variants={fadeUp} className="text-heading-xl text-[var(--text-primary)]">
          Reserve Your{' '}
          <span className="italic text-[var(--accent-gold)]">Table Tonight</span>
        </motion.h2>
        <motion.p variants={fadeUp} className="text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light">
          Join us for an evening of unparalleled culinary artistry. Limited tables available — secure yours now.
        </motion.p>
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
          <Link href="/reservations" className="btn-crimson">
            Reserve a Table
          </Link>
          <Link href="/order" className="btn-gold">
            Order Online
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS
// ═══════════════════════════════════════════════════════════════════════════════

const TESTIMONIALS = [
  {
    quote: 'An absolute masterpiece of fine dining. Every dish was a revelation — the Grilled Chicken with Herbs was perfection on a plate.',
    author: 'Aisha Khan',
    role: 'Food Critic, Dawn Magazine',
    rating: 5,
  },
  {
    quote: 'Éclat redefined what I thought fine dining could be in this city. The atmosphere, service, and food were all flawless.',
    author: 'Tariq Mahmood',
    role: 'CEO, Prestige Group',
    rating: 5,
  },
  {
    quote: 'From the Garlic Bread to the Chocolate Lava Cake, every single course was extraordinary. We will be back.',
    author: 'Sara Ahmed',
    role: 'Lifestyle Blogger',
    rating: 5,
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-1" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="var(--accent-gold)" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function TestimonialsSection() {
  const [active, setActive] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  // Auto-rotate
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <section ref={ref} className="section-py bg-[var(--bg-primary)]">
      <div className="container-eclat">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="flex flex-col items-center text-center gap-4 mb-14"
        >
          <SectionLabel text="Guest Voices" />
          <motion.h2 variants={fadeUp} className="text-heading-xl text-[var(--text-primary)]">
            What Our Guests{' '}
            <span className="italic text-[var(--accent-gold)]">Say</span>
          </motion.h2>
          <GoldDivider />
        </motion.div>

        {/* Testimonial carousel */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="max-w-2xl mx-auto"
        >
          <div className="relative min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-sm p-8 flex flex-col gap-5"
              >
                {/* Quote mark */}
                <svg width="32" height="24" viewBox="0 0 32 24" fill="none" aria-hidden="true">
                  <path d="M0 24V14.4C0 6.4 4.8 1.6 14.4 0l1.6 2.4C10.4 3.6 7.6 6.4 7.2 10.4H12V24H0zm20 0V14.4C20 6.4 24.8 1.6 34.4 0L36 2.4C30.4 3.6 27.6 6.4 27.2 10.4H32V24H20z"
                    fill="var(--accent-gold)" fillOpacity="0.3" />
                </svg>
                <p className="text-[var(--text-secondary)] font-[var(--font-sans)] font-light leading-relaxed text-base italic">
                  "{TESTIMONIALS[active].quote}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--text-primary)] font-[var(--font-sans)] font-medium text-sm">
                      {TESTIMONIALS[active].author}
                    </p>
                    <p className="text-[var(--text-muted)] font-[var(--font-sans)] text-xs mt-0.5">
                      {TESTIMONIALS[active].role}
                    </p>
                  </div>
                  <StarRating count={TESTIMONIALS[active].rating} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Testimonial ${i + 1}`}
                className={[
                  'rounded-full transition-all duration-300',
                  i === active
                    ? 'w-6 h-1.5 bg-[var(--accent-gold)]'
                    : 'w-1.5 h-1.5 bg-[var(--border-default)] hover:bg-[var(--accent-gold-hover)]',
                ].join(' ')}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEWSLETTER SECTION
// ═══════════════════════════════════════════════════════════════════════════════

function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

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
    <section ref={ref} className="section-py bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)]">
      <div className="container-eclat">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="max-w-xl mx-auto flex flex-col items-center text-center gap-6"
        >
          <SectionLabel text="Stay Connected" />
          <motion.h2 variants={fadeUp} className="text-heading-lg text-[var(--text-primary)]">
            Join the Éclat{' '}
            <span className="italic text-[var(--accent-gold)]">Inner Circle</span>
          </motion.h2>
          <GoldDivider />
          <motion.p variants={fadeUp} className="text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light leading-relaxed">
            Subscribe for exclusive menus, private events, and culinary stories delivered straight to your inbox.
          </motion.p>

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 text-[var(--accent-gold)] bg-[var(--accent-gold-muted)] border border-[var(--border-gold)] px-6 py-4 rounded-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-sm font-[var(--font-sans)]">You're on the list. Welcome to Éclat.</span>
            </motion.div>
          ) : (
            <motion.form
              variants={fadeUp}
              onSubmit={handleSubmit}
              className="flex w-full gap-3"
              noValidate
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input-eclat flex-1"
                aria-label="Email for newsletter"
                disabled={status === 'loading'}
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
            <p className="text-xs text-red-400 font-[var(--font-sans)]">
              Something went wrong. Please try again.
            </p>
          )}
          <motion.p variants={fadeUp} className="text-xs text-[var(--text-muted)] font-[var(--font-sans)]">
            No spam, ever. Unsubscribe anytime.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <StatsBar />
      <AboutSection />
      <FeaturedDishes />
      <ExperienceSection />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  )
}