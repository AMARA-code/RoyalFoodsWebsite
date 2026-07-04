import { NextResponse } from 'next/server'
import { getSignedStorageUrl } from '@/lib/storage'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const bucket = searchParams.get('bucket') ?? 'payment-screenshots'

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    const signedUrl = await getSignedStorageUrl(bucket, url)
    if (!signedUrl) {
      return NextResponse.json({ error: 'Could not resolve image URL' }, { status: 404 })
    }

    return NextResponse.json({ success: true, url: signedUrl })
  } catch (err) {
    console.error('Signed URL route error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
