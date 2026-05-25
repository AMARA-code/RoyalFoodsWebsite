'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate, formatTime, getReservationStatusConfig } from '@/lib/utils'
import { updateReservationStatus } from '@/app/(admin)/admin/reservations/actions'
import type { ReservationStatus } from '@/types/database'
import { RESERVATION_WORKFLOW_STATUSES } from '@/types/index'
import toast from 'react-hot-toast'

export interface AdminReservationRow {
  id: string
  booking_ref: string
  customer_name: string
  customer_email: string | null
  customer_phone: string
  date: string
  time_slot: string
  party_size: number
  status: ReservationStatus
  special_requests: string | null
  created_at: string
}

const STATUS_OPTIONS = RESERVATION_WORKFLOW_STATUSES as unknown as ReservationStatus[]

export default function ReservationsTable({
  reservations,
}: {
  reservations: AdminReservationRow[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [filter, setFilter] = useState<ReservationStatus | 'all'>('all')

  const filterOptions: (ReservationStatus | 'all')[] = ['all', ...STATUS_OPTIONS]

  const filtered =
    filter === 'all'
      ? reservations
      : reservations.filter((r) => r.status === filter)

  function handleStatusChange(id: string, status: ReservationStatus) {
    startTransition(async () => {
      const result = await updateReservationStatus(id, status)
      if (result.success) {
        if (status === 'confirmed') {
          if (result.emailSent) {
            toast.success('Confirmed — confirmation email sent with cancel link')
          } else if (result.emailError) {
            toast.error(`Status saved, but email failed: ${result.emailError}`, {
              duration: 8000,
            })
          } else {
            toast.success('Status updated to Confirmed')
          }
        } else {
          toast.success(`Status updated to ${getReservationStatusConfig(status).label}`)
        }
        router.refresh()
      } else {
        toast.error(result.error ?? 'Update failed')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded-sm text-label transition-colors"
            style={{
              fontSize: '10px',
              border: `1px solid ${filter === s ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
              color: filter === s ? 'var(--accent-gold)' : 'var(--text-muted)',
              background:
                filter === s ? 'rgba(201,168,76,0.1)' : 'var(--bg-elevated)',
            }}
          >
            {s === 'all' ? 'All' : getReservationStatusConfig(s).label}
          </button>
        ))}
      </div>

      <div
        className="overflow-x-auto rounded-sm"
        style={{ border: '1px solid var(--border-subtle)' }}
      >
        <table className="w-full text-sm" style={{ minWidth: '900px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
              {['Reference', 'Guest', 'Date & Time', 'Party', 'Status', 'Actions'].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-label"
                    style={{ color: 'var(--text-muted)', fontSize: '10px' }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center"
                  style={{ color: 'var(--text-muted)' }}
                >
                  No reservations found
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const cfg = getReservationStatusConfig(r.status)
                return (
                  <tr
                    key={r.id}
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <td className="px-4 py-3" style={{ color: 'var(--accent-gold)' }}>
                      {r.booking_ref}
                    </td>
                    <td className="px-4 py-3">
                      <p style={{ color: 'var(--text-primary)' }}>{r.customer_name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {r.customer_phone}
                      </p>
                      {r.customer_email && (
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {r.customer_email}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(r.date)}
                      <br />
                      <span style={{ fontSize: '12px' }}>{formatTime(r.time_slot)}</span>
                    </td>
                    <td className="px-4 py-3">{r.party_size}</td>
                    <td className="px-4 py-3">
                      <span style={{ color: cfg.color, fontSize: '12px' }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'cancelled' ? (
                        <span style={{ color: '#c0392b', fontSize: '12px' }}>
                          Cancelled
                        </span>
                      ) : (
                        <select
                          value={r.status}
                          disabled={pending}
                          onChange={(e) =>
                            handleStatusChange(r.id, e.target.value as ReservationStatus)
                          }
                          className="input-eclat py-2 text-xs min-w-[140px]"
                          aria-label={`Update status for ${r.booking_ref}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {getReservationStatusConfig(s).label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
        <strong style={{ color: 'var(--accent-gold)' }}>Pending</strong> holds the slot until
        you confirm or the guest cancels.{' '}
        <strong style={{ color: 'var(--accent-gold)' }}>Confirmed</strong> sends the guest a
        confirmation email with a cancel link.{' '}
        <strong style={{ color: 'var(--accent-gold)' }}>Cancelled</strong> frees the slot
        immediately.
      </p>
    </div>
  )
}
