'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Package } from 'lucide-react'
import { formatPrice, formatDate, getOrderStatusConfig } from '@/lib/utils'
import { PAYMENT_METHOD_LABELS } from '@/lib/constants'
import type { OrderStatus, PaymentMethod } from '@/types/database'
import { GoldButton } from '@/components/ui/Button'

interface LookupOrder {
  id: string
  order_ref: string
  customer_name: string
  status: OrderStatus
  payment_method: PaymentMethod
  payment_verified: boolean
  total_amount: number
  created_at: string
  order_items?: { id: string; name: string; quantity: number; subtotal: number }[]
}

export default function MyOrdersPage() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<LookupOrder[] | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() && !phone.trim()) {
      setError('Enter your email or phone number')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Lookup failed')
      setOrders(json.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load orders')
      setOrders(null)
    } finally {
      setLoading(false)
    }
  }

  const active = orders?.filter(
    (o) => !['delivered', 'cancelled'].includes(o.status)
  )
  const past = orders?.filter((o) =>
    ['delivered', 'cancelled'].includes(o.status)
  )

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <section
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingTop: '48px',
          paddingBottom: '48px',
        }}
      >
        <div className="container-eclat text-center">
          <p className="text-label text-[var(--accent-gold)] mb-3">Your Orders</p>
          <h1 className="text-display" style={{ fontFamily: 'var(--font-serif)' }}>
            Track &amp; Manage
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '14px' }}>
            View active and past deliveries by email or phone
          </p>
        </div>
      </section>

      <section className="section-py">
        <div className="container-eclat max-w-2xl mx-auto space-y-8">
          <form onSubmit={handleSearch} className="card-eclat p-6 space-y-4">
            <div>
              <label className="text-label block mb-2">Email</label>
              <input
                type="email"
                className="input-eclat w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="same as checkout"
              />
            </div>
            <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              or
            </p>
            <div>
              <label className="text-label block mb-2">Phone</label>
              <input
                type="tel"
                className="input-eclat w-full"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03XX XXXXXXX"
              />
            </div>
            {error && (
              <p className="text-sm" style={{ color: 'var(--accent-crimson-light)' }}>
                {error}
              </p>
            )}
            <GoldButton type="submit" disabled={loading} className="w-full flex justify-center gap-2">
              <Search size={16} />
              {loading ? 'Searching…' : 'Find My Orders'}
            </GoldButton>
          </form>

          {orders && orders.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} style={{ color: 'var(--border-default)', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-muted)' }}>No orders found for this email or phone.</p>
            </div>
          )}

          {active && active.length > 0 && (
            <OrderList title="Active Orders" orders={active} />
          )}

          {past && past.length > 0 && (
            <OrderList title="Past Orders" orders={past} />
          )}

          <div className="text-center">
            <Link href="/order" className="btn-outline inline-flex">
              Place New Order
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function OrderList({ title, orders }: { title: string; orders: LookupOrder[] }) {
  return (
    <div>
      <h2
        className="text-label mb-4"
        style={{ color: 'var(--accent-gold)' }}
      >
        {title}
      </h2>
      <div className="space-y-4">
        {orders.map((order, i) => {
          const cfg = getOrderStatusConfig(order.status)
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-eclat p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>
                    {order.order_ref}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <span
                  className="px-3 py-1 rounded-sm text-label"
                  style={{ background: cfg.bg, color: cfg.color, fontSize: '10px' }}
                >
                  {cfg.label}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>
                {PAYMENT_METHOD_LABELS[order.payment_method]}
                {order.payment_verified && ' · Payment verified'}
              </p>
              <p className="price-tag mb-4">{formatPrice(order.total_amount)}</p>
              <Link
                href={`/order/${order.id}`}
                className="text-label hover:text-[var(--accent-gold)] transition-colors"
                style={{ fontSize: '11px', color: 'var(--text-muted)' }}
              >
                View tracking →
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
