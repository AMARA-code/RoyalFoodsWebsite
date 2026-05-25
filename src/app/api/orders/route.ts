import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateOrderRef } from '@/lib/utils'
import { getSiteConfig } from '@/lib/site-settings'
import { sendAdminNewOrderEmail } from '@/lib/email'
import { isDigitalPayment } from '@/lib/orders'
import type { PaymentMethod } from '@/types/database'
import type { CartItem } from '@/types/index'

interface CreateOrderBody {
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: string
  payment_method: PaymentMethod
  special_instructions?: string
  payment_screenshot?: string
  payment_reference?: string
  items: CartItem[]
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderBody

    const {
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      payment_method,
      special_instructions,
      payment_screenshot,
      payment_reference,
      items,
    } = body

    if (!customer_name?.trim() || !customer_phone?.trim() || !delivery_address?.trim()) {
      return NextResponse.json(
        { error: 'Name, phone, and delivery address are required' },
        { status: 400 }
      )
    }

    if (!['easypaisa', 'jazzcash', 'cod'].includes(payment_method)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

    if (!items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const siteConfig = await getSiteConfig()
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    const delivery_fee = siteConfig.delivery_fee
    const total_amount = subtotal + delivery_fee
    const order_ref = generateOrderRef()

    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const normalizedEmail = customer_email?.trim().toLowerCase() || null
    let customer_id: string | null = null

    if (normalizedEmail || customer_phone) {
      let existingQuery = db
        .from('customers')
        .select('id, total_orders, total_spent')

      if (normalizedEmail) {
        existingQuery = existingQuery.eq('email', normalizedEmail)
      } else {
        existingQuery = existingQuery.eq('phone', customer_phone.trim())
      }

      const { data: existing } = await existingQuery.maybeSingle()

      if (existing) {
        customer_id = existing.id
        await db
          .from('customers')
          .update({
            name: customer_name,
            email: normalizedEmail,
            phone: customer_phone.trim(),
            total_orders: (existing.total_orders ?? 0) + 1,
          })
          .eq('id', existing.id)
      } else {
        const { data: created } = await db
          .from('customers')
          .insert({
            name: customer_name,
            email: normalizedEmail,
            phone: customer_phone.trim(),
            total_orders: 1,
            total_spent: 0,
          })
          .select('id')
          .single()

        customer_id = created?.id ?? null
      }
    }

    const hasPaymentProof =
      isDigitalPayment(payment_method) &&
      Boolean(payment_screenshot?.trim())

    const initialStatus = hasPaymentProof ? 'payment_pending' : 'pending'

    const { data: order, error: orderError } = await db
      .from('orders')
      .insert({
        order_ref,
        customer_id,
        customer_name: customer_name.trim(),
        customer_email: normalizedEmail,
        customer_phone: customer_phone.trim(),
        delivery_address: delivery_address.trim(),
        status: initialStatus,
        payment_method,
        payment_verified: false,
        payment_screenshot: payment_screenshot?.trim() || null,
        payment_reference: payment_reference?.trim() || null,
        subtotal,
        delivery_fee,
        total_amount,
        special_instructions: special_instructions?.trim() || null,
      })
      .select('*')
      .single()

    if (orderError || !order) {
      console.error('Order insert error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }))

    const { error: itemsError } = await db.from('order_items').insert(orderItems)

    if (itemsError) {
      console.error('Order items error:', itemsError)
      await db.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: 'Failed to save order items' }, { status: 500 })
    }

    try {
      await sendAdminNewOrderEmail(order)
    } catch (emailErr) {
      console.error('Admin order notification error:', emailErr)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        order_ref: order.order_ref,
        status: order.status,
        payment_method: order.payment_method,
        total_amount: order.total_amount,
      },
    })
  } catch (err) {
    console.error('Orders API error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
