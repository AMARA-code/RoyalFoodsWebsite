'use client'

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { ensurePushSubscription } from '@/lib/push'

export default function NotificationPrompt() {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    if (Notification.permission === 'granted') {
      ensurePushSubscription().catch(() => {
        /* ignore subscription failures */
      })
      return
    }

    if (Notification.permission !== 'default') return
    if (localStorage.getItem('notif-prompt-dismissed')) return

    const t = window.setTimeout(() => setVisible(true), 5000)
    return () => window.clearTimeout(t)
  }, [])

  async function enable() {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setVisible(false)
        return
      }

      await ensurePushSubscription()
      setVisible(false)
      localStorage.setItem('notif-prompt-dismissed', '1')
    } catch {
      /* permission denied or push unavailable */
    } finally {
      setLoading(false)
    }
  }

  function dismiss() {
    setVisible(false)
    localStorage.setItem('notif-prompt-dismissed', '1')
  }

  if (!visible) return null

  return (
    <div className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#D62828]/10 flex items-center justify-center shrink-0">
          <Bell size={20} className="text-[#D62828]" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-[#1A2238] text-sm">Get offer notifications</p>
          <p className="text-xs text-gray-500 mt-1">
            Be the first to know about discounts and new menu items from Royal Foods.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={enable}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#D62828] text-white text-xs font-bold disabled:opacity-60"
            >
              {loading ? 'Enabling…' : 'Enable Notifications'}
            </button>
            <button type="button" onClick={dismiss} className="px-3 py-2 text-xs text-gray-500">
              Not now
            </button>
          </div>
        </div>
        <button type="button" onClick={dismiss} className="text-gray-400">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
