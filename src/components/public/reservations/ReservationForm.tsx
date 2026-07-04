'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DayPicker } from 'react-day-picker'
import { Calendar, Users, Clock, ChevronRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toDateString, formatTime, getSlotAvailabilityLabel } from '@/lib/utils'
import type { SlotAvailabilityState } from '@/types/index'
import type { SlotAvailability } from '@/types/index'
import { CrimsonButton, OutlineButton } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import 'react-day-picker/style.css'

type FormStep = 'datetime' | 'details'

export default function ReservationForm() {
  const router = useRouter()
  const [step, setStep] = useState<FormStep>('datetime')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [partySize, setPartySize] = useState(2)
  const [timeSlot, setTimeSlot] = useState<string | null>(null)
  const [slots, setSlots] = useState<SlotAvailability[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    special_requests: '',
  })

  const dateStr = selectedDate ? toDateString(selectedDate) : null
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const fetchSlots = useCallback(async (date: string) => {
    setLoadingSlots(true)
    setTimeSlot(null)
    try {
      const res = await fetch(`/api/reservations/slots?date=${date}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to load slots')
      setSlots(json.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load time slots')
      setSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }, [])

  useEffect(() => {
    if (dateStr) fetchSlots(dateStr)
  }, [dateStr, fetchSlots])

  // Realtime: refresh slots when reservations change for this date
  useEffect(() => {
    if (!dateStr) return

    const supabase = createClient()
    const channel = supabase
      .channel(`reservation-slots-${dateStr}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `date=eq.${dateStr}`,
        },
        () => {
          fetchSlots(dateStr)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dateStr, fetchSlots])

  function canProceedFromDateTime() {
    return dateStr && timeSlot && partySize >= 1
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dateStr || !timeSlot) return

    if (!form.customer_name.trim() || !form.customer_phone.trim() || !form.customer_email.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date: dateStr,
          time_slot: timeSlot,
          party_size: partySize,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Booking failed')
      if (!json.data?.id) {
        throw new Error('Booking could not be confirmed. Please contact the restaurant.')
      }
      try {
        sessionStorage.setItem(
          'eclat-last-reservation',
          JSON.stringify(json.data)
        )
      } catch {
        /* sessionStorage unavailable */
      }
      toast.success('Table reserved!')
      router.push(`/reservations/confirm/${json.data.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not complete booking')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedSlot = slots.find((s) => s.time_slot === timeSlot)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-10">
        {(['datetime', 'details'] as FormStep[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-sm"
              style={{
                border: `1px solid ${step === s ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                background: step === s ? 'rgba(201,168,76,0.08)' : 'transparent',
              }}
            >
              <span className="text-label" style={{ fontSize: '10px', color: step === s ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                {i + 1}. {s === 'datetime' ? 'Date & Time' : 'Your Details'}
              </span>
            </div>
            {i === 0 && <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'datetime' && (
          <motion.div
            key="datetime"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="grid gap-8 lg:grid-cols-[auto_1fr]"
          >
            <div className="card-eclat p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={16} style={{ color: 'var(--accent-gold)' }} />
                <span className="text-label">Select Date</span>
              </div>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={{ before: today }}
                classNames={{
                  root: 'rdp-eclat',
                  month_caption: 'text-[var(--text-primary)] font-[var(--font-serif)] text-lg mb-4',
                  weekday: 'text-[var(--text-muted)] text-xs uppercase tracking-wider',
                  day: 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] rounded-sm',
                  selected: '!bg-[var(--accent-crimson)] !text-white',
                  today: 'border border-[var(--accent-gold)]',
                  disabled: 'opacity-30',
                }}
              />
            </div>

            <div className="space-y-6">
              <div className="card-eclat p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={16} style={{ color: 'var(--accent-gold)' }} />
                  <span className="text-label">Party Size</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPartySize(n)}
                      className="w-10 h-10 rounded-sm text-sm transition-all"
                      style={{
                        background: partySize === n ? 'var(--accent-crimson)' : 'var(--bg-elevated)',
                        border: `1px solid ${partySize === n ? 'var(--accent-crimson)' : 'var(--border-subtle)'}`,
                        color: partySize === n ? '#fff' : 'var(--text-secondary)',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-eclat p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} style={{ color: 'var(--accent-gold)' }} />
                  <span className="text-label">Time Slot</span>
                </div>

                {!dateStr ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Select a date to see available times.
                  </p>
                ) : loadingSlots ? (
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Loader2 size={18} className="animate-spin" />
                    Loading availability…
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {slots.map((slot) => {
                      const disabled =
                        slot.availability === 'unavailable' ||
                        partySize > slot.remaining_covers
                      const selected = timeSlot === slot.time_slot
                      const statusColor =
                        slot.availability === 'unavailable'
                          ? 'var(--accent-crimson-light)'
                          : slot.availability === 'occupied'
                            ? '#e09050'
                            : 'var(--accent-gold)'

                      return (
                        <button
                          key={slot.time_slot}
                          type="button"
                          disabled={disabled}
                          onClick={() => setTimeSlot(slot.time_slot)}
                          className="p-3 rounded-sm text-left transition-all"
                          style={{
                            background: selected
                              ? 'rgba(201,168,76,0.12)'
                              : slot.availability === 'unavailable'
                                ? 'rgba(139,0,0,0.08)'
                                : 'var(--bg-elevated)',
                            border: `1px solid ${
                              selected
                                ? 'var(--accent-gold)'
                                : slot.availability === 'unavailable'
                                  ? 'rgba(139,0,0,0.35)'
                                  : 'var(--border-subtle)'
                            }`,
                            opacity: disabled ? 0.55 : 1,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <p style={{ fontSize: '13px', fontWeight: 500 }}>
                            {formatTime(slot.time_slot)}
                          </p>
                          <p
                            style={{
                              fontSize: '11px',
                              color: statusColor,
                              marginTop: '4px',
                              fontWeight: 500,
                            }}
                          >
                            {getSlotAvailabilityLabel(
                              slot.availability as SlotAvailabilityState,
                              slot.remaining_covers
                            )}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <CrimsonButton
                type="button"
                onClick={() => setStep('details')}
                disabled={!canProceedFromDateTime()}
                className="w-full sm:w-auto"
              >
                Continue
                <ChevronRight size={16} className="inline ml-1" />
              </CrimsonButton>
            </div>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.form
            key="details"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            onSubmit={handleSubmit}
            className="grid gap-8 lg:grid-cols-[1fr_300px]"
          >
            <div className="card-eclat p-6 md:p-8 space-y-5">
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>
                Guest Information
              </h2>
              {(
                [
                  ['customer_name', 'Full Name', 'text'],
                  ['customer_email', 'Email', 'email'],
                  ['customer_phone', 'Phone', 'tel'],
                ] as const
              ).map(([key, label, type]) => (
                <div key={key}>
                  <label className="text-label block mb-2">{label}</label>
                  <input
                    type={type}
                    required
                    className="input-eclat w-full"
                    value={form[key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
              <div>
                <label className="text-label block mb-2">Special Requests (optional)</label>
                <textarea
                  className="input-eclat w-full min-h-[80px] resize-y"
                  value={form.special_requests}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, special_requests: e.target.value }))
                  }
                  placeholder="Dietary needs, celebration, seating preference…"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <OutlineButton type="button" onClick={() => setStep('datetime')}>
                  Back
                </OutlineButton>
                <CrimsonButton type="submit" disabled={submitting}>
                  {submitting ? 'Reserving…' : 'Confirm Reservation'}
                </CrimsonButton>
              </div>
            </div>

            <aside className="card-eclat p-6 h-fit">
              <p className="text-label text-[var(--accent-gold)] mb-4">Summary</p>
              <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p>
                  <span style={{ color: 'var(--text-muted)' }}>Date</span>
                  <br />
                  {selectedDate?.toLocaleDateString('en-PK', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p>
                  <span style={{ color: 'var(--text-muted)' }}>Time</span>
                  <br />
                  {timeSlot ? formatTime(timeSlot) : '—'}
                </p>
                <p>
                  <span style={{ color: 'var(--text-muted)' }}>Party</span>
                  <br />
                  {partySize} guests
                </p>
                {selectedSlot && !selectedSlot.is_full && (
                  <p style={{ fontSize: '12px', color: 'var(--accent-gold)' }}>
                    {selectedSlot.remaining_covers} covers available in this slot
                  </p>
                )}
              </div>
            </aside>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
