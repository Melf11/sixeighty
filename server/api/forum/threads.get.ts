/**
 * Holt passende Themen aus dem Begleitforum (Flarum).
 *
 * Serverseitig, damit nicht jeder Browser das Forum direkt anfragt, und mit
 * Zwischenspeicher, weil dieselben Fehlerbilder oft nacheinander aufgerufen
 * werden.
 *
 * Grundsatz: Das Forum darf die App nie ausbremsen oder kaputtmachen. Bei
 * Zeitüberschreitung oder Ausfall kommt eine leere Liste zurück — die Seite
 * lässt den Abschnitt dann weg.
 */

interface FlarumDiscussion {
  id: string
  attributes: {
    title: string
    slug: string
    commentCount: number
    lastPostedAt: string | null
  }
}

export interface ForumThread {
  id: string
  title: string
  url: string
  replies: number
  lastPostedAt: string | null
}

/** Häufige Wörter, die als Suchbegriff nichts eingrenzen. */
const STOPWORDS = new Set([
  'oder', 'und', 'nicht', 'nur', 'sich', 'beim', 'beim', 'einer', 'eine', 'einen',
  'wird', 'wird', 'lässt', 'lasst', 'sehr', 'zu', 'im', 'am', 'der', 'die', 'das',
  'mit', 'ohne', 'bei', 'auf', 'aus', 'für', 'von', 'über', 'unter', 'geht', 'kein',
])

/**
 * Aus einem Symptomsatz die tragenden Begriffe ziehen.
 * „Kupplung rutscht oder trennt nicht" → „Kupplung rutscht trennt"
 */
function keywords(text: string, max = 3): string {
  return text
    .replace(/[(),.;:/]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 5 && !STOPWORDS.has(w.toLowerCase()))
    .slice(0, max)
    .join(' ')
}

export default defineCachedEventHandler(async (event): Promise<{
  threads: ForumThread[]
  forumUrl: string
  /** true = keine gezielten Treffer, stattdessen Neuestes aus dem Bereich */
  fallback: boolean
}> => {
  const { q = '', tag = '', limit = '4' } = getQuery(event) as Record<string, string>
  const forumUrl = ((useRuntimeConfig().public.forumUrl as string) || '').replace(/\/$/, '')
  const empty = { threads: [], forumUrl, fallback: false }
  if (!forumUrl) return { ...empty, forumUrl: '' }

  const take = Math.min(Number(limit) || 4, 10)

  async function ask(terms: string): Promise<ForumThread[] | null> {
    if (!terms) return null
    try {
      const res = await $fetch<{ data: FlarumDiscussion[] }>(`${forumUrl}/api/discussions`, {
        // Der Bereich muss innerhalb der Suche stehen: ein separates
        // filter[tag] wird von Flarum ignoriert, sobald filter[q] gesetzt ist.
        query: { 'filter[q]': terms, 'page[limit]': take },
        timeout: 2500,
        retry: 0,
      })
      return (res.data ?? []).map(d => ({
        id: d.id,
        title: d.attributes.title,
        // Flarums slug enthält die ID bereits ("1-titel") — nicht doppeln
        url: `${forumUrl}/d/${d.attributes.slug.startsWith(d.id + '-') ? d.attributes.slug : `${d.id}-${d.attributes.slug}`}`,
        replies: Math.max(0, (d.attributes.commentCount ?? 1) - 1),
        lastPostedAt: d.attributes.lastPostedAt,
      }))
    } catch {
      return null
    }
  }

  const tagPart = tag ? `tag:${tag}` : ''
  const kw = keywords(String(q))

  // 1. Versuch: Bereich und tragende Begriffe
  const precise = await ask([tagPart, kw].filter(Boolean).join(' '))
  if (precise === null) return empty
  if (precise.length) return { threads: precise, forumUrl, fallback: false }

  // 2. Versuch: nur der Bereich — lieber Neuestes aus dem Umfeld als gar nichts
  if (tagPart) {
    const recent = await ask(tagPart)
    if (recent?.length) return { threads: recent, forumUrl, fallback: true }
  }

  return empty
}, {
  maxAge: 300, // fünf Minuten; neue Beiträge dürfen etwas später erscheinen
  name: 'forum-threads',
  getKey: event => new URLSearchParams(getQuery(event) as Record<string, string>).toString(),
})
