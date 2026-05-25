'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

const NAV_LINKS = [
  { href: '/',        label: 'Home' },
  { href: '/menu',    label: 'Menu' },
  { href: '/about',   label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/blog',    label: 'Events' },
  { href: '/contact', label: 'Contact' },
]

function Logo() {
  return (
    <Link href="/" className="flex flex-col leading-none group" aria-label="Éclat — home">
      <span
        className="text-heading-md text-[var(--text-primary)] tracking-[0.1em] group-hover:text-[var(--accent-gold)] transition-colors duration-300"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        Éclat
      </span>
      <span className="text-label text-[var(--text-muted)] tracking-[0.25em] mt-0.5">Fine Dining</span>
    </Link>
  )
}

function CartIcon({ count = 0, onClick }: { count?: number; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={`Cart — ${count} item${count !== 1 ? 's' : ''}`}
      className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors duration-200"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center rounded-full bg-[var(--accent-crimson)] text-white text-[0.55rem] font-bold font-[var(--font-sans)]">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}

function UserMenu({ isAdmin }: { isAdmin: boolean }) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'
  const initials = displayName.slice(0, 2).toUpperCase()

  async function handleSignOut() {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 group"
        aria-label="Account menu"
        aria-expanded={open}
      >
        <span className="w-8 h-8 rounded-full bg-[var(--accent-crimson)]/20 border border-[var(--accent-crimson)]/40 flex items-center justify-center text-[var(--accent-gold)] text-[0.6rem] font-bold tracking-wider group-hover:border-[var(--accent-gold)]/60 transition-colors">
          {initials}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-full mt-2 w-52 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded shadow-xl z-40 py-1 animate-fade-in">
            <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
              <p className="text-[var(--text-primary)] text-sm font-medium truncate">{displayName}</p>
              <p className="text-[var(--text-muted)] text-xs truncate">{user?.email}</p>
            </div>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors text-xs tracking-wider"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Admin Dashboard
              </Link>
            )}

            <Link
              href="/order"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors text-xs tracking-wider"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              My Orders
            </Link>

            <div className="border-t border-[var(--border-subtle)] mt-1" />

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[var(--text-muted)] hover:text-[var(--accent-crimson)] hover:bg-[var(--accent-crimson)]/5 transition-colors text-xs tracking-wider"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function MenuToggle({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        {isOpen ? (
          <>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </>
        ) : (
          <>
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </>
        )}
      </svg>
    </button>
  )
}

interface NavbarProps {
  cartCount?: number
  onCartClick?: () => void
}

export default function Navbar({ cartCount = 0, onCartClick }: NavbarProps) {
  const pathname = usePathname()
  const { user, loading, isAdmin } = useAuth()
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 60) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setMobileOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isActive = useCallback(
    (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/'),
    [pathname]
  )

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 z-40 transition-all duration-500',
          scrolled
            ? 'bg-[var(--bg-primary)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] py-3'
            : 'bg-transparent py-5',
        ].join(' ')}
      >
        <nav className="container-eclat flex items-center justify-between" aria-label="Main navigation">
          <Logo />

          <ul className="hidden lg:flex items-center gap-8" role="list">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    'text-label tracking-[0.2em] transition-colors duration-200 relative',
                    'after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-[var(--accent-gold)]',
                    'after:transition-all after:duration-300',
                    isActive(href)
                      ? 'text-[var(--accent-gold)] after:w-full'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] after:w-0 hover:after:w-full',
                  ].join(' ')}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop right — cart · dashboard (admin only) · auth */}
          <div className="hidden lg:flex items-center gap-4">
            <CartIcon count={cartCount} onClick={onCartClick} />

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[0.6rem] tracking-widest font-semibold bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 hover:bg-[var(--accent-gold)]/20 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                DASHBOARD
              </Link>
            )}

            {!loading && (
              user ? (
                <UserMenu isAdmin={isAdmin} />
              ) : (
                <Link href="/signin" className="btn-outline !py-2.5 !px-5 !text-[0.65rem]">
                  Sign In
                </Link>
              )
            )}
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <CartIcon count={cartCount} onClick={onCartClick} />
            <MenuToggle isOpen={mobileOpen} onClick={() => setMobileOpen(v => !v)} />
          </div>
        </nav>
      </header>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)] flex flex-col animate-fade-in-up lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            style={{ animationDuration: '0.2s' }}
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
              <Logo />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {!loading && user && (
              <div className="px-6 py-4 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-[var(--accent-crimson)]/20 border border-[var(--accent-crimson)]/30 flex items-center justify-center text-[var(--accent-gold)] text-[0.65rem] font-bold">
                    {(user.user_metadata?.full_name || user.email || '?').slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[var(--text-primary)] text-xs font-medium truncate">
                      {user.user_metadata?.full_name || 'Account'}
                    </p>
                    <p className="text-[var(--text-muted)] text-[0.65rem] truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto p-6" aria-label="Mobile menu">
              <ul className="space-y-1" role="list">
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={[
                        'flex items-center gap-3 px-4 py-3 rounded-sm',
                        'text-label tracking-[0.2em] transition-colors duration-200',
                        isActive(href)
                          ? 'text-[var(--accent-gold)] bg-[var(--accent-gold-muted)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
                      ].join(' ')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}

                {isAdmin && (
                  <li>
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-3 rounded-sm text-label tracking-[0.2em] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      Admin Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            {/* Mobile drawer CTA */}
            <div className="p-6 border-t border-[var(--border-subtle)] space-y-3">
              {!loading && !user ? (
                <>
                  <Link href="/signup" className="btn-outline w-full justify-center !py-3 !text-[0.65rem]">
                    Create Account
                  </Link>
                  <Link href="/signin" className="btn-crimson w-full justify-center !py-3 !text-[0.65rem]">
                    Sign In
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => { setMobileOpen(false); onCartClick?.() }}
                  className="btn-outline w-full justify-center !py-3 !text-[0.65rem]"
                >
                  View Cart {cartCount > 0 && `(${cartCount})`}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}