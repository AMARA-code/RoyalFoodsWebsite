import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendReservationCancelledEmail } from '@/lib/email'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(`${SITE_URL}/reservations?error=missing_token`)
    }

    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const { data: reservation, error: findError } = await db
      .from('reservations')
      .select('*')
      .eq('cancel_token', token)
      .maybeSingle()

    if (findError || !reservation) {
      return NextResponse.redirect(`${SITE_URL}/reservations?error=invalid_token`)
    }

    if (reservation.status === 'cancelled') {
      return NextResponse.redirect(
        `${SITE_URL}/reservations/cancelled?ref=${reservation.booking_ref}&already=1`
      )
    }

    const { error: updateError } = await db
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservation.id)

    if (updateError) {
      return NextResponse.redirect(`${SITE_URL}/reservations?error=cancel_failed`)
    }

    try {
      await sendReservationCancelledEmail(reservation)
    } catch (emailErr) {
      console.error('Cancel email error:', emailErr)
    }

    return NextResponse.redirect(
      `${SITE_URL}/reservations/cancelled?ref=${encodeURIComponent(reservation.booking_ref)}`
    )
  } catch (err) {
    console.error('Cancel reservation error:', err)
    return NextResponse.redirect(`${SITE_URL}/reservations?error=cancel_failed`)
  }
}

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const { data: reservation } = await db
      .from('reservations')
      .select('*')
      .eq('cancel_token', token)
      .maybeSingle()

    if (!reservation) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    if (reservation.status === 'cancelled') {
      return NextResponse.json({ success: true, data: reservation, already: true })
    }

    const { data: updated, error } = await db
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservation.id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to cancel' }, { status: 500 })
    }

    try {
      await sendReservationCancelledEmail(updated)
    } catch (emailErr) {
      console.error('Cancel email error:', emailErr)
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    console.error('Cancel POST error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
