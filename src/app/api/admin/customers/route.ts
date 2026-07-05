import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { Customer } from '@/types/database'

type CustomerRow = Customer & {
  live_order_count: number
  live_verified_spent: number
}

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? ''
}

export async function GET() {
  try {
    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const [{ data: customers, error: custErr }, { data: orders, error: ordErr }] =
      await Promise.all([
        db.from('customers').select('*').order('created_at', { ascending: false }),
        db
          .from('orders')
          .select('customer_id, customer_email, total_amount, payment_verified'),
      ])

    if (custErr) {
      console.error('Customers fetch:', custErr)
      return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 })
    }
    if (ordErr) {
      console.error('Orders fetch for customers:', ordErr)
      return NextResponse.json({ error: 'Failed to load order stats' }, { status: 500 })
    }

    const orderList = (orders ?? []) as {
      customer_id: string | null
      customer_email: string | null
      total_amount: number
      payment_verified: boolean
    }[]

    const enriched: CustomerRow[] = (customers ?? []).map((c: Customer) => {
      const emailKey = normalizeEmail(c.email)
      const matched = orderList.filter((o) => {
        if (c.id && o.customer_id === c.id) return true
        if (emailKey && normalizeEmail(o.customer_email) === emailKey) return true
        return false
      })
      return {
        ...c,
        live_order_count: matched.length,
        live_verified_spent: matched
          .filter((o) => o.payment_verified)
          .reduce((sum, o) => sum + (o.total_amount ?? 0), 0),
      }
    })

    const withEmail = enriched.filter((c) => c.email?.trim())
    const stats = {
      total: enriched.length,
      withEmail: withEmail.length,
      totalOrders: enriched.reduce((s, c) => s + c.live_order_count, 0),
      totalSpent: enriched.reduce((s, c) => s + c.live_verified_spent, 0),
    }

    return NextResponse.json({ success: true, data: enriched, stats })
  } catch (err) {
    console.error('Admin customers GET:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

/** Recompute total_orders & total_spent on customers from verified orders. */
export async function POST() {
  try {
    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const { data: customers, error: custErr } = await db.from('customers').select('*')
    if (custErr) {
      return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 })
    }

    const { data: orders, error: ordErr } = await db
      .from('orders')
      .select('customer_id, customer_email, total_amount, payment_verified')
    if (ordErr) {
      return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 })
    }

    const orderList = (orders ?? []) as {
      customer_id: string | null
      customer_email: string | null
      total_amount: number
      payment_verified: boolean
    }[]

    let updated = 0
    for (const c of customers ?? []) {
      const emailKey = normalizeEmail(c.email)
      const matched = orderList.filter((o) => {
        if (c.id && o.customer_id === c.id) return true
        if (emailKey && normalizeEmail(o.customer_email) === emailKey) return true
        return false
      })
      const total_orders = matched.length
      const total_spent = matched
        .filter((o) => o.payment_verified)
        .reduce((sum, o) => sum + (o.total_amount ?? 0), 0)

      const { error } = await db
        .from('customers')
        .update({ total_orders, total_spent, updated_at: new Date().toISOString() })
        .eq('id', c.id)

      if (!error) updated++
    }

    return NextResponse.json({ success: true, updated })
  } catch (err) {
    console.error('Admin customers sync:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

/** Remove all customer records. */
export async function DELETE() {
  try {
    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const { error } = await db
      .from('customers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
      console.error('Customers delete:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin customers DELETE:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
