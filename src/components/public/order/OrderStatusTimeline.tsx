'use client'

import type { ComponentType } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Truck,
  PackageCheck,
  CreditCard,
} from 'lucide-react'
import type { OrderStatus } from '@/types/database'
import { getOrderStatusConfig } from '@/lib/utils'

const TIMELINE_STEPS: {
  key: OrderStatus
  label: string
  icon: ComponentType<{ size?: number; className?: string }>
}[] = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'out_for_delivery', label: 'On the Way', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: PackageCheck },
]

const STATUS_ORDER: OrderStatus[] = [
  'pending',
  'payment_pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
]

function getStepIndex(status: OrderStatus): number {
  if (status === 'cancelled') return -1
  if (status === 'payment_pending') return 0.5
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === status)
  if (idx >= 0) return idx
  const orderIdx = STATUS_ORDER.indexOf(status)
  if (orderIdx <= 0) return 0
  return Math.min(orderIdx, TIMELINE_STEPS.length - 1)
}

interface Props {
  status: OrderStatus
  paymentMethod: string
  paymentVerified: boolean
}

export default function OrderStatusTimeline({
  status,
  paymentMethod,
  paymentVerified,
}: Props) {
  const currentIndex = getStepIndex(status)
  const isCancelled = status === 'cancelled'
  const showPaymentPending =
    paymentMethod !== 'cod' &&
    !paymentVerified &&
    (status === 'pending' || status === 'payment_pending')

  if (isCancelled) {
    const cfg = getOrderStatusConfig('cancelled')
    return (
      <div
        className="rounded-sm p-6 text-center"
        style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}
      >
        <p style={{ color: cfg.color, fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>
          Order Cancelled
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showPaymentPending && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-sm"
          style={{
            background: 'rgba(224,144,80,0.12)',
            border: '1px solid rgba(224,144,80,0.3)',
          }}
        >
          <CreditCard size={20} style={{ color: '#e09050' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            {status === 'payment_pending'
              ? 'Payment screenshot received — awaiting admin verification'
              : 'Awaiting payment screenshot upload'}
          </p>
        </motion.div>
      )}

      <div className="relative">
        {TIMELINE_STEPS.map((step, index) => {
          const isComplete = currentIndex >= index
          const isActive =
            Math.floor(currentIndex) === index ||
            (status === 'payment_pending' && index === 0)
          const Icon = step.icon
          const cfg = getOrderStatusConfig(step.key)

          return (
            <motion.div
              key={step.key}
              className="flex gap-4 pb-8 last:pb-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500"
                  style={{
                    background: isComplete ? cfg.bg : 'var(--bg-elevated)',
                    border: `2px solid ${isComplete || isActive ? cfg.color : 'var(--border-subtle)'}`,
                    color: isComplete ? cfg.color : 'var(--text-muted)',
                  }}
                >
                  <Icon size={18} />
                </div>
                {index < TIMELINE_STEPS.length - 1 && (
                  <div
                    className="w-px flex-1 min-h-[32px] mt-2 transition-colors duration-500"
                    style={{
                      background:
                        currentIndex > index
                          ? cfg.color
                          : 'var(--border-subtle)',
                    }}
                  />
                )}
              </div>
              <div className="pt-2">
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.15rem',
                    color: isComplete ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                >
                  {step.label}
                </p>
                {isActive && (
                  <p
                    className="text-label mt-1"
                    style={{ color: cfg.color, fontSize: '10px' }}
                  >
                    Current step
                  </p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
