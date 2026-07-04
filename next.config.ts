import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      { source: '/about', destination: '/', permanent: false },
      { source: '/gallery', destination: '/', permanent: false },
      { source: '/blog', destination: '/', permanent: false },
      { source: '/contact', destination: '/', permanent: false },
      { source: '/reservations', destination: '/', permanent: false },
      { source: '/reservations/:path*', destination: '/', permanent: false },
      { source: '/menu/:slug', destination: '/', permanent: false },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig