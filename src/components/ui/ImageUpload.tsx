'use client'

import React, { useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadBucket =
  | 'menu-images'
  | 'gallery-images'
  | 'chef-photos'
  | 'blog-images'
  | 'payment-screenshots'

interface ImageUploadProps {
  bucket: UploadBucket
  folder?: string           // subfolder within bucket e.g. "dishes"
  value?: string            // current image URL (for edit mode)
  onChange: (url: string) => void
  onError?: (msg: string) => void
  accept?: string
  maxSizeMB?: number
  label?: string
  hint?: string
  previewHeight?: string    // Tailwind h-* class e.g. "h-48"
  disabled?: boolean
  className?: string
}

// ─── Upload Icon ──────────────────────────────────────────────────────────────

function UploadIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageUpload({
  bucket,
  folder = '',
  value,
  onChange,
  onError,
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMB = 5,
  label = 'Upload Image',
  hint,
  previewHeight = 'h-48',
  disabled = false,
  className = '',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [localError, setLocalError] = useState<string | null>(null)

  const supabase = createClient()

  function clearError() { setLocalError(null) }

  function handleError(msg: string) {
    setLocalError(msg)
    onError?.(msg)
  }

  const uploadFile = useCallback(async (file: File) => {
    clearError()

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      handleError(`File exceeds ${maxSizeMB}MB limit`)
      return
    }

    // Validate type
    const allowedTypes = accept.split(',').map(t => t.trim())
    if (!allowedTypes.includes(file.type)) {
      handleError('File type not allowed')
      return
    }

    setUploading(true)
    setProgress(20)

    try {
      // Unique file name
      const ext = file.name.split('.').pop()
      const ts = Date.now()
      const rand = Math.random().toString(36).slice(2, 8)
      const fileName = folder
        ? `${folder}/${ts}-${rand}.${ext}`
        : `${ts}-${rand}.${ext}`

      setProgress(50)

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: false, cacheControl: '3600' })

      if (error) throw error

      setProgress(90)

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      onChange(urlData.publicUrl)
      setProgress(100)
    } catch (err: unknown) {
      handleError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 800)
    }
  }, [bucket, folder, maxSizeMB, accept, onChange, supabase])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    e.target.value = ''          // allow re-uploading same file
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (disabled || uploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    if (!disabled && !uploading) setIsDragging(true)
  }

  function handleRemove() {
    onChange('')
    clearError()
  }

  const showDropzone = !value
  const borderColor = isDragging
    ? 'border-[var(--accent-gold)]'
    : localError
    ? 'border-red-800/60'
    : 'border-[var(--border-subtle)]'

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-label text-[var(--text-secondary)] tracking-[0.15em]">
          {label}
        </label>
      )}

      {/* Preview */}
      {value ? (
        <div className={`relative ${previewHeight} group rounded-sm overflow-hidden border ${borderColor}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />
          {/* Overlay actions */}
          {!disabled && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-card)] text-[var(--text-primary)] text-xs font-[var(--font-sans)] tracking-wider uppercase border border-[var(--border-default)] rounded-sm hover:border-[var(--accent-gold)] transition-colors"
              >
                <UploadIcon size={14} />
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-2 px-3 py-2 bg-red-950/50 text-red-400 text-xs font-[var(--font-sans)] tracking-wider uppercase border border-red-900/40 rounded-sm hover:border-red-700 transition-colors"
              >
                <TrashIcon />
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Dropzone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          className={[
            `${previewHeight} flex flex-col items-center justify-center`,
            'border border-dashed rounded-sm',
            borderColor,
            'bg-[var(--bg-elevated)]',
            'transition-all duration-200',
            !disabled && !uploading ? 'cursor-pointer hover:border-[var(--accent-gold)] hover:bg-[var(--bg-card)]' : 'opacity-60 cursor-not-allowed',
            isDragging ? 'bg-[var(--accent-gold-muted)]' : '',
          ].join(' ')}
          role="button"
          aria-label={`${label} — click or drag file here`}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3 w-full px-8">
              <svg className="animate-spin w-6 h-6 text-[var(--accent-gold)]" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="rgba(201,168,76,0.15)" strokeWidth="2" />
                <circle cx="20" cy="20" r="18" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 18 * 0.25} ${2 * Math.PI * 18 * 0.75}`} strokeDashoffset={2 * Math.PI * 18 * 0.25} transform="rotate(-90 20 20)" />
              </svg>
              <div className="w-full bg-[var(--bg-card)] rounded-full h-0.5">
                <div
                  className="h-0.5 rounded-full bg-[var(--accent-gold)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-label text-accent-gold">Uploading…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
              <UploadIcon size={24} />
              <div className="text-center">
                <p className="text-sm font-[var(--font-sans)] text-[var(--text-secondary)]">
                  {isDragging ? 'Drop to upload' : 'Click or drag image here'}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {hint ?? `PNG, JPG, WEBP up to ${maxSizeMB}MB`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {localError && (
        <p className="text-xs text-red-400 font-[var(--font-sans)]">{localError}</p>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled || uploading}
        aria-hidden="true"
      />
    </div>
  )
}

// ─── Compact inline variant (for forms) ──────────────────────────────────────

interface InlineUploadProps {
  bucket: UploadBucket
  folder?: string
  value?: string
  onChange: (url: string) => void
  placeholder?: string
  disabled?: boolean
}

export function InlineImageUpload({ bucket, folder, value, onChange, placeholder = 'No image selected', disabled }: InlineUploadProps) {
  return (
    <ImageUpload
      bucket={bucket}
      folder={folder}
      value={value}
      onChange={onChange}
      previewHeight="h-32"
      label=""
      hint="Click to upload"
      disabled={disabled}
      hint-placeholder={placeholder}
    />
  )
}