'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Banknote, CreditCard, CheckCircle2, ShoppingBag, Plus, Minus } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { createClient } from '@/lib/supabase/client'
import { usePublicSettings } from '@/hooks/usePublicSettings'
import { useOrderPricing } from '@/hooks/useOrderPricing'
import { formatPrice } from '@/lib/utils'
import { normalizeEmail } from '@/lib/email-utils'
import { applyDiscount } from '@/lib/promo'
import { DEFAULT_SITE_CONFIG } from '@/lib/constants'
import type { SiteConfig } from '@/types/index'
import type { PaymentMethod } from '@/types/database'
import toast from 'react-hot-toast'

export default function RoyalFoodsCheckout() {
  const router = useRouter()
  const { items, clearCart, isEmpty, updateQuantity, removeItem } = useCart()
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG)
  const [submitting, setSubmitting] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<{ id: string; order_ref: string } | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [deliveryTime, setDeliveryTime] = useState('asap')

  const [form, setForm] = useState({
    name: '',
    phone: '+92 ',
    email: '',
    address: '',
    payment_method: 'cod' as PaymentMethod,
    special_instructions: '',
  })

  const { settings } = usePublicSettings()
  const {
    subtotal,
    discountAmount,
    deliveryFee,
    grandTotal,
    promo,
    freeDeliveryApplied,
    freeDeliveryThreshold,
  } = useOrderPricing()
  const promoActive = promo.enabled && promo.percent > 0

  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).from('site_settings').select('key, value')
      if (!data?.length) return
      const map = Object.fromEntries(
        (data as { key: string; value: unknown }[]).map((r) => [r.key, r.value])
      )
      setSiteConfig((prev) => ({
        ...prev,
        delivery_fee: Number(map.delivery_fee) ?? Number((map.delivery as { fee?: number })?.fee) ?? prev.delivery_fee,
      }))
    }
    loadSettings()
  }, [])

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function placeOrder() {
    if (!form.name.trim()) {
      toast.error('Please enter your full name')
      return
    }
    if (!form.phone.trim() || form.phone.trim() === '+92') {
      toast.error('Please enter your mobile number')
      return
    }
    if (!form.address.trim()) {
      toast.error('Please add your delivery address')
      return
    }
    if (!form.email.trim()) {
      toast.error('Email is required for order confirmation')
      return
    }
    if (!normalizeEmail(form.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_email: form.email.trim(),
          customer_phone: form.phone,
          delivery_address: form.address,
          payment_method: form.payment_method,
          special_instructions: [
            form.special_instructions,
            deliveryTime !== 'asap' ? `Delivery time: ${deliveryTime}` : 'Delivery: ASAP',
          ].filter(Boolean).join(' | '),
          items,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to place order')

      setPlacedOrder({ id: json.data.id, order_ref: json.data.order_ref })
      clearCart()
      toast.success('Order placed successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not place order')
    } finally {
      setSubmitting(false)
    }
  }

  if (isEmpty && !placedOrder) {
    return (
      <div className="text-center py-20">
        <ShoppingBag size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
        <h1 className="text-xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">Add items from the menu to checkout.</p>
        <Link href="/" className="btn-crimson">Browse Menu</Link>
      </div>
    )
  }

  if (placedOrder) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center py-12"
      >
        <CheckCircle2 size={56} className="mx-auto mb-4 text-green-600" />
        <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
        <p className="text-[var(--text-muted)] mb-1">Reference:</p>
        <p className="text-lg font-bold text-[var(--accent-crimson)] mb-6">{placedOrder.order_ref}</p>
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          We&apos;ll confirm your order shortly. Pay cash on delivery when your food arrives.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button type="button" onClick={() => router.push(`/order/${placedOrder.id}`)} className="btn-crimson">
            Track Order
          </button>
          <Link href="/" className="btn-outline text-center">Order More</Link>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <nav className="text-xs text-[var(--text-muted)] mb-6">
        <Link href="/" className="hover:text-[var(--accent-crimson)]">Home</Link>
        <span className="mx-2">›</span>
        <span>Checkout</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left — Form */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <h1 className="text-xl font-bold">Checkout</h1>

          {/* Personal info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full rounded-lg border border-[var(--border-default)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--accent-crimson)]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Mobile Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full rounded-lg border border-[var(--border-default)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--accent-crimson)]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">
                Email <span className="text-[var(--accent-crimson)]">*</span>
              </label>
              <input
                type="email"
                placeholder="For order confirmation email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--border-default)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--accent-crimson)]"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Your Address</h2>
              <button
                type="button"
                onClick={() => setShowAddressForm(true)}
                className="text-sm font-semibold text-[var(--accent-crimson)] flex items-center gap-1"
              >
                <Plus size={14} /> Add New Address
              </button>
            </div>
            {showAddressForm || form.address ? (
              <textarea
                placeholder="Street, area, landmark..."
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[var(--border-default)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--accent-crimson)] resize-none"
              />
            ) : (
              <p className="text-sm text-[var(--text-muted)] py-4 px-4 bg-[var(--bg-elevated)] rounded-lg">
                You don&apos;t have a saved address.
              </p>
            )}
          </div>

          {/* Delivery time */}
          <div>
            <h2 className="font-semibold mb-3">Choose Delivery Time</h2>
            <select
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-default)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--accent-crimson)] bg-white"
            >
              <option value="asap">ASAP (default)</option>
              <option value="30min">In 30 minutes</option>
              <option value="45min">In 45 minutes</option>
              <option value="1hr">In 1 hour</option>
              <option value="1.5hr">In 1.5 hours</option>
              <option value="2hr">In 2 hours</option>
            </select>
          </div>

          {/* Payment */}
          <div>
            <h2 className="font-semibold mb-3">Select Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateField('payment_method', 'cod')}
                className={[
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-colors text-left',
                  form.payment_method === 'cod'
                    ? 'border-[var(--accent-crimson)] bg-[var(--accent-crimson)]/5'
                    : 'border-[var(--border-default)] hover:border-[var(--border-accent)]',
                ].join(' ')}
              >
                <Banknote size={24} className="text-green-600" />
                <span className="font-medium text-sm">Cash On Delivery</span>
              </button>
              <button
                type="button"
                onClick={() => updateField('payment_method', 'cod')}
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-[var(--border-default)] opacity-50 cursor-not-allowed text-left"
                disabled
                title="Coming soon"
              >
                <CreditCard size={24} />
                <span className="font-medium text-sm">Credit/Debit Card</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Special Instructions (optional)</label>
            <textarea
              placeholder="Delivery notes, allergies..."
              value={form.special_instructions}
              onChange={(e) => updateField('special_instructions', e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-[var(--border-default)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--accent-crimson)] resize-none"
            />
          </div>
        </div>

        {/* Right — Cart summary */}
        <aside className="bg-white rounded-2xl p-6 shadow-sm h-fit lg:sticky lg:top-24">
          <h2 className="font-bold text-lg mb-4">Your Cart</h2>

          <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 items-start">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[var(--bg-elevated)]">
                  {item.image_url && (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="56px" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-sm text-[var(--accent-crimson)] font-semibold">
                    {promoActive
                      ? formatPrice(applyDiscount(item.price, promo))
                      : formatPrice(item.price)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded hover:bg-[var(--bg-elevated)]">
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-semibold w-5 text-center">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded hover:bg-[var(--bg-elevated)]">
                      <Plus size={12} />
                    </button>
                    <button type="button" onClick={() => removeItem(item.id)} className="ml-auto text-xs text-[var(--text-muted)] hover:text-[var(--accent-crimson)]">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link href="/" className="text-sm text-[var(--accent-crimson)] font-medium mb-4 inline-block">
            + Add more items
          </Link>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            {promoActive && discountAmount > 0 && (
              <>
                <div className="flex justify-between text-gray-500">
                  <span>Items total</span>
                  <span className="line-through">{formatPrice(subtotal + discountAmount)}</span>
                </div>
                <div className="flex justify-between text-[#D62828] font-medium">
                  <span>Discount ({promo.percent}%)</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Charges</span>
              <span className={freeDeliveryApplied ? 'text-green-600 font-medium' : ''}>
                {freeDeliveryApplied ? 'FREE' : formatPrice(deliveryFee)}
              </span>
            </div>
            {freeDeliveryThreshold > 0 && !freeDeliveryApplied && (
              <p className="text-xs text-gray-400">
                Free delivery on orders above {formatPrice(freeDeliveryThreshold)}
              </p>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
              <span>Grand total</span>
              <span className="text-[#D62828]">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={placeOrder}
            disabled={submitting}
            className="btn-crimson w-full mt-6 !py-3.5 !text-sm"
          >
            {submitting ? 'Placing Order…' : 'Place Order'}
          </button>
        </aside>
      </div>
    </div>
  )
}
