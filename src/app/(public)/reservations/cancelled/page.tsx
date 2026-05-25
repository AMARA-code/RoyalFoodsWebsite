'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { XCircle } from 'lucide-react'

function CancelledContent() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')
  const already = searchParams.get('already')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-eclat p-8 md:p-10 text-center max-w-md mx-auto"
    >
      <XCircle
        size={48}
        style={{ color: 'var(--text-muted)', margin: '0 auto 20px' }}
      />
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.8rem',
          marginBottom: '12px',
        }}
      >
        {already ? 'Already Cancelled' : 'Reservation Cancelled'}
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
        {already
          ? 'This reservation was already cancelled.'
          : 'Your table has been released and is now available for other guests.'}
      </p>
      {ref && (
        <p className="mt-4 text-label" style={{ color: 'var(--accent-gold)', fontSize: '11px' }}>
          {ref}
        </p>
      )}
      <div className="flex flex-col gap-3 mt-8">
        <Link href="/reservations" className="btn-gold">
          Book Again
        </Link>
        <Link href="/" className="btn-outline">
          Return Home
        </Link>
      </div>
    </motion.div>
  )
}

export default function ReservationCancelledPage() {
  return (
    <div
      style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}
      className="section-py"
    >
      <div className="container-eclat">
        <Suspense
          fallback={
            <p className="text-center" style={{ color: 'var(--text-muted)' }}>
              Loading…
            </p>
          }
        >
          <CancelledContent />
        </Suspense>
      </div>
    </div>
  )
}
