'use client'

import { useEffect, useState } from 'react'
import BrandLoader from '@/components/brand/BrandLoader'

export default function AppBootSplash() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const hideSplash = () => {
      window.setTimeout(() => setVisible(false), 350)
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
