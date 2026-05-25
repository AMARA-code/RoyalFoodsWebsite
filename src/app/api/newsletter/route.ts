import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('newsletter_subscribers')
      .insert({
        email: email as string,
        name: (name as string) ?? null,
      })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Already subscribed' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Newsletter error:', err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}