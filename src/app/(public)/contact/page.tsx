'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  type Variants,
} from 'framer-motion'

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

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7 } },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13 } },
}

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: EASE },
  },
}

const slideRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: EASE },
  },
}

// ─── Opening Hours Data ───────────────────────────────────────────────────────

const HOURS = [
  { day: 'Monday',    open: '5:00 PM', close: '11:00 PM', closed: false },
  { day: 'Tuesday',   open: '5:00 PM', close: '11:00 PM', closed: false },
  { day: 'Wednesday', open: '5:00 PM', close: '11:00 PM', closed: false },
  { day: 'Thursday',  open: '5:00 PM', close: '11:00 PM', closed: false },
  { day: 'Friday',    open: '5:00 PM', close: '11:00 PM', closed: false },
  { day: 'Saturday',  open: '5:00 PM', close: '11:00 PM', closed: false },
  { day: 'Sunday',    open: '5:00 PM', close: '10:00 PM', closed: false },
]

// ─── Gold Divider ─────────────────────────────────────────────────────────────

function GoldDivider({ align = 'center' }: { align?: 'left' | 'center' }) {
  return (
    <div className={`flex items-center gap-3 my-4 ${align === 'left' ? '' : 'justify-center'}`}>
      <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--accent-gold)]" />
      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
      <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--accent-gold)]" />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════════════════

