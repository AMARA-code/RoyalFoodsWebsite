'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// ─── Social Icons ─────────────────────────────────────────────────────────────

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
    </svg>
  )
}

function TiktokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
    </svg>
  )
}

// ─── Link Groups ──────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: '/menu',         label: 'Our Menu' },
  { href: '/reservations', label: 'Reserve a Table' },
  { href: '/gallery',      label: 'Gallery' },
  { href: '/about',        label: 'Our Story' },
  { href: '/contact',      label: 'Contact Us' },
]

// ─── Newsletter ───────────────────────────────────────────────────────────────

function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')

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
      setMsg("You're on the list.")
      setEmail('')
    } catch {
      setStatus('error')
      setMsg('Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 py-3">
        <div className="w-5 h-5 border border-[var(--accent-gold)] flex items-center justify-center flex-shrink-0">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--accent-gold)', fontSize: 13, fontWeight: 300, letterSpacing: '0.05em' }}>
          {msg}
        </span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="relative flex items-stretch">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === 'loading'}
          aria-label="Email for newsletter"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            letterSpacing: '0.05em',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRight: 'none',
            color: 'white',
            padding: '11px 14px',
            outline: 'none',
            flex: 1,
            minWidth: 0,
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 9,
            letterSpacing: '0.3em',
            background: 'var(--accent-gold)',
            color: '#0a0a0a',
            border: 'none',
            padding: '11px 16px',
            cursor: 'pointer',
            fontWeight: 600,
            textTransform: 'uppercase',
            flexShrink: 0,
            opacity: status === 'loading' ? 0.6 : 1,
          }}
        >
          {status === 'loading' ? '…' : 'Join'}
        </button>
      </div>
      {status === 'error' && (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#f87171', marginTop: 6, fontWeight: 300 }}>{msg}</p>
      )}
    </form>
  )
}

