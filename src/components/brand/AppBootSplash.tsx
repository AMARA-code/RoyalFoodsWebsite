'use client'

import { useEffect, useState } from 'react'
import BrandLoader from '@/components/brand/BrandLoader'

export default function AppBootSplash() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const seen = sessionStorage.getItem('rf-boot-seen')
    if (seen) {
      setVisible(false)
      return
    }

    const hideSplash = () => {
      sessionStorage.setItem('rf-boot-seen', '1')
      window.setTimeout(() => setVisible(false), 300)
    }

    if (document.readyState === 'complete') {
      hideSplash()
      return
    }

    const handleLoad = () => hideSplash()
    window.addEventListener('load', handleLoad, { once: true })
    return () => window.removeEventListener('load', handleLoad)
  }, [])

  if (!visible) return null

  return (
    <div id="rf-boot-splash" className="rf-boot-splash" aria-hidden="true">
      <BrandLoader />
    </div>
  )
}
