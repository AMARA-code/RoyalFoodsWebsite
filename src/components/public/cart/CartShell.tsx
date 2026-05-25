'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/public/cart/CartDrawer'
import { useCartStore, selectCartItemCount } from '@/store/cartStore'

export default function CartShell({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false)
  const itemCount = useCartStore(selectCartItemCount)

  return (
    <>
      <Navbar cartCount={itemCount} onCartClick={() => setCartOpen(true)} />
      <main id="main-content" className="min-h-screen pt-20">
        {children}
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}