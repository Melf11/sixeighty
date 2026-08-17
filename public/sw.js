// Minimaler Service Worker.
//
// Zweck ist allein die Installierbarkeit als App (Android/Chrome verlangt einen
// registrierten SW mit fetch-Handler; iOS installiert über das Manifest).
// Offline-Betrieb ist bewusst NICHT implementiert: Inhalte kommen immer frisch
// aus dem Netz, damit nach einem Deploy nie veraltete Seiten oder ein alter
// Suchindex ausgeliefert werden.

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', event => event.waitUntil(
  // Aufräumen, falls eine frühere Version Inhalte gecacht hat
  caches.keys()
    .then(keys => Promise.all(keys.map(k => caches.delete(k))))
    .then(() => self.clients.claim()),
))

self.addEventListener('fetch', () => {
  // Durchreichen an das Netzwerk (kein respondWith = Standardverhalten)
})
