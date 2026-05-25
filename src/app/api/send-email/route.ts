import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import {
  sendAdminNewOrderEmail,
  sendOrderConfirmedEmail,
} from '@/lib/email'

/**
 * Internal email trigger — used by admin CRM (Phase 6) or webhooks.
 * Requires a shared secret in production.
 */
export async function POST(request: Request) {
  try {
    const secret = request.headers.get('x-email-secret')
    if (
      process.env.EMAIL_API_SECRET &&
      secret !== process.env.EMAIL_API_SECRET
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { order_id, type } = await request.json()

    if (!order_id || !type) {
      return NextResponse.json(
        { error: 'order_id and type are required' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order, error } = await (supabase as any)
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    switch (type) {
      case 'order_placed':
      case 'admin_new_order':
        await sendAdminNewOrderEmail(order)
        break
      case 'order_confirmed':
      case 'payment_received':
        await sendOrderConfirmedEmail(order)
        break
      default:
        return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Send email error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
