import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ')
}

// Format price — converts number to display string
export function formatPrice(price: number): string {
  return `$${price.toLocaleString()}`
}
// Format date
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format time
export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + '...'
}

// Generate order reference number
export function generateOrderRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `ECL-${timestamp}-${random}`
}

// Generate booking reference number
export function generateBookingRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `ECL-R-${timestamp}-${random}`
}

// Format date as YYYY-MM-DD in local timezone
export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Slugify a string
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Get image URL from Supabase Storage
export function getStorageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`
}

// Order status label + color
export function getOrderStatusConfig(status: string): {
  label: string
  color: string
  bg: string
} {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending: {
      label: 'Pending',
      color: '#c9a84c',
      bg: 'rgba(201,168,76,0.12)',
    },
    payment_pending: {
      label: 'Awaiting Payment',
      color: '#e09050',
      bg: 'rgba(224,144,80,0.12)',
    },
    confirmed: {
      label: 'Confirmed',
      color: '#6db86a',
      bg: 'rgba(109,184,106,0.12)',
    },
    preparing: {
      label: 'Preparing',
      color: '#5aabf0',
      bg: 'rgba(90,171,240,0.12)',
    },
    out_for_delivery: {
      label: 'Out for Delivery',
      color: '#c07cc0',
      bg: 'rgba(192,124,192,0.12)',
    },
    delivered: {
      label: 'Delivered',
      color: '#6db86a',
      bg: 'rgba(109,184,106,0.12)',
    },
    cancelled: {
      label: 'Cancelled',
      color: '#c0392b',
      bg: 'rgba(192,57,43,0.12)',
    },
  }
  return map[status] ?? { label: status, color: '#a8a8a0', bg: 'rgba(168,168,160,0.12)' }
}

// Reservation status config (workflow: pending → confirmed | cancelled)
export function getReservationStatusConfig(status: string): {
  label: string
  color: string
} {
  const map: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: '#c9a84c' },
    confirmed: { label: 'Confirmed', color: '#6db86a' },
    cancelled: { label: 'Cancelled', color: '#c0392b' },
    completed: { label: 'Completed', color: '#5aabf0' },
    no_show: { label: 'No Show', color: '#a8a8a0' },
  }
  if (map[status]) return map[status]
  return { label: 'Pending', color: '#c9a84c' }
}

export function getSlotAvailabilityLabel(
  availability: 'available' | 'occupied' | 'unavailable',
  remaining: number
): string {
  if (availability === 'unavailable') return 'Unavailable'
  if (availability === 'occupied') return `${remaining} covers left · Occupied`
  return 'Available'
}
