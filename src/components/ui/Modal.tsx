'use client'

import React, { useEffect, useRef, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: ModalSize
  children: React.ReactNode
  footer?: React.ReactNode
  closeOnOverlayClick?: boolean
  showCloseButton?: boolean
  className?: string
}

// ─── Size Map ─────────────────────────────────────────────────────────────────

const sizeMap: Record<ModalSize, string> = {
  sm:   'max-w-sm',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-[95vw] max-h-[95vh]',
}

// ─── Close Icon ───────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M1 1l12 12M13 1L1 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Focus Trap Hook ──────────────────────────────────────────────────────────

function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const el = containerRef.current
    if (!el) return

    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]

    first?.focus()

    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    el.addEventListener('keydown', handleTab)
    return () => el.removeEventListener('keydown', handleTab)
  }, [isOpen])

  return containerRef
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
}: ModalProps) {
  const containerRef = useFocusTrap(isOpen)

  // ESC key
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleOverlay = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) onClose()
    },
    [closeOnOverlayClick, onClose]
  )

  if (!isOpen) return null

  return (
    <div
      className={[
        'fixed inset-0 z-50',
        'flex items-center justify-center',
        'p-4',
      ].join(' ')}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-desc' : undefined}
      onClick={handleOverlay}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={containerRef}
        className={[
          'relative w-full',
          sizeMap[size],
          'bg-[var(--bg-card)]',
          'border border-[var(--border-default)]',
          'rounded-sm shadow-[var(--shadow-elevated)]',
          'animate-fade-in-up',
          'max-h-[90vh] flex flex-col',
          className,
        ].join(' ')}
        style={{ animationDuration: '0.25s' }}
      >
        {/* Gold top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-gold)] to-transparent opacity-60" />

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 pb-4 flex-shrink-0">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-heading-md text-[var(--text-primary)]"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-desc"
                  className="mt-1 text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                className={[
                  'ml-4 flex-shrink-0 p-2',
                  'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                  'border border-transparent hover:border-[var(--border-subtle)]',
                  'rounded-sm transition-all duration-200',
                  '-mt-1 -mr-1',
                ].join(' ')}
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        {/* Divider under header */}
        {title && (
          <div className="mx-6 h-px bg-[var(--border-subtle)] flex-shrink-0" />
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <>
            <div className="mx-6 h-px bg-[var(--border-subtle)] flex-shrink-0" />
            <div className="p-6 pt-4 flex-shrink-0">
              {footer}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Confirm Modal (convenience wrapper) ──────────────────────────────────────

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-outline !px-5 !py-2 !text-xs">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={
              variant === 'danger'
                ? 'inline-flex items-center gap-2 px-5 py-2 bg-red-900/30 text-red-400 font-[var(--font-sans)] text-xs font-medium tracking-[0.15em] uppercase border border-red-900/50 hover:border-red-700 hover:bg-red-900/50 rounded-sm transition-all disabled:opacity-50'
                : 'btn-crimson !px-5 !py-2 !text-xs'
            }
          >
            {loading ? '…' : confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm text-[var(--text-secondary)] font-[var(--font-sans)] font-light leading-relaxed">
        {message}
      </p>
    </Modal>
  )
}