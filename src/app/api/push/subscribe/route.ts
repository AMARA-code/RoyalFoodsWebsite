import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface PushSubscriptionJSON {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const subscription = body.subscription as PushSubscriptionJSON
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

    const subs: PushSubscriptionJSON[] = Array.isArray(existing?.value)
      ? existing.value.filter(
          (item: unknown): item is PushSubscriptionJSON =>
            Boolean(item && typeof item === 'object' && 'endpoint' in (item as Record<string, unknown>))
        )
      : []

    const already = subs.findIndex((item) => item.endpoint === subscription.endpoint)
    if (already >= 0) {
      subs[already] = subscription
    } else {
      subs.push(subscription)
    }

    await db.from('site_settings').upsert(
      { key: 'push_subscriptions', value: subs },
      { onConflict: 'key' }
    )

    return NextResponse.json({ success: true, subscribers: subs.length })
  } catch {
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}
