'use client'

import { useEffect } from 'react'
import { ensurePushSubscription } from '@/lib/push'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.update()

        ensurePushSubscription().catch(() => {
          /* subscription is optional until permission is granted */
        })
      })
      .catch(() => {
        /* registration failed silently */
      })
  }, [])

  return null
}
