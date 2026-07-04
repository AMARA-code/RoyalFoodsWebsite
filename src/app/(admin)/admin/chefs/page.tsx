'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { adminUpload, parseAdminResponse } from '@/lib/admin-api'
import { Plus, Pencil, Trash2, X, Check, Upload, Loader2, GripVertical } from 'lucide-react'

interface Chef {
  id: string
  name: string
  title: string
  bio: string
  photo_url: string
  speciality: string
  sort_order: number
  is_active: boolean
}

// ✅ Explicit payload type for DB insert/update
type ChefPayload = Omit<Chef, 'id'>

const EMPTY: ChefPayload = {
  name: '',
  title: '',
  bio: '',
  photo_url: '',
  speciality: '',
  sort_order: 0,
  is_active: true,
}

export default function AdminChefsPage() {
  const [chefs, setChefs] = useState<Chef[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Chef | null>(null)
  const [form, setForm] = useState<ChefPayload>(EMPTY)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchChefs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/chefs')
      const json = await parseAdminResponse<{ data: Chef[] }>(res)
      setChefs(json.data ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load team')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchChefs() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY, sort_order: chefs.length + 1 })
    setImageFile(null)
    setImagePreview('')
    setModalOpen(true)
  }

  const openEdit = (chef: Chef) => {
    setEditing(chef)
    setForm({
      name: chef.name,
      title: chef.title,
      bio: chef.bio,
      photo_url: chef.photo_url,
      speciality: chef.speciality,
      sort_order: chef.sort_order,
      is_active: chef.is_active,
    })
    setImagePreview(chef.photo_url)
    setImageFile(null)
    setModalOpen(true)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.name || !form.title) return
    setSaving(true)

    try {
      let photoUrl = form.photo_url

      if (imageFile) {
        photoUrl = await adminUpload(imageFile, 'chef-photos', 'team')
      }

      const payload: ChefPayload = { ...form, photo_url: photoUrl }

      if (editing) {
        const res = await fetch(`/api/admin/chefs/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        await parseAdminResponse(res)
        toast.success('Team member updated')
      } else {
        const res = await fetch('/api/admin/chefs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        await parseAdminResponse(res)
        toast.success('Team member added')
      }

      setModalOpen(false)
      await fetchChefs()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/chefs/${id}`, { method: 'DELETE' })
      await parseAdminResponse(res)
      toast.success('Removed from team')
      setDeleteConfirm(null)
      await fetchChefs()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const toggleActive = async (chef: Chef) => {
    try {
      const res = await fetch(`/api/admin/chefs/${chef.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !chef.is_active }),
      })
      await parseAdminResponse(res)
      setChefs((prev) =>
        prev.map((c) => (c.id === chef.id ? { ...c, is_active: !c.is_active } : c))
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            Team Manager
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {chefs.length} team members
          </p>
        </div>
        <button onClick={openCreate} className="btn-gold flex items-center gap-2">
          <Plus size={15} /> Add Member
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-gold)' }} />
        </div>
      ) : chefs.length === 0 ? (
        <div
          className="rounded-xl flex flex-col items-center justify-center py-20 gap-3"
          style={{ background: 'var(--bg-card)', border: '1px dashed rgba(201,168,76,0.2)' }}
        >
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No team members yet</p>
          <button onClick={openCreate} className="btn-outline">Add First Member</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {chefs.map(chef => (
            <div
              key={chef.id}
              className="rounded-xl overflow-hidden relative"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(201,168,76,0.12)',
                opacity: chef.is_active ? 1 : 0.55,
              }}
            >
              {/* Photo */}
              <div className="relative" style={{ aspectRatio: '4/3', background: 'var(--bg-elevated)' }}>
                {chef.photo_url ? (
                  <Image src={chef.photo_url} alt={chef.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '0.72rem' }}>No photo</span>
                  </div>
                )}
                {/* Status badge */}
                <span
                  className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs"
                  style={{
                    background: chef.is_active ? 'rgba(34,197,94,0.2)' : 'rgba(139,0,0,0.2)',
                    color: chef.is_active ? '#22c55e' : 'var(--accent-crimson)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.08em',
                  }}
                >
                  {chef.is_active ? 'ACTIVE' : 'HIDDEN'}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                  {chef.name}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '0.08em', marginTop: '2px' }}>
                  {chef.title}
                </p>
                {chef.speciality && (
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {chef.speciality}
                  </p>
                )}
                {chef.bio && (
                  <p
                    className="mt-2 line-clamp-2"
                    style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}
                  >
                    {chef.bio}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => openEdit(chef)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg"
                    style={{ background: 'rgba(201,168,76,0.08)', color: 'var(--accent-gold)', fontSize: '0.72rem' }}
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => toggleActive(chef)}
                    className="py-1.5 px-2.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', fontSize: '0.72rem' }}
                  >
                    {chef.is_active ? 'Hide' : 'Show'}
                  </button>
                  {deleteConfirm === chef.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(chef.id)} className="p-1.5 rounded-lg" style={{ background: 'rgba(139,0,0,0.2)', color: 'var(--accent-crimson)' }}>
                        <Check size={12} />
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(chef.id)}
                      className="p-1.5 rounded-lg"
                      style={{ background: 'rgba(139,0,0,0.08)', color: 'var(--accent-crimson)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            style={{ background: 'var(--bg-card)', border: '1px solid rgba(201,168,76,0.2)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                {editing ? 'Edit Team Member' : 'Add Team Member'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Photo */}
              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
                  PHOTO
                </label>
                <div
                  className="relative rounded-xl overflow-hidden flex items-center justify-center"
                  style={{ height: '140px', background: 'var(--bg-elevated)', border: '1px dashed rgba(201,168,76,0.2)' }}
                >
                  {imagePreview ? (
                    <Image src={imagePreview} alt="preview" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <Upload size={20} />
                      <span style={{ fontSize: '0.7rem' }}>Upload photo</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>NAME *</label>
                  <input className="input-eclat w-full" placeholder="Chef's name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>TITLE *</label>
                  <input className="input-eclat w-full" placeholder="e.g. Head Chef" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>SPECIALITY</label>
                <input className="input-eclat w-full" placeholder="e.g. French Cuisine, Pastry" value={form.speciality} onChange={e => setForm(f => ({ ...f, speciality: e.target.value }))} />
              </div>

              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>BIO</label>
                <textarea className="input-eclat w-full" rows={3} placeholder="Short biography…" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <button
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  className="w-9 h-5 rounded-full transition-colors relative"
                  style={{ background: form.is_active ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)' }}
                >
                  <span className="absolute top-0.5 w-4 h-4 rounded-full transition-transform" style={{ background: 'white', left: form.is_active ? '18px' : '2px' }} />
                </button>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Show on public site</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.title} className="btn-gold flex-1" style={{ opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}