'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.replace('/admin')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)' }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-2xl"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(201,168,76,0.2)',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.2rem',
              letterSpacing: '0.15em',
              color: 'var(--accent-gold)',
            }}
          >
            ÉCLAT
          </p>
          <p style={{ fontSize: '0.68rem', letterSpacing: '0.2em', color: 'var(--text-secondary)', marginTop: '4px' }}>
            ADMIN ACCESS
          </p>
          <div className="mt-4 mx-auto w-12 h-px" style={{ background: 'var(--accent-gold)', opacity: 0.4 }} />
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label
              className="block mb-1.5"
              style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}
            >
              EMAIL
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="input-eclat w-full pl-9"
                placeholder="admin@eclat.com"
              />
            </div>
          </div>

          <div>
            <label
              className="block mb-1.5"
              style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}
            >
              PASSWORD
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="input-eclat w-full pl-9 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <p style={{ fontSize: '0.75rem', color: 'var(--accent-crimson)' }}>{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="btn-gold w-full mt-2"
            style={{ opacity: loading || !email || !password ? 0.5 : 1 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}