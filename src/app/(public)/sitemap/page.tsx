import Link from 'next/link'
import RoyalFoodsMap from '@/components/public/RoyalFoodsMap'
import { ROYAL_FOODS } from '@/lib/constants'
import { googleMapsSearchUrl } from '@/lib/maps'

export const metadata = {
  title: 'Sitemap',
  description: 'Royal Foods sitemap — menu, checkout, policies, and location in Rajanpur, Pakistan.',
}

const PAGES = [
  { href: '/', label: 'Home / Menu' },
  { href: '/order', label: 'Checkout' },
  { href: '/signin', label: 'Sign In' },
  { href: '/signup', label: 'Sign Up' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/privacy', label: 'Privacy Policy' },
]

export default function SitemapPage() {
  const mapsUrl = googleMapsSearchUrl()

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-[#1A2238] mb-2">Royal Foods Sitemap</h1>
      <p className="text-sm text-gray-500 mb-8">
        Find our restaurant on the map, browse site pages, and contact Royal Foods in Rajanpur.
      </p>

      <section className="mb-10">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#D62828] mb-4">
          Find us on Google Maps
        </h2>
        <RoyalFoodsMap />
      </section>

      <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#D62828] mb-3">Location</h2>
        <p className="text-[#1A2238] font-semibold mb-1">{ROYAL_FOODS.name}</p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-600 leading-relaxed hover:text-[#D62828] hover:underline block mb-4"
        >
          {ROYAL_FOODS.address}
        </a>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <a href={`tel:${ROYAL_FOODS.phone}`} className="text-[#D62828] hover:underline">
            {ROYAL_FOODS.phone}
          </a>
          {ROYAL_FOODS.phoneAlt.map((p) => (
            <a key={p} href={`tel:${p}`} className="text-[#D62828] hover:underline">
              {p}
            </a>
          ))}
        </div>
        <a
          href={ROYAL_FOODS.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-sm text-[#D62828] hover:underline"
        >
          Facebook — Royal Foods Rajanpur
        </a>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#1A2238] mb-4">Pages</h2>
        <ul className="space-y-2">
          {PAGES.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="text-sm text-[#D62828] hover:underline">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
