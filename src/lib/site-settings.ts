import { createClient } from '@/lib/supabase/server'
import { DEFAULT_SITE_CONFIG } from '@/lib/constants'
import type { SiteConfig } from '@/types/index'

function parseSettingValue<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback
  return value as T
}

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).from('site_settings').select('key, value')

    if (error || !data?.length) {
      return DEFAULT_SITE_CONFIG
    }

    const map = Object.fromEntries(
      (data as { key: string; value: unknown }[]).map((row) => [row.key, row.value])
    )
    const config = { ...DEFAULT_SITE_CONFIG }

    if (map.delivery_fee != null) {
      config.delivery_fee = Number(map.delivery_fee) || DEFAULT_SITE_CONFIG.delivery_fee
    }
    if (map.min_order != null) {
      config.min_order = Number(map.min_order) || DEFAULT_SITE_CONFIG.min_order
    }
    if (map.easypaisa_number != null) {
      config.easypaisa_number = String(map.easypaisa_number)
    }
    if (map.jazzcash_number != null) {
      config.jazzcash_number = String(map.jazzcash_number)
    }
    if (map.phone != null) config.phone = String(map.phone)
    if (map.email != null) config.email = String(map.email)
    if (map.address != null) config.address = String(map.address)
    if (map.restaurant_name != null) {
      config.restaurant_name = String(map.restaurant_name)
    }
    if (map.opening_hours != null) {
      config.opening_hours = parseSettingValue(
        map.opening_hours,
        DEFAULT_SITE_CONFIG.opening_hours
      )
    }
    if (map.social_links != null) {
      config.social_links = {
        ...DEFAULT_SITE_CONFIG.social_links,
        ...parseSettingValue(map.social_links, {}),
      }
    }

    return config
  } catch {
    return DEFAULT_SITE_CONFIG
  }
}
