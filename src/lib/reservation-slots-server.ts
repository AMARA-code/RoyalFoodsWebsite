import { createAdminClient } from '@/lib/supabase/server'
import {
  DEFAULT_RESERVATION_SLOTS,
  computeSlotAvailability,
  parseReservationSlotsFromSettings,
} from '@/lib/reservations'
import type { ReservationSlotConfig, SlotAvailability } from '@/types/index'

export async function getReservationSlotsConfig(): Promise<ReservationSlotConfig[]> {
  const supabase = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: slotRows } = await db
    .from('reservation_slots')
    .select('time_slot, label, max_covers, sort_order')
    .eq('is_active', true)
    .order('sort_order')

  if (slotRows?.length) {
    return (slotRows as ReservationSlotConfig[]).map((r) => ({
      time_slot: r.time_slot,
      label: r.label ?? r.time_slot,
      max_covers: r.max_covers,
      sort_order: r.sort_order,
    }))
  }

  const { data: setting } = await db
    .from('site_settings')
    .select('value')
    .eq('key', 'reservation_slots')
    .maybeSingle()

  const fromSettings = parseReservationSlotsFromSettings(setting?.value)
  return fromSettings ?? DEFAULT_RESERVATION_SLOTS
}

export async function getSlotsForDate(date: string): Promise<SlotAvailability[]> {
  const slots = await getReservationSlotsConfig()
  const supabase = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: reservations } = await db
    .from('reservations')
    .select('time_slot, party_size, status')
    .eq('date', date)
    .in('status', ['pending', 'confirmed'])

  return computeSlotAvailability(slots, reservations ?? [])
}

export async function validateSlotCapacity(
  date: string,
  time_slot: string,
  party_size: number
): Promise<{ ok: boolean; error?: string }> {
  const availability = await getSlotsForDate(date)
  const slot = availability.find((s) => s.time_slot === time_slot)

  if (!slot) {
    return { ok: false, error: 'Invalid time slot' }
  }
  if (slot.is_full || party_size > slot.remaining_covers) {
    return {
      ok: false,
      error: `Only ${slot.remaining_covers} covers left for this time`,
    }
  }
  return { ok: true }
}
