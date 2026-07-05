'use client'

import { useEffect, useState, useCallback } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Save, Loader2, Megaphone, Clock, Phone, Globe, Tag, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { parseAdminResponse } from '@/lib/admin-api'
import { DEFAULT_PROMO, type PromoSettings } from '@/lib/promo'

interface SiteSettings {
  hours: {
    monday_friday: string
    saturday: string
    sunday: string
    note: string
  }
  contact: {
    phone: string
    email: string
    address: string
    map_embed: string
  }
  social: {
    instagram: string
    facebook: string
    whatsapp: string
    tiktok: string
  }
  announcement: {
    enabled: boolean
    text: string
    type: 'info' | 'promo' | 'warning'
  }
  delivery: {
    fee: number
    min_order: number
    free_delivery_min: number
    radius: string
    estimated_time: string
    areas: { id: string; label: string; eta: number }[]
  }
  promo: PromoSettings
}

interface SettingsRow {
  key: string
  value: unknown
}

const EMPTY_DEFAULTS: SiteSettings = {
  hours: { monday_friday: '', saturday: '', sunday: '', note: '' },
  contact: { phone: '', email: '', address: '', map_embed: '' },
  social: { instagram: '', facebook: '', whatsapp: '', tiktok: '' },
  announcement: { enabled: false, text: '', type: 'promo' },
  delivery: { fee: 0, min_order: 0, free_delivery_min: 0, radius: '', estimated_time: '', areas: [] },
  promo: { ...DEFAULT_PROMO },
}

function mergeSettings(map: Record<string, unknown>): SiteSettings {
  const hours = (map.hours as SiteSettings['hours']) || {}
  const contact = (map.contact as SiteSettings['contact']) || {}
  const social = (map.social as SiteSettings['social']) || {}
  const announcement = (map.announcement as SiteSettings['announcement']) || {}
  const delivery = (map.delivery as SiteSettings['delivery']) || {}
  const promo = (map.promo as PromoSettings) || {}

  return {
    hours: { ...EMPTY_DEFAULTS.hours, ...hours },
    contact: { ...EMPTY_DEFAULTS.contact, ...contact },
    social: { ...EMPTY_DEFAULTS.social, ...social },
    announcement: { ...EMPTY_DEFAULTS.announcement, ...announcement },
    delivery: {
      ...EMPTY_DEFAULTS.delivery,
      ...delivery,
      fee: Number(map.delivery_fee ?? delivery.fee ?? 0),
      min_order: Number(map.min_order ?? delivery.min_order ?? 0),
      free_delivery_min: Number(map.free_delivery_min ?? delivery.free_delivery_min ?? 0),
      areas: delivery.areas ?? [],
    },
    promo: { ...DEFAULT_PROMO, ...promo },
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1.5 text-[11px] font-medium tracking-wide text-gray-500 uppercase">
        {label}
      </label>
      {children}
    </div>
  )
}

