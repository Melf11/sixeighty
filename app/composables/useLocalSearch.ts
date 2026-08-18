import MiniSearch from 'minisearch'
import { DOCS } from '~/data/docs'
import { loadStoredIndex, saveStoredIndex, clearStoredIndex } from './useOfflineStore'

/**
 * Volltextsuche im Browser — identisch zur Server-Logik in
 * `server/api/search.get.ts`, damit online und offline dieselben Treffer
 * herauskommen (gleiche Gewichtung, gleiche Dubletten-Zusammenfassung).
 */

interface PageEntry { d: string, p: number, t: string, c?: number }

export interface LocalHit {
  docId: string
  title: string
  category: string
  models: string[]
  page: number
  score: number
  snippet: string
  alsoIn: Array<{ docId: string, title: string, page: number }>
}

const MINI_OPTS = { fields: ['t'], storeFields: [], idField: 'id' }

let mini: MiniSearch | null = null
let pageMap: Map<string, PageEntry> | null = null
let loadedVersion: string | null = null

export function isIndexLoaded() {
  return mini !== null
}

/** Legt den gespeicherten Index in den Speicher, falls vorhanden. */
export async function initLocalIndex(): Promise<boolean> {
  if (mini) return true
  const stored = await loadStoredIndex()
  if (!stored) return false
  try {
    mini = MiniSearch.loadJSON(stored.serialized, MINI_OPTS)
    pageMap = new Map(stored.pages.map(e => [`${e.d}:${e.p}`, e]))
    loadedVersion = stored.version
    return true
  } catch {
    // Beschädigt oder Formatwechsel — verwerfen, damit neu geladen werden kann
    await clearStoredIndex()
    mini = null
    pageMap = null
    return false
  }
}

export function storedIndexVersion() {
  return loadedVersion
}

/**
 * Lädt den Index vom Server, baut ihn auf und legt ihn ab.
 * `onProgress` bekommt Werte von 0 bis 1 für die Fortschrittsanzeige.
 */
export async function installLocalIndex(onProgress?: (p: number, label: string) => void) {
  onProgress?.(0.05, 'Index wird geladen …')
  const res = await $fetch<{ version: string, count: number, pages: PageEntry[] }>('/api/search-index')

  onProgress?.(0.35, `${res.count.toLocaleString('de-AT')} Seiten werden aufbereitet …`)
  const next = new MiniSearch(MINI_OPTS)

  // addAllAsync arbeitet in Häppchen und gibt zwischendurch den Hauptthread
  // frei — sonst würde die Oberfläche am Telefon sekundenlang einfrieren.
  await next.addAllAsync(
    res.pages.map(e => ({ id: `${e.d}:${e.p}`, t: e.t })),
    { chunkSize: 200 },
  )

  onProgress?.(0.85, 'Wird gespeichert …')
  await saveStoredIndex({
    version: res.version,
    builtAt: Date.now(),
    count: res.count,
    serialized: JSON.stringify(next),
    pages: res.pages,
  })

  mini = next
  pageMap = new Map(res.pages.map(e => [`${e.d}:${e.p}`, e]))
  loadedVersion = res.version
  onProgress?.(1, 'Fertig')
  return res.count
}

export async function removeLocalIndex() {
  await clearStoredIndex()
  mini = null
  pageMap = null
  loadedVersion = null
}

function makeSnippet(text: string, terms: string[], width = 260): string {
  const lower = text.toLowerCase()
  let pos = -1
  for (const t of terms) {
    const i = lower.indexOf(t.toLowerCase())
    if (i >= 0 && (pos === -1 || i < pos)) pos = i
  }
  if (pos === -1) pos = 0
  const start = Math.max(0, pos - Math.floor(width / 3))
  const end = Math.min(text.length, start + width)
  return (start > 0 ? '… ' : '') + text.slice(start, end).trim() + (end < text.length ? ' …' : '')
}

export function searchLocal(query: string, opts: { cat?: string, model?: string, limit?: number } = {}) {
  if (!mini || !pageMap) return null
  const q = query.trim()
  if (q.length < 2) return { total: 0, rawTotal: 0, indexed: true, results: [] as LocalHit[] }

  const docMeta = new Map(DOCS.map(d => [d.id, d]))
  const raw = mini.search(q, { prefix: true, fuzzy: 0.15, combineWith: 'AND' })

  const filtered = raw.filter((r) => {
    const meta = docMeta.get(String(r.id).split(':')[0]!)
    if (!meta) return false
    if (opts.cat && meta.category !== opts.cat) return false
    if (opts.model && !meta.models.includes(opts.model)) return false
    return true
  })

  const max = Math.min(opts.limit ?? 40, 100)
  const results: LocalHit[] = []
  const seenCluster = new Map<number, LocalHit | null>()
  let distinct = 0

  for (const r of filtered) {
    const entry = pageMap.get(String(r.id))
    if (!entry) continue
    const meta = docMeta.get(entry.d)
    if (!meta) continue

    if (entry.c !== undefined && seenCluster.has(entry.c)) {
      const target = seenCluster.get(entry.c)
      if (target && target.alsoIn.length < 4 && !target.alsoIn.some(a => a.docId === entry.d)) {
        target.alsoIn.push({ docId: entry.d, title: meta.title, page: entry.p })
      }
      continue
    }

    distinct++
    if (results.length >= max) {
      if (entry.c !== undefined) seenCluster.set(entry.c, null)
      continue
    }

    const hit: LocalHit = {
      docId: entry.d,
      title: meta.title,
      category: meta.category,
      models: meta.models,
      page: entry.p,
      score: Math.round(r.score * 10) / 10,
      snippet: makeSnippet(entry.t, r.queryTerms),
      alsoIn: [],
    }
    if (entry.c !== undefined) seenCluster.set(entry.c, hit)
    results.push(hit)
  }

  return { total: distinct, rawTotal: filtered.length, indexed: true, results }
}