// ─── Footer Component ─────────────────────────────────────────────────────────

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      aria-label="Site footer"
      style={{ background: '#080808', borderTop: '1px solid rgba(255,255,255,0.04)' }}
    >

      {/* ── TOP ACCENT LINE ── */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--accent-gold) 30%, var(--accent-crimson) 70%, transparent)' }} />

      {/* ── MAIN FOOTER BODY ── */}
      <div className="container-eclat" style={{ paddingTop: 72, paddingBottom: 56 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.3fr', gap: 48, alignItems: 'start' }}>

          {/* ── COL 1: BRAND ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Wordmark */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 42,
                  fontWeight: 300,
                  color: 'white',
                  lineHeight: 1,
                  letterSpacing: '-0.01em',
                  marginBottom: 4,
                }}
              >
                Éclat
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 20, height: 1, background: 'var(--accent-gold)' }} />
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 9,
                  letterSpacing: '0.35em',
                  color: 'var(--accent-gold)',
                  textTransform: 'uppercase',
                }}>
                  Fine Dining · Est. 2020
                </span>
              </div>
            </div>

            {/* Tagline quote */}
            <blockquote style={{ borderLeft: '1px solid rgba(201,168,76,0.3)', paddingLeft: 14, margin: 0 }}>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.7,
                margin: 0,
              }}>
                "Where every detail is composed<br />with obsessive intention."
              </p>
            </blockquote>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Instagram', icon: <InstagramIcon />, href: '#' },
                { label: 'Facebook',  icon: <FacebookIcon />,  href: '#' },
                { label: 'TikTok',    icon: <TiktokIcon />,    href: '#' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    width: 36,
                    height: 36,
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.4)',
                    transition: 'all 0.25s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.borderColor = 'var(--accent-gold)'
                    el.style.color = 'var(--accent-gold)'
                    el.style.background = 'rgba(201,168,76,0.06)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.borderColor = 'rgba(255,255,255,0.1)'
                    el.style.color = 'rgba(255,255,255,0.4)'
                    el.style.background = 'transparent'
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── COL 2: NAV ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 16, height: 1, background: 'var(--accent-gold)' }} />
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 9,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'var(--accent-gold)',
              }}>
                Navigate
              </span>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      fontWeight: 300,
                      color: 'rgba(255,255,255,0.45)',
                      textDecoration: 'none',
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.9)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)' }}
                  >
                    <span style={{ width: 14, height: 1, background: 'rgba(201,168,76,0.4)', flexShrink: 0, display: 'inline-block' }} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── COL 3: CONTACT ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 16, height: 1, background: 'var(--accent-gold)' }} />
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 9,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'var(--accent-gold)',
              }}>
                Find Us
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Address */}
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, margin: 0 }}>
                  123 Luxury Avenue<br />Prestige District
                </p>
              </div>

              {/* Phone & Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  {
                    href: 'tel:+923000000000',
                    text: '+92 300 0000000',
                    icon: (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 4.18 2 2 0 015 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                    ),
                  },
                  {
                    href: 'mailto:reservations@eclat.com',
                    text: 'reservations@eclat.com',
                    icon: (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    ),
                  },
                ].map(({ href, text, icon }) => (
                  <a
                    key={href}
                    href={href}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 12,
                      fontWeight: 300,
                      color: 'rgba(255,255,255,0.4)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      letterSpacing: '0.03em',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-gold)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)' }}
                  >
                    <span style={{ color: 'rgba(201,168,76,0.5)', flexShrink: 0 }}>{icon}</span>
                    {text}
                  </a>
                ))}
              </div>

              {/* Hours */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 8,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: 'rgba(201,168,76,0.6)',
                  marginBottom: 8,
                }}>
                  Hours
                </p>
                {[
                  'Mon – Sat · 5:00 PM – 11:00 PM',
                  'Sunday · 5:00 PM – 10:00 PM',
                ].map(h => (
                  <p key={h} style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.35)', margin: '0 0 4px', letterSpacing: '0.02em' }}>
                    {h}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* ── COL 4: NEWSLETTER ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 16, height: 1, background: 'var(--accent-gold)' }} />
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 9,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'var(--accent-gold)',
              }}>
                Stay Connected
              </span>
            </div>

            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: 300,
              color: 'rgba(255,255,255,0.4)',
              lineHeight: 1.75,
              marginBottom: 20,
            }}>
              Exclusive menus, private events, and culinary stories — delivered to your inbox.
            </p>

            <NewsletterForm />

            {/* Reserve CTA */}
            <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.25)',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}>
                Ready for an evening?
              </p>
              <Link
                href="/reservations"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 9,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-gold)',
                  textDecoration: 'none',
                  border: '1px solid rgba(201,168,76,0.3)',
                  padding: '10px 20px',
                  display: 'inline-block',
                  transition: 'all 0.25s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'rgba(201,168,76,0.08)'
                  el.style.borderColor = 'var(--accent-gold)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'transparent'
                  el.style.borderColor = 'rgba(201,168,76,0.3)'
                }}
              >
                Reserve a Table →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container-eclat" style={{ paddingTop: 20, paddingBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>

            {/* Left — copyright */}
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              color: 'rgba(255,255,255,0.2)',
              fontWeight: 300,
              letterSpacing: '0.05em',
              margin: 0,
            }}>
              © {year} Éclat Fine Dining. All rights reserved.
            </p>

            {/* Center — ornament */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(201,168,76,0.2)' }}>
              <div style={{ width: 40, height: 1, background: 'rgba(201,168,76,0.15)' }} />
              <span style={{ fontSize: 10 }}>✦</span>
              <div style={{ width: 40, height: 1, background: 'rgba(201,168,76,0.15)' }} />
            </div>

            {/* Right — legal links */}
            <div style={{ display: 'flex', gap: 24 }}>
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms',   label: 'Terms' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.2)',
                    textDecoration: 'none',
                    letterSpacing: '0.05em',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.2)' }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

    </footer>
  )
}