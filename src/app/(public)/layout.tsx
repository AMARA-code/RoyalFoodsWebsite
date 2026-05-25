import React from 'react'
import CartShell from '@/components/public/cart/CartShell'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CartShell>{children}</CartShell>
}
