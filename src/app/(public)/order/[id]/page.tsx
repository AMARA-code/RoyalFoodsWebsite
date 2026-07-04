'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, getOrderStatusConfig } from '@/lib/utils'
import { DEFAULT_SITE_CONFIG, PAYMENT_METHOD_LABELS } from '@/lib/constants'
import type { OrderWithItems } from '@/types/index'
import type { PaymentMethod } from '@/types/database'
import OrderStatusTimeline from '@/components/public/order/OrderStatusTimeline'
import PaymentProofSection from '@/components/public/order/PaymentProofSection'
import { PageLoader } from '@/components/ui/LoadingSpinner'

export default function OrderTrackingPage() {
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentAccounts, setPaymentAccounts] = useState({
    easypaisa: DEFAULT_SITE_CONFIG.easypaisa_number,
    jazzcash: DEFAULT_SITE_CONFIG.jazzcash_number,
  })

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Order not found')
      setOrder(json.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  useEffect(() => {
    async function loadAccounts() {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('site_settings')
        .select('key, value')
        .in('key', ['easypaisa_number', 'jazzcash_number'])
      if (data?.length) {
        const map = Object.fromEntries(
          (data as { key: string; value: unknown }[]).map((r) => [r.key, r.value])
        )
        setPaymentAccounts({
          easypaisa: String(map.easypaisa_number ?? paymentAccounts.easypaisa),
          jazzcash: String(map.jazzcash_number ?? paymentAccounts.jazzcash),
        })
      }
    }
    loadAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Realtime status updates
  useEffect(() => {
    if (!orderId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`order-track-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        () => {
          fetchOrder()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, fetchOrder])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <PageLoader />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container-eclat section-py text-center">
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error ?? 'Order not found'}</p>
        <Link href="/menu" className="btn-gold">
          Back to Menu
        </Link>
      </div>
    )
  }

  const statusCfg = getOrderStatusConfig(order.status)
  const paymentMethod = order.payment_method as PaymentMethod
  const needsPaymentUpload =
    ['easypaisa', 'jazzcash'].includes(paymentMethod) &&
    !order.payment_screenshot &&
    ['pending', 'payment_pending'].includes(order.status)

  const accountNumber =
    paymentMethod === 'easypaisa'
      ? paymentAccounts.easypaisa
      : paymentAccounts.jazzcash

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <section
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingTop: '40px',
          paddingBottom: '40px',
        }}
      >
        <div className="container-eclat">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-label mb-6 hover:text-[var(--accent-gold)] transition-colors"
            style={{ color: 'var(--text-muted)', fontSize: '11px' }}
          >
            <ArrowLeft size={14} />
            Back to Menu
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
          >
            <div>
              <p className="text-label text-[var(--accent-gold)] mb-2">Order Tracking</p>
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                }}
              >
                {order.order_ref}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>
                Placed {formatDate(order.created_at)}
              </p>
            </div>
            <span
              className="inline-flex self-start px-4 py-2 rounded-sm text-label"
              style={{
                background: statusCfg.bg,
                color: statusCfg.color,
                fontSize: '11px',
              }}
            >
              {statusCfg.label}
            </span>
          </motion.div>
        </div>
      </section>

      <section className="section-py">
        <div className="container-eclat grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-eclat p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>
                  Order Progress
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true)
                    fetchOrder()
                  }}
                  className="flex items-center gap-2 text-label hover:text-[var(--accent-gold)] transition-colors"
                  style={{ color: 'var(--text-muted)', fontSize: '10px' }}
                >
                  <RefreshCw size={12} />
                  Refresh
                </button>
              </div>
              <OrderStatusTimeline
                status={order.status}
                paymentMethod={order.payment_method}
                paymentVerified={order.payment_verified}
              />
            </motion.div>

            {(needsPaymentUpload || order.payment_screenshot) &&
              paymentMethod !== 'cod' && (
                <PaymentProofSection
                  orderId={order.id}
                  paymentMethod={paymentMethod}
                  accountNumber={accountNumber}
                  existingScreenshot={order.payment_screenshot}
                  existingReference={
                    'payment_reference' in order
                      ? (order.payment_reference as string | null)
                      : null
                  }
                  onUploaded={fetchOrder}
                />
              )}
          </div>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-6"
          >
            <div className="card-eclat p-6">
              <h3 className="text-label text-[var(--accent-gold)] mb-4">Order Details</h3>
              <div className="space-y-3">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {item.quantity}× {item.name}
                    </span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="divider-gold my-4" />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span className="price-tag">{formatPrice(order.total_amount)}</span>
              </div>
            </div>

            <div className="card-eclat p-6 space-y-3 text-sm">
              <h3 className="text-label text-[var(--accent-gold)] mb-2">Delivery</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{order.customer_name}</p>
              <p style={{ color: 'var(--text-muted)' }}>{order.delivery_address}</p>
              <p style={{ color: 'var(--text-muted)' }}>{order.customer_phone}</p>
              <div className="divider-crimson my-3" />
              <p>
                <span className="text-label" style={{ fontSize: '10px' }}>
                  Payment
                </span>
                <br />
                <span style={{ color: 'var(--text-secondary)' }}>
                  {PAYMENT_METHOD_LABELS[paymentMethod]}
                  {order.payment_verified && (
                    <span style={{ color: 'var(--accent-gold)', marginLeft: '8px' }}>
                      · Verified
                    </span>
                  )}
                </span>
              </p>
            </div>

            <Link href="/order/my-orders" className="btn-outline w-full flex justify-center !py-3 mb-3">
              My Orders
            </Link>
            <Link href="/order" className="btn-outline w-full flex justify-center !py-3">
              Place Another Order
            </Link>
          </motion.aside>
        </div>
      </section>
    </div>
  )
}
