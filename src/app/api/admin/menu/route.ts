import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const [catRes, itemRes] = await Promise.all([
      db.from('menu_categories').select('*').order('sort_order'),
      db.from('menu_items').select('*').order('sort_order'),
    ])

    if (catRes.error || itemRes.error) {
      console.error('Menu fetch:', catRes.error, itemRes.error)
      return NextResponse.json({ error: 'Failed to load menu' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      categories: catRes.data ?? [],
      items: itemRes.data ?? [],
    })
  } catch (err) {
    console.error('Admin menu GET:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
