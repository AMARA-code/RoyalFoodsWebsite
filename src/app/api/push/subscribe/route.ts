import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface PushSubscriptionJSON {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

interface StoredPushSubscription extends PushSubscriptionJSON {
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

function isStoredPushSubscription(value: unknown): value is StoredPushSubscription {
  if (!value || typeof value !== 'object') return false

  const item = value as Record<string, unknown>
  return (
    typeof item.endpoint === 'string' &&
    typeof item.keys === 'object' &&
    item.keys !== null &&
    typeof (item.keys as { p256dh?: unknown }).p256dh === 'string' &&
    typeof (item.keys as { auth?: unknown }).auth === 'string'
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const action = body?.action === 'unsubscribe' ? 'unsubscribe' : 'subscribe'
    const subscription = body?.subscription as PushSubscriptionJSON | undefined

    if (action === 'unsubscribe') {
      if (!subscription?.endpoint) {
        return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
      }

      const supabase = await createAdminClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any
      const { data: existing } = await db
        .from('site_settings')
        .select('value')
        .eq('key', 'push_subscriptions')
        .maybeSingle()

      const subs: StoredPushSubscription[] = Array.isArray(existing?.value)
        ? existing.value.filter(isStoredPushSubscription)
        : []

      const filtered = subs.filter((item) => item.endpoint !== subscription.endpoint)
      await db.from('site_settings').upsert(
        { key: 'push_subscriptions', value: filtered },
        { onConflict: 'key' }
      )

      return NextResponse.json({ success: true, subscribers: filtered.length })
    }

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const { data: existing } = await db
      .from('site_settings')
      .select('value')
      .eq('key', 'push_subscriptions')
      .maybeSingle()

    const subs: StoredPushSubscription[] = Array.isArray(existing?.value)
      ? existing.value.filter(isStoredPushSubscription)
      : []

    const now = new Date().toISOString()
    const existingIndex = subs.findIndex((item) => item.endpoint === subscription.endpoint)

    if (existingIndex >= 0) {
      subs[existingIndex] = {
        ...subs[existingIndex],
        ...subscription,
        active: true,
        updatedAt: now,
      }
    } else {
      subs.push({
        ...subscription,
        active: true,
        createdAt: now,
        updatedAt: now,
      })
    }

    const activeSubs = subs.filter((item) => item.active !== false)

    await db.from('site_settings').upsert(
      { key: 'push_subscriptions', value: activeSubs },
      { onConflict: 'key' }
    )

    return NextResponse.json({ success: true, subscribers: activeSubs.length })
  } catch {
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}
