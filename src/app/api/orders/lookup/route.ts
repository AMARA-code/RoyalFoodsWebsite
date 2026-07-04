import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = (body.email as string | undefined)?.trim().toLowerCase()
    const phone = (body.phone as string | undefined)?.trim()

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    let query = db
      .from('orders')
      .select(
        `
        id,
        order_ref,
        customer_name,
        customer_email,
        customer_phone,
        status,
        payment_method,
        payment_verified,
        total_amount,
        created_at,
        order_items ( id, name, quantity, subtotal )
      `
      )
      .order('created_at', { ascending: false })
      .limit(50)

    if (email) {
      query = query.eq('customer_email', email)
    } else {
      query = query.eq('customer_phone', phone!)
    }

    const { data, error } = await query

    if (error) {
      console.error('Order lookup error:', error)
      return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data ?? [] })
  } catch (err) {
    console.error('Order lookup error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
