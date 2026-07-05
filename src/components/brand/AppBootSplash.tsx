'use client'

import { useEffect, useState } from 'react'
import BrandLoader from '@/components/brand/BrandLoader'

export default function AppBootSplash() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('rf-boot-seen')
    if (seen) {
      document.getElementById('rf-boot-splash')?.remove()
      return
    }

    setVisible(true)

    const hideSplash = () => {
      sessionStorage.setItem('rf-boot-seen', '1')
      window.setTimeout(() => setVisible(false), 300)
    }

    if (document.readyState === 'complete') {
      hideSplash()
      return
    }

    window.addEventListener('load', hideSplash, { once: true })
    return () => window.removeEventListener('load', hideSplash)
  }, [])

  useEffect(() => {
    if (!visible) {
      document.getElementById('rf-boot-splash')?.remove()
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className="rf-boot-splash-overlay">
      <BrandLoader />
    </div>
  )
}
