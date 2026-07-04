import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const ALLOWED_BUCKETS = [
  'menu-images',
  'gallery-images',
  'blog-images',
  'chef-photos',
  'payment-screenshots',
] as const

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file') as File | null
    const bucket = form.get('bucket') as string | null
    const folder = (form.get('folder') as string | null)?.trim() ?? ''

    if (!file || !bucket) {
      return NextResponse.json({ error: 'file and bucket are required' }, { status: 400 })
    }

    if (!ALLOWED_BUCKETS.includes(bucket as (typeof ALLOWED_BUCKETS)[number])) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path = folder ? `${folder}/${fileName}` : fileName

    const supabase = await createAdminClient()
    const buffer = Buffer.from(await file.arrayBuffer())

    const { data, error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    })

    if (error) {
      console.error('Admin upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return NextResponse.json({ success: true, url: urlData.publicUrl, path: data.path })
  } catch (err) {
    console.error('Upload route error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
