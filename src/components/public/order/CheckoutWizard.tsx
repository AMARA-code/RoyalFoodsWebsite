'use client'

import { useState, useEffect, useId } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  CreditCard,
  ClipboardList,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { DEFAULT_SITE_CONFIG, PAYMENT_METHOD_LABELS } from '@/lib/constants'
import type { SiteConfig } from '@/types/index'
import type { PaymentMethod } from '@/types/database'
import { CrimsonButton, GoldButton, OutlineButton } from '@/components/ui/Button'
import CheckoutDigitalPayment from '@/components/public/order/CheckoutDigitalPayment'
import PaymentProofSection from '@/components/public/order/PaymentProofSection'
import toast from 'react-hot-toast'

type Step = 'details' | 'payment' | 'review' | 'success'

const STEPS: { key: Step; label: string; icon: typeof User }[] = [
  { key: 'details', label: 'Your Details', icon: User },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'review', label: 'Review', icon: ClipboardList },
]

function isDigital(method: PaymentMethod) {
  return method === 'easypaisa' || method === 'jazzcash'
}

export default function CheckoutWizard() {
  const router = useRouter()
  const uploadFolder = useId().replace(/:/g, '')
  const { items, total, clearCart, isEmpty } = useCart()
  const [step, setStep] = useState<Step>('details')
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG)
  const [submitting, setSubmitting] = useState(false)
  const [paymentScreenshot, setPaymentScreenshot] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [placedOrder, setPlacedOrder] = useState<{
    id: string
    order_ref: string
    payment_method: PaymentMethod
  } | null>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    payment_method: 'cod' as PaymentMethod,
    special_instructions: '',
  })

  const deliveryFee = siteConfig.delivery_fee
  const grandTotal = total + deliveryFee

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
        delivery_fee: Number(map.delivery_fee) || prev.delivery_fee,
        easypaisa_number: String(map.easypaisa_number ?? prev.easypaisa_number),
        jazzcash_number: String(map.jazzcash_number ?? prev.jazzcash_number),
      }))
    }
    loadSettings()
  }, [])

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === 'payment_method' && value === 'cod') {
      setPaymentScreenshot('')
      setPaymentReference('')
    }
  }

  function validateDetails() {
    if (!form.name.trim()) {
      toast.error('Please enter your name')
      return false
    }
    if (!form.phone.trim()) {
      toast.error('Please enter your phone number')
      return false
    }
    if (!form.address.trim()) {
      toast.error('Please enter your delivery address')
      return false
    }
    if (!form.email.trim()) {
      toast.error('Email is required so we can save your customer profile and send order updates')
      return false
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    if (!emailOk) {
      toast.error('Please enter a valid email address')
      return false
    }
    return true
  }

  function validatePayment() {
    if (isDigital(form.payment_method) && !paymentScreenshot) {
      toast.error('Please upload your payment screenshot')
      return false
    }
    return true
  }

  function goNext() {
    if (step === 'details') {
      if (!validateDetails()) return
      setStep('payment')
    } else if (step === 'payment') {
      if (!validatePayment()) return
      setStep('review')
    }
  }

  function goBack() {
    if (step === 'payment') setStep('details')
    else if (step === 'review') setStep('payment')
  }

  async function placeOrder() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          delivery_address: form.address,
          payment_method: form.payment_method,
          special_instructions: form.special_instructions,
          payment_screenshot: isDigital(form.payment_method) ? paymentScreenshot : undefined,
          payment_reference: isDigital(form.payment_method) ? paymentReference : undefined,
          items,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to place order')

      const order = json.data
      setPlacedOrder({
        id: order.id,
        order_ref: order.order_ref,
        payment_method: order.payment_method,
      })
      clearCart()
      setStep('success')
      toast.success('Order placed successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not place order')
    } finally {
      setSubmitting(false)
    }
  }

  if (isEmpty && step !== 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <ShoppingBag size={56} style={{ color: 'var(--border-default)', margin: '0 auto 24px' }} />
        <h1 className="text-heading-lg mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
          Your cart is empty
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Add dishes from our menu to start your order.
        </p>
        <Link href="/menu" className="btn-gold">
          Browse Menu
        </Link>
      </motion.div>
    )
  }

  const accountNumber =
    form.payment_method === 'easypaisa'
      ? siteConfig.easypaisa_number
      : siteConfig.jazzcash_number

  return (
    <div className="max-w-4xl mx-auto">
      {step !== 'success' && (
        <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
          {STEPS.map((s, i) => {
            const stepIndex = STEPS.findIndex((x) => x.key === step)
            const isActive = s.key === step
            const isDone = i < stepIndex
            const Icon = s.icon
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-sm transition-all"
                  style={{
                    background: isActive
                      ? 'rgba(201,168,76,0.1)'
                      : isDone
                        ? 'var(--bg-elevated)'
                        : 'transparent',
                    border: `1px solid ${isActive ? 'var(--accent-gold)' : isDone ? 'var(--border-subtle)' : 'transparent'}`,
                  }}
                >
                  <Icon
                    size={14}
                    style={{
                      color: isActive || isDone ? 'var(--accent-gold)' : 'var(--text-muted)',
                    }}
                  />
                  <span
                    className="text-label hidden sm:inline"
                    style={{
                      color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)',
                      fontSize: '10px',
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="w-8 h-px"
                    style={{
                      background: isDone ? 'var(--accent-gold)' : 'var(--border-subtle)',
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <AnimatePresence mode="wait">
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card-eclat p-6 md:p-8 space-y-5"
            >
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>
                Delivery Details
              </h2>
              {(
                [
                  ['name', 'Full Name', 'text', true],
                  ['email', 'Email', 'email', true],
                  ['phone', 'Phone Number', 'tel', true],
                  ['address', 'Delivery Address', 'text', true],
                ] as const
              ).map(([key, label, type, required]) => (
                <div key={key}>
                  <label className="text-label block mb-2">
                    {label}
                    {key === 'email' && (
                      <span style={{ color: 'var(--accent-gold)' }}> *</span>
                    )}
                  </label>
                  <input
                    type={type}
                    className="input-eclat w-full"
                    value={form[key]}
                    onChange={(e) => updateField(key, e.target.value)}
                    required={required}
                    placeholder={
                      key === 'address'
                        ? 'Street, area, city'
                        : key === 'phone'
                          ? '03XX XXXXXXX'
                          : key === 'email'
                            ? 'For order confirmation email'
                            : undefined
                    }
                  />
                </div>
              ))}
              <div>
                <label className="text-label block mb-2">Special Instructions (optional)</label>
                <textarea
                  className="input-eclat w-full min-h-[80px] resize-y"
                  value={form.special_instructions}
                  onChange={(e) => updateField('special_instructions', e.target.value)}
                  placeholder="Allergies, delivery notes…"
                />
              </div>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card-eclat p-6 md:p-8 space-y-4"
            >
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>
                Payment Method
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                Select how you would like to pay for your order.
              </p>
              {(['easypaisa', 'jazzcash', 'cod'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => updateField('payment_method', method)}
                  className="w-full text-left p-4 rounded-sm transition-all duration-200"
                  style={{
                    background:
                      form.payment_method === method
                        ? 'rgba(201,168,76,0.08)'
                        : 'var(--bg-elevated)',
                    border: `1px solid ${form.payment_method === method ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                  }}
                >
                  <p style={{ fontWeight: 500, marginBottom: '4px' }}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {method === 'cod'
                      ? 'Pay cash when your order is delivered'
                      : 'Transfer now and upload payment proof below'}
                  </p>
                </button>
              ))}

              {isDigital(form.payment_method) && (
                <CheckoutDigitalPayment
                  paymentMethod={form.payment_method}
                  accountNumber={accountNumber}
                  totalLabel={formatPrice(grandTotal)}
                  screenshot={paymentScreenshot}
                  onScreenshotChange={setPaymentScreenshot}
                  paymentReference={paymentReference}
                  onReferenceChange={setPaymentReference}
                  uploadFolder={`checkout-${uploadFolder}`}
                />
              )}
            </motion.div>
          )}

          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card-eclat p-6 md:p-8 space-y-5"
            >
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>
                Review Order
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between py-2"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <span style={{ fontSize: '14px' }}>
                      {item.quantity}× {item.name}
                    </span>
                    <span className="price-tag" style={{ fontSize: '0.95rem' }}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="divider-gold" />
              <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p>
                  <strong style={{ color: 'var(--text-primary)' }}>Name:</strong> {form.name}
                </p>
                <p>
                  <strong style={{ color: 'var(--text-primary)' }}>Phone:</strong> {form.phone}
                </p>
                <p>
                  <strong style={{ color: 'var(--text-primary)' }}>Address:</strong>{' '}
                  {form.address}
                </p>
                <p>
                  <strong style={{ color: 'var(--text-primary)' }}>Payment:</strong>{' '}
                  {PAYMENT_METHOD_LABELS[form.payment_method]}
                </p>
                {isDigital(form.payment_method) && paymentReference && (
                  <p>
                    <strong style={{ color: 'var(--text-primary)' }}>TID:</strong>{' '}
                    {paymentReference}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {step === 'success' && placedOrder && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="card-eclat p-8 text-center">
                <CheckCircle2
                  size={48}
                  style={{ color: 'var(--accent-gold)', margin: '0 auto 16px' }}
                />
                <h2
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.8rem',
                    marginBottom: '8px',
                  }}
                >
                  Order Placed!
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Reference:{' '}
                  <span style={{ color: 'var(--accent-gold)' }}>{placedOrder.order_ref}</span>
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                  {placedOrder.payment_method === 'cod'
                    ? 'Your order is pending. We will confirm it shortly — you will receive one email when confirmed.'
                    : 'Payment proof received. We will verify and confirm your order — you will receive one confirmation email with a tracking link.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                  <GoldButton
                    type="button"
                    onClick={() => router.push(`/order/${placedOrder.id}`)}
                  >
                    Track Order
                  </GoldButton>
                  <OutlineButton type="button" onClick={() => router.push('/order/my-orders')}>
                    My Orders
                  </OutlineButton>
                  <OutlineButton type="button" onClick={() => router.push('/menu')}>
                    Order More
                  </OutlineButton>
                </div>
              </div>

              {placedOrder.payment_method !== 'cod' && !paymentScreenshot && (
                <PaymentProofSection
                  orderId={placedOrder.id}
                  paymentMethod={placedOrder.payment_method}
                  accountNumber={accountNumber}
                  onUploaded={() => router.push(`/order/${placedOrder.id}`)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {step !== 'success' && (
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-eclat p-6 h-fit sticky top-24"
          >
            <h3 className="text-label mb-4" style={{ color: 'var(--accent-gold)' }}>
              Order Summary
            </h3>
            <div className="space-y-2 mb-4" style={{ fontSize: '14px' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <div className="divider-gold my-3" />
              <div className="flex justify-between">
                <span style={{ fontWeight: 500 }}>Total</span>
                <span className="price-tag">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              {step !== 'details' && (
                <OutlineButton type="button" onClick={goBack} className="flex-1 !py-3">
                  <ArrowLeft size={14} className="inline mr-1" />
                  Back
                </OutlineButton>
              )}
              {step === 'review' ? (
                <CrimsonButton
                  type="button"
                  onClick={placeOrder}
                  disabled={submitting}
                  className="flex-1 !py-3"
                >
                  {submitting ? 'Placing…' : 'Place Order'}
                </CrimsonButton>
              ) : (
                <CrimsonButton type="button" onClick={goNext} className="flex-1 !py-3">
                  Continue
                  <ArrowRight size={14} className="inline ml-1" />
                </CrimsonButton>
              )}
            </div>
          </motion.aside>
        )}
      </div>
    </div>
  )
}
