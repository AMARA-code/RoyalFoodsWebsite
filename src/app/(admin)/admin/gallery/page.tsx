'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Trash2, Upload, X, Check, Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminUpload, parseAdminResponse } from '@/lib/admin-api'

interface GalleryImage {
  id: string
  url: string
  caption: string
  category: string
  alt_text: string
  sort_order: number
  is_active: boolean
}

// ✅ Explicit payload type for DB insert/update
type GalleryImagePayload = Omit<GalleryImage, 'id'>

const CATEGORIES = ['all', 'food', 'ambiance', 'events', 'team']

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCat, setActiveCat] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload modal
  const [uploadModal, setUploadModal] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([])
  const [uploadCaption, setUploadCaption] = useState('')
  const [uploadCategory, setUploadCategory] = useState('food')

  const fetchImages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/gallery')
      const json = await parseAdminResponse<{ data: GalleryImage[] }>(res)
      setImages(json.data ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchImages() }, [])

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadFiles(files)
    setUploadPreviews(files.map(f => URL.createObjectURL(f)))
    setUploadModal(true)
  }

  const handleUpload = async () => {
    if (!uploadFiles.length) return
    setUploading(true)

    try {
      let sortBase = images.length
      for (const file of uploadFiles) {
        const url = await adminUpload(file, 'gallery-images', uploadCategory)
        const payload: GalleryImagePayload = {
          url,
          caption: uploadCaption,
          category: uploadCategory,
          alt_text: uploadCaption || file.name,
          sort_order: ++sortBase,
          is_active: true,
        }
        const res = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        await parseAdminResponse(res)
      }

      toast.success(`${uploadFiles.length} image(s) uploaded`)
      setUploadModal(false)
      setUploadFiles([])
      setUploadPreviews([])
      setUploadCaption('')
      await fetchImages()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
      await parseAdminResponse(res)
      toast.success('Image deleted')
      setDeleteConfirm(null)
      await fetchImages()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const toggleActive = async (img: GalleryImage) => {
    try {
      const res = await fetch(`/api/admin/gallery/${img.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !img.is_active }),
      })
      await parseAdminResponse(res)
      setImages((prev) =>
        prev.map((i) => (i.id === img.id ? { ...i, is_active: !i.is_active } : i))
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  const filtered = activeCat === 'all' ? images : images.filter(i => i.category === activeCat)

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            Gallery Manager
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {images.length} images
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFilesSelect}
          />
          <button onClick={() => fileInputRef.current?.click()} className="btn-gold flex items-center gap-2">
            <Upload size={15} /> Upload Images
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className="px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: activeCat === cat ? 'rgba(201,168,76,0.15)' : 'var(--bg-card)',
              border: `1px solid ${activeCat === cat ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.06)'}`,
              color: activeCat === cat ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontSize: '0.72rem',
              letterSpacing: '0.08em',
              textTransform: 'capitalize',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-gold)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl flex flex-col items-center justify-center py-20 gap-3"
          style={{ background: 'var(--bg-card)', border: '1px dashed rgba(201,168,76,0.2)' }}
        >
          <Upload size={32} style={{ color: 'var(--text-secondary)' }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No images yet — upload some</p>
          <button onClick={() => fileInputRef.current?.click()} className="btn-outline mt-2">
            Upload Images
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(img => (
            <div
              key={img.id}
              className="relative group rounded-xl overflow-hidden"
              style={{
                aspectRatio: '1',
                background: 'var(--bg-elevated)',
                opacity: img.is_active ? 1 : 0.5,
              }}
            >
              <Image src={img.url} alt={img.alt_text || img.caption} fill className="object-cover" />

              {/* Overlay on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2"
                style={{ background: 'rgba(0,0,0,0.7)' }}
              >
                {/* Top row: actions */}
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => toggleActive(img)}
                    className="p-1.5 rounded-lg"
                    style={{ background: 'rgba(0,0,0,0.5)', color: img.is_active ? '#22c55e' : 'var(--text-secondary)' }}
                  >
                    {img.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  {deleteConfirm === img.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(img.id)}
                        className="p-1.5 rounded-lg"
                        style={{ background: 'rgba(139,0,0,0.8)', color: 'white' }}
                      >
                        <Check size={12} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="p-1.5 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(img.id)}
                      className="p-1.5 rounded-lg"
                      style={{ background: 'rgba(139,0,0,0.5)', color: 'var(--accent-crimson)' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {/* Bottom: caption + category */}
                <div>
                  {img.caption && (
                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.3 }}>
                      {img.caption}
                    </p>
                  )}
                  <span
                    className="inline-block mt-1 px-1.5 py-0.5 rounded capitalize"
                    style={{ fontSize: '0.55rem', background: 'rgba(201,168,76,0.3)', color: 'var(--accent-gold)', letterSpacing: '0.08em' }}
                  >
                    {img.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: 'var(--bg-card)', border: '1px solid rgba(201,168,76,0.2)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                Upload Images
              </h2>
              <button onClick={() => { setUploadModal(false); setUploadFiles([]); setUploadPreviews([]) }} style={{ color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            {/* Previews */}
            <div className="flex flex-wrap gap-2 mb-4">
              {uploadPreviews.map((src, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                  <Image src={src} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {uploadFiles.length} file{uploadFiles.length !== 1 ? 's' : ''} selected
            </p>

            <div className="space-y-3">
              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
                  CAPTION (applies to all)
                </label>
                <input
                  className="input-eclat w-full"
                  placeholder="Optional caption…"
                  value={uploadCaption}
                  onChange={e => setUploadCaption(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
                  CATEGORY
                </label>
                <select
                  className="input-eclat w-full"
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value)}
                >
                  {CATEGORIES.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => { setUploadModal(false); setUploadFiles([]); setUploadPreviews([]) }} className="btn-outline flex-1">
                Cancel
              </button>
              <button onClick={handleUpload} disabled={uploading} className="btn-gold flex-1 flex items-center justify-center gap-2">
                {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}