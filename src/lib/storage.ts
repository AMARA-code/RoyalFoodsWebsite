import { createAdminClient } from '@/lib/supabase/server'

/** Extract object path inside a bucket from a public URL or raw path. */
export function extractStoragePath(bucket: string, urlOrPath: string): string | null {
  if (!urlOrPath?.trim()) return null

  const trimmed = urlOrPath.trim()
  if (!trimmed.includes('http')) {
    return trimmed.replace(/^\/+/, '')
  }

  const patterns = [
    new RegExp(`/object/public/${bucket}/(.+?)(?:\\?|$)`),
    new RegExp(`/object/sign/${bucket}/(.+?)(?:\\?|$)`),
    new RegExp(`/storage/v1/object/public/${bucket}/(.+?)(?:\\?|$)`),
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match?.[1]) return decodeURIComponent(match[1])
  }

  return null
}

export async function getSignedStorageUrl(
  bucket: string,
  urlOrPath: string,
  expiresIn = 3600
): Promise<string | null> {
  const path = extractStoragePath(bucket, urlOrPath)
  if (!path) return null

  const supabase = await createAdminClient()
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)

  if (error) {
    console.error('Signed URL error:', error.message, path)
    return null
  }

  return data.signedUrl
}
