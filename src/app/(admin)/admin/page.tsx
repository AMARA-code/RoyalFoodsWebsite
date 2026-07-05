'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, TrendingUp, Clock, CheckCircle, ArrowRight, RefreshCw, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import toast from 'react-hot-toast'

interface Stats {
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  activeOrders: number
  recentOrders: RecentOrder[]
}

interface RecentOrder {
  id: string
  order_ref: string
  customer_name: string
  total_amount: number
  status: string
  payment_method: string
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#D62828',
  payment_pending: '#c9a84c',
  confirmed: '#22c55e',
  preparing: '#3b82f6',
  out_for_delivery: '#a855f7',
  delivered: '#6b7280',
  cancelled: '#ef4444',
}

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  href,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  loading: boolean
  href?: string
}) {
  return (
    <div className="rounded-xl p-5 bg-white border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-medium tracking-wide text-gray-500 uppercase">{label}</p>
        <div className="p-2 rounded-lg bg-[#D62828]/10">
          <Icon size={16} className="text-[#D62828]" />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#1A2238]">{loading ? '—' : value}</p>
      {href && (
        <Link href={href} className="flex items-center gap-1 mt-3 text-xs font-medium text-[#D62828] hover:underline">
          View all <ArrowRight size={11} />
        </Link>
      )}
    </div>
  )
}

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState<Stats>({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    activeOrders: 0,
    recentOrders: [],
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [clearing, setClearing] = useState(false)

  const fetchStats = useCallback(async () => {
    setRefreshing(true)
    const today = new Date().toISOString().split('T')[0]

    const [ordersRes, recentOrdersRes] = await Promise.all([
      supabase.from('orders').select('id, status, total_amount, created_at').gte('created_at', `${today}T00:00:00`),
      supabase.from('orders').select('id, order_ref, customer_name, total_amount, status, payment_method, created_at').order('created_at', { ascending: false }).limit(8),
    ])

    const todayOrders = (ordersRes.data ?? []) as { status: string | null; total_amount: number | null }[]
    const recentOrders = (recentOrdersRes.data ?? []) as RecentOrder[]

    setStats({
      todayOrders: todayOrders.length,
      todayRevenue: todayOrders.reduce((s, o) => s + (o.total_amount ?? 0), 0),
      pendingOrders: todayOrders.filter((o) => o.status === 'pending' || o.status === 'payment_pending').length,
      activeOrders: todayOrders.filter((o) => ['confirmed', 'preparing', 'out_for_delivery'].includes(o.status ?? '')).length,
      recentOrders,
    })
    setLoading(false)
    setRefreshing(false)
  }, [supabase])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  async function clearOrdersAndCustomers() {
    if (!window.confirm('Delete ALL previous orders and customer records? Settings and menu will be kept. This cannot be undone.')) return
    setClearing(true)
    try {
      const ordersRes = await fetch('/api/admin/orders', { method: 'DELETE' })
      const ordersJson = await ordersRes.json()
      if (!ordersRes.ok) throw new Error(ordersJson.error ?? 'Failed to clear orders')

      const customersRes = await fetch('/api/admin/customers', { method: 'DELETE' })
      const customersJson = await customersRes.json()
      if (!customersRes.ok) throw new Error(customersJson.error ?? 'Failed to clear customers')

      setStats({
        todayOrders: 0,
        todayRevenue: 0,
        pendingOrders: 0,
        activeOrders: 0,
        recentOrders: [],
      })
      toast.success('All orders and customers removed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to clear data')
    } finally {
      setClearing(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1A2238]">Royal Foods Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
        <button
          type="button"
          onClick={clearOrdersAndCustomers}
          disabled={clearing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50"
        >
          <Trash2 size={13} />
          {clearing ? 'Clearing…' : 'Clear orders & customers'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Today's Orders" value={stats.todayOrders} icon={ShoppingBag} loading={loading} href="/admin/orders" />
        <StatCard label="Today's Revenue" value={formatPrice(stats.todayRevenue)} icon={TrendingUp} loading={loading} />
        <StatCard label="Pending" value={stats.pendingOrders} icon={Clock} loading={loading} href="/admin/orders" />
        <StatCard label="Active" value={stats.activeOrders} icon={CheckCircle} loading={loading} href="/admin/orders" />
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-[#1A2238]">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs font-medium text-[#D62828] hover:underline">View all</Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-400">No orders yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                href="/admin/orders"
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-[#1A2238]">{order.customer_name}</p>
                  <p className="text-xs text-gray-400">{order.order_ref} · {order.payment_method}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#D62828]">{formatPrice(order.total_amount)}</p>
                  <p className="text-xs capitalize" style={{ color: STATUS_COLORS[order.status] ?? '#888' }}>
                    {order.status?.replace(/_/g, ' ')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
