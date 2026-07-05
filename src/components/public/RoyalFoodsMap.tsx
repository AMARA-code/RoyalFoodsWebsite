'use client'

import { ExternalLink, MapPin, Navigation } from 'lucide-react'
import { usePublicSettings } from '@/hooks/usePublicSettings'
import { ROYAL_FOODS } from '@/lib/constants'
import {
  googleMapsDirectionsUrl,
  googleMapsSearchUrl,
  resolveMapEmbedSrc,
  ROYAL_FOODS_MAP_QUERY,
} from '@/lib/maps'

interface RoyalFoodsMapProps {
  className?: string
  showActions?: boolean
}

export default function RoyalFoodsMap({ className = '', showActions = true }: RoyalFoodsMapProps) {
  const { settings } = usePublicSettings()
  const address = settings.contact.address?.trim() || ROYAL_FOODS.address
  const mapQuery = address.includes(ROYAL_FOODS.name)
    ? address
    : `${ROYAL_FOODS.name}, ${address}`
  const embedSrc = resolveMapEmbedSrc(settings.contact.map_embed)
  const mapsUrl = googleMapsSearchUrl(mapQuery || ROYAL_FOODS_MAP_QUERY)
  const directionsUrl = googleMapsDirectionsUrl(mapQuery || ROYAL_FOODS_MAP_QUERY)

  return (
    <div className={className}>
      <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm aspect-[16/10] min-h-[280px]">
        <iframe
          title={`${ROYAL_FOODS.name} location on Google Maps`}
          src={embedSrc}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {showActions && (
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#D62828] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#b82222] transition-colors"
          >
            <MapPin size={16} />
            Open in Google Maps
            <ExternalLink size={14} className="opacity-80" />
          </a>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[#1A2238]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#1A2238] hover:bg-gray-50 transition-colors"
          >
            <Navigation size={16} />
            Get directions
          </a>
        </div>
      )}
    </div>
  )
}
