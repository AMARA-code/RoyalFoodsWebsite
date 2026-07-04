import { formatDate, formatTime } from '@/lib/utils'

interface ReservationICSInput {
  booking_ref: string
  customer_name: string
  date: string
  time_slot: string
  party_size: number
  restaurant_name?: string
  address?: string
}

function formatICSDate(date: string, time: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const dt = new Date(y, m - 1, d, hh, mm, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`
}

export function buildReservationICS(input: ReservationICSInput): string {
  const restaurant = input.restaurant_name ?? 'Éclat Restaurant'
  const start = formatICSDate(input.date, input.time_slot)
  const [hh, mm] = input.time_slot.split(':').map(Number)
  const endHour = hh + 2
  const endTime = `${String(endHour).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  const end = formatICSDate(input.date, endTime)
  const uid = `${input.booking_ref}@eclatrestaurant.com`
  const summary = `Table for ${input.party_size} — ${restaurant}`
  const description = [
    `Booking: ${input.booking_ref}`,
    `Guest: ${input.customer_name}`,
    `Party of ${input.party_size}`,
    `Time: ${formatTime(input.time_slot)}`,
    `Date: ${formatDate(input.date)}`,
  ].join('\\n')

  const location = input.address ?? 'Éclat Fine Dining'

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Éclat Restaurant//Reservations//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(new Date().toISOString().slice(0, 10), '12:00')}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadICS(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
