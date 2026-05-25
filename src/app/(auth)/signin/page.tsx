'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const ADMIN_EMAIL = 'amaranaeem453@gmail.com'

export default function SignInPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirect') || '/'
  const supabase     = createClient()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    setError('')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email:    form.email,
      password: form.password,
    })

    if (signInError) {
      setError(signInError.message === 'Invalid login credentials'
        ? 'Invalid email or password.'
        : signInError.message)
      setLoading(false)
      return
    }

    // Admin goes to dashboard, others go to redirect target
    if (data.user?.email === ADMIN_EMAIL) {
      router.push('/admin')
    } else {
      router.push(redirectTo)
    }
    router.refresh()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative w-full max-w-md"
    >
      <div className="card-eclat p-8 md:p-10 border border-[var(--border-subtle)]">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6 group">
            <span
              className="text-heading-lg text-[var(--text-primary)] tracking-[0.12em] group-hover:text-[var(--accent-gold)] transition-colors"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Éclat
            </span>
            <span className="block text-label text-[var(--text-muted)] tracking-[0.3em] text-[0.6rem] mt-0.5">Fine Dining</span>
          </Link>
          <div className="divider-gold mb-6" />
          <h1 className="text-heading-md text-[var(--text-primary)] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Welcome Back
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Sign in to your Éclat account
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-label text-[var(--text-secondary)] tracking-widest text-[0.6rem] block mb-1.5">
              EMAIL ADDRESS
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handle}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="input-eclat w-full"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-label text-[var(--text-secondary)] tracking-widest text-[0.6rem]">
                PASSWORD
              </label>
              {/* Future: forgot password link */}
              {/* <Link href="/forgot-password" className="text-[0.6rem] text-[var(--accent-gold)] hover:underline">Forgot?</Link> */}
            </div>
            <div className="relative">
              <input
                name="password"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={handle}
                placeholder="Your password"
                required
                autoComplete="current-password"
                className="input-eclat w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[var(--accent-crimson)] text-sm text-center bg-[var(--accent-crimson)]/10 border border-[var(--accent-crimson)]/20 rounded px-3 py-2"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-crimson w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" /></svg>
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[var(--text-muted)] text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[var(--accent-gold)] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </motion.div>
  )
}