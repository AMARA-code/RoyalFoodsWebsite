import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { parsePublicSettings } from '@/lib/promo'

/** Public site settings (announcement, contact, promo, etc.) — no auth required. */
export async function GET() {
  try {
    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const { data, error } = await db.from('site_settings').select('key, value')

    if (error) {
      console.error('Public settings fetch:', error)
      return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
    }

    const map = Object.fromEntries(
      ((data ?? []) as { key: string; value: unknown }[]).map((row) => [row.key, row.value])
    )

    return NextResponse.json({ success: true, data: parsePublicSettings(map) })
  } catch (err) {
    console.error('Public settings GET:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
