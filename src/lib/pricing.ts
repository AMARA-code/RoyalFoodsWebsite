import {
  applyDiscount,
  type PromoSettings,
  type PublicSiteSettings,
} from '@/lib/promo'

export interface CartLine {
  price: number
  quantity: number
}

export interface OrderTotals {
  originalSubtotal: number
  subtotal: number
  discountAmount: number
  deliveryFee: number
  grandTotal: number
  promo: PromoSettings
  freeDeliveryApplied: boolean
  freeDeliveryThreshold: number
}

export function normalizePromo(promo: PromoSettings): PromoSettings {
  const raw = promo as { enabled?: boolean | string; percent?: number }
  const enabled = raw.enabled === true || String(raw.enabled ?? '') === 'true'
  return {
    ...promo,
    enabled,
    percent: Math.min(90, Math.max(0, Number(raw.percent) || 0)),
  }
}

/** Read free-delivery threshold from delivery settings or announcement text (e.g. "free delivery above 1500"). */
export function resolveFreeDeliveryThreshold(
  deliveryMin: number,
  announcementText?: string
): number {
  if (deliveryMin > 0) return deliveryMin
  const text = announcementText?.trim() ?? ''
  if (!text) return 0

  const lower = text.toLowerCase()
  if (!lower.includes('free') || !lower.includes('deliver')) return 0

  const aboveMatch = text.match(
    /(?:above|over|from|more than|≥|>=)\s*(?:rs\.?\s*)?([\d,]+)/i
  )
  if (aboveMatch) return Number(aboveMatch[1].replace(/,/g, ''))

  const amountMatch = text.match(/(?:rs\.?\s*)([\d,]+)/i)
  if (amountMatch) return Number(amountMatch[1].replace(/,/g, ''))

  const bareMatch = text.match(/\b([\d]{3,}(?:,\d{3})*)\b/)
  if (bareMatch) return Number(bareMatch[1].replace(/,/g, ''))

  return 0
}

export function calculateDeliveryFee(
  subtotalAfterDiscount: number,
  delivery: Pick<PublicSiteSettings['delivery'], 'fee' | 'free_delivery_min'>,
  announcementText?: string
): { fee: number; freeDeliveryApplied: boolean; freeDeliveryThreshold: number } {
  const threshold = resolveFreeDeliveryThreshold(
    Number(delivery.free_delivery_min) || 0,
    announcementText
  )
  if (threshold > 0 && subtotalAfterDiscount >= threshold) {
    return { fee: 0, freeDeliveryApplied: true, freeDeliveryThreshold: threshold }
  }
  return {
    fee: Number(delivery.fee) || 0,
    freeDeliveryApplied: false,
    freeDeliveryThreshold: threshold,
  }
}

export function calculateOrderTotals(
  items: CartLine[],
  settings: Pick<PublicSiteSettings, 'promo' | 'delivery' | 'announcement'>
): OrderTotals {
  const promo = normalizePromo(settings.promo)
  const originalSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const subtotal =
    promo.enabled && promo.percent > 0
      ? items.reduce(
          (sum, i) => sum + applyDiscount(i.price, promo) * i.quantity,
          0
        )
      : originalSubtotal

  const discountAmount = originalSubtotal - subtotal
  const {
    fee: deliveryFee,
    freeDeliveryApplied,
    freeDeliveryThreshold,
  } = calculateDeliveryFee(
    subtotal,
    settings.delivery,
    settings.announcement.enabled ? settings.announcement.text : ''
  )

  return {
    originalSubtotal,
    subtotal,
    discountAmount,
    deliveryFee,
    grandTotal: subtotal + deliveryFee,
    promo,
    freeDeliveryApplied,
    freeDeliveryThreshold,
  }
}
