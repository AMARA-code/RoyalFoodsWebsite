'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Images,
  Users,
  UserCircle,
  Settings,
  BookOpen,
  ShoppingBag,
  CalendarDays,
  BarChart3,
  LogOut,
  Menu as MenuIcon,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: UserCircle },
  { href: '/admin/reservations', label: 'Reservations', icon: CalendarDays },
  { href: '/admin/menu', label: 'Menu Manager', icon: UtensilsCrossed },
  { href: '/admin/gallery', label: 'Gallery', icon: Images },
  { href: '/admin/chefs', label: 'Team', icon: Users },
  { href: '/admin/blog', label: 'Blog & Events', icon: BookOpen },
  { href: '/admin/revenue', label: 'Revenue', icon: BarChart3 },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/admin/login')
      } else {
        setAdminEmail(session.user.email ?? '')
        setLoading(false)
      }
    })
  }, [pathname])

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent-gold)', borderTopColor: 'transparent' }} />
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
            AUTHENTICATING
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: '260px',
          minWidth: '260px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid rgba(201,168,76,0.12)',
          transition: 'transform 0.3s',
        }}
      >
        {/* Logo area */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.12)', flexShrink: 0 }}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                letterSpacing: '0.12em',
                color: 'var(--accent-gold)',
                lineHeight: 1,
              }}
            >
              ÉCLAT
            </p>
            <p
              style={{
                fontSize: '0.62rem',
                letterSpacing: '0.18em',
                color: 'var(--text-secondary)',
                marginTop: '2px',
              }}
            >
              ADMIN PANEL
            </p>
          </div>
          <button
            className="lg:hidden p-1"
            onClick={() => setSidebarOpen(false)}
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav — scrolls independently */}
        <nav style={{ flex: 1, overflowY: 'auto', paddingTop: '1rem', paddingBottom: '1rem' }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-all duration-200"
                style={{
                  background: active ? 'rgba(201,168,76,0.1)' : 'transparent',
                  borderLeft: active ? '2px solid var(--accent-gold)' : '2px solid transparent',
                  color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  letterSpacing: '0.06em',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User + logout */}
        <div
          className="px-6 py-4"
          style={{ borderTop: '1px solid rgba(201,168,76,0.12)', flexShrink: 0 }}
        >
          <p
            className="truncate mb-3"
            style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}
          >
            {adminEmail}
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left transition-colors duration-200"
            style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-crimson)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main — scrolls independently */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Top bar */}
        <header
          className="flex items-center gap-4 px-6 py-4"
          style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid rgba(201,168,76,0.12)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          <button
            className="lg:hidden p-1"
            onClick={() => setSidebarOpen(true)}
            style={{ color: 'var(--text-secondary)' }}
          >
            <MenuIcon size={20} />
          </button>
          <div
            className="flex items-center gap-2"
            style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', letterSpacing: '0.08em' }}
          >
            {NAV_ITEMS.find(n => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label ?? 'Dashboard'}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '1.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  )
}