import Link from 'next/link'
import ReservationsTable from '@/components/admin/ReservationsTable'
import { getAdminReservations } from './actions'
import type { ReservationStatus } from '@/types/database'

export default async function AdminReservationsPage() {
  const reservations = await getAdminReservations()

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <Link
            href="/admin"
            className="text-label hover:text-[var(--accent-gold)] transition-colors"
            style={{ color: 'var(--text-muted)', fontSize: '10px' }}
          >
            ← Dashboard
          </Link>
          <h1
            className="mt-2"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2rem',
              color: 'var(--text-primary)',
            }}
          >
            Reservations
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '14px' }}>
            Pending bookings hold a slot until you confirm or the guest cancels.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link href="/admin/reservations/slots" className="btn-outline !py-2 !text-[0.65rem]">
            Manage Time Slots
          </Link>
          <p className="text-label" style={{ color: 'var(--accent-gold)', fontSize: '11px' }}>
            {reservations.length} total
          </p>
        </div>
      </div>

      <ReservationsTable
        reservations={reservations.map((r) => ({
          id: r.id,
          booking_ref: r.booking_ref,
          customer_name: r.customer_name,
          customer_email: r.customer_email,
          customer_phone: r.customer_phone,
          date: r.date,
          time_slot: r.time_slot,
          party_size: r.party_size,
          status: r.status as ReservationStatus,
          special_requests: r.special_requests,
          created_at: r.created_at,
        }))}
      />
    </div>
  )
}
