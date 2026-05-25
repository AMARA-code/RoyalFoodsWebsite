import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    console.log('ID received:', id)

    if (!id || id === 'undefined') {
      return NextResponse.json({ error: 'Invalid reservation id' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    console.log('Supabase client created')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const { data, error } = await db
      .from('reservations')
      .select('id, booking_ref, customer_name, customer_email, customer_phone, date, time_slot, party_size, status, special_requests, cancel_token, created_at')
      .eq('id', id)
      .maybeSingle()

    console.log('DB result:', JSON.stringify({ data, error }))

    if (error) {
      console.error('Reservation GET error:', error)
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Reservation GET caught error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}