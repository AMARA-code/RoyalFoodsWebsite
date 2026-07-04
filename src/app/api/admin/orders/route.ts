import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/** Remove all orders and their line items. */
export async function DELETE() {
  try {
    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const { error: itemsErr } = await db
      .from('order_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (itemsErr) {
      console.error('Order items delete:', itemsErr)
      return NextResponse.json({ error: itemsErr.message }, { status: 500 })
    }

    const { error: ordersErr } = await db
      .from('orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (ordersErr) {
      console.error('Orders delete:', ordersErr)
      return NextResponse.json({ error: ordersErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Orders DELETE:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
