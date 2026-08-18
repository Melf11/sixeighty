/**
 * Hält einen Zustandswert und die URL synchron — damit „Zurück“ im Browser,
 * Neuladen und geteilte Links denselben Stand zeigen.
 *
 * Warum nötig: Zustand, der nur in einem `ref` lebt, ist nach dem Zurückspringen
 * verloren, weil die Seitenkomponente neu aufgebaut wird. Steht er in der URL,
 * ist er die Quelle der Wahrheit und übersteht Navigation und Reload.
 *
 * Geschrieben wird mit `replace` statt `push`: Sonst entstünde pro Tastendruck
 * ein History-Eintrag und man müsste sich buchstabenweise zurückklicken.
 */

/** Sammelt Änderungen eines Ticks, damit gleichzeitige Writes sich nicht überschreiben. */
const pendingPatch = new Map<string, string | undefined>()
let flushScheduled = false

function scheduleFlush(router: ReturnType<typeof useRouter>, route: ReturnType<typeof useRoute>) {
  if (flushScheduled) return
  flushScheduled = true
  queueMicrotask(() => {
    flushScheduled = false
    if (pendingPatch.size === 0) return
    const query: Record<string, string> = {}
    // Bestehende Parameter übernehmen …
    for (const [k, v] of Object.entries(route.query)) {
      if (typeof v === 'string') query[k] = v
    }
    // … und die gesammelten Änderungen darüberlegen
    for (const [k, v] of pendingPatch) {
      if (v === undefined || v === '') delete query[k]
      else query[k] = v
    }
    pendingPatch.clear()
    router.replace({ query })
  })
}

export function useQueryState(key: string, defaultValue = '') {
  const route = useRoute()
  const router = useRouter()

  const initial = route.query[key]
  const state = ref<string>(typeof initial === 'string' ? initial : defaultValue)

  // Zustand → URL
  watch(state, (val) => {
    const inUrl = typeof route.query[key] === 'string' ? route.query[key] as string : ''
    if (inUrl === (val ?? '')) return
    pendingPatch.set(key, val === defaultValue && defaultValue === '' ? undefined : val)
    scheduleFlush(router, route)
  })

  // URL → Zustand (Vor/Zurück im Browser)
  watch(() => route.query[key], (val) => {
    const next = typeof val === 'string' ? val : defaultValue
    if (next !== state.value) state.value = next
  })

  return state
}

/** Zahlvariante, z. B. für die Blattnummer im Dokumentbetrachter. */
export function useQueryNumber(key: string, defaultValue = 1) {
  const raw = useQueryState(key, String(defaultValue))
  return computed<number>({
    get: () => {
      const n = Number(raw.value)
      return Number.isFinite(n) && n > 0 ? n : defaultValue
    },
    // Beim Tippen kann das Feld kurz leer sein (NaN) — dann nichts schreiben,
    // sonst landet „NaN“ in der URL.
    set: (n) => {
      if (!Number.isFinite(n) || n <= 0) return
      raw.value = String(Math.floor(n))
    },
  })
}
