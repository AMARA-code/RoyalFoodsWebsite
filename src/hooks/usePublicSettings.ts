'use client'

import { useEffect, useState } from 'react'
import {
  DEFAULT_PUBLIC_SETTINGS,
  type PublicSiteSettings,
} from '@/lib/promo'

export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSiteSettings>(DEFAULT_PUBLIC_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings/public', { cache: 'no-store' })
        const json = await res.json()
        if (res.ok && json.data) {
          setSettings(json.data as PublicSiteSettings)
        }
      } catch {
        /* use defaults */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { settings, loading }
}
