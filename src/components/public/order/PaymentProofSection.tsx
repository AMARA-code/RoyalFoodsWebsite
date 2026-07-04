'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Upload } from 'lucide-react'
import ImageUpload from '@/components/ui/ImageUpload'
import PaymentScreenshotImage from '@/components/admin/PaymentScreenshotImage'
import { GoldButton } from '@/components/ui/Button'
import { PAYMENT_METHOD_LABELS } from '@/lib/constants'
import type { PaymentMethod } from '@/types/database'
import toast from 'react-hot-toast'

interface Props {
  orderId: string
  paymentMethod: PaymentMethod
  accountNumber: string
  existingScreenshot?: string | null
  existingReference?: string | null
  onUploaded: () => void
}

export default function PaymentProofSection({
  orderId,
  paymentMethod,
  accountNumber,
  existingScreenshot,
  existingReference,
  onUploaded,
}: Props) {
  const [screenshot, setScreenshot] = useState(existingScreenshot ?? '')
  const [paymentReference, setPaymentReference] = useState(existingReference ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  const label = PAYMENT_METHOD_LABELS[paymentMethod]

  async function handleSubmit() {
    if (!screenshot) {
      toast.error('Please upload your payment screenshot')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_payment',
          payment_screenshot: screenshot,
          payment_reference: paymentReference.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')
      toast.success('Payment proof submitted!')
      onUploaded()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  function copyNumber() {
    navigator.clipboard.writeText(accountNumber)
    setCopied(true)
    toast.success('Account number copied')
    setTimeout(() => setCopied(false), 2000)
  }

  if (existingScreenshot && paymentMethod !== 'cod') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-eclat p-6"
      >
        <p className="text-label text-[var(--accent-gold)] mb-2">Payment Proof</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
          Your {label} payment screenshot has been submitted. We will verify it shortly.
        </p>
        <div className="relative h-48 rounded-sm overflow-hidden border border-[var(--border-subtle)]">
          <PaymentScreenshotImage
            storedUrl={existingScreenshot}
            className="w-full h-full object-contain bg-[var(--bg-elevated)]"
          />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-eclat p-6 space-y-6"
    >
      <div>
        <p className="text-label text-[var(--accent-gold)] mb-2">Pay via {label}</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
          Transfer the exact order total to the account below, then upload a screenshot of your
          payment confirmation.
        </p>
      </div>

      <div
        className="flex items-center justify-between gap-4 p-4 rounded-sm"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-gold)',
        }}
      >
        <div>
          <p className="text-label" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {label} Account
          </p>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1.25rem',
              letterSpacing: '0.05em',
              color: 'var(--accent-gold)',
            }}
          >
            {accountNumber}
          </p>
        </div>
        <button
          type="button"
          onClick={copyNumber}
          className="flex items-center gap-2 px-3 py-2 border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] transition-colors rounded-sm"
          style={{ color: 'var(--text-secondary)', fontSize: '12px' }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div>
        <label className="text-label block mb-2">Transaction ID (TID)</label>
        <input
          type="text"
          className="input-eclat w-full"
          value={paymentReference}
          onChange={(e) => setPaymentReference(e.target.value)}
          placeholder="e.g. 1234567890"
        />
      </div>

      <ImageUpload
        bucket="payment-screenshots"
        folder={orderId}
        value={screenshot}
        onChange={setScreenshot}
        label="Upload Payment Screenshot"
        hint="JPG or PNG, max 5MB"
        accept="image/jpeg,image/png,image/webp"
        previewHeight="h-40"
      />

      <GoldButton
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !screenshot}
        className="w-full flex items-center justify-center gap-2"
      >
        <Upload size={16} />
        {submitting ? 'Submitting…' : 'Submit Payment Proof'}
      </GoldButton>
    </motion.div>
  )
}
