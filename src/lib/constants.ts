import type { SiteConfig } from '@/types/index'

export const DEFAULT_DELIVERY_FEE = 0
export const DEFAULT_MIN_ORDER = 500

export const ROYAL_FOODS = {
  name: 'Royal Foods',
  tagline: 'Kabab Crust Pizza',
  address: 'Bodla Colony Road Near Boys High School no.1 Rajanpur, Rajanpur, Pakistan',
  phone: '0334-1704444',
  phoneAlt: ['0334-1765555', '0604-689495'],
  whatsapp: '923341704444',
  hours: 'Daily · Open until 2:00 AM',
  rating: 4.2,
  reviews: 402,
  priceRange: 'Rs 1,000–2,000 per person',
  specialty: 'Kabab Crust Pizza',
  facebook: 'https://www.facebook.com/RoyalFoodsRajanpur',
} as const

export const DELIVERY_AREAS = [
  { id: 'bodla', label: 'Bodla Colony, Rajanpur', eta: 30 },
  { id: 'city', label: 'City Centre, Rajanpur', eta: 25 },
  { id: 'college', label: 'College Road, Rajanpur', eta: 35 },
  { id: 'dha', label: 'DHA Area, Rajanpur', eta: 40 },
] as const

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  restaurant_name: ROYAL_FOODS.name,
  tagline: ROYAL_FOODS.tagline,
  phone: ROYAL_FOODS.phone,
  email: 'royalfoods@example.com',
  address: ROYAL_FOODS.address,
  announcement: null,
  delivery_fee: DEFAULT_DELIVERY_FEE,
  min_order: DEFAULT_MIN_ORDER,
  easypaisa_number: '03341704444',
  jazzcash_number: '03341704444',
  opening_hours: {
    monday: { open: '12:00', close: '02:00', closed: false },
    tuesday: { open: '12:00', close: '02:00', closed: false },
    wednesday: { open: '12:00', close: '02:00', closed: false },
    thursday: { open: '12:00', close: '02:00', closed: false },
    friday: { open: '12:00', close: '02:00', closed: false },
    saturday: { open: '12:00', close: '02:00', closed: false },
    sunday: { open: '12:00', close: '02:00', closed: false },
  },
  social_links: {
    instagram: '',
    facebook: ROYAL_FOODS.facebook,
    twitter: '',
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
