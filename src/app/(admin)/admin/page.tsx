'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import {
  ShoppingBag,
  CalendarDays,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  ChefHat,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'

interface Stats {
  todayOrders: number
  todayRevenue: number
  todayReservations: number
  pendingPayments: number
  newCustomers: number
  activeOrders: number
  recentOrders: RecentOrder[]
  recentReservations: RecentReservation[]
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

interface RecentReservation {
  id: string
  booking_ref: string
  customer_name: string
  date: string
  time_slot: string
  party_size: number
  status: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#c9a84c',
  payment_pending: '#8b6914',
  confirmed: '#22c55e',
  preparing: '#3b82f6',
  out_for_delivery: '#a855f7',
  delivered: '#6b7280',
  cancelled: '#8b0000',
}

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState<Stats>({
    todayOrders: 0,
    todayRevenue: 0,
    todayReservations: 0,
    pendingPayments: 0,
    newCustomers: 0,
    activeOrders: 0,
    recentOrders: [],
    recentReservations: [],
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async () => {
    setRefreshing(true)
    const today = new Date().toISOString().split('T')[0]

    const [ordersRes, reservationsRes, customersRes, recentOrdersRes, recentResRes] = await Promise.all([
      supabase
        .from('orders')
        .select('status, payment_method, payment_verified, total_amount, created_at')
        .gte('created_at', `${today}T00:00:00`)
        .returns<{ status: string; payment_method: string; payment_verified: boolean; total_amount: number; created_at: string }[]>(),
      supabase
        .from('reservations')
        .select('status, date')
        .eq('date', today)
        .returns<{ status: string; date: string }[]>(),
      supabase
        .from('customers')
        .select('created_at')
        .gte('created_at', `${today}T00:00:00`)
        .returns<{ created_at: string }[]>(),
      supabase
        .from('orders')
        .select('id, order_ref, customer_name, total_amount, status, payment_method, created_at')
        .order('created_at', { ascending: false })
        .limit(6)
        .returns<RecentOrder[]>(),
      supabase
        .from('reservations')
        .select('id, booking_ref, customer_name, date, time_slot, party_size, status')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(5)
        .returns<RecentReservation[]>(),
    ])

    const orders = ordersRes.data ?? []
    const todayRevenue = orders
      .filter(o => o.payment_verified)
      .reduce((sum, o) => sum + (o.total_amount ?? 0), 0)
    const pendingPayments = orders.filter(o => o.status === 'payment_pending').length
    const activeOrders = orders.filter(o =>
      ['confirmed', 'preparing', 'out_for_delivery'].includes(o.status)
    ).length

    setStats({
      todayOrders: orders.length,
      todayRevenue,
      todayReservations: reservationsRes.data?.length ?? 0,
      pendingPayments,
      newCustomers: customersRes.data?.length ?? 0,
      activeOrders,
      recentOrders: recentOrdersRes.data ?? [],
      recentReservations: recentResRes.data ?? [],
    })
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    fetchStats()
    // Auto-refresh every 30s
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const StatCard = ({
    label,
    value,
    icon: Icon,
    accent,
    sub,
    href,
  }: {
    label: string
    value: string | number
    icon: any
    accent: string
    sub?: string
    href?: string
  }) => (
    <div
      className="rounded-xl p-5 relative overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid rgba(${accent === 'gold' ? '201,168,76' : '139,0,0'},0.2)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${accent === 'gold' ? '#c9a84c' : '#8b0000'}, transparent 70%)`,
        }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p style={{ fontSize: '0.68rem', letterSpacing: '0.14em', color: 'var(--text-secondary)' }}>
            {label}
          </p>
          <div
            className="p-2 rounded-lg"
            style={{ background: `rgba(${accent === 'gold' ? '201,168,76' : '139,0,0'},0.12)` }}
          >
            <Icon
              size={16}
              style={{ color: accent === 'gold' ? 'var(--accent-gold)' : 'var(--accent-crimson)' }}
            />
          </div>
        </div>
        <p
          style={{
            fontSize: '1.8rem',
            fontFamily: 'var(--font-serif)',
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          {loading ? '—' : value}
        </p>
        {sub && (
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '6px' }}>{sub}</p>
        )}
        {href && (
          <Link
            href={href}
            className="flex items-center gap-1 mt-3"
            style={{ fontSize: '0.7rem', color: accent === 'gold' ? 'var(--accent-gold)' : 'var(--accent-crimson)', textDecoration: 'none' }}
          >
            View all <ArrowRight size={11} />
          </Link>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.8rem',
              color: 'var(--text-primary)',
              letterSpacing: '0.04em',
            }}
          >
            Dashboard
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(201,168,76,0.2)',
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
          }}
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-7">
        <StatCard
          label="TODAY'S ORDERS"
          value={stats.todayOrders}
          icon={ShoppingBag}
          accent="gold"
          href="/admin/orders"
        />
        <StatCard
          label="TODAY'S REVENUE"
          value={formatPrice(stats.todayRevenue)}
          icon={TrendingUp}
          accent="gold"
          href="/admin/revenue"
        />
        <StatCard
          label="RESERVATIONS"
          value={stats.todayReservations}
          icon={CalendarDays}
          accent="gold"
          sub="Today"
          href="/admin/reservations"
        />
        <StatCard
          label="PENDING PAYMENTS"
          value={stats.pendingPayments}
          icon={AlertCircle}
          accent="crimson"
          href="/admin/orders"
        />
        <StatCard
          label="ACTIVE ORDERS"
          value={stats.activeOrders}
          icon={Clock}
          accent="gold"
          href="/admin/orders"
        />
        <StatCard
          label="NEW CUSTOMERS"
          value={stats.newCustomers}
          icon={Users}
          accent="gold"
          sub="Today"
          href="/admin/customers"
        />
      </div>

      {/* Recent orders + reservations */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid rgba(201,168,76,0.12)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(201,168,76,0.12)' }}
          >
            <h2 style={{ fontSize: '0.8rem', letterSpacing: '0.12em', color: 'var(--text-primary)' }}>
              RECENT ORDERS
            </h2>
            <Link
              href="/admin/orders"
              style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', textDecoration: 'none' }}
              className="flex items-center gap-1"
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div>
            {loading ? (
              <div className="p-6 text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Loading…
              </div>
            ) : stats.recentOrders.length === 0 ? (
              <div className="p-6 text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                No orders yet
              </div>
            ) : (
              stats.recentOrders.map((order, i) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors"
                  style={{
                    borderBottom: i < stats.recentOrders.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                        {order.customer_name}
                      </p>
                      <span
                        className="px-1.5 py-0.5 rounded text-xs"
                        style={{
                          fontSize: '0.6rem',
                          letterSpacing: '0.08em',
                          background: `${STATUS_COLORS[order.status] ?? '#555'}22`,
                          color: STATUS_COLORS[order.status] ?? '#aaa',
                        }}
                      >
                        {order.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      #{order.order_ref} · {order.payment_method?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)', whiteSpace: 'nowrap' }}>
                    {formatPrice(order.total_amount ?? 0)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Reservations */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid rgba(201,168,76,0.12)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(201,168,76,0.12)' }}
          >
            <h2 style={{ fontSize: '0.8rem', letterSpacing: '0.12em', color: 'var(--text-primary)' }}>
              UPCOMING RESERVATIONS
            </h2>
            <Link
              href="/admin/reservations"
              style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', textDecoration: 'none' }}
              className="flex items-center gap-1"
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div>
            {loading ? (
              <div className="p-6 text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Loading…
              </div>
            ) : stats.recentReservations.length === 0 ? (
              <div className="p-6 text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                No upcoming reservations
              </div>
            ) : (
              stats.recentReservations.map((res, i) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{
                    borderBottom: i < stats.recentReservations.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                        {res.customer_name}
                      </p>
                      <span
                        className="px-1.5 py-0.5 rounded"
                        style={{
                          fontSize: '0.6rem',
                          letterSpacing: '0.08em',
                          background: res.status === 'confirmed' ? 'rgba(34,197,94,0.12)' : 'rgba(201,168,76,0.12)',
                          color: res.status === 'confirmed' ? '#22c55e' : 'var(--accent-gold)',
                        }}
                      >
                        {res.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      {new Date(res.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })} · {res.time_slot} · {res.party_size} guests
                    </p>
                  </div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                    #{res.booking_ref}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6">
        <p style={{ fontSize: '0.68rem', letterSpacing: '0.14em', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          QUICK ACTIONS
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/admin/menu', label: 'Add Menu Item', icon: ChefHat },
            { href: '/admin/orders', label: 'Review Payments', icon: AlertCircle },
            { href: '/admin/gallery', label: 'Upload to Gallery', icon: CheckCircle },
            { href: '/admin/settings', label: 'Update Hours', icon: Clock },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(201,168,76,0.15)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                textDecoration: 'none',
              }}
            >
              <Icon size={13} style={{ color: 'var(--accent-gold)' }} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}