/** Client helpers for admin CRUD via service-role API routes. */

export async function parseAdminResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      (json as { error?: string }).error ?? `Request failed (${res.status})`
    )
  }
  return json as T
}

export async function adminUpload(
  file: File,
  bucket: string,
  folder = ''
): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('bucket', bucket)
  if (folder) form.append('folder', folder)

  const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
  const json = await parseAdminResponse<{ url: string }>(res)
  return json.url
}
