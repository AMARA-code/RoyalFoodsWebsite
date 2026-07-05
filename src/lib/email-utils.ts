const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Fix common typos (e.g. gmailcom → gmail.com) and validate. */
export function normalizeEmail(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null

  let email = raw.trim().toLowerCase()
  email = email.replace(/@gmailcom$/i, '@gmail.com')
  email = email.replace(/@gmai\.com$/i, '@gmail.com')
  email = email.replace(/@yahooo?\.com$/i, '@yahoo.com')
  email = email.replace(/\s+/g, '')

  if (!EMAIL_RE.test(email)) return null
  return email
}

export function getAdminEmail(): string {
  const normalized = normalizeEmail(process.env.ADMIN_EMAIL ?? 'amaranaeem453@gmail.com')
  return normalized ?? 'amaranaeem453@gmail.com'
}
