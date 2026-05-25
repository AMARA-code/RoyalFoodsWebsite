'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'
import { OutlineButton } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Props {
  cancelToken: string
  bookingRef: string
}

export default function CancelReservationButton({ cancelToken, bookingRef }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)

  function handleCancel() {
    if (!confirming) {
      setConfirming(true)
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/reservations/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: cancelToken }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Cancellation failed')
        toast.success('Reservation cancelled — your slot has been released')
        sessionStorage.removeItem('eclat-last-reservation')
        router.push(
          `/reservations/cancelled?ref=${encodeURIComponent(bookingRef)}`
        )
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not cancel')
        setConfirming(false)
      }
    })
  }

  return (
    <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
      {!confirming ? (
        <OutlineButton
          type="button"
          onClick={handleCancel}
          className="w-full flex items-center justify-center gap-2 !border-[var(--accent-crimson)] !text-[var(--accent-crimson-light)]"
        >
          <XCircle size={16} />
          Cancel Reservation
        </OutlineButton>
      ) : (
        <div className="space-y-3">
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Cancel booking <strong>{bookingRef}</strong>? This will free your table slot.
          </p>
          <div className="flex gap-3">
            <OutlineButton
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="flex-1"
            >
              Keep Booking
            </OutlineButton>
            <button
              type="button"
              onClick={handleCancel}
              disabled={pending}
              className="btn-crimson flex-1 !py-3"
            >
              {pending ? 'Cancelling…' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
