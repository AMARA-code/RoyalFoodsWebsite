import Link from 'next/link'
import { ROYAL_FOODS } from '@/lib/constants'

export default function PrivacyPage() {
  return (
    <div className="container-eclat py-12 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
        {ROYAL_FOODS.name} collects your name, phone number, and delivery address solely to process and deliver your order.
        We do not share your information with third parties except as needed to fulfil your order.
      </p>
      <Link href="/" className="text-[var(--accent-crimson)] text-sm font-medium">← Back to Menu</Link>
    </div>
  )
}
