import MiniSearch from 'minisearch'
import { DOCS } from '../../app/data/docs'

interface PageEntry { d: string, p: number, t: string }

let indexPromise: Promise<{ mini: MiniSearch, pages: Map<string, PageEntry> }> | null = null

async function getIndex() {
  if (!indexPromise) {
    indexPromise = (async () => {
      const raw = await useStorage('assets:server').getItem<PageEntry[]>('search/pages.json')
      const entries = raw ?? []
      const mini = new MiniSearch({
        fields: ['t'],
        storeFields: [],
        idField: 'id',
      })
      const pages = new Map<string, PageEntry>()
      mini.addAll(entries.map((e) => {
        const id = `${e.d}:${e.p}`
        pages.set(id, e)
        return { id, t: e.t }
      }))
      return { mini, pages }
    })()
  }
  return indexPromise
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

export default defineEventHandler(async (event) => {
  const { q = '', cat = '', model = '', limit = '40' } = getQuery(event) as Record<string, string>
  const query = String(q).trim()
  if (query.length < 2) return { total: 0, indexed: false, results: [] }

  let { mini, pages } = await getIndex()
  if (pages.size === 0) {
    // Index war beim ersten Zugriff noch nicht gebaut — erneut versuchen
    indexPromise = null
    ;({ mini, pages } = await getIndex())
  }
  const indexed = pages.size > 0

  const docMeta = new Map(DOCS.map(d => [d.id, d]))
  const raw = mini.search(query, {
    prefix: true,
    fuzzy: 0.15,
    combineWith: 'AND',
  })

  const filtered = raw.filter((r) => {
    const docId = String(r.id).split(':')[0]!
    const meta = docMeta.get(docId)
    if (!meta) return false
    if (cat && meta.category !== cat) return false
    if (model && !meta.models.includes(model)) return false
    return true
  })

  const max = Math.min(Number(limit) || 40, 100)
  const results = filtered.slice(0, max).map((r) => {
    const entry = pages.get(String(r.id))!
    const meta = docMeta.get(entry.d)!
    return {
      docId: entry.d,
      title: meta.title,
      category: meta.category,
      models: meta.models,
      page: entry.p,
      score: Math.round(r.score * 10) / 10,
      snippet: makeSnippet(entry.t, r.queryTerms),
    }
  })

  return { total: filtered.length, indexed, results }
})
