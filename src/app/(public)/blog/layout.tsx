import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events & Journal',
  description:
    'Explore exclusive dining events, chef masterclasses, and stories from the kitchen at Éclat Fine Dining Restaurant.',
  openGraph: {
    title: 'Events & Journal | Éclat Fine Dining',
    description:
      'Exclusive evenings, culinary masterclasses and stories from our kitchen.',
    type: 'website',
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}