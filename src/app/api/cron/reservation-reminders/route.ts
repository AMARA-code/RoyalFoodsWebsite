import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendReservationReminderEmail } from '@/lib/email'

function getReservationDateTime(date: string, time_slot: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time_slot.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm, 0, 0)
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const { data: reservations, error } = await db
      .from('reservations')
      .select('*')
      .eq('status', 'confirmed')

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 })
    }

    const now = new Date()
    let sent24 = 0
    let sent1 = 0

    for (const r of reservations ?? []) {
      const resDt = getReservationDateTime(r.date, r.time_slot)
      const hoursUntil = (resDt.getTime() - now.getTime()) / (1000 * 60 * 60)

      if (hoursUntil < 0) continue

      if (hoursUntil >= 23 && hoursUntil <= 25 && r.customer_email) {
        const alreadySent = r.reminder_24h_sent === true
        if (!alreadySent) {
          try {
            await sendReservationReminderEmail(r, '24h')
            await db
              .from('reservations')
              .update({ reminder_24h_sent: true })
              .eq('id', r.id)
            sent24++
          } catch (e) {
            console.error('24h reminder failed:', r.id, e)
          }
        }
      }

      if (hoursUntil >= 0.75 && hoursUntil <= 1.25 && r.customer_email) {
        const alreadySent = r.reminder_1h_sent === true
        if (!alreadySent) {
          try {
            await sendReservationReminderEmail(r, '1h')
            await db
              .from('reservations')
              .update({ reminder_1h_sent: true })
              .eq('id', r.id)
            sent1++
          } catch (e) {
            console.error('1h reminder failed:', r.id, e)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent: { reminder_24h: sent24, reminder_1h: sent1 },
    })
  } catch (err) {
    console.error('Cron reminders error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
