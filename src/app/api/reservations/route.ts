import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { generateBookingRef } from '@/lib/utils'
import { validateSlotCapacity } from '@/lib/reservation-slots-server'
import { sendReservationReceivedEmail } from '@/lib/email'
import type { ReservationFormData } from '@/types/index'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReservationFormData

    const {
      customer_name,
      customer_email,
      customer_phone,
      date,
      time_slot,
      party_size,
      special_requests,
    } = body

    if (!customer_name?.trim() || !customer_phone?.trim()) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      )
    }

    if (!customer_email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!date || !time_slot) {
      return NextResponse.json(
        { error: 'Date and time slot are required' },
        { status: 400 }
      )
    }

    if (!party_size || party_size < 1 || party_size > 20) {
      return NextResponse.json(
        { error: 'Party size must be between 1 and 20' },
        { status: 400 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const bookingDate = new Date(date + 'T00:00:00')
    if (bookingDate < today) {
      return NextResponse.json(
        { error: 'Cannot book dates in the past' },
        { status: 400 }
      )
    }

    const capacity = await validateSlotCapacity(date, time_slot, party_size)
    if (!capacity.ok) {
      return NextResponse.json({ error: capacity.error }, { status: 409 })
    }

    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const booking_ref = generateBookingRef()
    const cancel_token = randomUUID()

    let customer_id: string | null = null
    const { data: existingCustomer } = await db
      .from('customers')
      .select('id')
      .eq('email', customer_email.trim())
      .maybeSingle()

    if (existingCustomer) {
      customer_id = existingCustomer.id
      await db
        .from('customers')
        .update({
          name: customer_name.trim(),
          phone: customer_phone.trim(),
        })
        .eq('id', customer_id)
    } else {
      const { data: created } = await db
        .from('customers')
        .insert({
          name: customer_name.trim(),
          email: customer_email.trim(),
          phone: customer_phone.trim(),
        })
        .select('id')
        .single()
      customer_id = created?.id ?? null
    }

    const insertPayload: Record<string, unknown> = {
      booking_ref,
      customer_id,
      customer_name: customer_name.trim(),
      customer_email: customer_email.trim(),
      customer_phone: customer_phone.trim(),
      date,
      time_slot,
      party_size,
      status: 'pending',
      special_requests: special_requests?.trim() || null,
      cancel_token,
    }

    let reservation: Record<string, unknown> | null = null
    let insertError: { message?: string } | null = null

    const attempts: Record<string, unknown>[] = [
      insertPayload,
      { ...insertPayload, cancel_token: undefined },
    ]

    for (const payload of attempts) {
      const cleaned = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== undefined)
      )
      const { data, error } = await db
        .from('reservations')
        .insert(cleaned)
        .select('*')
        .single()

      if (!error && data?.id) {
        reservation = data
        break
      }
      insertError = error
      console.error('Reservation insert attempt failed:', error?.message)
    }

    if (!reservation) {
      console.error('Reservation insert error:', insertError)
      return NextResponse.json(
        {
          error:
            insertError?.message?.includes('relation')
              ? 'Reservations table is not set up. Run the Supabase migration.'
              : 'Failed to create reservation. Please try again or call us to book.',
        },
        { status: 500 }
      )
    }

    try {
      await sendReservationReceivedEmail(
        reservation as Parameters<typeof sendReservationReceivedEmail>[0]
      )
    } catch (emailErr) {
      console.error('Reservation received email error:', emailErr)
    }

    return NextResponse.json({ success: true, data: reservation })
  } catch (err) {
    console.error('Reservations API error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
