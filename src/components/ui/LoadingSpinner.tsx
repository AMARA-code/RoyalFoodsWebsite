'use client'

import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type SpinnerVariant = 'crimson' | 'gold' | 'white' | 'muted'

interface LoadingSpinnerProps {
  size?: SpinnerSize
  variant?: SpinnerVariant
  label?: string         // accessible label + optional visible text
  showLabel?: boolean    // show label as visible text below spinner
  fullPage?: boolean     // center in viewport
  className?: string
}

// ─── Style Maps ───────────────────────────────────────────────────────────────

const sizeMap: Record<SpinnerSize, { svg: string; stroke: number }> = {
  xs: { svg: 'w-3 h-3',   stroke: 2 },
  sm: { svg: 'w-5 h-5',   stroke: 2 },
  md: { svg: 'w-8 h-8',   stroke: 2 },
  lg: { svg: 'w-12 h-12', stroke: 1.5 },
  xl: { svg: 'w-16 h-16', stroke: 1.5 },
}

const colorMap: Record<SpinnerVariant, { track: string; arc: string }> = {
  crimson: {
    track: 'rgba(139,0,0,0.15)',
    arc:   'var(--accent-crimson-light)',
  },
  gold: {
    track: 'rgba(201,168,76,0.15)',
    arc:   'var(--accent-gold)',
  },
  white: {
    track: 'rgba(255,255,255,0.1)',
    arc:   'rgba(255,255,255,0.85)',
  },
  muted: {
    track: 'var(--bg-elevated)',
    arc:   'var(--text-muted)',
  },
}

// ─── Spinner SVG ──────────────────────────────────────────────────────────────

function SpinnerSVG({
  size = 'md',
  variant = 'gold',
}: {
  size?: SpinnerSize
  variant?: SpinnerVariant
}) {
  const { svg, stroke } = sizeMap[size]
  const { track, arc } = colorMap[variant]
  const r = 20 - stroke
  const circum = 2 * Math.PI * r

  return (
    <svg
      className={`${svg} animate-spin`}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Track */}
      <circle
        cx="20" cy="20" r={r}
        stroke={track}
        strokeWidth={stroke}
      />
      {/* Arc */}
      <circle
        cx="20" cy="20" r={r}
        stroke={arc}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circum * 0.25} ${circum * 0.75}`}
        strokeDashoffset={circum * 0.25}
        transform="rotate(-90 20 20)"
      />
    </svg>
  )
}

// ─── Page Skeleton (for suspense boundaries) ─────────────────────────────────

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-primary)]">
      <SpinnerSVG size="lg" variant="gold" />
      <p className="mt-4 text-label text-accent-gold tracking-[0.2em]">{label}</p>
    </div>
  )
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card-eclat p-4 ${className}`}>
      <div className="shimmer h-48 w-full rounded mb-4" />
      <div className="shimmer h-4 w-3/4 rounded mb-2" />
      <div className="shimmer h-3 w-1/2 rounded mb-4" />
      <div className="shimmer h-8 w-24 rounded" />
    </div>
  )
}

// ─── Inline Skeletons ─────────────────────────────────────────────────────────

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="shimmer h-3 rounded"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LoadingSpinner({
  size = 'md',
  variant = 'gold',
  label = 'Loading',
  showLabel = false,
  fullPage = false,
  className = '',
}: LoadingSpinnerProps) {
  const inner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status" aria-label={label}>
      <SpinnerSVG size={size} variant={variant} />
      {showLabel && (
        <span className="text-label text-accent-gold tracking-[0.2em]">{label}</span>
      )}
      <span className="sr-only">{label}</span>
    </div>
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-sm">
        {inner}
      </div>
    )
  }

  return inner
}