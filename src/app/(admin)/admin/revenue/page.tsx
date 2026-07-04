'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import type { Order, OrderItem, PaymentMethod } from '@/types/database'

// ── Types ──────────────────────────────────────────────────────────────────
interface OrderWithItems extends Order {
  order_items?: (OrderItem & { name: string })[]
}

type Period = 'daily' | 'weekly' | 'monthly'

interface RevenuePoint { label: string; revenue: number; orders: number }

interface TopDish { name: string; quantity: number; revenue: number }

// ── Fallback ───────────────────────────────────────────────────────────────
function generateFallbackData(): OrderWithItems[] {
  const items = [
    'Grilled Chicken with Herbs', 'Beef Steak with Mushroom Sauce',
    'Margherita Pizza', 'Lamb Curry', 'Truffle Arancini',
    'Cold Coffee Frappe', 'Cheesecake with Berries', 'Chicken Tikka Masala',
  ]
  const methods: PaymentMethod[] = ['easypaisa', 'jazzcash', 'cod']
  const orders: OrderWithItems[] = []
  const now = Date.now()

  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const total = Math.floor(Math.random() * 800) + 200
    orders.push({
      id: `f${i}`,
      order_ref: `ECL-${String(i + 1).padStart(3, '0')}`,
      customer_id: null,
      customer_name: `Customer ${i + 1}`,
      customer_email: null,
      customer_phone: '+92 300 0000000',
      delivery_address: 'Sample Address',
      status: 'delivered',
      payment_method: methods[i % 3],
      payment_verified: true,
      payment_screenshot: null,
      payment_reference: null,
      subtotal: total - 50,
      delivery_fee: 50,
      total_amount: total,
      special_instructions: null,
      admin_notes: null,
      verified_at: null,
      verified_by: null,
      created_at: new Date(now - daysAgo * 86400000).toISOString(),
      updated_at: new Date(now - daysAgo * 86400000).toISOString(),
      order_items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
        id: `fi${i}${j}`,
        order_id: `f${i}`,
        menu_item_id: null,
        name: items[(i + j) % items.length],
        price: Math.floor(Math.random() * 100) + 50,
        quantity: Math.floor(Math.random() * 2) + 1,
        subtotal: 0,
        notes: null,
        created_at: new Date().toISOString(),
      })),
    })
  }
  return orders
}

