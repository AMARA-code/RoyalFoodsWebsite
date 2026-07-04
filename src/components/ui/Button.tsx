'use client'

import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonVariant = 'crimson' | 'gold' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  as?: 'button' | 'a'
  href?: string
}

// ─── Style Maps ───────────────────────────────────────────────────────────────

const variantStyles: Record<ButtonVariant, string> = {
  crimson: 'btn-crimson',
  gold:    'btn-gold',
  outline: 'btn-outline',
  ghost: [
    'inline-flex items-center gap-2',
    'px-4 py-2 bg-transparent',
    'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    'font-[var(--font-sans)] text-xs font-medium tracking-[0.15em] uppercase',
    'border border-transparent hover:border-[var(--border-subtle)]',
    'rounded-sm cursor-pointer transition-all duration-200',
  ].join(' '),
  danger: [
    'inline-flex items-center gap-2',
    'px-8 py-[0.85rem] bg-red-900/30',
    'text-red-400',
    'font-[var(--font-sans)] text-xs font-medium tracking-[0.15em] uppercase',
    'border border-red-900/50 hover:border-red-700/70 hover:bg-red-900/50',
    'rounded-sm cursor-pointer transition-all duration-200',
    'hover:-translate-y-0.5',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: '!px-4 !py-2 !text-[0.65rem]',
  md: '',  // default from variant
  lg: '!px-10 !py-4 !text-[0.8rem]',
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin h-3.5 w-3.5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Button({
  variant = 'crimson',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'right',
  fullWidth = false,
  disabled,
  children,
  className = '',
  as: Tag = 'button',
  href,
  onClick,
  type = 'button',
  ...rest
}: ButtonProps) {
  const baseClass = [
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? '!w-full justify-center' : '',
    (disabled || loading) ? 'opacity-50 pointer-events-none' : '',
    className,
  ].filter(Boolean).join(' ')

  const content = (
    <>
      {loading && <Spinner />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </>
  )

  if (Tag === 'a' && href) {
    return (
      <a href={href} className={baseClass} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    )
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={baseClass}
      {...rest}
    >
      {content}
    </button>
  )
}

// ─── Named Exports for convenience ───────────────────────────────────────────

export function CrimsonButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="crimson" {...props} />
}

export function GoldButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="gold" {...props} />
}

export function OutlineButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="outline" {...props} />
}