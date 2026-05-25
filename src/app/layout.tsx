import type { Metadata } from 'next'
import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Éclat — Fine Dining Restaurant',
    template: '%s | Éclat Restaurant',
  },
  description:
    'Experience exquisite culinary excellence at Éclat. Premium fine dining with masterfully crafted dishes, elegant ambiance, and impeccable service.',
  keywords: ['fine dining', 'restaurant', 'éclat', 'premium cuisine', 'reservations'],
  openGraph: {
    title: 'Éclat — Fine Dining Restaurant',
    description: 'Where every meal is a masterpiece.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body> <Providers>{children}</Providers>
      </body>
    </html>
  )
}