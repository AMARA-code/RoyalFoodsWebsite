'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Mail, Search, Users } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Customer } from '@/types/database'

type CustomerRow = Customer & {
  live_order_count: number
  live_verified_spent: number
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [stats, setStats] = useState({
    total: 0,
    withEmail: 0,
    totalOrders: 0,
    totalSpent: 0,
  })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [search, setSearch] = useState('')
  const [emailOnly, setEmailOnly] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch('/api/admin/customers')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to load')
      setCustomers(json.data ?? [])
      setStats(json.stats ?? { total: 0, withEmail: 0, totalOrders: 0, totalSpent: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load customers')
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/admin/customers', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Sync failed')
      await fetchCustomers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const filtered = customers.filter((c) => {
    if (emailOnly && !c.email?.trim()) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email?.toLowerCase().includes(q) ?? false) ||
      (c.phone?.includes(q) ?? false)
    )
  })

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-label mb-1" style={{ color: 'var(--accent-gold)' }}>
            ADMIN CRM
          </p>
          <h1 className="text-heading-xl" style={{ color: 'var(--text-primary)' }}>
            Customers
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Anyone who places an order with an email is saved here. Gmail and other addresses
            are matched on each new order.
          </p>
          <div className="divider-gold mt-3" style={{ width: '60px' }} />
        </div>
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          style={{
            border: '1px solid rgba(201,168,76,0.35)',
            color: 'var(--accent-gold)',
            opacity: syncing ? 0.6 : 1,
          }}
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing…' : 'Sync counts from orders'}
        </button>
      </div>

      {error && (
        <div
          className="mb-6 px-4 py-3 rounded text-sm"
          style={{
            background: 'rgba(239,83,80,0.12)',
            color: '#ef5350',
            border: '1px solid rgba(239,83,80,0.3)',
          }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Profiles', value: stats.total, color: 'var(--text-primary)' },
          { label: 'With Email', value: stats.withEmail, color: 'var(--accent-gold)' },
          { label: 'Orders Linked', value: stats.totalOrders, color: '#64b5f6' },
          {
            label: 'Verified Spend',
            value: formatPrice(stats.totalSpent),
            color: '#4caf74',
          },
        ].map((s) => (
          <motion.div key={s.label} className="card-eclat p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
              {s.label}
            </p>
            <p className="text-2xl font-bold font-serif" style={{ color: s.color }}>
              {loading ? '—' : s.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-eclat w-full pl-9 py-2 text-sm rounded"
          />
        </div>
        <label
          className="flex items-center gap-2 px-4 py-2 rounded text-sm cursor-pointer"
          style={{ border: '1px solid rgba(201,168,76,0.2)', color: 'var(--text-secondary)' }}
        >
          <input
            type="checkbox"
            checked={emailOnly}
            onChange={(e) => setEmailOnly(e.target.checked)}
            className="accent-[var(--accent-gold)]"
          />
          <Mail size={14} />
          Email customers only
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--accent-gold)', borderTopColor: 'transparent' }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 card-eclat">
          <Users size={48} style={{ color: 'var(--border-default)', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No customers found.</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Customers are created automatically when someone places an order with an email.
          </p>
        </div>
      ) : (
        <div className="card-eclat overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
                  {['Customer', 'Email', 'Phone', 'Orders', 'Verified spend', 'Joined'].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold"
                        style={{ color: 'var(--accent-gold)' }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b"
                    style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                      {c.name}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--accent-gold)' }}>
                      {c.email ?? (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {c.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: 'var(--text-primary)' }}>{c.live_order_count}</span>
                      {c.total_orders !== c.live_order_count && (
                        <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                          (db: {c.total_orders})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#4caf74' }}>
                      {formatPrice(c.live_verified_spent)}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(c.created_at)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
