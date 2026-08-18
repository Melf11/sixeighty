import { initLocalIndex, searchLocal } from './useLocalSearch'

interface SearchResult {
  docId: string
  title: string
  category: string
  models: string[]
  page: number
  score: number
  snippet: string
}

interface SearchResponse {
  total: number
  rawTotal?: number
  indexed: boolean
  results: SearchResult[]
}

/**
 * Entprellte Volltextsuche.
 *
 * Ist der Offline-Index eingerichtet (siehe /offline), wird lokal gesucht —
 * das ist schneller und funktioniert ohne Netz. Sonst fragt sie den Server.
 * Fällt der Server aus (kein Empfang) und liegt ein lokaler Index vor, springt
 * sie darauf zurück, statt einen Fehler zu zeigen.
 *
 * Explizites $fetch statt useFetch-Watching — feuert zuverlässig bei jeder
 * Eingabe und bricht veraltete Anfragen sauber ab.
 */
export function useDocSearch(params: () => Record<string, string>) {
  const data = ref<SearchResponse | null>(null)
  const pending = ref(false)
  /** true, wenn die Antwort aus dem lokalen Index kam */
  const offline = ref(false)
  // Fehler nicht verschlucken: ein stiller „0 Treffer“ sieht aus wie ein
  // legitimes Ergebnis und verdeckt Serverprobleme.
  const error = ref<string | null>(null)
  let timer: ReturnType<typeof setTimeout> | null = null
  let requestId = 0

  async function run() {
    const p = params()
    const q = (p.q ?? '').trim()
    if (q.length < 2) {
      data.value = null
      error.value = null
      pending.value = false
      return
    }
    const id = ++requestId
    pending.value = true

    const local = () => searchLocal(q, {
      cat: p.cat || undefined,
      model: p.model || undefined,
      limit: p.limit ? Number(p.limit) : undefined,
    })

    try {
      // Lokaler Index vorhanden → ohne Netz und ohne Wartezeit
      const localRes = local()
      if (localRes) {
        if (id === requestId) {
          data.value = localRes
          offline.value = true
          error.value = null
        }
        return
      }

      const res = await $fetch<SearchResponse>('/api/search', { query: p })
      if (id === requestId) {
        data.value = res
        offline.value = false
        error.value = null
      }
    } catch (e: unknown) {
      // Kein Netz? Wenn ein lokaler Index existiert, damit antworten.
      const fallback = local()
      if (id === requestId) {
        if (fallback) {
          data.value = fallback
          offline.value = true
          error.value = null
        } else {
          data.value = null
          error.value = e instanceof Error ? e.message : 'Unbekannter Fehler'
        }
      }
    } finally {
      if (id === requestId) pending.value = false
    }
  }

  function trigger(debounceMs = 250) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(run, debounceMs)
  }

  onMounted(async () => {
    // Gespeicherten Index in den Speicher holen, bevor zum ersten Mal gesucht wird
    await initLocalIndex()
    watch(params, () => trigger(), { deep: true })
    run() // Falls die Seite mit ?q=… geladen wird
  })

  return { data, pending, error, offline }
}
