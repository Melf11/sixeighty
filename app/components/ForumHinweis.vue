<script setup lang="ts">
import { forumTagUrl, forumSearchUrl } from '~/data/forum'

/**
 * Zeigt passende Themen aus dem Begleitforum und den Weg dorthin.
 *
 * Bewusst zurückhaltend: Gibt es keine Treffer (oder ist das Forum nicht
 * erreichbar), erscheint nur der Verweis auf den Bereich — nie eine
 * Fehlermeldung. Das Handbuch bleibt auch ohne Forum vollständig.
 */
const props = defineProps<{
  /** Suchbegriff, meist das Symptom oder die Benennung */
  q: string
  /** Forumsbereich (Tag-Kürzel), z. B. 'bremsen' */
  tag?: string
  /** Überschrift des Abschnitts */
  titel?: string
}>()

const forumUrl = useRuntimeConfig().public.forumUrl as string

const { data } = await useFetch('/api/forum/threads', {
  query: computed(() => ({ q: props.q, tag: props.tag ?? '', limit: '4' })),
  // Das Forum ist Beiwerk — beim Seitenaufbau nicht darauf warten
  lazy: true,
  server: false,
  default: () => ({ threads: [], forumUrl, fallback: false }),
})

const threads = computed(() => data.value?.threads ?? [])
// true = keine gezielten Treffer, gezeigt wird Neuestes aus dem Bereich
const fallback = computed(() => data.value?.fallback ?? false)

function datum(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: '2-digit' })
}
</script>

<template>
  <section class="mt-6">
    <h2 class="h-display border-b-2 border-ink pb-1 text-xl">
      {{ titel ?? 'Im Forum' }}
    </h2>

    <p v-if="threads.length && fallback" class="kennziffer mt-2">
      Nichts direkt dazu gefunden — hier das Neueste aus diesem Bereich:
    </p>

    <ul v-if="threads.length" class="mt-3 space-y-2">
      <li v-for="t in threads" :key="t.id">
        <a
          :href="t.url"
          class="flex flex-wrap items-baseline gap-x-3 gap-y-1 border border-line bg-card px-4 py-2.5 transition-all hover:border-ink hover:shadow-plate"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 text-olive" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />
          </svg>
          <span class="min-w-0 flex-1 truncate text-sm font-semibold">{{ t.title }}</span>
          <span class="kennziffer shrink-0">
            {{ t.replies }} {{ t.replies === 1 ? 'Antwort' : 'Antworten' }}<template v-if="datum(t.lastPostedAt)"> · {{ datum(t.lastPostedAt) }}</template>
          </span>
        </a>
      </li>
    </ul>

    <p v-else class="mt-3 text-sm text-ink-soft">
      Dazu gibt es im Forum noch nichts — vielleicht magst du den Anfang machen.
    </p>

    <div class="mt-3 flex flex-wrap gap-2">
      <a
        v-if="tag"
        :href="forumTagUrl(forumUrl, tag)"
        class="h-display border border-ink bg-olive px-4 py-2 text-sm text-card transition-colors hover:bg-olive-deep"
      >Im Forum besprechen ↗</a>
      <a
        :href="forumSearchUrl(forumUrl, q, tag)"
        class="h-display border border-ink bg-card px-4 py-2 text-sm transition-all hover:shadow-plate"
      >Forum durchsuchen ↗</a>
    </div>
  </section>
</template>
