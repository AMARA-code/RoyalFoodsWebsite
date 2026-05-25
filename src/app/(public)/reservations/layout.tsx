import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reserve a Table',
  description:
    'Book your table at Éclat Fine Dining. Choose your date, party size, and preferred time slot.',
}

export default function ReservationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
