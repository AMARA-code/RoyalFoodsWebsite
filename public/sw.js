const CACHE_NAME = 'royal-foods-v2'

const PRECACHE = [
  '/images/royal-foods-logo.png',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/favicon.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  )
})

function isCacheableAsset(pathname) {
  return (
    pathname.startsWith('/images/') ||
    pathname.startsWith('/icon-') ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/favicon.png' ||
    pathname === '/apple-touch-icon.png'
  )
}

function shouldBypassServiceWorker(request, url) {
  if (request.method !== 'GET') return true
  if (url.origin !== self.location.origin) return true
  if (url.pathname.startsWith('/api/')) return true
  if (url.pathname.startsWith('/_next/')) return true
  if (request.mode === 'navigate') return true
  if (request.headers.get('RSC') === '1') return true
  if (request.headers.get('Next-Router-Prefetch') === '1') return true
  if (request.headers.get('Accept')?.includes('text/x-component')) return true
  return false
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  if (shouldBypassServiceWorker(request, url)) return
  if (!isCacheableAsset(url.pathname)) return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
    })
  )
})

self.addEventListener('push', (event) => {
  let data = { title: 'Royal Foods', body: 'New offer available!', url: '/' }
  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch {
    /* use defaults */
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url || '/' },
      vibrate: [100, 50, 100],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})