// ── Chart: Bar ─────────────────────────────────────────────────────────────
function BarChart({ data, max }: { data: RevenuePoint[]; max: number }) {
  return (
    <div className="flex items-end gap-1 h-40 w-full">
      {data.map((pt, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <motion.div
            className="w-full rounded-t"
            style={{ background: 'linear-gradient(to top, var(--accent-crimson), var(--accent-gold))' }}
            initial={{ height: 0 }}
            animate={{ height: `${max > 0 ? (pt.revenue / max) * 130 : 0}px` }}
            transition={{ delay: i * 0.04, duration: 0.5, ease: 'easeOut' }}
            title={`$${pt.revenue.toLocaleString()} · ${pt.orders} orders`}
          />
          <span className="text-xs truncate w-full text-center" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
            {pt.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Donut Chart ────────────────────────────────────────────────────────────
function DonutChart({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0)
  if (total === 0) return <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No data</div>

  let cumAngle = -90
  const radius = 50, cx = 60, cy = 60, strokeW = 16

  function polarToXY(deg: number) {
    const rad = (deg * Math.PI) / 180
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    }
  }

  const paths = slices.map(sl => {
    const angle = (sl.value / total) * 360
    const start = polarToXY(cumAngle)
    const end   = polarToXY(cumAngle + angle - 0.5)
    const large = angle > 180 ? 1 : 0
    const path = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 1 ${end.x} ${end.y}`
    cumAngle += angle
    return { ...sl, path, angle }
  })

  return (
    <div className="flex items-center gap-6">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {paths.map((p, i) => (
          <motion.path
            key={i}
            d={p.path}
            fill="none"
            stroke={p.color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="10" fill="var(--text-secondary)">Total</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--text-primary)">
          ${(total / 1000).toFixed(1)}k
        </text>
      </svg>
      <div className="space-y-2 flex-1">
        {slices.map(sl => (
          <div key={sl.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: sl.color }} />
              <span style={{ color: 'var(--text-secondary)' }}>{sl.label}</span>
            </div>
            <span style={{ color: 'var(--text-primary)' }}>{formatPrice(sl.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminRevenuePage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('daily')
  const supabase = createClient()

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('payment_verified', true)
        .order('created_at', { ascending: true })

      if (error || !data || data.length === 0) {
        setOrders(generateFallbackData())
      } else {
        setOrders(data as OrderWithItems[])
      }
    } catch {
      setOrders(generateFallbackData())
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // ── Compute Stats ────────────────────────────────────────────────────────
  const totalRevenue  = orders.reduce((s, o) => s + o.total_amount, 0)
  const totalOrders   = orders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const todayRevenue = orders
    .filter(o => o.created_at.slice(0, 10) === todayStr)
    .reduce((s, o) => s + o.total_amount, 0)

  // Payment method breakdown
  const methodMap: Record<PaymentMethod, number> = { easypaisa: 0, jazzcash: 0, cod: 0 }
  orders.forEach(o => { methodMap[o.payment_method] += o.total_amount })
  const paymentSlices = [
    { label: 'EasyPaisa',       value: methodMap.easypaisa, color: '#4caf74' },
    { label: 'JazzCash',        value: methodMap.jazzcash,  color: '#c9a84c' },
    { label: 'Cash on Delivery', value: methodMap.cod,       color: '#8b0000' },
  ]

  // Top dishes
  const dishMap: Record<string, TopDish> = {}
  orders.forEach(o => {
    o.order_items?.forEach(it => {
      if (!dishMap[it.name]) dishMap[it.name] = { name: it.name, quantity: 0, revenue: 0 }
      dishMap[it.name].quantity += it.quantity
      dishMap[it.name].revenue += it.subtotal || (it.price * it.quantity)
    })
  })
  const topDishes = Object.values(dishMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Revenue chart data
  function buildChartData(): RevenuePoint[] {
    if (period === 'daily') {
      const points: RevenuePoint[] = []
      for (let d = 6; d >= 0; d--) {
        const date = new Date(now)
        date.setDate(date.getDate() - d)
        const ds = date.toISOString().slice(0, 10)
        const dayOrders = orders.filter(o => o.created_at.slice(0, 10) === ds)
        points.push({
          label: date.toLocaleDateString('en', { weekday: 'short' }),
          revenue: dayOrders.reduce((s, o) => s + o.total_amount, 0),
          orders: dayOrders.length,
        })
      }
      return points
    }
    if (period === 'weekly') {
      const points: RevenuePoint[] = []
      for (let w = 3; w >= 0; w--) {
        const start = new Date(now)
        start.setDate(start.getDate() - w * 7 - 6)
        const end = new Date(now)
        end.setDate(end.getDate() - w * 7)
        const wOrders = orders.filter(o => {
          const d = new Date(o.created_at)
          return d >= start && d <= end
        })
        points.push({
          label: `W${4 - w}`,
          revenue: wOrders.reduce((s, o) => s + o.total_amount, 0),
          orders: wOrders.length,
        })
      }
      return points
    }
    // monthly
    const points: RevenuePoint[] = []
    for (let m = 5; m >= 0; m--) {
      const date = new Date(now.getFullYear(), now.getMonth() - m, 1)
      const mStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const mOrders = orders.filter(o => o.created_at.startsWith(mStr))
      points.push({
        label: date.toLocaleDateString('en', { month: 'short' }),
        revenue: mOrders.reduce((s, o) => s + o.total_amount, 0),
        orders: mOrders.length,
      })
    }
    return points
  }

  const chartData = buildChartData()
  const chartMax  = Math.max(...chartData.map(p => p.revenue), 1)

  const statCards = [
    { label: "Today's Revenue",  value: formatPrice(todayRevenue),   color: '#c9a84c' },
    { label: 'Total Revenue',    value: formatPrice(totalRevenue),    color: '#4caf74' },
    { label: 'Total Orders',     value: totalOrders.toString(),                  color: 'var(--text-primary)' },
    { label: 'Avg Order Value',  value: formatPrice(Math.round(avgOrderValue)), color: '#64b5f6' },
  ]

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 lg:px-8" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="mb-8">
        <p className="text-label mb-1" style={{ color: 'var(--accent-gold)' }}>ADMIN CRM</p>
        <h1 className="text-heading-xl" style={{ color: 'var(--text-primary)' }}>Revenue Dashboard</h1>
        <div className="divider-gold mt-3" style={{ width: '60px' }} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--accent-gold)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s, i) => (
              <motion.div key={s.label}
                className="card-eclat p-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                <p className="text-2xl font-bold font-serif" style={{ color: s.color }}>{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Revenue Chart */}
          <motion.div className="card-eclat p-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-heading-md" style={{ color: 'var(--text-primary)' }}>Revenue Trend</h2>
              <div className="flex gap-2">
                {(['daily', 'weekly', 'monthly'] as Period[]).map(p => (
                  <button key={p}
                    onClick={() => setPeriod(p)}
                    className="px-3 py-1 rounded text-xs font-semibold capitalize transition-all"
                    style={period === p
                      ? { background: 'var(--accent-crimson)', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <BarChart data={chartData} max={chartMax} />
            {/* Summary below chart */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t text-center"
              style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
              {chartData.slice(-3).map(pt => (
                <div key={pt.label}>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{pt.label}</p>
                  <p className="font-semibold text-sm" style={{ color: 'var(--accent-gold)' }}>
                    {formatPrice(pt.revenue)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{pt.orders} orders</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Payment Breakdown + Top Dishes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Breakdown */}
            <motion.div className="card-eclat p-6"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            >
              <h2 className="text-heading-md mb-4" style={{ color: 'var(--text-primary)' }}>Payment Breakdown</h2>
              <DonutChart slices={paymentSlices} />
              <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {paymentSlices.map(sl => (
                  <div key={sl.label}>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sl.label}</p>
                    <p className="font-semibold text-sm" style={{ color: sl.color }}>
                      {totalRevenue > 0 ? Math.round((sl.value / totalRevenue) * 100) : 0}%
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Dishes */}
            <motion.div className="card-eclat p-6"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
            >
              <h2 className="text-heading-md mb-4" style={{ color: 'var(--text-primary)' }}>Top Dishes by Revenue</h2>
              {topDishes.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No item-level data available.</p>
              ) : (
                <div className="space-y-3">
                  {topDishes.map((dish, i) => {
                    const pct = topDishes[0].revenue > 0 ? (dish.revenue / topDishes[0].revenue) * 100 : 0
                    return (
                      <div key={dish.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold"
                              style={{ background: i === 0 ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)', color: i === 0 ? '#000' : 'var(--text-secondary)' }}>
                              {i + 1}
                            </span>
                            <span style={{ color: 'var(--text-primary)' }}>{dish.name}</span>
                          </span>
                          <span style={{ color: 'var(--accent-gold)' }}>{formatPrice(dish.revenue)}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: i === 0 ? 'var(--accent-gold)' : 'var(--accent-crimson)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.4 + i * 0.07, duration: 0.6 }}
                          />
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          {dish.quantity} sold
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Recent Verified Orders */}
          <motion.div className="card-eclat p-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          >
            <h2 className="text-heading-md mb-4" style={{ color: 'var(--text-primary)' }}>Recent Verified Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
                    {['Ref', 'Customer', 'Method', 'Amount', 'Date'].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-xs font-semibold"
                        style={{ color: 'var(--accent-gold)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...orders]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 8)
                    .map(o => (
                      <tr key={o.id} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <td className="px-3 py-2 font-mono text-xs" style={{ color: 'var(--accent-gold)' }}>{o.order_ref}</td>
                        <td className="px-3 py-2" style={{ color: 'var(--text-primary)' }}>{o.customer_name}</td>
                        <td className="px-3 py-2 text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
                          {o.payment_method === 'cod' ? 'COD' : o.payment_method === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'}
                        </td>
                        <td className="px-3 py-2 font-semibold" style={{ color: '#4caf74' }}>
                          {formatPrice(o.total_amount)}
                        </td>
                        <td className="px-3 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(o.created_at).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}