function ContactHero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={ref} className="relative h-[55vh] min-h-[420px] overflow-hidden flex items-center justify-center">
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        <Image
          src="/images/mitili-mitili-vbxpits5isw-unsplash.jpg"
          alt="Contact Éclat"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-[var(--bg-primary)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 text-center px-4">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="flex flex-col items-center gap-5"
        >
          <motion.span variants={fadeUp} className="text-label text-accent-gold tracking-[0.35em]">
            Get In Touch
          </motion.span>
          <motion.div variants={fadeIn} className="divider-gold" />
          <motion.h1 variants={fadeUp} className="text-display text-[var(--text-primary)]">
            Connect{' '}
            <span className="italic text-[var(--accent-gold)]">With Us</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light tracking-widest max-w-md">
            We'd love to hear from you — reservations, enquiries, or simply a conversation
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT INFO CARDS
// ═══════════════════════════════════════════════════════════════════════════════

function LocationIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 4.18 2 2 0 015 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

const INFO_CARDS = [
  {
    icon: <LocationIcon />,
    label: 'Location',
    lines: ['123 Luxury Avenue', 'Prestige District'],
    href: 'https://maps.google.com',
    linkLabel: 'Get Directions',
  },
  {
    icon: <PhoneIcon />,
    label: 'Reservations',
    lines: ['+92 300 0000000', 'reservations@eclat.com'],
    href: 'tel:+923000000000',
    linkLabel: 'Call Now',
  },
  {
    icon: <MailIcon />,
    label: 'Email Us',
    lines: ['reservations@eclat.com', 'info@eclat.com'],
    href: 'mailto:reservations@eclat.com',
    linkLabel: 'Send Email',
  },
  {
    icon: <ClockIcon />,
    label: 'Hours',
    lines: ['Mon – Sat: 5:00 PM – 11:00 PM', 'Sunday: 5:00 PM – 10:00 PM'],
    href: '#hours',
    linkLabel: 'View Full Hours',
  },
]

function InfoCards() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
      <div className="container-eclat py-0">
        <motion.div
          ref={ref}
          variants={stagger}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-subtle)]"
        >
          {INFO_CARDS.map(({ icon, label, lines, href, linkLabel }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="flex flex-col gap-4 p-8 group"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-sm border border-[var(--border-gold)] flex items-center justify-center text-[var(--accent-gold)] group-hover:bg-[var(--accent-gold-muted)] transition-colors duration-300">
                {icon}
              </div>
              {/* Label */}
              <p className="text-label text-[var(--text-muted)] tracking-[0.2em]">{label}</p>
              {/* Lines */}
              <div className="space-y-1">
                {lines.map((line, i) => (
                  <p key={i} className="text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light">
                    {line}
                  </p>
                ))}
              </div>
              {/* Link */}
              <a
                href={href}
                className="inline-flex items-center gap-2 text-label text-accent-gold tracking-[0.15em] hover:gap-3 transition-all duration-200 mt-auto"
              >
                {linkLabel}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT FORM
// ═══════════════════════════════════════════════════════════════════════════════

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

interface FormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

function ContactForm() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', subject: '', message: '',
  })
  const [status, setStatus] = useState<FormStatus>('idle')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      // Send to your send-email API route (Phase 3 wires Resend)
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          ...form,
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <motion.div
      ref={ref}
      variants={slideRight}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className="flex flex-col gap-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-3">
        <span className="text-label text-accent-gold tracking-[0.3em]">Send a Message</span>
        <h2 className="text-heading-lg text-[var(--text-primary)]">
          We'd Love to{' '}
          <span className="italic text-[var(--accent-gold)]">Hear from You</span>
        </h2>
        <GoldDivider align="left" />
        <p className="text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light leading-relaxed">
          Whether it's a special occasion, a private dining enquiry, or feedback — our team responds within 24 hours.
        </p>
      </div>

      {/* Success */}
      {status === 'success' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 py-12 text-center bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-sm"
        >
          <div className="w-12 h-12 rounded-full border border-[var(--accent-gold)] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p className="text-heading-md text-[var(--text-primary)] mb-1">Message Sent</p>
            <p className="text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light">
              Thank you. We'll be in touch within 24 hours.
            </p>
          </div>
          <button
            onClick={() => setStatus('idle')}
            className="btn-gold !py-2 !px-5 !text-[0.65rem] mt-2"
          >
            Send Another
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-label text-[var(--text-secondary)] tracking-[0.15em]">
                Full Name <span className="text-[var(--accent-crimson-light)]">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="input-eclat"
                disabled={status === 'loading'}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-label text-[var(--text-secondary)] tracking-[0.15em]">
                Email Address <span className="text-[var(--accent-crimson-light)]">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="input-eclat"
                disabled={status === 'loading'}
              />
            </div>
          </div>

          {/* Phone + Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-label text-[var(--text-secondary)] tracking-[0.15em]">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+92 300 0000000"
                className="input-eclat"
                disabled={status === 'loading'}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="subject" className="text-label text-[var(--text-secondary)] tracking-[0.15em]">
                Subject <span className="text-[var(--accent-crimson-light)]">*</span>
              </label>
              <select
                id="subject"
                name="subject"
                required
                value={form.subject}
                onChange={handleChange}
                className="input-eclat"
                disabled={status === 'loading'}
              >
                <option value="" disabled>Select a subject…</option>
                <option value="Reservation Enquiry">Reservation Enquiry</option>
                <option value="Private Dining">Private Dining</option>
                <option value="Event Catering">Event Catering</option>
                <option value="Feedback">Feedback</option>
                <option value="General Enquiry">General Enquiry</option>
              </select>
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-label text-[var(--text-secondary)] tracking-[0.15em]">
              Message <span className="text-[var(--accent-crimson-light)]">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us how we can help…"
              className="input-eclat resize-none"
              disabled={status === 'loading'}
            />
          </div>

          {/* Error */}
          {status === 'error' && (
            <p className="text-xs text-red-400 font-[var(--font-sans)]">
              Something went wrong. Please try again or email us directly.
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-crimson disabled:opacity-50 w-full sm:w-auto"
          >
            {status === 'loading' ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                </svg>
                Sending…
              </span>
            ) : 'Send Message'}
          </button>
        </form>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOURS TABLE
// ═══════════════════════════════════════════════════════════════════════════════

function HoursTable() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      variants={slideLeft}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className="flex flex-col gap-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-3">
        <span className="text-label text-accent-gold tracking-[0.3em]">Opening Hours</span>
        <h2 className="text-heading-lg text-[var(--text-primary)]">
          When to{' '}
          <span className="italic text-[var(--accent-gold)]">Visit Us</span>
        </h2>
        <GoldDivider align="left" />
      </div>

      {/* Hours list */}
      <div
        id="hours"
        className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-sm overflow-hidden"
      >
        {HOURS.map(({ day, open, close, closed }, i) => {
          const isToday = day === today
          return (
            <div
              key={day}
              className={[
                'flex items-center justify-between px-6 py-4 transition-colors duration-200',
                i !== HOURS.length - 1 ? 'border-b border-[var(--border-subtle)]' : '',
                isToday ? 'bg-[var(--accent-gold-muted)]' : 'hover:bg-[var(--bg-elevated)]',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] flex-shrink-0" aria-hidden="true" />
                )}
                <span className={[
                  'font-[var(--font-sans)] text-sm',
                  isToday ? 'text-[var(--accent-gold)] font-medium' : 'text-[var(--text-secondary)] font-light',
                ].join(' ')}>
                  {day}
                  {isToday && (
                    <span className="ml-2 text-label text-[var(--accent-gold)] tracking-[0.1em]">(Today)</span>
                  )}
                </span>
              </div>
              <span className={[
                'font-[var(--font-sans)] text-sm',
                closed ? 'text-[var(--text-muted)]' : isToday ? 'text-[var(--accent-gold)]' : 'text-[var(--text-primary)]',
              ].join(' ')}>
                {closed ? 'Closed' : `${open} – ${close}`}
              </span>
            </div>
          )
        })}
      </div>

      {/* Reserve CTA */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-sm p-6 flex flex-col gap-4">
        {/* Gold accent top */}
        <div className="h-px bg-gradient-to-r from-[var(--accent-gold)] via-[var(--accent-gold-hover)] to-transparent" />
        <p className="text-label text-[var(--text-muted)] tracking-[0.2em]">Ready to Dine?</p>
        <p className="text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light leading-relaxed">
          Secure your table for an unforgettable evening at Éclat. For parties larger than 8, please call us directly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/reservations" className="btn-crimson !py-2.5 !text-[0.65rem]">
            Reserve a Table
          </Link>
          <Link href="/order" className="btn-gold !py-2.5 !text-[0.65rem]">
            Order Online
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAP SECTION
// ═══════════════════════════════════════════════════════════════════════════════

function MapSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="section-py bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)]">
      <div className="container-eclat">
        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="flex flex-col items-center text-center gap-4 mb-10"
        >
          <motion.span variants={fadeUp} className="text-label text-accent-gold tracking-[0.3em]">
            Find Us
          </motion.span>
          <motion.h2 variants={fadeUp} className="text-heading-xl text-[var(--text-primary)]">
            Our{' '}
            <span className="italic text-[var(--accent-gold)]">Location</span>
          </motion.h2>
          <GoldDivider />
          <motion.p variants={fadeUp} className="text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light">
            123 Luxury Avenue, Prestige District
          </motion.p>
        </motion.div>

        {/* Map placeholder — replace with real Google Maps embed in Phase 5 admin settings */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="relative rounded-sm overflow-hidden border border-[var(--border-subtle)] shadow-[var(--shadow-elevated)]"
          style={{ height: '420px' }}
        >
          {/* Gold top accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-gold)] to-transparent z-10 opacity-70" />

          {/* Decorative grid background */}
          <div
            className="absolute inset-0 bg-[var(--bg-elevated)]"
            style={{
              backgroundImage: `
                linear-gradient(var(--border-subtle) 1px, transparent 1px),
                linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Subtle radial glow */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)',
            }}
          />

          {/* Center pin */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
            {/* Animated pin */}
            <div className="relative flex items-center justify-center">
              {/* Pulse rings */}
              <div className="absolute w-20 h-20 rounded-full border border-[var(--accent-gold)]/20 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute w-14 h-14 rounded-full border border-[var(--accent-gold)]/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
              {/* Pin circle */}
              <div className="w-10 h-10 rounded-full bg-[var(--accent-crimson)] border-2 border-[var(--accent-gold)] flex items-center justify-center shadow-[0_0_24px_rgba(139,0,0,0.5)] z-10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" fill="var(--accent-crimson)" />
                </svg>
              </div>
            </div>

            {/* Address card */}
            <div className="bg-[var(--bg-card)]/95 backdrop-blur-sm border border-[var(--border-gold)] rounded-sm px-8 py-5 flex flex-col items-center gap-3 shadow-[var(--shadow-elevated)] max-w-sm text-center">
              <p className="text-heading-md text-[var(--text-primary)]">Éclat Fine Dining</p>
              <div className="divider-gold" />
              <p className="text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light leading-relaxed">
                123 Luxury Avenue<br />Prestige District
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold !py-2 !px-5 !text-[0.65rem] mt-1"
              >
                Open in Google Maps
              </a>
            </div>

          
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOCIAL STRIP
// ═══════════════════════════════════════════════════════════════════════════════

function SocialStrip() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="py-12 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
      <div className="container-eclat">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <motion.div variants={fadeUp} className="text-center sm:text-left">
            <p className="text-label text-[var(--text-muted)] tracking-[0.2em]">Follow Our Journey</p>
            <p className="text-heading-md text-[var(--text-primary)] mt-1">
              @eclat_dining
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex gap-4">
            {[
              { label: 'Instagram', href: '#', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                </svg>
              )},
              { label: 'Facebook', href: '#', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              )},
              { label: 'Twitter / X', href: '#', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              )},
            ].map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-11 h-11 flex items-center justify-center border border-[var(--border-subtle)] hover:border-[var(--border-gold)] text-[var(--text-muted)] hover:text-[var(--accent-gold)] rounded-sm transition-all duration-200"
              >
                {icon}
              </a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <InfoCards />

      {/* Main content: Form + Hours side by side */}
      <section className="section-py bg-[var(--bg-primary)]">
        <div className="container-eclat">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <HoursTable />
            <ContactForm />
          </div>
        </div>
      </section>

      <MapSection />
      <SocialStrip />
    </>
  )
}