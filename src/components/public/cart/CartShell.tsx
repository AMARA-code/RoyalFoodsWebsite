'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/public/cart/CartDrawer'
import StickyCartBar from '@/components/public/cart/StickyCartBar'
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister'
import InstallPrompt from '@/components/pwa/InstallPrompt'
import NotificationPrompt from '@/components/pwa/NotificationPrompt'
import { useCartStore, selectCartItemCount } from '@/store/cartStore'
import { usePublicSettings } from '@/hooks/usePublicSettings'

export default function CartShell({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false)
  const itemCount = useCartStore(selectCartItemCount)
  const pathname = usePathname()
  const isCheckout = pathname === '/order' || pathname.startsWith('/order/')
  const isMenuHome = pathname === '/'
  const { settings } = usePublicSettings()
  const hasBanner =
    settings.announcement.enabled && Boolean(settings.announcement.text?.trim())
  const mainPadding = isMenuHome
    ? 'pt-0'
    : hasBanner
      ? 'pt-[var(--rf-header-offset-banner)]'
      : 'pt-[var(--rf-header-offset)]'

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <ServiceWorkerRegister />
      <Navbar cartCount={itemCount} onCartClick={() => setCartOpen(true)} />
      <main id="main-content" className={`min-h-screen ${mainPadding} bg-[#FAF7F2]`}>
        {children}
      </main>
      <Footer />
      {!isCheckout && <StickyCartBar />}
      {!isCheckout && <InstallPrompt />}
      {!isCheckout && <NotificationPrompt />}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
