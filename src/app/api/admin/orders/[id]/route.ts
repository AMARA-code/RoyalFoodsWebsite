import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendOrderConfirmedEmailOrReport } from '@/lib/email'
import {
  applyCustomerRevenue,
  canAdminChangeStatus,
  isDigitalPayment,
} from '@/lib/orders'
import type { Order, OrderStatus } from '@/types/database'

interface RouteContext {
  params: Promise<{ id: string }>
}

function emailErrorMessage(result: Extract<Awaited<ReturnType<typeof sendOrderConfirmedEmailOrReport>>, { ok: false }>) {
  if (result.reason === 'missing_email') {
    return 'Customer email is missing or invalid. Confirmation email was not sent.'
  }
  return result.message
}

async function confirmWithEmail(updated: Order) {
  const emailResult = await sendOrderConfirmedEmailOrReport(updated)
  if (!emailResult.ok) {
    return {
      success: true as const,
      data: updated,
      emailError: emailErrorMessage(emailResult),
    }
  }
  return { success: true as const, data: updated }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getOrder(db: any, id: string) {
  const { data, error } = await db.from('orders').select('*').eq('id', id).single()
  return { order: data as Order | null, error }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const { order: existing, error: fetchError } = await getOrder(db, id)
    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!canAdminChangeStatus(existing)) {
      return NextResponse.json(
        { error: 'Delivered and cancelled orders cannot be modified' },
        { status: 400 }
      )
    }

    const action = body.action as string | undefined

    if (action === 'verify_payment') {
      if (!isDigitalPayment(existing.payment_method)) {
        return NextResponse.json({ error: 'Not a digital payment order' }, { status: 400 })
      }
      if (existing.payment_verified) {
        return NextResponse.json({ error: 'Payment already verified' }, { status: 400 })
      }

      const wasVerified = existing.payment_verified
      const needsConfirm = ['pending', 'payment_pending'].includes(existing.status)
      const updates: Record<string, unknown> = {
        payment_verified: true,
        verified_at: new Date().toISOString(),
      }
      if (needsConfirm) {
        updates.status = 'confirmed'
      }

      const { data: updated, error } = await db
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single()

      if (error || !updated) {
        return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
      }

      await applyCustomerRevenue(db, updated, wasVerified)

      if (needsConfirm) {
        return NextResponse.json(await confirmWithEmail(updated))
      }

      return NextResponse.json({ success: true, data: updated })
    }

    if (action === 'confirm_order') {
      if (existing.status === 'confirmed' && existing.payment_verified) {
        return NextResponse.json({ error: 'Order is already confirmed' }, { status: 400 })
      }

      const wasVerified = existing.payment_verified
      const updates: Record<string, unknown> = { status: 'confirmed' }
      if (isDigitalPayment(existing.payment_method) && !existing.payment_verified) {
        updates.payment_verified = true
        updates.verified_at = new Date().toISOString()
      }

      const { data: updated, error } = await db
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single()

      if (error || !updated) {
        return NextResponse.json({ error: 'Failed to confirm order' }, { status: 500 })
      }

      await applyCustomerRevenue(db, updated, wasVerified)

      if (existing.status !== 'confirmed') {
        return NextResponse.json(await confirmWithEmail(updated))
      }

      return NextResponse.json({ success: true, data: updated })
    }

    const newStatus = body.status as OrderStatus | undefined
    if (newStatus) {
      if (newStatus === 'delivered' && existing.payment_method === 'cod' && !existing.payment_verified) {
        const wasVerified = existing.payment_verified
        const { data: updated, error } = await db
          .from('orders')
          .update({
            status: 'delivered',
            payment_verified: true,
            verified_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select('*')
          .single()

        if (error || !updated) {
          return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
        }

        await applyCustomerRevenue(db, updated, wasVerified)
        return NextResponse.json({ success: true, data: updated })
      }

      const updates: Record<string, unknown> = { status: newStatus }

      if (newStatus === 'confirmed' && existing.status !== 'confirmed') {
        if (isDigitalPayment(existing.payment_method) && !existing.payment_verified) {
          updates.payment_verified = true
          updates.verified_at = new Date().toISOString()
        }

        const wasVerified = existing.payment_verified
        const { data: updated, error } = await db
          .from('orders')
          .update(updates)
          .eq('id', id)
          .select('*')
          .single()

        if (error || !updated) {
          return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
        }

        await applyCustomerRevenue(db, updated, wasVerified)

        return NextResponse.json(await confirmWithEmail(updated))
      }

      // Already confirmed but payment never verified (legacy / early confirm)
      if (
        newStatus === 'confirmed' &&
        existing.status === 'confirmed' &&
        isDigitalPayment(existing.payment_method) &&
        !existing.payment_verified
      ) {
        const wasVerified = existing.payment_verified
        const { data: updated, error } = await db
          .from('orders')
          .update({
            payment_verified: true,
            verified_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select('*')
          .single()

        if (error || !updated) {
          return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
        }

        await applyCustomerRevenue(db, updated, wasVerified)
        return NextResponse.json({ success: true, data: updated })
      }

      const { data: updated, error } = await db
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single()

      if (error || !updated) {
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: updated })
    }

    return NextResponse.json({ error: 'Invalid update' }, { status: 400 })
  } catch (err) {
    console.error('Admin order PATCH error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
