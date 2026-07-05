'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSHint, setShowIOSHint] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('pwa-install-dismissed')) {
      setDismissed(true)
    }

    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)

    const ua = window.navigator.userAgent
    const ios = /iPad|iPhone|iPod/.test(ua)
    setIsIOS(ios)
    if (ios && !standalone) {
      setShowIOSHint(true)
    }

    function onBip(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', onBip)
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [])

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    if (outcome === 'accepted') {
      setDeferred(null)
    }
  }

  function dismiss() {
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', '1')
    setShowIOSHint(false)
  }

  if (dismissed || isStandalone) return null

  if (isIOS && showIOSHint) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <Download size={22} className="text-[#D62828] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-[#1A2238] text-sm">Install Royal Foods App</p>
            <p className="text-xs text-gray-500 mt-1">
              Tap <strong>Share</strong> then <strong>Add to Home Screen</strong> to install and get offer notifications.
            </p>
          </div>
          <button type="button" onClick={dismiss} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
      </div>
    )
  }

  if (!deferred) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto bg-[#1A2238] rounded-2xl shadow-xl p-4 text-white">
      <div className="flex items-center gap-3">
        <img src="/icon-192.png" alt="" className="w-12 h-12 rounded-xl" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">Install Royal Foods</p>
          <p className="text-xs text-white/70 mt-0.5">Get the app for faster ordering & exclusive offers</p>
        </div>
        <button
          type="button"
          onClick={install}
          className="shrink-0 px-4 py-2 rounded-xl bg-[#D62828] text-white text-xs font-bold hover:bg-[#b81f1f] transition-colors"
        >
          Install
        </button>
        <button type="button" onClick={dismiss} className="text-white/50 hover:text-white">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
