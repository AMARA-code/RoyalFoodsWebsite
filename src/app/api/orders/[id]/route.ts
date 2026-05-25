import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { Order } from '@/types/database'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const { data: order, error } = await db
      .from('orders')
      .select(
        `
        id,
        order_ref,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        status,
        payment_method,
        payment_verified,
        payment_screenshot,
        payment_reference,
        subtotal,
        delivery_fee,
        total_amount,
        special_instructions,
        created_at,
        updated_at,
        order_items (
          id,
          name,
          price,
          quantity,
          subtotal
        )
      `
      )
      .eq('id', id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (err) {
    console.error('Order GET error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const { data: existing, error: fetchError } = (await db
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()) as { data: Order | null; error: Error | null }

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (body.action === 'upload_payment') {
      const screenshot = body.payment_screenshot as string | undefined
      const paymentReference = (body.payment_reference as string | undefined)?.trim()

      if (!screenshot) {
        return NextResponse.json({ error: 'Screenshot URL required' }, { status: 400 })
      }

      if (!['easypaisa', 'jazzcash'].includes(existing.payment_method)) {
        return NextResponse.json(
          { error: 'Payment upload not required for this method' },
          { status: 400 }
        )
      }

      if (existing.status === 'delivered' || existing.status === 'cancelled') {
        return NextResponse.json({ error: 'Order cannot be updated' }, { status: 400 })
      }

      const keepStatus = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(
        existing.status
      )
      const nextStatus = keepStatus ? existing.status : 'payment_pending'

      const { data: updated, error } = await db
        .from('orders')
        .update({
          payment_screenshot: screenshot,
          payment_reference: paymentReference || existing.payment_reference || null,
          status: nextStatus,
        })
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: updated })
    }

    return NextResponse.json({ error: 'Invalid update' }, { status: 400 })
  } catch (err) {
    console.error('Order PATCH error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
