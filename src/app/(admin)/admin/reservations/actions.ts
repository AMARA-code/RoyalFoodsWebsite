'use server'

import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import {
  sendReservationConfirmationEmail,
  sendReservationCancelledEmail,
} from '@/lib/email'
import type { Reservation, ReservationStatus } from '@/types/database'

const VALID_STATUSES: ReservationStatus[] = ['pending', 'confirmed', 'cancelled']

export async function getAdminReservations(): Promise<Reservation[]> {
  const supabase = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data, error } = await db
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Admin list reservations:', error)
    return []
  }

  return (data ?? []) as Reservation[]
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus
): Promise<{
  success: boolean
  error?: string
  emailSent?: boolean
  emailError?: string
}> {
  if (!VALID_STATUSES.includes(status)) {
    return { success: false, error: 'Invalid status' }
  }

  const supabase = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: existing, error: fetchError } = await db
    .from('reservations')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (fetchError || !existing) {
    return { success: false, error: 'Reservation not found' }
  }

  let cancel_token = existing.cancel_token as string | undefined
  if (status === 'confirmed' && !cancel_token) {
    cancel_token = randomUUID()
    const { error: tokenError } = await db
      .from('reservations')
      .update({ cancel_token })
      .eq('id', id)
    if (tokenError) {
      console.error('cancel_token update:', tokenError)
    }
  }

  const { data: updated, error: updateError } = await db
    .from('reservations')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single()

  if (updateError || !updated) {
    return { success: false, error: 'Failed to update status' }
  }

  let emailSent = false
  let emailError: string | undefined

  // Send confirmation whenever admin sets Confirmed (including re-send if already confirmed)
  if (status === 'cancelled' && existing.status !== 'cancelled') {
    try {
      await sendReservationCancelledEmail({
        booking_ref: updated.booking_ref,
        customer_name: updated.customer_name,
        customer_email: updated.customer_email,
      })
    } catch (e) {
      console.error('Cancelled email error:', e)
    }
  }

  if (status === 'confirmed') {
    const { data: fresh } = await db
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single()

    const row = fresh ?? updated
    const token = (row.cancel_token as string | undefined) ?? cancel_token

    try {
      await sendReservationConfirmationEmail({
        id: row.id,
        booking_ref: row.booking_ref,
        customer_name: row.customer_name,
        customer_email: row.customer_email,
        date: row.date,
        time_slot: row.time_slot,
        party_size: row.party_size,
        cancel_token: token,
      })
      emailSent = true
    } catch (emailErr) {
      emailError =
        emailErr instanceof Error ? emailErr.message : 'Failed to send confirmation email'
      console.error('Confirmation email error:', emailErr)
    }
  }

  revalidatePath('/admin/reservations')
  revalidatePath(`/reservations/confirm/${id}`)

  return { success: true, emailSent, emailError }
}
