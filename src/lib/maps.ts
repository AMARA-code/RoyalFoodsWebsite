import { ROYAL_FOODS } from '@/lib/constants'

/** Search string used for Google Maps geocoding. */
export const ROYAL_FOODS_MAP_QUERY = `${ROYAL_FOODS.name}, ${ROYAL_FOODS.address}`

/** Approximate pin near Bodla Colony Road / Boys High School No.1, Rajanpur. */
export const ROYAL_FOODS_COORDS = {
  lat: 29.1038,
  lng: 70.3275,
} as const

export function googleMapsSearchUrl(query = ROYAL_FOODS_MAP_QUERY) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function googleMapsDirectionsUrl(destination = ROYAL_FOODS_MAP_QUERY) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}

export function googleMapsEmbedUrl(query = ROYAL_FOODS_MAP_QUERY) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&hl=en&z=17&output=embed`
}

/** Accept a full iframe snippet or raw embed URL from admin settings. */
export function resolveMapEmbedSrc(customEmbed?: string | null): string {
  const trimmed = customEmbed?.trim()
  if (trimmed) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i)
    if (srcMatch?.[1]) return srcMatch[1]
    if (trimmed.startsWith('http')) return trimmed
  }
  return googleMapsEmbedUrl()
}
