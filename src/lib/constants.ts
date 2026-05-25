import type { SiteConfig } from '@/types/index'

export const DEFAULT_DELIVERY_FEE = 150
export const DEFAULT_MIN_ORDER = 500

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  restaurant_name: 'Éclat',
  tagline: 'Fine Dining',
  phone: '+92 300 1234567',
  email: 'hello@eclatrestaurant.com',
  address: '123 Culinary Avenue, Karachi',
  announcement: null,
  delivery_fee: DEFAULT_DELIVERY_FEE,
  min_order: DEFAULT_MIN_ORDER,
  easypaisa_number: '03001234567',
  jazzcash_number: '03001234567',
  opening_hours: {
    monday: { open: '12:00', close: '23:00', closed: false },
    tuesday: { open: '12:00', close: '23:00', closed: false },
    wednesday: { open: '12:00', close: '23:00', closed: false },
    thursday: { open: '12:00', close: '23:00', closed: false },
    friday: { open: '12:00', close: '00:00', closed: false },
    saturday: { open: '12:00', close: '00:00', closed: false },
    sunday: { open: '12:00', close: '22:00', closed: false },
  },
  social_links: {
    instagram: 'https://instagram.com/eclatrestaurant',
    facebook: 'https://facebook.com/eclatrestaurant',
    twitter: 'https://twitter.com/eclatrestaurant',
  },
}

export const ORDER_STATUS_STEPS = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
] as const

export const PAYMENT_METHOD_LABELS = {
  easypaisa: 'EasyPaisa',
  jazzcash: 'JazzCash',
  cod: 'Cash on Delivery',
} as const
