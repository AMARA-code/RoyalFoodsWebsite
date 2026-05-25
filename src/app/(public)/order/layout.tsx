import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Online',
  description:
    'Place your Éclat order online. Delivery across Karachi with EasyPaisa, JazzCash, or cash on delivery.',
}

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return children
}
