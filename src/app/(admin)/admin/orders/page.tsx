'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import PaymentScreenshotImage from '@/components/admin/PaymentScreenshotImage'
import { formatPrice } from '@/lib/utils'
import type { Order, OrderStatus, PaymentMethod } from '@/types/database'
import toast from 'react-hot-toast'

// ── Types ──────────────────────────────────────────────────────────────────
interface OrderWithItems extends Order {
  order_items?: {
    id: string
    name: string
    quantity: number
    price: number
    subtotal: number
  }[]
}

// ── Constants ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:          { label: 'Pending',          color: '#a8a8a0', bg: 'rgba(168,168,160,0.12)' },
  payment_pending:  { label: 'Payment Pending',  color: '#c9a84c', bg: 'rgba(201,168,76,0.12)'  },
  confirmed:        { label: 'Confirmed',         color: '#4caf74', bg: 'rgba(76,175,116,0.12)'  },
  preparing:        { label: 'Preparing',         color: '#64b5f6', bg: 'rgba(100,181,246,0.12)' },
  out_for_delivery: { label: 'Out for Delivery',  color: '#ff9800', bg: 'rgba(255,152,0,0.12)'   },
  delivered:        { label: 'Delivered',         color: '#81c784', bg: 'rgba(129,199,132,0.12)' },
  cancelled:        { label: 'Cancelled',         color: '#ef5350', bg: 'rgba(239,83,80,0.12)'   },
}

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  easypaisa: 'EasyPaisa',
  jazzcash:  'JazzCash',
  cod:       'Cash on Delivery',
}

const ADMIN_STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'payment_pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
]

