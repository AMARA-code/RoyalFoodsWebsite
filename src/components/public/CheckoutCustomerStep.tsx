'use client'

import { useEffect } from 'react'
import { useOrderPrefill } from '@/hooks/useOrderPrefill'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

interface CustomerInfoData {
  name:     string
  email:    string
  phone:    string
  address:  string
  instructions: string
}

interface Props {
  data:     CustomerInfoData
  onChange: (data: CustomerInfoData) => void
  onNext:   () => void
}

/**
 * Step 1 of checkout — customer info form.
 * Pre-fills name/email/phone from signed-in user's account.
 * Drop this into your multi-step checkout wizard at Step 1.
 */
export default function CheckoutCustomerStep({ data, onChange, onNext }: Props) {
  const { prefill, ready } = useOrderPrefill()
  const { user } = useAuth()

  // Pre-fill once auth data is ready (only if fields are empty)
  useEffect(() => {
    if (!ready) return
    onChange({
      ...data,
      name:  data.name  || prefill.name,
      email: data.email || prefill.email,
      phone: data.phone || prefill.phone,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  function set(field: keyof CustomerInfoData, value: string) {
    onChange({ ...data, [field]: value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Auth notice */}
      {!user && (
        <div className="flex items-start gap-3 px-4 py-3 bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/20 rounded">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1.5" strokeLinecap="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p className="text-[var(--text-muted)] text-xs leading-relaxed">
            <Link href="/signin?redirect=/order" className="text-[var(--accent-gold)] hover:underline">Sign in</Link> to auto-fill your details and track your orders.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="text-label text-[var(--text-secondary)] tracking-widest text-[0.6rem] block mb-1.5">
            FULL NAME <span className="text-[var(--accent-crimson)]">*</span>
          </label>
          <input
            type="text"
            value={data.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Your full name"
            required
            className="input-eclat w-full"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="text-label text-[var(--text-secondary)] tracking-widest text-[0.6rem] block mb-1.5">
            PHONE <span className="text-[var(--accent-crimson)]">*</span>
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="+92 300 0000000"
            required
            className="input-eclat w-full"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="text-label text-[var(--text-secondary)] tracking-widest text-[0.6rem] block mb-1.5">
          EMAIL ADDRESS
        </label>
        <input
          type="email"
          value={data.email}
          onChange={e => set('email', e.target.value)}
          placeholder="For order confirmation (optional)"
          className="input-eclat w-full"
        />
      </div>

      {/* Delivery address */}
      <div>
        <label className="text-label text-[var(--text-secondary)] tracking-widest text-[0.6rem] block mb-1.5">
          DELIVERY ADDRESS <span className="text-[var(--accent-crimson)]">*</span>
        </label>
        <input
          type="text"
          value={data.address}
          onChange={e => set('address', e.target.value)}
          placeholder="Full delivery address"
          required
          className="input-eclat w-full"
        />
      </div>

      {/* Special instructions */}
      <div>
        <label className="text-label text-[var(--text-secondary)] tracking-widest text-[0.6rem] block mb-1.5">
          SPECIAL INSTRUCTIONS
        </label>
        <textarea
          value={data.instructions}
          onChange={e => set('instructions', e.target.value)}
          placeholder="Allergies, dietary requirements, delivery notes…"
          rows={3}
          className="input-eclat w-full resize-none"
        />
      </div>

      <button type="submit" className="btn-crimson w-full justify-center">
        Continue to Payment
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="ml-2">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </form>
  )
}