'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const ADMIN_EMAIL = 'amaranaeem453@gmail.com'

function SignInContent() {
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
      <div className="bg-white rounded-2xl p-8 md:p-10 border border-gray-200 shadow-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center mb-6">
            <img src="/images/royal-foods-logo.png" alt="Royal Foods" className="w-16 h-16 rounded-full mb-2" />
            <span className="font-bold text-[#1A2238] text-lg">Royal Foods</span>
            <span className="text-gray-500 text-xs">Order Online</span>
          </Link>
          <h1 className="text-xl font-bold text-[#1A2238] mb-2">Welcome Back</h1>
          <p className="text-gray-500 text-sm">
            Sign in to your Éclat account
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-label text-[var(--text-secondary)] tracking-widest text-[0.6rem]">
                PASSWORD
              </label>
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

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-[var(--text-muted)]">Loading…</div>}>
      <SignInContent />
    </Suspense>
  )
}