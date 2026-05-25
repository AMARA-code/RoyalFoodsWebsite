'use client'

import { useState, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SiteSettings {
  hours: {
    monday_friday: string
    saturday: string
    sunday: string
    note: string
  }
  contact: {
    phone: string
    email: string
    address: string
    map_embed: string
  }
  social: {
    instagram: string
    facebook: string
    whatsapp: string
    tiktok: string
  }
  announcement: {
    enabled: boolean
    text: string
    type: 'info' | 'promo' | 'warning'
  }
  delivery: {
    fee: number
    min_order: number
    radius: string
    estimated_time: string
  }
}

// ─── Hardcoded Fallbacks (shown when DB has no value yet) ─────────────────────

export const SETTINGS_FALLBACK: SiteSettings = {
  hours: {
    monday_friday: '5:00 PM – 11:00 PM',
    saturday: '5:00 PM – 11:00 PM',
    sunday: '5:00 PM – 10:00 PM',
    note: '',
  },
  contact: {
    phone: '+92 300 0000000',
    email: 'reservations@eclat.com',
    address: '123 Luxury Avenue, Prestige District',
    map_embed: '',
  },
  social: {
    instagram: '#',
    facebook: '#',
    whatsapp: '#',
    tiktok: '#',
  },
  announcement: {
    enabled: false,
    text: '',
    type: 'promo',
  },
  delivery: {
    fee: 150,
    min_order: 500,
    radius: '10km',
    estimated_time: '30–45 mins',
  },
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(SETTINGS_FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch settings')
        const json = await res.json()

        // API returns { data: [{ key, value }] }
        const rows: { key: string; value: unknown }[] = json?.data ?? []
        const map: Record<string, unknown> = {}
        rows.forEach(r => { map[r.key] = r.value })

        if (!cancelled) {
          setSettings({
            hours:        (map.hours        as SiteSettings['hours'])        ?? SETTINGS_FALLBACK.hours,
            contact:      (map.contact      as SiteSettings['contact'])      ?? SETTINGS_FALLBACK.contact,
            social:       (map.social       as SiteSettings['social'])       ?? SETTINGS_FALLBACK.social,
            announcement: (map.announcement as SiteSettings['announcement']) ?? SETTINGS_FALLBACK.announcement,
            delivery:     (map.delivery     as SiteSettings['delivery'])     ?? SETTINGS_FALLBACK.delivery,
          })
        }
      } catch {
        // Silently fall back — hardcoded defaults remain
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { settings, loading }
}