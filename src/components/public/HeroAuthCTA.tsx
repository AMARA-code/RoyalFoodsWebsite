'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

/**
 * Drop this inside the homepage hero CTA button group.
 * Shows "Sign In" when logged out, or a greeting + "My Orders" when signed in.
 *
 * Usage in page.tsx hero:
 *   <HeroAuthCTA />
 */
export default function HeroAuthCTA() {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return null

  if (user) {
    const firstName = (user.user_metadata?.full_name || user.email || '').split(' ')[0]
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <span className="text-[var(--text-muted)] text-sm tracking-wide">
          Welcome back,{' '}
          <span className="text-[var(--accent-gold)]">{firstName}</span>
        </span>
        {isAdmin ? (
          <Link href="/admin" className="btn-gold !py-2.5 !px-6 !text-[0.65rem]">
            Admin Dashboard
          </Link>
        ) : (
          <Link href="/order" className="btn-outline !py-2.5 !px-6 !text-[0.65rem]">
            My Orders
          </Link>
        )}
      </div>
    )
  }

  return (
    <Link
      href="/signin"
      className="btn-outline !py-3 !px-8 !text-[0.7rem] group"
    >
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        className="mr-2 group-hover:translate-x-0.5 transition-transform"
        aria-hidden="true"
      >
        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </svg>
      Sign In to Your Account
    </Link>
  )
}