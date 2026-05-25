'use client'

import { useEffect, useState } from 'react'

interface Props {
  storedUrl: string
  alt?: string
  className?: string
}

export default function PaymentScreenshotImage({
  storedUrl,
  alt = 'Payment screenshot',
  className = 'w-full max-h-64 object-contain bg-black/40',
}: Props) {
  const [src, setSrc] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setFailed(false)
    setSrc(null)

    async function load() {
      try {
        const res = await fetch(
          `/api/admin/storage/signed-url?${new URLSearchParams({
            url: storedUrl,
            bucket: 'payment-screenshots',
          })}`
        )
        const json = await res.json()
        if (!cancelled) {
          if (res.ok && json.url) {
            setSrc(json.url)
          } else {
            setSrc(storedUrl)
          }
        }
      } catch {
        if (!cancelled) setSrc(storedUrl)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [storedUrl])

  if (failed) {
    return (
      <p className="text-sm p-4" style={{ color: 'var(--text-muted)' }}>
        Could not load payment screenshot. Check Supabase storage bucket permissions or re-upload
        proof.
      </p>
    )
  }

  if (!src) {
    return (
      <div
        className="flex items-center justify-center h-32 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        Loading image…
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
