import type { ReservationSlotConfig, SlotAvailability } from '@/types/index'

export const DEFAULT_RESERVATION_SLOTS: ReservationSlotConfig[] = [
  { time_slot: '12:00', label: 'Lunch — 12:00 PM', max_covers: 24, sort_order: 1 },
  { time_slot: '12:30', label: '12:30 PM', max_covers: 24, sort_order: 2 },
  { time_slot: '13:00', label: '1:00 PM', max_covers: 24, sort_order: 3 },
  { time_slot: '13:30', label: '1:30 PM', max_covers: 24, sort_order: 4 },
  { time_slot: '18:00', label: 'Dinner — 6:00 PM', max_covers: 30, sort_order: 5 },
  { time_slot: '18:30', label: '6:30 PM', max_covers: 30, sort_order: 6 },
  { time_slot: '19:00', label: '7:00 PM', max_covers: 30, sort_order: 7 },
  { time_slot: '19:30', label: '7:30 PM', max_covers: 30, sort_order: 8 },
  { time_slot: '20:00', label: '8:00 PM', max_covers: 30, sort_order: 9 },
  { time_slot: '20:30', label: '8:30 PM', max_covers: 30, sort_order: 10 },
  { time_slot: '21:00', label: '9:00 PM', max_covers: 24, sort_order: 11 },
]

interface ActiveReservation {
  time_slot: string
  party_size: number
  status: string
}

/** Statuses that hold a table slot (released when cancelled). */
export const SLOT_HOLDING_STATUSES = ['pending', 'confirmed'] as const

export function holdsSlot(status: string): boolean {
  return (SLOT_HOLDING_STATUSES as readonly string[]).includes(status)
}

export function computeSlotAvailability(
  slots: ReservationSlotConfig[],
  reservations: ActiveReservation[]
): SlotAvailability[] {
  const active = reservations.filter((r) => holdsSlot(r.status))

  return slots.map((slot) => {
    const booked = active
      .filter((r) => r.time_slot === slot.time_slot)
      .reduce((sum, r) => sum + r.party_size, 0)
    const remaining = Math.max(0, slot.max_covers - booked)
    const is_full = remaining <= 0
    const availability: SlotAvailability['availability'] = is_full
      ? 'unavailable'
      : booked > 0
        ? 'occupied'
        : 'available'

    return {
      ...slot,
      booked_covers: booked,
      remaining_covers: remaining,
      is_full,
      availability,
    }
  })
}

export function parseReservationSlotsFromSettings(
  value: unknown
): ReservationSlotConfig[] | null {
  if (!Array.isArray(value)) return null
  const parsed = value
    .map((row) => {
      if (!row || typeof row !== 'object') return null
      const r = row as Record<string, unknown>
      if (typeof r.time_slot !== 'string') return null
      return {
        time_slot: r.time_slot,
        label: typeof r.label === 'string' ? r.label : r.time_slot,
        max_covers: Number(r.max_covers) || 24,
        sort_order: Number(r.sort_order) || 0,
      }
    })
    .filter(Boolean) as ReservationSlotConfig[]
  return parsed.length ? parsed.sort((a, b) => a.sort_order - b.sort_order) : null
}
