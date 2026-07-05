import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'amaranaeem453@gmail.com'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, body, url } = await request.json()
    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: 'Title and body required' }, { status: 400 })
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    const subject = process.env.VAPID_SUBJECT ?? 'mailto:amaranaeem453@gmail.com'

    if (!publicKey || !privateKey) {
      return NextResponse.json(
        { error: 'Push notifications not configured. Add VAPID keys to environment.' },
        { status: 503 }
      )
    }

    webpush.setVapidDetails(subject, publicKey, privateKey)

    const admin = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin as any)
      .from('site_settings')
      .select('value')
      .eq('key', 'push_subscriptions')
      .maybeSingle()

    const subs = Array.isArray(data?.value)
      ? data.value.filter(
          (item: unknown): item is { endpoint: string; keys: { p256dh: string; auth: string } } =>
            Boolean(item && typeof item === 'object' && 'endpoint' in (item as Record<string, unknown>))
        )
      : []

    if (subs.length === 0) {
      return NextResponse.json({ error: 'No subscribers yet' }, { status: 400 })
    }

    const payload = JSON.stringify({ title, body, url: url || '/' })
    let sent = 0
    const stale: string[] = []

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(sub, payload)
          sent++
        } catch (err: unknown) {
          const status = (err as { statusCode?: number })?.statusCode
          if (status === 404 || status === 410) stale.push(sub.endpoint)
        }
      })
    )

    if (stale.length > 0) {
      const cleaned = subs.filter((s) => !stale.includes(s.endpoint))
      await (admin as any).from('site_settings').upsert(
        { key: 'push_subscriptions', value: cleaned },
        { onConflict: 'key' }
      )
    }

    return NextResponse.json({ success: true, sent, total: subs.length })
  } catch (err) {
    console.error('Push broadcast error:', err)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}
