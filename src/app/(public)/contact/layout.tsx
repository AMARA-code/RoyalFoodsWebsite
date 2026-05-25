import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Éclat Fine Dining for reservations, private dining enquiries, or general questions. Visit us at 123 Luxury Avenue, Prestige District.',
  openGraph: {
    title: 'Contact Us | Éclat Fine Dining',
    description:
      'Reach out for reservations, private dining, and enquiries.',
    type: 'website',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}