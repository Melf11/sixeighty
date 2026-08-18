/**
 * Liefert die Rohdaten des Suchindex für die Offline-Nutzung.
 *
 * Der Client baut daraus einmalig einen MiniSearch-Index (rund 1 s, in Häppchen,
 * damit die Oberfläche bedienbar bleibt) und legt ihn in IndexedDB ab. Die
 * Seitentexte werden mitgeliefert, weil daraus die Textausschnitte entstehen.
 *
 * Bewusst nur auf Anforderung: rund 2,2 MB gzip, das lädt niemand ungefragt.
 */
export default defineEventHandler(async (event) => {
  const raw = await useStorage('assets:server').getItem<unknown[]>('search/pages.json')
  if (!raw) {
    throw createError({ statusCode: 503, statusMessage: 'Suchindex nicht verfügbar' })
  }

  const { public: pub } = useRuntimeConfig()
  const version = (pub.appVersion as string) || 'dev'

  // Unveränderlich pro Ausgabe: nach einem Deploy ändert sich die Version und
  // der Client merkt beim Abgleich, dass er neu laden muss.
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  setHeader(event, 'X-Index-Version', version)

  return { version, count: raw.length, pages: raw }
})