// ── Helper ─────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Order Detail Modal ─────────────────────────────────────────────────────
function OrderModal({
  order,
  onClose,
  onUpdated,
}: {
  order: OrderWithItems
  onClose: () => void
  onUpdated: (updated: OrderWithItems) => void
}) {
  const cfg = STATUS_CONFIG[order.status]
  const isLocked = order.status === 'delivered' || order.status === 'cancelled'
  const isDigital = order.payment_method === 'easypaisa' || order.payment_method === 'jazzcash'
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [updating, setUpdating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [emailNote, setEmailNote] = useState<string | null>(null)

  async function patchAdmin(body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Update failed')
    if (json.emailError) setEmailNote(json.emailError)
    return json.data as OrderWithItems
  }

  async function handleStatusSave() {
    if (status === order.status) return
    setUpdating(true)
    setErrorMsg(null)
    setEmailNote(null)
    try {
      const updated = await patchAdmin({ status })
      onUpdated({ ...order, ...updated })
      if (status === 'delivered' || status === 'cancelled') onClose()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  async function handleVerifyPayment() {
    setUpdating(true)
    setErrorMsg(null)
    setEmailNote(null)
    try {
      const updated = await patchAdmin({ action: 'verify_payment' })
      onUpdated({ ...order, ...updated })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setUpdating(false)
    }
  }

  async function handleConfirmCod() {
    setUpdating(true)
    setErrorMsg(null)
    setEmailNote(null)
    try {
      const updated = await patchAdmin({ action: 'confirm_order' })
      onUpdated({ ...order, ...updated })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Confirm failed')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border"
        style={{ background: 'var(--bg-card)', borderColor: 'rgba(201,168,76,0.2)' }}
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
          <div>
            <p className="text-label mb-1" style={{ color: 'var(--accent-gold)' }}>ORDER DETAILS</p>
            <h2 className="text-heading-md" style={{ color: 'var(--text-primary)' }}>{order.order_ref}</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ color: cfg.color, background: cfg.bg }}>
              {cfg.label}
            </span>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Error banner */}
          {errorMsg && (
            <div className="px-4 py-3 rounded text-sm" style={{ background: 'rgba(239,83,80,0.12)', color: '#ef5350', border: '1px solid rgba(239,83,80,0.3)' }}>
              ⚠ Failed to update: {errorMsg}
            </div>
          )}

          {/* Customer */}
          <div>
            <p className="text-label mb-3" style={{ color: 'var(--accent-gold)' }}>CUSTOMER</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span style={{ color: 'var(--text-secondary)' }}>Name</span><p style={{ color: 'var(--text-primary)' }}>{order.customer_name}</p></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Phone</span><p style={{ color: 'var(--text-primary)' }}>{order.customer_phone}</p></div>
              {order.customer_email && (
                <div className="col-span-2"><span style={{ color: 'var(--text-secondary)' }}>Email</span><p style={{ color: 'var(--text-primary)' }}>{order.customer_email}</p></div>
              )}
              <div className="col-span-2"><span style={{ color: 'var(--text-secondary)' }}>Address</span><p style={{ color: 'var(--text-primary)' }}>{order.delivery_address}</p></div>
            </div>
          </div>

          {/* Items */}
          {order.order_items && order.order_items.length > 0 && (
            <div>
              <p className="text-label mb-3" style={{ color: 'var(--accent-gold)' }}>ORDER ITEMS</p>
              <div className="space-y-2">
                {order.order_items.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div>
                      <p style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold" style={{ color: 'var(--accent-gold)' }}>{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Subtotal</span><span style={{ color: 'var(--text-primary)' }}>{formatPrice(order.subtotal)}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Delivery</span><span style={{ color: 'var(--text-primary)' }}>{formatPrice(order.delivery_fee)}</span></div>
                <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t" style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>Total</span>
                  <span style={{ color: 'var(--accent-gold)' }}>{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment */}
          <div>
            <p className="text-label mb-3" style={{ color: 'var(--accent-gold)' }}>PAYMENT</p>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p style={{ color: 'var(--text-primary)' }}>{PAYMENT_LABEL[order.payment_method]}</p>
                <p className="text-sm" style={{ color: order.payment_verified ? '#4caf74' : '#ef5350' }}>
                  {order.payment_verified ? '✓ Counted in revenue' : '○ Not verified yet'}
                </p>
                {'payment_reference' in order && order.payment_reference && (
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    TID: <span style={{ color: 'var(--accent-gold)' }}>{order.payment_reference}</span>
                  </p>
                )}
              </div>
              {!isLocked && isDigital && !order.payment_verified && (
                <button
                  onClick={handleVerifyPayment}
                  disabled={updating}
                  className="px-4 py-2 rounded text-sm font-semibold"
                  style={{ background: 'rgba(76,175,116,0.2)', color: '#4caf74', border: '1px solid rgba(76,175,116,0.3)' }}
                >
                  {updating
                    ? 'Processing…'
                    : ['pending', 'payment_pending'].includes(order.status)
                      ? 'Verify Payment & Confirm'
                      : 'Verify Payment (add to revenue)'}
                </button>
              )}
              {!isLocked && order.payment_method === 'cod' && order.status === 'pending' && (
                <button
                  onClick={handleConfirmCod}
                  disabled={updating}
                  className="px-4 py-2 rounded text-sm font-semibold"
                  style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--accent-gold)', border: '1px solid rgba(201,168,76,0.35)' }}
                >
                  {updating ? 'Processing…' : 'Confirm Order (send email)'}
                </button>
              )}
            </div>
            {order.payment_screenshot && (
              <div className="mt-4 rounded overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <PaymentScreenshotImage storedUrl={order.payment_screenshot} />
              </div>
            )}
            {isDigital && !order.payment_screenshot && !isLocked && (
              <p className="text-sm mt-2" style={{ color: '#e09050' }}>
                Waiting for customer payment screenshot / TID
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <p className="text-label mb-3" style={{ color: 'var(--accent-gold)' }}>ORDER STATUS</p>
            {isLocked ? (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                This order is {order.status}. Status cannot be changed.
                {order.payment_method === 'cod' && order.payment_verified && (
                  <span> COD payment has been counted in revenue.</span>
                )}
              </p>
            ) : (
              <div className="flex flex-wrap gap-3 items-center">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="input-eclat px-4 py-2 text-sm rounded flex-1 min-w-[200px]"
                >
                  {ADMIN_STATUS_OPTIONS.filter((s) => s !== 'cancelled' || order.status === 'cancelled').map((s) => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>
                <button
                  onClick={handleStatusSave}
                  disabled={updating || status === order.status}
                  className="px-4 py-2 rounded text-sm font-semibold"
                  style={{ background: 'var(--accent-crimson)', color: '#fff', opacity: updating ? 0.6 : 1 }}
                >
                  {updating ? 'Saving…' : 'Update Status'}
                </button>
              </div>
            )}
            {emailNote && (
              <p className="text-sm mt-2" style={{ color: '#e09050' }}>
                Status saved but confirmation email failed: {emailNote}
              </p>
            )}
          </div>

          {/* Special instructions */}
          {order.special_instructions && (
            <div>
              <p className="text-label mb-2" style={{ color: 'var(--accent-gold)' }}>SPECIAL INSTRUCTIONS</p>
              <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>"{order.special_instructions}"</p>
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selected, setSelected] = useState<OrderWithItems | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | 'all'>('all')
  const [search, setSearch] = useState('')
  const [clearing, setClearing] = useState(false)
  const supabase = createClient()

  const fetchOrders = useCallback(async () => {
    setFetchError(null)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })

      if (error) {
        // Show the real Supabase error so you can diagnose it
        console.error('Supabase fetch error:', error)
        setFetchError(error.message)
        setOrders([])
      } else {
        setOrders((data ?? []) as OrderWithItems[])
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setFetchError(msg)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  function handleOrderUpdated(updated: OrderWithItems) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)))
    setSelected((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev))
  }

  async function clearAllOrders() {
    if (orders.length === 0) return
    if (!window.confirm(`Delete all ${orders.length} orders? This cannot be undone.`)) return
    setClearing(true)
    try {
      const res = await fetch('/api/admin/orders', { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to clear orders')
      setOrders([])
      setSelected(null)
      toast.success('All orders removed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to clear orders')
    } finally {
      setClearing(false)
    }
  }

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (paymentFilter !== 'all' && o.payment_method !== paymentFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!o.order_ref.toLowerCase().includes(q) &&
          !o.customer_name.toLowerCase().includes(q) &&
          !o.customer_phone.includes(q)) return false
    }
    return true
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending' || o.status === 'payment_pending').length,
    active: orders.filter(o => ['confirmed','preparing','out_for_delivery'].includes(o.status)).length,
    revenue: orders.filter(o => o.payment_verified).reduce((s, o) => s + o.total_amount, 0),
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 lg:px-8" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-label mb-1" style={{ color: 'var(--accent-gold)' }}>ADMIN CRM</p>
          <h1 className="text-heading-xl" style={{ color: 'var(--text-primary)' }}>Orders Panel</h1>
          <div className="divider-gold mt-3" style={{ width: '60px' }} />
        </div>
        {orders.length > 0 && (
          <button
            type="button"
            onClick={clearAllOrders}
            disabled={clearing}
            className="px-3 py-2 rounded-lg text-xs font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50"
          >
            {clearing ? 'Clearing…' : 'Clear all orders'}
          </button>
        )}
      </div>

      {/* Supabase error banner */}
      {fetchError && (
        <div className="mb-6 px-4 py-3 rounded text-sm" style={{ background: 'rgba(239,83,80,0.12)', color: '#ef5350', border: '1px solid rgba(239,83,80,0.3)' }}>
          ⚠ Could not load orders from database: {fetchError}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orders',     value: stats.total,                            color: 'var(--text-primary)' },
          { label: 'Awaiting Action',  value: stats.pending,                          color: '#c9a84c' },
          { label: 'Active Orders',    value: stats.active,                           color: '#64b5f6' },
          { label: 'Verified Revenue', value: `$${stats.revenue.toLocaleString()}`, color: '#4caf74' },
        ].map(s => (
          <motion.div key={s.label}
            className="card-eclat p-5"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            <p className="text-2xl font-bold font-serif" style={{ color: s.color }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search order ref, name, phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-eclat px-4 py-2 text-sm rounded flex-1 min-w-[200px]"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as OrderStatus | 'all')}
          className="input-eclat px-4 py-2 text-sm rounded"
        >
          <option value="all">All Statuses</option>
          {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map(s => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={e => setPaymentFilter(e.target.value as PaymentMethod | 'all')}
          className="input-eclat px-4 py-2 text-sm rounded"
        >
          <option value="all">All Payments</option>
          <option value="easypaisa">EasyPaisa</option>
          <option value="jazzcash">JazzCash</option>
          <option value="cod">Cash on Delivery</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--accent-gold)', borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📦</p>
          <p style={{ color: 'var(--text-secondary)' }}>No orders found.</p>
        </div>
      ) : (
        <div className="card-eclat overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
                  {['Order Ref', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold"
                      style={{ color: 'var(--accent-gold)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const cfg = STATUS_CONFIG[order.status]
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b transition-colors cursor-pointer"
                      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,168,76,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => setSelected(order)}
                    >
                      <td className="px-4 py-3 font-mono font-semibold" style={{ color: 'var(--accent-gold)' }}>
                        {order.order_ref}
                      </td>
                      <td className="px-4 py-3">
                        <p style={{ color: 'var(--text-primary)' }}>{order.customer_name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{order.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {order.order_items?.length ?? 0} item{(order.order_items?.length ?? 0) !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {formatPrice(order.total_amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {PAYMENT_LABEL[order.payment_method]}
                        </span>
                        {order.payment_verified && (
                          <span className="ml-1 text-xs" style={{ color: '#4caf74' }}>✓</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ color: cfg.color, background: cfg.bg }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="px-3 py-1 rounded text-xs transition-colors"
                          style={{ border: '1px solid rgba(201,168,76,0.3)', color: 'var(--accent-gold)' }}
                          onClick={e => { e.stopPropagation(); setSelected(order) }}
                        >
                          View
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <OrderModal
            order={selected}
            onClose={() => setSelected(null)}
            onUpdated={handleOrderUpdated}
          />
        )}
      </AnimatePresence>
    </div>
  )
}