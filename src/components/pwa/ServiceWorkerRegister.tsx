'use client'

import { useEffect } from 'react'
import { ensurePushSubscription } from '@/lib/push'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    let cancelled = false

    async function registerAndSync() {
      if (!('serviceWorker' in navigator)) return

      try {
        let registration = await navigator.serviceWorker.getRegistration()
        if (!registration) {
          registration = await navigator.serviceWorker.register('/sw.js')
        }

        if (cancelled) return

        await registration.update().catch(() => undefined)
        await navigator.serviceWorker.ready

        if (cancelled) return

        ensurePushSubscription().catch(() => {
          /* subscription is optional until permission is granted */
        })
      } catch {
        /* registration failed silently */
      }
    }

    void registerAndSync()

    return () => {
      cancelled = true
    }
  }, [])

  return null
}
