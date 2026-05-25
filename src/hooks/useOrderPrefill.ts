'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Returns pre-filled customer info from the signed-in user's
 * Supabase auth metadata + profile. Use this on the checkout form
 * so returning users don't have to retype their details.
 */
export function useOrderPrefill() {
  const supabase = createClient()
  const [prefill, setPrefill] = useState({
    name:    '',
    email:   '',
    phone:   '',
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user
        setPrefill({
          name:  u.user_metadata?.full_name ?? '',
          email: u.email ?? '',
          phone: u.user_metadata?.phone ?? '',
        })
      }
      setReady(true)
    })
  }, [])

  return { prefill, ready }
}