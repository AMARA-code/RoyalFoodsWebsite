'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { adminUpload, parseAdminResponse } from '@/lib/admin-api'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Upload,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Heading2,
  Quote,
} from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
}

// ✅ Explicit payload type for DB insert/update
type BlogPostPayload = Omit<BlogPost, 'id' | 'created_at'>

const EMPTY: BlogPostPayload = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featured_image: '',
  status: 'draft',
  published_at: null,
}

// Simple toolbar-only rich textarea (no external Tiptap dep needed at this point;
// Tiptap can be swapped in if already installed)
function RichTextEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = React.useRef<HTMLTextAreaElement>(null)

  const wrap = (before: string, after: string = before) => {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const sel = value.slice(start, end) || 'text'
    const newVal = value.slice(0, start) + before + sel + after + value.slice(end)
    onChange(newVal)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + before.length, start + before.length + sel.length)
    }, 0)
  }

  const toolbarBtns = [
    { icon: Bold, action: () => wrap('**', '**'), title: 'Bold' },
    { icon: Italic, action: () => wrap('_', '_'), title: 'Italic' },
    { icon: Heading2, action: () => wrap('## '), title: 'Heading' },
    { icon: Quote, action: () => wrap('> '), title: 'Blockquote' },
    { icon: List, action: () => wrap('- '), title: 'List item' },
    { icon: LinkIcon, action: () => wrap('[', '](url)'), title: 'Link' },
  ]

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Toolbar */}
      <div
        className="flex gap-1 px-3 py-2"
        style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {toolbarBtns.map(({ icon: Icon, action, title }) => (
          <button
            key={title}
            onClick={action}
            title={title}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-gold)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <Icon size={14} />
          </button>
        ))}
        <span className="ml-2" style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>
          Markdown supported
        </span>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={12}
        placeholder="Write your post content here… Markdown is supported."
        className="w-full p-4 resize-none"
        style={{
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.85rem',
          lineHeight: 1.7,
          outline: 'none',
          border: 'none',
        }}
      />
    </div>
  )
}

