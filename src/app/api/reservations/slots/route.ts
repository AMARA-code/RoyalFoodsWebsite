import { NextResponse } from 'next/server'
import { getSlotsForDate } from '@/lib/reservation-slots-server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Valid date parameter required (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    const slots = await getSlotsForDate(date)
    return NextResponse.json({ success: true, data: slots })
  } catch (err) {
    console.error('Slots API error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
