'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2, Megaphone, Clock, Phone, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { parseAdminResponse } from '@/lib/admin-api'

// Shape of settings we manage
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
    radius: string
    estimated_time: string
  }
}

// ✅ Explicit type for rows returned from site_settings table
interface SettingsRow {
  key: string
  value: any
}

const DEFAULTS: SiteSettings = {
  hours: { monday_friday: '12:00 PM – 11:00 PM', saturday: '12:00 PM – 12:00 AM', sunday: '1:00 PM – 10:00 PM', note: '' },
  contact: { phone: '', email: '', address: '', map_embed: '' },
  social: { instagram: '', facebook: '', whatsapp: '', tiktok: '' },
  announcement: { enabled: false, text: '', type: 'promo' },
  delivery: { fee: 150, min_order: 500, radius: '10km', estimated_time: '30–45 mins' },
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      const json = await parseAdminResponse<{ data: SettingsRow[] }>(res)
      const map: Record<string, unknown> = {}
      ;(json.data ?? []).forEach((row) => {
        map[row.key] = row.value
      })
      setSettings({
        hours: (map.hours as SiteSettings['hours']) ?? DEFAULTS.hours,
        contact: (map.contact as SiteSettings['contact']) ?? DEFAULTS.contact,
        social: (map.social as SiteSettings['social']) ?? DEFAULTS.social,
        announcement: (map.announcement as SiteSettings['announcement']) ?? DEFAULTS.announcement,
        delivery: (map.delivery as SiteSettings['delivery']) ?? DEFAULTS.delivery,
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  const saveSection = async (key: keyof SiteSettings) => {
    setSaving(key)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: settings[key] }),
      })
      await parseAdminResponse(res)
      toast.success(`${key} settings saved`)
      setSaved(key)
      setTimeout(() => setSaved(null), 2500)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(null)
    }
  }

  const set = <K extends keyof SiteSettings>(section: K, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-gold)' }} />
      </div>
    )
  }

  const SectionCard = ({
    id,
    title,
    icon: Icon,
    children,
  }: {
    id: keyof SiteSettings
    title: string
    icon: any
    children: React.ReactNode
  }) => (
    <div
      className="rounded-xl p-6 mb-5"
      style={{ background: 'var(--bg-card)', border: '1px solid rgba(201,168,76,0.12)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg" style={{ background: 'rgba(201,168,76,0.1)' }}>
            <Icon size={16} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <h2 style={{ fontSize: '0.82rem', letterSpacing: '0.12em', color: 'var(--text-primary)' }}>{title}</h2>
        </div>
        <button
          onClick={() => saveSection(id)}
          disabled={saving === id}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
          style={{
            background: saved === id ? 'rgba(34,197,94,0.15)' : 'rgba(201,168,76,0.12)',
            color: saved === id ? '#22c55e' : 'var(--accent-gold)',
            fontSize: '0.72rem',
            letterSpacing: '0.08em',
            border: `1px solid ${saved === id ? 'rgba(34,197,94,0.3)' : 'rgba(201,168,76,0.25)'}`,
          }}
        >
          {saving === id ? (
            <Loader2 size={12} className="animate-spin" />
          ) : saved === id ? (
            <>✓ Saved</>
          ) : (
            <><Save size={12} /> Save</>
          )}
        </button>
      </div>
      {children}
    </div>
  )

  const Field = ({
    label,
    children,
  }: {
    label: string
    children: React.ReactNode
  }) => (
    <div>
      <label className="block mb-1.5" style={{ fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  )

  return (
    <div style={{ fontFamily: 'var(--font-sans)', maxWidth: '720px' }}>
      <div className="mb-6">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
          Site Settings
        </h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Changes are saved per section and reflect on the public site instantly.
        </p>
      </div>

      {/* Announcement Banner */}
      <SectionCard id="announcement" title="ANNOUNCEMENT BANNER" icon={Megaphone}>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              onClick={() => set('announcement', 'enabled', !settings.announcement.enabled)}
              className="w-10 h-5 rounded-full transition-colors relative flex-shrink-0"
              style={{ background: settings.announcement.enabled ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)' }}
            >
              <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: settings.announcement.enabled ? '22px' : '2px' }} />
            </button>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Show announcement banner on site
            </span>
          </label>

          <Field label="BANNER TEXT">
            <input
              className="input-eclat w-full"
              placeholder="e.g. 🎉 Now taking Eid bookings — Reserve your table today!"
              value={settings.announcement.text}
              onChange={e => set('announcement', 'text', e.target.value)}
            />
          </Field>

          <Field label="BANNER TYPE">
            <div className="flex gap-2">
              {(['promo', 'info', 'warning'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => set('announcement', 'type', t)}
                  className="px-3 py-1.5 rounded-lg capitalize transition-colors"
                  style={{
                    fontSize: '0.7rem',
                    letterSpacing: '0.06em',
                    background: settings.announcement.type === t ? 'rgba(201,168,76,0.15)' : 'var(--bg-elevated)',
                    border: `1px solid ${settings.announcement.type === t ? 'rgba(201,168,76,0.4)' : 'transparent'}`,
                    color: settings.announcement.type === t ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* Opening Hours */}
      <SectionCard id="hours" title="OPENING HOURS" icon={Clock}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="MONDAY – FRIDAY">
            <input className="input-eclat w-full" value={settings.hours.monday_friday} onChange={e => set('hours', 'monday_friday', e.target.value)} placeholder="12:00 PM – 11:00 PM" />
          </Field>
          <Field label="SATURDAY">
            <input className="input-eclat w-full" value={settings.hours.saturday} onChange={e => set('hours', 'saturday', e.target.value)} placeholder="12:00 PM – 12:00 AM" />
          </Field>
          <Field label="SUNDAY">
            <input className="input-eclat w-full" value={settings.hours.sunday} onChange={e => set('hours', 'sunday', e.target.value)} placeholder="1:00 PM – 10:00 PM" />
          </Field>
          <Field label="SPECIAL NOTE (optional)">
            <input className="input-eclat w-full" value={settings.hours.note} onChange={e => set('hours', 'note', e.target.value)} placeholder="e.g. Closed on public holidays" />
          </Field>
        </div>
      </SectionCard>

      {/* Contact Info */}
      <SectionCard id="contact" title="CONTACT INFORMATION" icon={Phone}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="PHONE">
            <input className="input-eclat w-full" value={settings.contact.phone} onChange={e => set('contact', 'phone', e.target.value)} placeholder="+92 300 000 0000" />
          </Field>
          <Field label="EMAIL">
            <input className="input-eclat w-full" value={settings.contact.email} onChange={e => set('contact', 'email', e.target.value)} placeholder="info@eclat.com" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="ADDRESS">
              <input className="input-eclat w-full" value={settings.contact.address} onChange={e => set('contact', 'address', e.target.value)} placeholder="123 Street, City, Pakistan" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="GOOGLE MAPS EMBED URL">
              <input className="input-eclat w-full" value={settings.contact.map_embed} onChange={e => set('contact', 'map_embed', e.target.value)} placeholder="https://maps.google.com/maps?..." />
            </Field>
          </div>
        </div>
      </SectionCard>

      {/* Social Links */}
      <SectionCard id="social" title="SOCIAL MEDIA LINKS" icon={Globe}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'instagram', placeholder: 'https://instagram.com/eclat' },
            { key: 'facebook', placeholder: 'https://facebook.com/eclat' },
            { key: 'whatsapp', placeholder: '+92 300 000 0000' },
            { key: 'tiktok', placeholder: 'https://tiktok.com/@eclat' },
          ].map(({ key, placeholder }) => (
            <Field key={key} label={key.toUpperCase()}>
              <input
                className="input-eclat w-full"
                value={settings.social[key as keyof typeof settings.social]}
                onChange={e => set('social', key, e.target.value)}
                placeholder={placeholder}
              />
            </Field>
          ))}
        </div>
      </SectionCard>

      {/* Delivery Settings */}
      <SectionCard id="delivery" title="DELIVERY SETTINGS" icon={Clock}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="DELIVERY FEE ($)">
            <input type="number" className="input-eclat w-full" value={settings.delivery.fee} onChange={e => set('delivery', 'fee', parseFloat(e.target.value) || 0)} />
          </Field>
          <Field label="MIN ORDER ($)">
            <input type="number" className="input-eclat w-full" value={settings.delivery.min_order} onChange={e => set('delivery', 'min_order', parseFloat(e.target.value) || 0)} />
          </Field>
          <Field label="DELIVERY RADIUS">
            <input className="input-eclat w-full" value={settings.delivery.radius} onChange={e => set('delivery', 'radius', e.target.value)} placeholder="10km" />
          </Field>
          <Field label="ESTIMATED TIME">
            <input className="input-eclat w-full" value={settings.delivery.estimated_time} onChange={e => set('delivery', 'estimated_time', e.target.value)} placeholder="30–45 mins" />
          </Field>
        </div>
      </SectionCard>
    </div>
  )
}