'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import type { ReservationSlotRow } from '@/types/index'

function normalizeTimeSlot(value: string): string {
  const trimmed = value.trim()
  if (!/^\d{1,2}:\d{2}$/.test(trimmed)) {
    throw new Error('Time must be in HH:MM format (e.g. 19:00)')
  }
  const [h, m] = trimmed.split(':').map(Number)
  if (h < 0 || h > 23 || m < 0 || m > 59) {
    throw new Error('Invalid time')
  }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export async function getAdminSlots(): Promise<ReservationSlotRow[]> {
  const supabase = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data, error } = await db
    .from('reservation_slots')
    .select('*')
    .order('sort_order')

  if (error) {
    console.error('getAdminSlots:', error)
    return []
  }

  return (data ?? []) as ReservationSlotRow[]
}

export async function upsertAdminSlot(input: {
  id?: string
  time_slot: string
  label: string
  max_covers: number
  sort_order: number
  is_active: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    const time_slot = normalizeTimeSlot(input.time_slot)
    const max_covers = Math.max(1, Math.min(100, Number(input.max_covers) || 24))

    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const payload = {
      time_slot,
      label: input.label.trim() || time_slot,
      max_covers,
      sort_order: Number(input.sort_order) || 0,
      is_active: input.is_active,
    }

    if (input.id) {
      const { error } = await db
        .from('reservation_slots')
        .update(payload)
        .eq('id', input.id)
      if (error) throw error
    } else {
      const { error } = await db.from('reservation_slots').insert(payload)
      if (error) throw error
    }

    revalidatePath('/admin/reservations/slots')
    revalidatePath('/admin/reservations')
    revalidatePath('/reservations')
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save slot'
    return { success: false, error: msg }
  }
}

export async function removeAdminSlot(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { error } = await db
    .from('reservation_slots')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/reservations/slots')
  revalidatePath('/reservations')
  return { success: true }
}
