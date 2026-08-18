// Service Worker des Steyr-680-Nachschlagewerks.
//
// Drei Ablagen mit bewusst unterschiedlicher Lebensdauer:
//
//   shell-<version>   App-Hülle (HTML, JS, CSS, Schriften, Bilder).
//                     An die Ausgabe gekoppelt: Nach einem Deploy wird der
//                     alte Stand verworfen, damit nie eine Mischung aus
//                     altem und neuem Code läuft.
//
//   sixeighty-docs    Vom Nutzer auf /offline gewählte PDFs. Überlebt Updates
//                     bewusst — die Scans ändern sich nie und ein erneutes
//                     Laden von 200 MB wäre unsinnig.
//
//   (IndexedDB)       Der Suchindex, verwaltet von der App selbst.
//
// /api/* geht immer ans Netz: Der Suchindex-Endpunkt und die Server-Suche
// sollen nie aus einem veralteten Cache beantwortet werden.

// Die Ausgabe kommt als Query-Parameter aus der Registrierung (?v=1.1.0).
// Damit ändert sich bei jedem Release auch die Worker-URL — der Browser
// erkennt ihn dadurch zuverlässig als neu und aktiviert ihn.
const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev'
const SHELL = `shell-${VERSION}`
const DOCS = 'sixeighty-docs'

self.addEventListener('install', () => {
  // Sofort übernehmen; die App-Hülle füllt sich beim Benutzen.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Alte Shell-Stände wegräumen, PDF-Cache ausdrücklich behalten
    const keys = await caches.keys()
    await Promise.all(
      keys
        .filter(k => k.startsWith('shell-') && k !== SHELL)
        .map(k => caches.delete(k)),
    )
    await self.clients.claim()
  })())
})

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Server-Suche und Index-Download: immer frisch
  if (url.pathname.startsWith('/api/')) return

  // PDFs: nur ausliefern, was der Nutzer bewusst gespeichert hat.
  // Nichts wird hier nebenbei aufgenommen — sonst würde sich der Speicher
  // unbemerkt mit allem füllen, was man einmal geöffnet hat.
  if (url.pathname.startsWith('/docs/')) {
    event.respondWith((async () => {
      const hit = await caches.match(request, { cacheName: DOCS })
      if (hit) return hit
      try {
        return await fetch(request)
      } catch {
        return new Response(
          'Dieses PDF ist nicht offline gespeichert. Unter „Offline verfügbar machen“ kannst du es mitnehmen.',
          { status: 504, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
        )
      }
    })())
    return
  }

  // App-Hülle: Netz zuerst (damit ein Deploy sofort greift), Cache als Rückhalt
  event.respondWith((async () => {
    const cache = await caches.open(SHELL)
    try {
      const res = await fetch(request)
      if (res.ok && res.type === 'basic') cache.put(request, res.clone())
      return res
    } catch {
      const cached = await cache.match(request)
      if (cached) return cached
      if (request.mode === 'navigate') {
        const shell = await cache.match('/')
        if (shell) return shell
      }
      return new Response('Offline und nicht gespeichert', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }
  })())
})
