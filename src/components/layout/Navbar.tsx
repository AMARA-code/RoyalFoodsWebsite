'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, User } from 'lucide-react'
import Logo from '@/components/brand/Logo'
import AnnouncementTicker from '@/components/layout/AnnouncementTicker'
import { useAuth } from '@/hooks/useAuth'
import { usePublicSettings } from '@/hooks/usePublicSettings'

interface NavbarProps {
  cartCount?: number
  onCartClick?: () => void
}

export default function Navbar({ cartCount = 0, onCartClick }: NavbarProps) {
  const router = useRouter()
  const { user, loading, isAdmin, signOut } = useAuth()
  const { settings } = usePublicSettings()
  const [userOpen, setUserOpen] = useState(false)

  const showAnnouncement =
    settings.announcement.enabled && Boolean(settings.announcement.text?.trim())

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      {showAnnouncement && (
        <AnnouncementTicker text={settings.announcement.text.trim()} />
      )}

      <nav
        className="max-w-6xl mx-auto px-3 sm:px-4 flex items-center justify-between h-[var(--rf-header-nav-h)] gap-2"
        aria-label="Main navigation"
      >
        <Logo size={32} showSubtitle={false} />

        <div className="flex-1" aria-hidden="true" />

        <div className="flex items-center gap-1 shrink-0">
          {!loading &&
            (user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserOpen((v) => !v)}
                  className="p-2 rounded-lg hover:bg-gray-50 text-[#1A2238]"
                  aria-label="Account menu"
                >
                  <User size={20} />
                </button>
                {userOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 text-sm">
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2.5 hover:bg-gray-50 font-medium text-[#D62828]"
                          onClick={() => setUserOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        href="/order/my-orders"
                        className="block px-4 py-2.5 hover:bg-gray-50 text-[#1A2238]"
                        onClick={() => setUserOpen(false)}
                      >
                        My Orders
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          await signOut()
                          setUserOpen(false)
                          router.push('/')
                        }}
                        className="block w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-500"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="px-2.5 py-1.5 rounded-lg bg-[#D62828]/10 text-[#D62828] text-xs font-bold hover:bg-[#D62828]/20 transition-colors"
              >
                Sign In
              </Link>
            ))}

          <button
            type="button"
            onClick={onCartClick}
            className="relative p-2 rounded-lg hover:bg-gray-50"
            aria-label={`Cart — ${cartCount} items`}
          >
            <ShoppingBag size={22} className="text-[#D62828]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#D62828] text-white text-[10px] font-bold">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  )
}
