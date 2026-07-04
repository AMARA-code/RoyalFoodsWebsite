import type { MenuItem, MenuCategory, OrderStatus, PaymentMethod } from './database'

// ── Cart ──
export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url: string | null
}

export interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

// ── Checkout ──
export interface CheckoutForm {
  name: string
  email: string
  phone: string
  address: string
  payment_method: PaymentMethod
  special_instructions?: string
}

// ── Menu with category ──
export interface MenuItemWithCategory extends MenuItem {
  menu_categories: MenuCategory | null
}

// ── Order with items ──
export interface OrderWithItems {
  id: string
  order_ref: string
  customer_name: string
  customer_phone: string
  delivery_address: string
  status: OrderStatus
  payment_method: PaymentMethod
  payment_verified: boolean
  payment_screenshot: string | null
  total_amount: number
  created_at: string
  order_items: {
    id: string
    name: string
    price: number
    quantity: number
    subtotal: number
  }[]
}

// ── Site Settings parsed ──
export interface OpeningHours {
  [day: string]: {
    open: string
    close: string
    closed: boolean
  }
}

export interface SocialLinks {
  instagram: string
  facebook: string
  twitter: string
}

export interface SiteConfig {
  restaurant_name: string
  tagline: string
  phone: string
  email: string
  address: string
  announcement: string | null
  delivery_fee: number
  min_order: number
  easypaisa_number: string
  jazzcash_number: string
  opening_hours: OpeningHours
  social_links: SocialLinks
}

// ── API Response ──
export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
  success: boolean
}

// ── Reservations ──
export interface ReservationSlotConfig {
  time_slot: string
  label: string
  max_covers: number
  sort_order: number
}

export type SlotAvailabilityState = 'available' | 'occupied' | 'unavailable'

export interface SlotAvailability extends ReservationSlotConfig {
  booked_covers: number
  remaining_covers: number
  is_full: boolean
  availability: SlotAvailabilityState
}

export interface ReservationSlotRow {
  id: string
  time_slot: string
  label: string | null
  max_covers: number
  sort_order: number
  is_active: boolean
}

/** Admin + guest-facing reservation statuses */
export const RESERVATION_WORKFLOW_STATUSES = [
  'pending',
  'confirmed',
  'cancelled',
] as const

export type ReservationWorkflowStatus =
  (typeof RESERVATION_WORKFLOW_STATUSES)[number]

export interface ReservationBooking {
  id: string
  booking_ref: string
  customer_name: string
  customer_email: string | null
  customer_phone: string
  date: string
  time_slot: string
  party_size: number
  status: string
  special_requests: string | null
  cancel_token?: string
  created_at: string
}

export interface ReservationFormData {
  customer_name: string
  customer_email: string
  customer_phone: string
  date: string
  time_slot: string
  party_size: number
  special_requests?: string
}

// ── Admin Dashboard Stats ──
export interface DashboardStats {
  todayOrders: number
  todayRevenue: number
  todayReservations: number
  pendingOrders: number
  pendingPayments: number
  totalCustomers: number
}