function SectionCard({
  title,
  icon: Icon,
  saving,
  saved,
  onSave,
  children,
}: {
  title: string
  icon: LucideIcon
  saving: boolean
  saved: boolean
  onSave: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl p-6 mb-5 bg-white border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#D62828]/10">
            <Icon size={16} className="text-[#D62828]" />
          </div>
          <h2 className="text-xs font-semibold tracking-wide text-[#1A2238] uppercase">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            saved
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-[#D62828]/10 text-[#D62828] border border-[#D62828]/20 hover:bg-[#D62828]/15'
          }`}
        >
          {saving ? (
            <Loader2 size={12} className="animate-spin" />
          ) : saved ? (
            '✓ Saved'
          ) : (
            <>
              <Save size={12} /> Save
            </>
          )}
        </button>
      </div>
      {children}
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#1A2238] placeholder:text-gray-400 focus:outline-none focus:border-[#D62828] focus:ring-1 focus:ring-[#D62828]/30'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(EMPTY_DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [pushTitle, setPushTitle] = useState('')
  const [pushBody, setPushBody] = useState('')
  const [pushSending, setPushSending] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      const json = await parseAdminResponse<{ data: SettingsRow[] }>(res)
      const map: Record<string, unknown> = {}
      ;(json.data ?? []).forEach((row) => {
        map[row.key] = row.value
      })
      setSettings(mergeSettings(map))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const set = useCallback(<K extends keyof SiteSettings>(section: K, field: string, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }))
  }, [])

  const saveSection = useCallback(
    async (key: keyof SiteSettings) => {
      setSaving(key)
      try {
        const res = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value: settings[key] }),
        })
        await parseAdminResponse(res)

        if (key === 'delivery') {
          await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'delivery_fee', value: settings.delivery.fee }),
          })
          await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'min_order', value: settings.delivery.min_order }),
          })
          await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: 'free_delivery_min',
              value: settings.delivery.free_delivery_min,
            }),
          })
        }
        if (key === 'contact') {
          await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'phone', value: settings.contact.phone }),
          })
          await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'address', value: settings.contact.address }),
          })
        }

        toast.success('Settings saved')
        setSaved(key)
        setTimeout(() => setSaved(null), 2500)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save')
      } finally {
        setSaving(null)
      }
    },
    [settings]
  )

  async function sendPushNotification() {
    if (!pushTitle.trim() || !pushBody.trim()) {
      toast.error('Enter notification title and message')
      return
    }
    setPushSending(true)
    try {
      const res = await fetch('/api/admin/push/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: pushTitle, body: pushBody, url: '/' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to send')
      toast.success(`Sent to ${json.sent} subscriber(s)`)
      setPushTitle('')
      setPushBody('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send notification')
    } finally {
      setPushSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#D62828]" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1A2238]">Royal Foods Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Update your restaurant info, discounts, and delivery settings.</p>
      </div>

      <SectionCard
        title="Announcement Banner"
        icon={Megaphone}
        saving={saving === 'announcement'}
        saved={saved === 'announcement'}
        onSave={() => saveSection('announcement')}
      >
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => set('announcement', 'enabled', !settings.announcement.enabled)}
              className={`w-10 h-5 rounded-full relative transition-colors ${settings.announcement.enabled ? 'bg-[#D62828]' : 'bg-gray-300'}`}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: settings.announcement.enabled ? '22px' : '2px' }}
              />
            </button>
            <span className="text-sm text-gray-600">Show banner on menu page</span>
          </label>
          <Field label="Banner text">
            <input
              className={inputClass}
              placeholder="Free delivery on orders above Rs 1500!"
              value={settings.announcement.text}
              onChange={(e) => set('announcement', 'text', e.target.value)}
            />
          </Field>
          <p className="text-xs text-gray-400">
            Shown as a scrolling ticker at the top. If the text mentions free delivery above an amount (e.g. Rs 1500), that rule is applied in cart and checkout automatically.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        title="Opening Hours"
        icon={Clock}
        saving={saving === 'hours'}
        saved={saved === 'hours'}
        onSave={() => saveSection('hours')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Monday – Friday">
            <input className={inputClass} value={settings.hours.monday_friday} onChange={(e) => set('hours', 'monday_friday', e.target.value)} placeholder="12:00 PM – 2:00 AM" />
          </Field>
          <Field label="Saturday">
            <input className={inputClass} value={settings.hours.saturday} onChange={(e) => set('hours', 'saturday', e.target.value)} placeholder="12:00 PM – 2:00 AM" />
          </Field>
          <Field label="Sunday">
            <input className={inputClass} value={settings.hours.sunday} onChange={(e) => set('hours', 'sunday', e.target.value)} placeholder="12:00 PM – 2:00 AM" />
          </Field>
          <Field label="Display note">
            <input className={inputClass} value={settings.hours.note} onChange={(e) => set('hours', 'note', e.target.value)} placeholder="Daily · Open until 2:00 AM" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        title="Contact & Location"
        icon={Phone}
        saving={saving === 'contact'}
        saved={saved === 'contact'}
        onSave={() => saveSection('contact')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phone">
            <input className={inputClass} value={settings.contact.phone} onChange={(e) => set('contact', 'phone', e.target.value)} placeholder="0334-1704444" />
          </Field>
          <Field label="Email">
            <input className={inputClass} value={settings.contact.email} onChange={(e) => set('contact', 'email', e.target.value)} placeholder="optional@email.com" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address">
              <input className={inputClass} value={settings.contact.address} onChange={(e) => set('contact', 'address', e.target.value)} placeholder="Your delivery address" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Google Maps embed (optional)">
              <textarea
                className={`${inputClass} min-h-[72px] resize-y font-mono text-xs`}
                value={settings.contact.map_embed}
                onChange={(e) => set('contact', 'map_embed', e.target.value)}
                placeholder="Paste embed URL or iframe from Google Maps → Share → Embed a map for an exact pin on /sitemap"
              />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Social Media"
        icon={Globe}
        saving={saving === 'social'}
        saved={saved === 'social'}
        onSave={() => saveSection('social')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['instagram', 'facebook', 'whatsapp', 'tiktok'] as const).map((key) => (
            <Field key={key} label={key}>
              <input
                className={inputClass}
                value={settings.social[key]}
                onChange={(e) => set('social', key, e.target.value)}
                placeholder={key === 'whatsapp' ? '923341704444' : `https://${key}.com/...`}
              />
            </Field>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Discounts & Offers"
        icon={Tag}
        saving={saving === 'promo'}
        saved={saved === 'promo'}
        onSave={() => saveSection('promo')}
      >
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setSettings((p) => ({ ...p, promo: { ...p.promo, enabled: !p.promo.enabled } }))}
              className={`w-10 h-5 rounded-full relative transition-colors ${settings.promo.enabled ? 'bg-[#D62828]' : 'bg-gray-300'}`}
            >
              <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: settings.promo.enabled ? '22px' : '2px' }} />
            </button>
            <span className="text-sm text-gray-600">Enable discount on menu prices & checkout</span>
          </label>
          <Field label="Discount %">
            <input
              type="number"
              min={0}
              max={90}
              className={inputClass}
              value={settings.promo.percent}
              onChange={(e) =>
                setSettings((p) => ({
                  ...p,
                  promo: { ...p.promo, percent: Number(e.target.value) || 0 },
                }))
              }
            />
          </Field>
          <p className="text-xs text-gray-400">
            Applied as strikethrough on each item, cart total, and final bill. Not shown as a separate banner.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        title="Delivery"
        icon={Clock}
        saving={saving === 'delivery'}
        saved={saved === 'delivery'}
        onSave={() => saveSection('delivery')}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Delivery fee (Rs)">
            <input type="number" className={inputClass} value={settings.delivery.fee} onChange={(e) => set('delivery', 'fee', parseFloat(e.target.value) || 0)} />
          </Field>
          <Field label="Min order (Rs)">
            <input type="number" className={inputClass} value={settings.delivery.min_order} onChange={(e) => set('delivery', 'min_order', parseFloat(e.target.value) || 0)} />
          </Field>
          <Field label="Free delivery above (Rs)">
            <input type="number" className={inputClass} value={settings.delivery.free_delivery_min} onChange={(e) => set('delivery', 'free_delivery_min', parseFloat(e.target.value) || 0)} placeholder="1500" />
          </Field>
          <Field label="Delivery area">
            <input className={inputClass} value={settings.delivery.radius} onChange={(e) => set('delivery', 'radius', e.target.value)} placeholder="Rajanpur" />
          </Field>
          <Field label="Est. time (mins)">
            <input className={inputClass} value={settings.delivery.estimated_time} onChange={(e) => set('delivery', 'estimated_time', e.target.value)} placeholder="30" />
          </Field>
        </div>
      </SectionCard>

      <div className="rounded-xl p-6 mb-5 bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-[#D62828]/10">
            <Bell size={16} className="text-[#D62828]" />
          </div>
          <h2 className="text-xs font-semibold tracking-wide text-[#1A2238] uppercase">Push Notifications</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">Send offer alerts to app users who enabled notifications.</p>
        <div className="space-y-4">
          <Field label="Title">
            <input className={inputClass} value={pushTitle} onChange={(e) => setPushTitle(e.target.value)} placeholder="20% Off Tonight!" />
          </Field>
          <Field label="Message">
            <textarea className={`${inputClass} min-h-[72px] resize-y`} value={pushBody} onChange={(e) => setPushBody(e.target.value)} placeholder="Order now and save!" />
          </Field>
          <button
            type="button"
            onClick={sendPushNotification}
            disabled={pushSending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#D62828] hover:bg-[#b81f1f] disabled:opacity-60"
          >
            {pushSending ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
            Send Notification
          </button>
        </div>
      </div>
    </div>
  )
}
