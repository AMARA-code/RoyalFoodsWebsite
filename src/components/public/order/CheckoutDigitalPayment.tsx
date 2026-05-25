'use client'

import { useId, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import ImageUpload from '@/components/ui/ImageUpload'
import { PAYMENT_METHOD_LABELS } from '@/lib/constants'
import type { PaymentMethod } from '@/types/database'
import toast from 'react-hot-toast'

interface Props {
  paymentMethod: PaymentMethod
  accountNumber: string
  totalLabel: string
  screenshot: string
  onScreenshotChange: (url: string) => void
  paymentReference: string
  onReferenceChange: (value: string) => void
  uploadFolder: string
}

export default function CheckoutDigitalPayment({
  paymentMethod,
  accountNumber,
  totalLabel,
  screenshot,
  onScreenshotChange,
  paymentReference,
  onReferenceChange,
  uploadFolder,
}: Props) {
  const tidId = useId()
  const [copied, setCopied] = useState(false)

  function copyNumber() {
    navigator.clipboard.writeText(accountNumber)
    setCopied(true)
    toast.success('Account number copied')
    setTimeout(() => setCopied(false), 2000)
  }

  const label = PAYMENT_METHOD_LABELS[paymentMethod]

  return (
    <div
      className="mt-4 p-5 rounded-sm space-y-5"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-gold)',
      }}
    >
      <div>
        <p className="text-label text-[var(--accent-gold)] mb-2">Pay via {label}</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
          Transfer <strong style={{ color: 'var(--text-primary)' }}>{totalLabel}</strong> to the
          account below, then enter your transaction ID and upload a screenshot before placing the
          order.
        </p>
      </div>

      <div
        className="flex items-center justify-between gap-4 p-4 rounded-sm"
        style={{ border: '1px solid var(--border-subtle)' }}
      >
        <div>
          <p className="text-label" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {label} Account
          </p>
          <p
            style={{
              fontSize: '1.15rem',
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
          className="flex items-center gap-2 px-3 py-2 border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] transition-colors rounded-sm text-xs"
          style={{ color: 'var(--text-secondary)' }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div>
        <label htmlFor={tidId} className="text-label block mb-2">
          Transaction ID (TID)
        </label>
        <input
          id={tidId}
          type="text"
          className="input-eclat w-full"
          value={paymentReference}
          onChange={(e) => onReferenceChange(e.target.value)}
          placeholder="e.g. 1234567890"
        />
      </div>

      <ImageUpload
        bucket="payment-screenshots"
        folder={uploadFolder}
        value={screenshot}
        onChange={onScreenshotChange}
        label="Payment Screenshot"
        hint="JPG or PNG, max 5MB"
        accept="image/jpeg,image/png,image/webp"
        previewHeight="h-36"
      />
    </div>
  )
}
