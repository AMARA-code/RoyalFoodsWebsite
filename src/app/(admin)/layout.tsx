'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Settings,
  ShoppingBag,
  Users,
  LogOut,
  Menu as MenuIcon,
  X,
  Loader2,
} from 'lucide-react'

const ADMIN_EMAIL = 'amaranaeem453@gmail.com'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
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
        router.replace('/signin?redirect=/admin')
      } else if (session.user.email !== ADMIN_EMAIL) {
        router.replace('/')
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
    router.replace('/signin')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <Loader2 size={28} className="animate-spin text-[#D62828]" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF7F2]">
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
        className={`fixed top-0 left-0 z-30 lg:static lg:translate-x-0 h-screen w-[240px] min-w-[240px] flex flex-col bg-white border-r border-gray-200 transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-sm font-bold text-[#D62828]">Royal Foods</p>
            <p className="text-[10px] tracking-wide text-gray-400 uppercase">Admin</p>
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
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-5 py-2.5 mx-2 rounded-lg text-sm transition-colors no-underline ${
                  active
                    ? 'bg-[#D62828]/10 text-[#D62828] font-medium border-l-2 border-[#D62828]'
                    : 'text-gray-500 hover:bg-gray-50 border-l-2 border-transparent'
                }`}
              >
                <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <p className="truncate mb-3 text-xs text-gray-400">{adminEmail}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left text-sm text-gray-500 hover:text-[#D62828] transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 bg-white border-b border-gray-200 shrink-0">
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