'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { adminUpload, parseAdminResponse } from '@/lib/admin-api'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  EyeOff,
  ChevronDown,
  Upload,
  X,
  Check,
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
  is_active: boolean
}

interface MenuItem {
  id: string
  category_id: string
  name: string
  slug: string
  description: string
  price: number
  image_url: string
  badge: string | null
  tags: string[]
  is_available: boolean
  is_featured: boolean
  sort_order: number
}

// ✅ Explicit type for DB insert/update payload (excludes 'id')
type MenuItemPayload = Omit<MenuItem, 'id'>

const EMPTY_ITEM: Omit<MenuItem, 'id' | 'slug'> = {
  category_id: '',
  name: '',
  description: '',
  price: 0,
  image_url: '',
  badge: '',
  tags: [],
  is_available: true,
  is_featured: false,
  sort_order: 0,
}

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [activeCat, setActiveCat] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [form, setForm] = useState(EMPTY_ITEM)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/menu')
      const json = await parseAdminResponse<{
        categories: Category[]
        items: MenuItem[]
      }>(res)
      setCategories(json.categories ?? [])
      setItems(json.items ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => {
    setEditingItem(null)
    setForm({ ...EMPTY_ITEM, category_id: categories[0]?.id ?? '' })
    setImageFile(null)
    setImagePreview('')
    setModalOpen(true)
  }

  const openEdit = (item: MenuItem) => {
    setEditingItem(item)
    setForm({
      category_id: item.category_id,
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image_url,
      badge: item.badge ?? '',
      tags: item.tags ?? [],
      is_available: item.is_available,
      is_featured: item.is_featured,
      sort_order: item.sort_order,
    })
    setImagePreview(item.image_url ?? '')
    setImageFile(null)
    setModalOpen(true)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSave = async () => {
    if (!form.name || !form.category_id || form.price <= 0) return
    setSaving(true)

    try {
      let imageUrl = form.image_url

      if (imageFile) {
        imageUrl = await adminUpload(imageFile, 'menu-images', 'dishes')
      }

      const payload: MenuItemPayload = {
        category_id: form.category_id,
        name: form.name,
        slug: slugify(form.name),
        description: form.description,
        price: Number(form.price),
        image_url: imageUrl,
        badge: form.badge || null,
        tags: form.tags,
        is_available: form.is_available,
        is_featured: form.is_featured,
        sort_order: form.sort_order,
      }

      if (editingItem) {
        const res = await fetch(`/api/admin/menu/items/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        await parseAdminResponse(res)
        toast.success('Menu item updated')
      } else {
        const res = await fetch('/api/admin/menu/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        await parseAdminResponse(res)
        toast.success('Menu item added')
      }

      setModalOpen(false)
      await fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/menu/items/${id}`, { method: 'DELETE' })
      await parseAdminResponse(res)
      toast.success('Item deleted')
      setDeleteConfirm(null)
      await fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const toggleAvailable = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/admin/menu/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !item.is_available }),
      })
      await parseAdminResponse(res)
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_available: !i.is_available } : i))
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  const filtered = items.filter(item => {
    const matchCat = activeCat === 'all' || item.category_id === activeCat
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const getCatName = (id: string) => categories.find(c => c.id === id)?.name ?? '—'

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }} className="min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="min-w-0">
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            Menu Manager
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {items.length} items across {categories.length} categories
          </p>
        </div>
        <button onClick={openCreate} className="btn-gold flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto">
          <Plus size={15} /> Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-5 min-w-0">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input
            className="input-eclat w-full pl-9"
            placeholder="Search dishes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category tabs — horizontal scroll */}
        <div className="admin-menu-scroll -mx-1 px-1 overflow-x-auto pb-1">
          <div className="flex flex-nowrap gap-2 min-w-max">
          {[{ id: 'all', name: 'All' }, ...categories].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className="px-3 py-1.5 rounded-lg transition-all text-xs shrink-0"
              style={{
                background: activeCat === cat.id ? 'rgba(201,168,76,0.15)' : 'var(--bg-card)',
                border: `1px solid ${activeCat === cat.id ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.06)'}`,
                color: activeCat === cat.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontSize: '0.72rem',
                letterSpacing: '0.06em',
              }}
            >
              {cat.name}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden min-w-0"
        style={{ background: 'var(--bg-card)', border: '1px solid rgba(201,168,76,0.12)' }}
      >
        {loading ? (
          <div className="p-10 text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Loading menu…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            No items found
          </div>
        ) : (
          <div className="admin-menu-scroll overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
                {['Item', 'Category', 'Price', 'Badge', 'Status', 'Actions'].map(h => (
                  <th
                    key={h}
                    className="text-left px-5 py-3"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--text-secondary)' }}
                  >
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr
                  key={item.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                >
                  {/* Item */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ background: 'var(--bg-elevated)' }}
                      >
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
                            <span style={{ fontSize: '0.6rem' }}>IMG</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{item.name}</p>
                        {item.is_featured && (
                          <span style={{ fontSize: '0.6rem', color: 'var(--accent-gold)', letterSpacing: '0.08em' }}>
                            ★ FEATURED
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-3">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {getCatName(item.category_id)}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-3">
                    <span style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)' }}>
                      {`$${item.price.toLocaleString()}`}
                    </span>
                  </td>

                  {/* Badge */}
                  <td className="px-5 py-3">
                    {item.badge ? (
                      <span
                        className="px-2 py-0.5 rounded"
                        style={{
                          fontSize: '0.6rem',
                          letterSpacing: '0.08em',
                          background: 'rgba(201,168,76,0.12)',
                          color: 'var(--accent-gold)',
                        }}
                      >
                        {item.badge}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>—</span>
                    )}
                  </td>

                  {/* Status toggle */}
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleAvailable(item)}
                      className="flex items-center gap-1.5 transition-colors"
                      style={{
                        fontSize: '0.7rem',
                        letterSpacing: '0.08em',
                        color: item.is_available ? '#22c55e' : 'var(--accent-crimson)',
                      }}
                    >
                      {item.is_available ? <Eye size={13} /> : <EyeOff size={13} />}
                      {item.is_available ? 'Available' : 'Hidden'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ background: 'rgba(201,168,76,0.08)', color: 'var(--accent-gold)' }}
                      >
                        <Pencil size={13} />
                      </button>
                      {deleteConfirm === item.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg"
                            style={{ background: 'rgba(139,0,0,0.2)', color: 'var(--accent-crimson)' }}
                          >
                            <Check size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="p-1.5 rounded-lg"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ background: 'rgba(139,0,0,0.08)', color: 'var(--accent-crimson)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            style={{ background: 'var(--bg-card)', border: '1px solid rgba(201,168,76,0.2)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                {editingItem ? 'Edit Item' : 'Add Menu Item'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image */}
              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
                  IMAGE
                </label>
                <div
                  className="relative rounded-xl overflow-hidden flex items-center justify-center"
                  style={{ height: '160px', background: 'var(--bg-elevated)', border: '1px dashed rgba(201,168,76,0.2)' }}
                >
                  {imagePreview ? (
                    <Image src={imagePreview} alt="preview" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <Upload size={24} />
                      <span style={{ fontSize: '0.72rem' }}>Upload image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <input
                  className="input-eclat w-full mt-2"
                  placeholder="Or paste image URL…"
                  value={form.image_url}
                  onChange={e => { setForm(f => ({ ...f, image_url: e.target.value })); setImagePreview(e.target.value) }}
                />
              </div>

              {/* Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
                    NAME *
                  </label>
                  <input
                    className="input-eclat w-full"
                    placeholder="Dish name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
                    PRICE ($) *
                  </label>
                  <input
                    type="number"
                    className="input-eclat w-full"
                    placeholder="0"
                    value={form.price || ''}
                    onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Category + Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
                    CATEGORY *
                  </label>
                  <div className="relative">
                    <select
                      className="input-eclat w-full appearance-none pr-8"
                      value={form.category_id}
                      onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
                    BADGE
                  </label>
                  <input
                    className="input-eclat w-full"
                    placeholder="e.g. Signature, Chef's Special"
                    value={form.badge ?? ''}
                    onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
                  DESCRIPTION
                </label>
                <textarea
                  className="input-eclat w-full"
                  rows={3}
                  placeholder="Dish description…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
                  TAGS (comma-separated)
                </label>
                <input
                  className="input-eclat w-full"
                  placeholder="e.g. vegetarian, spicy, gluten-free"
                  value={form.tags.join(', ')}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                />
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                {[
                  { key: 'is_available', label: 'Available' },
                  { key: 'is_featured', label: 'Featured' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <button
                      onClick={() => setForm(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
                      className="w-9 h-5 rounded-full transition-colors relative"
                      style={{
                        background: form[key as keyof typeof form]
                          ? 'var(--accent-gold)'
                          : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <span
                        className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                        style={{
                          background: 'white',
                          left: form[key as keyof typeof form] ? '18px' : '2px',
                        }}
                      />
                    </button>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="btn-outline flex-1">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.category_id || form.price <= 0}
                className="btn-gold flex-1"
                style={{ opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Saving…' : editingItem ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}