/**
 * Verbindung zwischen Nachschlagewerk und Begleitforum.
 *
 * Die Bereiche des Forums entsprechen den Baugruppen der Fehleranalyse — diese
 * Tabelle hält beide Seiten zusammen. Ändert sich drüben ein Tag-Kürzel, muss
 * es nur hier nachgezogen werden.
 */

/** Baugruppe aus `faults.ts` → Tag-Kürzel im Forum */
export const SYSTEM_TAGS: Record<string, string> = {
  'Motor & Startanlage': 'motor',
  'Kraftstoffanlage': 'kraftstoff',
  'Kühlung & Schmierung': 'kuehlung-schmierung',
  'Kupplung & Getriebe': 'kupplung-getriebe',
  'Bremsanlage': 'bremsen',
  'Lenkung & Fahrwerk': 'lenkung-fahrwerk',
  'Elektrik (24 V)': 'elektrik',
}

/** Dokumentkategorie → passender Forumsbereich */
export const CATEGORY_TAGS: Record<string, string> = {
  teile: 'teile',
  reparatur: 'motor',
  wartung: 'motor',
  technik: 'forum-intern',
  betrieb: 'forum-intern',
  register: 'motor',
}

/** Fahrzeug-Kennung → Modell-Tag im Forum */
export const MODEL_TAGS: Record<string, string> = {
  '680M': '680m',
  '680M3': '680m3',
  'A680g': 'a680g',
}

export function useForumUrl() {
  return useRuntimeConfig().public.forumUrl as string
}

/** Adresse eines Forumsbereichs */
export function forumTagUrl(base: string, tag: string) {
  return `${base}/t/${tag}`
}

/** Suchadresse im Forum, wahlweise auf einen Bereich eingegrenzt */
export function forumSearchUrl(base: string, query: string, tag?: string) {
  const q = tag ? `tag:${tag} ${query}` : query
  return `${base}?q=${encodeURIComponent(q)}`
}

/**
 * Adresse zum Verfassen eines neuen Beitrags. Flarum kennt keine vorbelegten
 * Formulare per Adresse — deshalb wird der Bereich geöffnet, in dem der Knopf
 * „Diskussion starten" dann den richtigen Bereich vorauswählt.
 */
export function forumNewTopicUrl(base: string, tag: string) {
  return `${base}/t/${tag}`
}
