import Link from 'next/link'
import SlotsManager from '@/components/admin/SlotsManager'
import { getAdminSlots } from './actions'

export default async function AdminSlotsPage() {
  const slots = await getAdminSlots()

  return (
    <div className="p-6 md:p-8 max-w-[1000px] mx-auto">
      <Link
        href="/admin/reservations"
        className="text-label hover:text-[var(--accent-gold)] transition-colors"
        style={{ color: 'var(--text-muted)', fontSize: '10px' }}
      >
        ← Reservations
      </Link>
      <h1
        className="mt-2 mb-2"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '2rem',
          color: 'var(--text-primary)',
        }}
      >
        Time Slots
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
        Configure dining times and capacity. Bookings hold slots while pending or
        confirmed; cancelled bookings release the slot automatically.
      </p>
      <SlotsManager slots={slots} />
    </div>
  )
}
