'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save } from 'lucide-react'
import type { ReservationSlotRow } from '@/types/index'
import {
  upsertAdminSlot,
  removeAdminSlot,
} from '@/app/(admin)/admin/reservations/slots/actions'
import { CrimsonButton, OutlineButton } from '@/components/ui/Button'
import toast from 'react-hot-toast'

const emptyForm = {
  time_slot: '',
  label: '',
  max_covers: 24,
  sort_order: 0,
  is_active: true,
}

export default function SlotsManager({ slots }: { slots: ReservationSlotRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [editing, setEditing] = useState<ReservationSlotRow | null>(null)
  const [form, setForm] = useState(emptyForm)

  function startEdit(slot: ReservationSlotRow) {
    setEditing(slot)
    setForm({
      time_slot: slot.time_slot,
      label: slot.label ?? slot.time_slot,
      max_covers: slot.max_covers,
      sort_order: slot.sort_order,
      is_active: slot.is_active,
    })
  }

  function startNew() {
    setEditing(null)
    setForm({
      ...emptyForm,
      sort_order: slots.length + 1,
    })
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await upsertAdminSlot({
        id: editing?.id,
        ...form,
      })
      if (result.success) {
        toast.success(editing ? 'Slot updated' : 'Slot added')
        setEditing(null)
        setForm(emptyForm)
        router.refresh()
      } else {
        toast.error(result.error ?? 'Save failed')
      }
    })
  }

  function handleRemove(id: string) {
    if (!confirm('Deactivate this time slot? It will no longer appear for booking.')) return
    startTransition(async () => {
      const result = await removeAdminSlot(id)
      if (result.success) {
        toast.success('Slot deactivated')
        router.refresh()
      } else {
        toast.error(result.error ?? 'Failed to remove')
      }
    })
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSave}
        className="card-eclat p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end"
      >
        <div>
          <label className="text-label block mb-2">Time (24h)</label>
          <input
            className="input-eclat w-full"
            placeholder="19:00"
            value={form.time_slot}
            onChange={(e) => setForm((f) => ({ ...f, time_slot: e.target.value }))}
            required
            disabled={!!editing}
          />
        </div>
        <div>
          <label className="text-label block mb-2">Label</label>
          <input
            className="input-eclat w-full"
            placeholder="Dinner — 7:00 PM"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-label block mb-2">Max covers</label>
          <input
            type="number"
            min={1}
            max={100}
            className="input-eclat w-full"
            value={form.max_covers}
            onChange={(e) =>
              setForm((f) => ({ ...f, max_covers: Number(e.target.value) }))
            }
            required
          />
        </div>
        <div>
          <label className="text-label block mb-2">Sort order</label>
          <input
            type="number"
            className="input-eclat w-full"
            value={form.sort_order}
            onChange={(e) =>
              setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))
            }
          />
        </div>
        <div className="flex gap-2">
          <CrimsonButton type="submit" disabled={pending} className="flex-1 !py-3">
            <Save size={14} className="inline mr-1" />
            {editing ? 'Update' : 'Add'}
          </CrimsonButton>
          {editing && (
            <OutlineButton
              type="button"
              onClick={() => {
                setEditing(null)
                setForm(emptyForm)
              }}
            >
              Cancel
            </OutlineButton>
          )}
        </div>
      </form>

      <div className="flex justify-between items-center">
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Slots auto-show as occupied or unavailable on the booking page based on
          pending and confirmed reservations.
        </p>
        <OutlineButton type="button" onClick={startNew}>
          <Plus size={14} className="inline mr-1" />
          New slot
        </OutlineButton>
      </div>

      <div
        className="overflow-x-auto rounded-sm"
        style={{ border: '1px solid var(--border-subtle)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                background: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              {['Time', 'Label', 'Max covers', 'Order', 'Active', ''].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-label"
                  style={{ color: 'var(--text-muted)', fontSize: '10px' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-muted)]">
                  No slots — run the Supabase migration or add one above.
                </td>
              </tr>
            ) : (
              slots.map((slot) => (
                <tr
                  key={slot.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    opacity: slot.is_active ? 1 : 0.5,
                  }}
                >
                  <td className="px-4 py-3" style={{ color: 'var(--accent-gold)' }}>
                    {slot.time_slot}
                  </td>
                  <td className="px-4 py-3">{slot.label}</td>
                  <td className="px-4 py-3">{slot.max_covers}</td>
                  <td className="px-4 py-3">{slot.sort_order}</td>
                  <td className="px-4 py-3">
                    {slot.is_active ? 'Yes' : 'No'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(slot)}
                        className="text-label hover:text-[var(--accent-gold)]"
                        style={{ fontSize: '10px', color: 'var(--text-muted)' }}
                      >
                        Edit
                      </button>
                      {slot.is_active && (
                        <button
                          type="button"
                          onClick={() => handleRemove(slot.id)}
                          disabled={pending}
                          style={{ color: 'var(--accent-crimson-light)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
