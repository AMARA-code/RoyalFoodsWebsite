export interface PromoSettings {
  enabled: boolean
  percent: number
  label: string
  message: string
}

export interface DeliveryAreaSetting {
  id: string
  label: string
  eta: number
}

export interface PublicSiteSettings {
  contact: {
    phone: string
    email: string
    address: string
    map_embed?: string
  }
  hours: {
    open: string
    close: string
    note: string
  }
  delivery: {
    fee: number
    min_order: number
    free_delivery_min: number
    estimated_time: string
    areas: DeliveryAreaSetting[]
  }
  promo: PromoSettings
  announcement: {
    enabled: boolean
    text: string
  }
}

export const DEFAULT_PROMO: PromoSettings = {
  enabled: false,
  percent: 0,
  label: '',
  message: '',
}

export const DEFAULT_PUBLIC_SETTINGS: PublicSiteSettings = {
  contact: {
    phone: '0334-1704444',
    email: 'royalfoods@example.com',
    address: 'Bodla Colony Road Near Boys High School no.1 Rajanpur, Rajanpur, Pakistan',
  },
  hours: {
    open: '12:00 PM',
    close: '2:00 AM',
    note: 'Daily · Open until 2:00 AM',
  },
  delivery: {
    fee: 0,
    min_order: 500,
    free_delivery_min: 0,
    estimated_time: '30',
    areas: [
      { id: 'bodla', label: 'Bodla Colony, Rajanpur', eta: 30 },
      { id: 'city', label: 'City Centre, Rajanpur', eta: 25 },
    ],
  },
  promo: DEFAULT_PROMO,
  announcement: { enabled: false, text: '' },
}

export function applyDiscount(price: number, promo: PromoSettings): number {
  if (!promo.enabled || promo.percent <= 0) return price
  return Math.round(price * (1 - promo.percent / 100))
}

export function parsePublicSettings(map: Record<string, unknown>): PublicSiteSettings {
  const contact = (map.contact as PublicSiteSettings['contact']) ?? DEFAULT_PUBLIC_SETTINGS.contact
  const hoursRaw = map.hours as Record<string, string> | undefined
  const deliveryRaw = map.delivery as PublicSiteSettings['delivery'] | undefined
  const promoRaw = map.promo as PromoSettings | undefined

  let announcementEnabled = false
  let announcementText = ''

  const announcementRaw = map.announcement
  if (typeof announcementRaw === 'string' && announcementRaw.trim()) {
    announcementEnabled = true
    announcementText = announcementRaw.trim()
  } else if (announcementRaw && typeof announcementRaw === 'object') {
    const obj = announcementRaw as { enabled?: boolean | string; text?: string }
    announcementText = obj.text?.trim() ?? ''
    announcementEnabled =
      (obj.enabled === true || obj.enabled === 'true') && Boolean(announcementText)
  }

  return {
    contact: {
      ...DEFAULT_PUBLIC_SETTINGS.contact,
      ...contact,
      map_embed: (contact as { map_embed?: string }).map_embed ?? '',
    },
    hours: {
      open: hoursRaw?.monday_friday?.split('–')[0]?.trim() ?? DEFAULT_PUBLIC_SETTINGS.hours.open,
      close: '2:00 AM',
      note: hoursRaw?.note || DEFAULT_PUBLIC_SETTINGS.hours.note,
    },
    delivery: {
      fee: Number(map.delivery_fee ?? deliveryRaw?.fee ?? 0),
      min_order: Number(map.min_order ?? deliveryRaw?.min_order ?? 500),
      free_delivery_min: Number(
        map.free_delivery_min ?? deliveryRaw?.free_delivery_min ?? 0
      ),
      estimated_time: deliveryRaw?.estimated_time ?? '30',
      areas: deliveryRaw?.areas ?? DEFAULT_PUBLIC_SETTINGS.delivery.areas,
    },
    promo: {
      ...DEFAULT_PROMO,
      ...promoRaw,
      enabled:
        promoRaw?.enabled === true || String(promoRaw?.enabled ?? '') === 'true',
      percent: Math.min(90, Math.max(0, Number(promoRaw?.percent) || 0)),
    },
    announcement: {
      enabled: announcementEnabled,
      text: announcementText,
    },
  }
}
