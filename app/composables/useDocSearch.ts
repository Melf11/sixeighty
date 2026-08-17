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
  indexed: boolean
  results: SearchResult[]
}

/**
 * Entprellte Volltextsuche gegen /api/search.
 * Explizites $fetch statt useFetch-Watching — feuert zuverlässig bei jeder
 * Eingabe und bricht veraltete Anfragen sauber ab.
 */
export function useDocSearch(params: () => Record<string, string>) {
  const data = ref<SearchResponse | null>(null)
  const pending = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null
  let requestId = 0

  async function run() {
    const p = params()
    const q = (p.q ?? '').trim()
    if (q.length < 2) {
      data.value = null
      pending.value = false
      return
    }
    const id = ++requestId
    pending.value = true
    try {
      const res = await $fetch<SearchResponse>('/api/search', { query: p })
      if (id === requestId) data.value = res
    } catch {
      if (id === requestId) data.value = { total: 0, indexed: true, results: [] }
    } finally {
      if (id === requestId) pending.value = false
    }
  }

  function trigger(debounceMs = 250) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(run, debounceMs)
  }

  onMounted(() => {
    watch(params, () => trigger(), { deep: true })
    run() // Falls die Seite mit ?q=… geladen wird
  })

  return { data, pending }
}