import React from 'react'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'editor'>('list')
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [form, setForm] = useState<BlogPostPayload>(EMPTY)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/blog')
      const json = await parseAdminResponse<{ data: BlogPost[] }>(res)
      setPosts(json.data ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPosts() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY })
    setImageFile(null)
    setImagePreview('')
    setView('editor')
  }

  const openEdit = (post: BlogPost) => {
    setEditing(post)
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featured_image: post.featured_image,
      status: post.status,
      published_at: post.published_at,
    })
    setImagePreview(post.featured_image ?? '')
    setImageFile(null)
    setView('editor')
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.title) return
    setSaving(true)

    try {
      let imageUrl = form.featured_image
      if (imageFile) {
        imageUrl = await adminUpload(imageFile, 'blog-images', 'posts')
      }

      const payload: BlogPostPayload = {
        ...form,
        slug: form.slug || slugify(form.title),
        featured_image: imageUrl,
        published_at:
          form.status === 'published' ? (form.published_at ?? new Date().toISOString()) : null,
      }

      if (editing) {
        const res = await fetch(`/api/admin/blog/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        await parseAdminResponse(res)
        toast.success('Post updated')
      } else {
        const res = await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        await parseAdminResponse(res)
        toast.success('Post created')
      }

      setView('list')
      await fetchPosts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
      await parseAdminResponse(res)
      toast.success('Post deleted')
      setDeleteConfirm(null)
      await fetchPosts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const toggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null,
        }),
      })
      await parseAdminResponse(res)
      await fetchPosts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  // ─── List view ────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div style={{ fontFamily: 'var(--font-sans)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
              Blog & Events
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {posts.length} posts · {posts.filter(p => p.status === 'published').length} published
            </p>
          </div>
          <button onClick={openCreate} className="btn-gold flex items-center gap-2">
            <Plus size={15} /> New Post
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-gold)' }} />
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl flex flex-col items-center justify-center py-20 gap-3" style={{ background: 'var(--bg-card)', border: '1px dashed rgba(201,168,76,0.2)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No posts yet</p>
            <button onClick={openCreate} className="btn-outline">Write First Post</button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <div
                key={post.id}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid rgba(201,168,76,0.1)' }}
              >
                {/* Featured image */}
                <div
                  className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                  style={{ background: 'var(--bg-elevated)' }}
                >
                  {post.featured_image ? (
                    <Image src={post.featured_image} alt={post.title} width={64} height={64} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ fontSize: '0.55rem' }}>IMG</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{post.title}</p>
                    <span
                      className="px-1.5 py-0.5 rounded"
                      style={{
                        fontSize: '0.58rem',
                        letterSpacing: '0.08em',
                        background: post.status === 'published' ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                        color: post.status === 'published' ? '#22c55e' : 'var(--text-secondary)',
                      }}
                    >
                      {post.status.toUpperCase()}
                    </span>
                  </div>
                  {post.excerpt && (
                    <p className="truncate" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {post.excerpt}
                    </p>
                  )}
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
                      : `Draft · Created ${new Date(post.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleStatus(post)}
                    className="p-1.5 rounded-lg transition-colors"
                    title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                    style={{
                      background: post.status === 'published' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.06)',
                      color: post.status === 'published' ? '#22c55e' : 'var(--text-secondary)',
                    }}
                  >
                    {post.status === 'published' ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button
                    onClick={() => openEdit(post)}
                    className="p-1.5 rounded-lg"
                    style={{ background: 'rgba(201,168,76,0.08)', color: 'var(--accent-gold)' }}
                  >
                    <Pencil size={13} />
                  </button>
                  {deleteConfirm === post.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-lg" style={{ background: 'rgba(139,0,0,0.2)', color: 'var(--accent-crimson)' }}>
                        <Check size={13} />
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(post.id)} className="p-1.5 rounded-lg" style={{ background: 'rgba(139,0,0,0.08)', color: 'var(--accent-crimson)' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ─── Editor view ──────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'var(--font-sans)', maxWidth: '820px' }}>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setView('list')}
          className="flex items-center gap-1.5"
          style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}
        >
          ← Back to posts
        </button>
        <div className="flex gap-2">
          {/* Status toggle */}
          <button
            onClick={() => setForm(f => ({ ...f, status: f.status === 'draft' ? 'published' : 'draft' }))}
            className="px-3 py-1.5 rounded-lg"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              background: form.status === 'published' ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
              color: form.status === 'published' ? '#22c55e' : 'var(--text-secondary)',
              border: `1px solid ${form.status === 'published' ? 'rgba(34,197,94,0.3)' : 'transparent'}`,
            }}
          >
            {form.status === 'published' ? '● Published' : '○ Draft'}
          </button>
          <button onClick={handleSave} disabled={saving || !form.title} className="btn-gold" style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Publish Post'}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Featured image */}
        <div
          className="relative rounded-xl overflow-hidden flex items-center justify-center"
          style={{ height: '200px', background: 'var(--bg-card)', border: '1px dashed rgba(201,168,76,0.2)' }}
        >
          {imagePreview ? (
            <Image src={imagePreview} alt="cover" fill className="object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Upload size={24} />
              <span style={{ fontSize: '0.75rem' }}>Click to add cover image</span>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>

        {/* Title */}
        <input
          className="w-full bg-transparent outline-none"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            color: 'var(--text-primary)',
            letterSpacing: '0.02em',
            borderBottom: '1px solid rgba(201,168,76,0.15)',
            paddingBottom: '12px',
          }}
          placeholder="Post title…"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: slugify(e.target.value) }))}
        />

        {/* Slug + Excerpt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5" style={{ fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--text-secondary)' }}>SLUG</label>
            <input className="input-eclat w-full" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated-from-title" />
          </div>
          <div>
            <label className="block mb-1.5" style={{ fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--text-secondary)' }}>EXCERPT</label>
            <input className="input-eclat w-full" value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Short summary…" />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block mb-2" style={{ fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--text-secondary)' }}>CONTENT</label>
          <RichTextEditor value={form.content} onChange={content => setForm(f => ({ ...f, content }))} />
        </div>
      </div>
    </div>
  )
}