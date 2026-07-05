'use client'

import { useEffect } from 'react'
import LogoMark from '@/components/brand/LogoMark'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6 text-center">
      <LogoMark size={96} animated />
      <h1 className="mt-6 text-xl font-bold text-[#1A2238]">Something went wrong</h1>
      <p className="mt-2 text-sm text-gray-500 max-w-sm">
        The page could not load. Try again or go back.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-[#1A2238] text-white text-sm font-semibold"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-[#1A2238] text-sm font-semibold"
        >
          Go back
        </button>
      </div>
    </div>
  )
}
