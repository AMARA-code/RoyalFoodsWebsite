'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, CalendarPlus, Mail } from 'lucide-react'
import { formatDate, formatTime, getReservationStatusConfig } from '@/lib/utils'
import { buildReservationICS, downloadICS } from '@/lib/ics'
import { DEFAULT_SITE_CONFIG } from '@/lib/constants'
import type { ReservationBooking } from '@/types/index'
import { GoldButton, OutlineButton } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import CancelReservationButton from '@/components/public/reservations/CancelReservationButton'

export default function ReservationConfirmPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [reservation, setReservation] = useState<ReservationBooking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        if (!id || id === 'undefined') {
          throw new Error('Invalid booking link')
        }

        const res = await fetch(`/api/reservations/${id}`)
        const json = await res.json()
        if (res.ok && json.data) {
          setReservation(json.data)
          return
        }

        const cached = sessionStorage.getItem('eclat-last-reservation')
        if (cached) {
          const parsed = JSON.parse(cached) as ReservationBooking
          if (parsed.id === id) {
            setReservation(parsed)
            return
          }
        }

        throw new Error(json.error ?? 'Reservation not found')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!id) return
    const interval = setInterval(async () => {
      const res = await fetch(`/api/reservations/${id}`)
      const json = await res.json()
      if (res.ok && json.data) setReservation(json.data)
    }, 15000)
    return () => clearInterval(interval)
  }, [id])

  useEffect(() => {
    if (reservation?.status === 'cancelled') {
      router.replace(
        `/reservations/cancelled?ref=${encodeURIComponent(reservation.booking_ref)}`
      )
    }
  }, [reservation, router])

  function handleDownloadICS() {
    if (!reservation) return
    const ics = buildReservationICS({
      booking_ref: reservation.booking_ref,
      customer_name: reservation.customer_name,
      date: reservation.date,
      time_slot: reservation.time_slot,
      party_size: reservation.party_size,
      restaurant_name: DEFAULT_SITE_CONFIG.restaurant_name,
      address: DEFAULT_SITE_CONFIG.address,
    })
    downloadICS(ics, `eclat-${reservation.booking_ref}.ics`)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <PageLoader />
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className="container-eclat section-py text-center">
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          {error ?? 'Reservation not found'}
        </p>
        <Link href="/reservations" className="btn-gold">
          Book a Table
        </Link>
      </div>
    )
  }

  const isCancelled = reservation.status === 'cancelled'
  const isConfirmed = reservation.status === 'confirmed'
  const isPending = !isCancelled && !isConfirmed
  const statusCfg = getReservationStatusConfig(
    isCancelled ? 'cancelled' : isConfirmed ? 'confirmed' : 'pending'
  )

  if (isCancelled) {
    return <PageLoader />
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <section className="section-py">
        <div className="container-eclat max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-eclat p-8 md:p-10 text-center"
          >
            {isConfirmed ? (
              <CheckCircle2
                size={52}
                style={{ color: 'var(--accent-gold)', margin: '0 auto 20px' }}
              />
            ) : (
              <Clock
                size={52}
                style={{ color: '#c9a84c', margin: '0 auto 20px' }}
              />
            )}

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2rem',
                marginBottom: '8px',
              }}
            >
              {isConfirmed ? "You're Booked" : 'Awaiting Confirmation'}
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              Reference{' '}
              <span style={{ color: 'var(--accent-gold)' }}>{reservation.booking_ref}</span>
            </p>

            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-label mb-8"
              style={{
                color: statusCfg.color,
                background: `${statusCfg.color}18`,
                fontSize: '11px',
                letterSpacing: '0.15em',
              }}
            >
              {isConfirmed ? (
                <CheckCircle2 size={14} />
              ) : (
                <Clock size={14} />
              )}
              {statusCfg.label}
            </span>

            <div
              className="text-left space-y-4 mb-8 p-6 rounded-sm"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Row label="Guest" value={reservation.customer_name} />
              <Row label="Date" value={formatDate(reservation.date)} />
              <Row label="Time" value={formatTime(reservation.time_slot)} />
              <Row label="Party" value={`${reservation.party_size} guests`} />
              {reservation.special_requests && (
                <Row label="Requests" value={reservation.special_requests} />
              )}
            </div>

            {isPending && (
              <p
                className="text-sm mb-6 p-4 rounded-sm"
                style={{
                  background: 'rgba(201,168,76,0.08)',
                  border: '1px solid rgba(201,168,76,0.25)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                Your table is <strong style={{ color: 'var(--accent-gold)' }}>pending</strong>{' '}
                admin approval. This time slot is held for you until we confirm or you
                cancel below.
              </p>
            )}

            {isConfirmed && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <GoldButton
                  type="button"
                  onClick={handleDownloadICS}
                  className="flex items-center justify-center gap-2"
                >
                  <CalendarPlus size={16} />
                  Add to Calendar
                </GoldButton>
                <OutlineButton type="button" onClick={() => window.print()} className="!py-3">
                  Print Confirmation
                </OutlineButton>
              </div>
            )}

            <p
              className="flex items-center justify-center gap-2 text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              <Mail size={14} />
              {isConfirmed
                ? 'Confirmation email sent with cancel link'
                : 'Request receipt sent — we will email you when confirmed'}
              {reservation.customer_email ? ` to ${reservation.customer_email}` : ''}.
            </p>

            {reservation.cancel_token && (isPending || isConfirmed) && (
              <CancelReservationButton
                cancelToken={reservation.cancel_token}
                bookingRef={reservation.booking_ref}
              />
            )}

            <Link
              href="/"
              className="inline-block mt-8 text-label hover:text-[var(--accent-gold)] transition-colors"
              style={{ color: 'var(--text-muted)', fontSize: '11px' }}
            >
              Return Home
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', textAlign: 'right' }}>{value}</span>
    </div>
  )
}
