import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#D62828',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'Royal Foods — Order Online | Kabab Crust Pizza',
    template: '%s | Royal Foods',
  },
  description:
    'Order from Royal Foods in Rajanpur. Kabab Crust Pizza, burgers, shawarma & more. Free home delivery. Open daily until 2 AM.',
  keywords: ['royal foods', 'rajanpur', 'pizza', 'food delivery', 'kabab crust pizza', 'online ordering'],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Royal Foods',
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Royal Foods — Order Online',
    description: 'Kabab Crust Pizza · Free Home Delivery · Rajanpur',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${montserrat.variable} light`} style={{ colorScheme: 'light' }}>
      <body className="bg-[#FAF7F2] text-[#1A2238] antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}