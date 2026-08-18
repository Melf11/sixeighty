/**
 * Offline-Speicher der App.
 *
 * Zwei getrennte Ablagen, weil sie sich völlig unterschiedlich verhalten:
 *
 *  - **Suchindex** → IndexedDB. Er gehört zu einer Ausgabe der App; nach einem
 *    Deploy muss er neu geholt werden, sonst zeigt die Suche einen alten Stand.
 *  - **PDFs** → Cache Storage. Sie ändern sich praktisch nie und überleben
 *    deshalb bewusst jedes Update; erneutes Laden von 200 MB wäre unsinnig.
 *
 * Nichts davon passiert automatisch — der Nutzer entscheidet auf /offline,
 * was mitgenommen wird.
 */

const DB_NAME = 'sixeighty-offline'
const DB_VERSION = 1
const STORE = 'search'
export const PDF_CACHE = 'sixeighty-docs'

interface StoredIndex {
  version: string
  builtAt: number
  count: number
  serialized: string
  pages: Array<{ d: string, p: number, t: string, c?: number }>
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = () => resolve(req.result as T | undefined)
    req.onerror = () => reject(req.error)
  })
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function idbDel(key: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadStoredIndex(): Promise<StoredIndex | undefined> {
  if (!import.meta.client || !('indexedDB' in window)) return undefined
  try {
    return await idbGet<StoredIndex>('index')
  } catch {
    return undefined
  }
}

export async function saveStoredIndex(data: StoredIndex): Promise<void> {
  await idbSet('index', data)
}

export async function clearStoredIndex(): Promise<void> {
  if (!import.meta.client) return
  try { await idbDel('index') } catch { /* nichts zu löschen */ }
}

// ————— PDFs —————

export async function cachedDocUrls(): Promise<Set<string>> {
  if (!import.meta.client || !('caches' in window)) return new Set()
  try {
    const cache = await caches.open(PDF_CACHE)
    const keys = await cache.keys()
    return new Set(keys.map(r => new URL(r.url).pathname))
  } catch {
    return new Set()
  }
}

export async function cacheDoc(url: string): Promise<boolean> {
  const cache = await caches.open(PDF_CACHE)
  const res = await fetch(url)
  // Teilantworten (206) sind als Cache-Eintrag unbrauchbar
  if (!res.ok || res.status !== 200) return false
  await cache.put(url, res)
  return true
}

export async function uncacheDoc(url: string): Promise<void> {
  const cache = await caches.open(PDF_CACHE)
  await cache.delete(url)
}

export async function clearDocCache(): Promise<void> {
  if (!import.meta.client || !('caches' in window)) return
  await caches.delete(PDF_CACHE)
}

// ————— Speicherplatz —————

export interface StorageInfo {
  usedMb: number
  quotaMb: number
  persistent: boolean
}

export async function storageInfo(): Promise<StorageInfo | null> {
  if (!import.meta.client || !navigator.storage?.estimate) return null
  try {
    const est = await navigator.storage.estimate()
    const persistent = navigator.storage.persisted ? await navigator.storage.persisted() : false
    return {
      usedMb: (est.usage ?? 0) / 1048576,
      quotaMb: (est.quota ?? 0) / 1048576,
      persistent,
    }
  } catch {
    return null
  }
}

/**
 * Bittet den Browser, die Daten nicht bei Speicherdruck wegzuräumen.
 * iOS gewährt das für Apps vom Home-Bildschirm meist — garantiert ist es nicht,
 * deshalb wird der tatsächliche Zustand angezeigt statt etwas zu versprechen.
 */
export async function requestPersistence(): Promise<boolean> {
  if (!import.meta.client || !navigator.storage?.persist) return false
  try {
    if (await navigator.storage.persisted()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

// ————— App-Hülle —————

/** Cache-Name der App-Hülle; an die Ausgabe gekoppelt (siehe public/sw.js). */
export function shellCacheName(version: string) {
  return `shell-${version || 'dev'}`
}

/** Alle Seiten der App, die offline erreichbar sein sollen. */
export const APP_ROUTES = [
  '/', '/dokumente', '/suche', '/teile',
  '/modelle', '/fehleranalyse', '/wartung', '/fahrzeug', '/offline',
]

/**
 * Ist die App-Hülle vollständig hinterlegt? Geprüft wird stellvertretend, ob
 * für jede Seite das HTML im Cache liegt.
 */
export async function isShellReady(version: string): Promise<boolean> {
  if (!import.meta.client || !('caches' in window)) return false
  try {
    const cache = await caches.open(shellCacheName(version))
    for (const r of APP_ROUTES) {
      if (!await cache.match(r)) return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * Lädt Seiten und Programmbausteine, damit die App auch ohne Netz vollständig
 * bedienbar ist — auch Seiten, die man vorher noch nie geöffnet hat.
 *
 * Zwei Dinge sind nötig:
 *  - das HTML jeder Seite (für den Kaltstart ohne Netz)
 *  - die JavaScript-Bausteine der Seiten (für das Wechseln innerhalb der App)
 */
export async function warmAppShell(
  version: string,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const cache = await caches.open(shellCacheName(version))
  const total = APP_ROUTES.length
  let done = 0
  for (const route of APP_ROUTES) {
    try {
      const res = await fetch(route, { headers: { Accept: 'text/html' } })
      if (res.ok) await cache.put(route, res.clone())
    } catch {
      // einzelne Seite überspringen — der Rest soll trotzdem verfügbar sein
    }
    done++
    onProgress?.(done, total)
  }
}
