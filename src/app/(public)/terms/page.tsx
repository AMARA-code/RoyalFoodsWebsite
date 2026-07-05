import Link from 'next/link'
import { ROYAL_FOODS } from '@/lib/constants'

export default function TermsPage() {
  return (
    <div className="container-eclat py-12 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Terms and Conditions</h1>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
        By placing an order with {ROYAL_FOODS.name}, you agree to provide accurate contact and delivery information.
        Orders are subject to availability. Delivery times are estimates and may vary.
      </p>
      <Link href="/" className="text-[var(--accent-crimson)] text-sm font-medium">← Back to Menu</Link>
    </div>
  )
}
