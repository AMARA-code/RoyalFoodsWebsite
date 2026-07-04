'use client'

import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  label?: string           // small uppercase label above (e.g. "Our Story")
  title: string            // main heading
  titleAccent?: string     // portion of title rendered in gold (appended after title)
  subtitle?: string        // paragraph below the heading
  align?: 'left' | 'center' | 'right'
  divider?: 'gold' | 'crimson' | 'none'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  as?: 'h1' | 'h2' | 'h3'
}

// ─── Size Maps ────────────────────────────────────────────────────────────────

const sizeMap = {
  sm: 'text-heading-md',
  md: 'text-heading-lg',
  lg: 'text-heading-xl',
}

const alignMap = {
  left:   'items-start text-left',
  center: 'items-center text-center',
  right:  'items-end text-right',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SectionHeader({
  label,
  title,
  titleAccent,
  subtitle,
  align = 'center',
  divider = 'gold',
  size = 'md',
  className = '',
  as: Heading = 'h2',
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col gap-4 ${alignMap[align]} ${className}`}>
      {/* Label */}
      {label && (
        <span className="text-label text-accent-gold tracking-[0.25em]">
          {label}
        </span>
      )}

      {/* Divider (above title when label exists) */}
      {divider !== 'none' && !label && (
        <div className={divider === 'gold' ? 'divider-gold' : 'divider-crimson'} />
      )}

      {/* Heading */}
      <Heading className={`${sizeMap[size]} text-[var(--text-primary)]`}>
        {title}
        {titleAccent && (
          <span className="text-accent-gold italic"> {titleAccent}</span>
        )}
      </Heading>

      {/* Divider (below heading) */}
      {divider !== 'none' && (
        <div className={divider === 'gold' ? 'divider-gold' : 'divider-crimson'} />
      )}

      {/* Subtitle */}
      {subtitle && (
        <p
          className={[
            'text-[var(--text-secondary)] font-[var(--font-sans)]',
            'font-light leading-relaxed',
            'max-w-xl',
            align === 'center' ? 'mx-auto' : '',
            size === 'lg' ? 'text-base' : 'text-sm',
          ].join(' ')}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}