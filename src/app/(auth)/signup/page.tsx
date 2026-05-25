'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    name:     '',
    email:    '',
    phone:    '',
    password: '',
    confirm:  '',
  })
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')

    const { error: signUpError } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
          phone:     form.phone,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    // Redirect to sign in after 2s
    setTimeout(() => router.push('/signin'), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative w-full max-w-md"
    >
      {/* Card */}
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
            Create Account
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Join Éclat to order online and reserve your table
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="w-14 h-14 rounded-full bg-green-900/30 border border-green-700/40 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-[var(--text-primary)] font-medium mb-1">Account created!</p>
            <p className="text-[var(--text-muted)] text-sm">Check your email to verify. Redirecting to sign in…</p>
          </motion.div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-label text-[var(--text-secondary)] tracking-widest text-[0.6rem] block mb-1.5">
                FULL NAME <span className="text-[var(--accent-crimson)]">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handle}
                placeholder="Your full name"
                required
                className="input-eclat w-full"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-label text-[var(--text-secondary)] tracking-widest text-[0.6rem] block mb-1.5">
                EMAIL ADDRESS <span className="text-[var(--accent-crimson)]">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                placeholder="you@example.com"
                required
                className="input-eclat w-full"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-label text-[var(--text-secondary)] tracking-widest text-[0.6rem] block mb-1.5">
                PHONE NUMBER
              </label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handle}
                placeholder="+92 300 0000000"
                className="input-eclat w-full"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-label text-[var(--text-secondary)] tracking-widest text-[0.6rem] block mb-1.5">
                PASSWORD <span className="text-[var(--accent-crimson)]">*</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handle}
                  placeholder="Min. 8 characters"
                  required
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

            {/* Confirm */}
            <div>
              <label className="text-label text-[var(--text-secondary)] tracking-widest text-[0.6rem] block mb-1.5">
                CONFIRM PASSWORD <span className="text-[var(--accent-crimson)]">*</span>
              </label>
              <input
                name="confirm"
                type={showPw ? 'text' : 'password'}
                value={form.confirm}
                onChange={handle}
                placeholder="Repeat password"
                required
                className="input-eclat w-full"
              />
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
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>
        )}

        {/* Footer link */}
        {!success && (
          <p className="text-center text-[var(--text-muted)] text-sm mt-6">
            Already have an account?{' '}
            <Link href="/signin" className="text-[var(--accent-gold)] hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </motion.div>
  )
}