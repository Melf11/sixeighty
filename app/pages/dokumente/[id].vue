<script setup lang="ts">
import { LIBRARY_DOCS, CATEGORIES, REPAIR_CHAPTERS, docById, docUrl } from '~/data/docs'
import { CATEGORY_TAGS } from '~/data/forum'

const route = useRoute()
const doc = computed(() => docById(route.params.id as string))

if (!doc.value) {
  throw createError({ statusCode: 404, statusMessage: 'Dokument nicht gefunden' })
}

useHead({ title: () => `${doc.value?.title ?? 'Dokument'} — Steyr 680` })

// Blattnummer steht in der URL: „Zurück“ aus einem anderen Dokument und ein
// Neuladen landen wieder auf demselben Blatt, und Treffer lassen sich verlinken.
const page = useQueryNumber('page', 1)

const viewerUrl = computed(() => doc.value ? docUrl(doc.value, page.value) : '')

// Key erzwingt den Reload des iframes — auch bei Vor/Zurück im Browser,
// deshalb am Blattwechsel selbst und nicht nur am Formular aufgehängt.
const viewerKey = ref(0)
watch(page, () => { viewerKey.value++ })

function goToPage() {
  const clamped = Math.min(Math.max(1, page.value || 1), doc.value!.pages)
  if (clamped === page.value) viewerKey.value++ // gleiche Seite: trotzdem neu laden
  else page.value = clamped
}

// Kapitelnavigation: entspricht der Registereinteilung des Werkstattordners
const chapters = computed(() => doc.value?.id === 'm-reparatur' ? REPAIR_CHAPTERS : [])
// Wenn dieses Dokument ein Register-Zweitscan ist: passendes Kapitel im Handbuch
const chapterOfThis = computed(() => REPAIR_CHAPTERS.find(c => c.altDocId === doc.value?.id))
// Kapitel, in dem das aktuell angezeigte Blatt liegt
const activeChapter = computed(() =>
  chapters.value.find(c => page.value >= c.page && page.value <= c.endPage),
)

function openChapter(target: number) {
  page.value = target
  goToPage()
}

const related = computed(() => {
  if (!doc.value) return []
  return LIBRARY_DOCS.filter(d =>
    d.id !== doc.value!.id
    && d.category === doc.value!.category
    && d.models.some(m => doc.value!.models.includes(m)),
  ).slice(0, 5)
})
</script>

<template>
  <div v-if="doc">
    <header class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div class="min-w-0">
        <NuxtLink to="/dokumente" class="kennziffer hover:text-olive">← Zurück zur Übersicht</NuxtLink>
        <h1 class="h-display mt-1 text-2xl sm:text-4xl">{{ doc.title }}</h1>
        <p class="kennziffer mt-1">
          <span class="stamp mr-2 text-olive">{{ CATEGORIES[doc.category] }}</span>
          {{ doc.models.join(' · ') }} — {{ doc.pages }} Seiten
        </p>
        <p v-if="doc.excerptOf && docById(doc.excerptOf)" class="kennziffer mt-1 text-blueprint">
          Zweitscan aus dem Werkstattordner — inhaltlich ein Auszug aus
          <NuxtLink
            :to="{ path: `/dokumente/${doc.excerptOf}`, query: chapterOfThis ? { page: chapterOfThis.page } : {} }"
            class="underline underline-offset-2 hover:text-olive"
          >{{ docById(doc.excerptOf)!.title }}<template v-if="chapterOfThis"> (Blatt {{ chapterOfThis.page }})</template></NuxtLink>.
          Nicht in der Bibliothek gelistet, aber bei schlecht lesbaren Stellen als Zweitmeinung nützlich.
        </p>
      </div>
      <form class="flex w-full items-center gap-2 sm:w-auto" @submit.prevent="goToPage">
        <label class="kennziffer shrink-0" for="page-input">Blatt</label>
        <input
          id="page-input"
          v-model.number="page"
          type="number"
          inputmode="numeric"
          min="1"
          :max="doc.pages"
          class="field !w-16 shrink-0 text-center"
        >
        <button type="submit" class="h-display shrink-0 cursor-pointer border border-ink bg-olive px-4 py-2 text-card transition-colors hover:bg-olive-deep">
          Gehe zu
        </button>
        <a
          :href="viewerUrl"
          target="_blank"
          rel="noopener"
          class="h-display ml-auto shrink-0 border border-ink bg-card px-4 py-2 transition-all hover:shadow-plate"
        >Öffnen ↗</a>
      </form>
    </header>

    <!-- Kapitelregister (nur Reparaturhandbuch) -->
    <nav v-if="chapters.length" class="mb-4">
      <p class="kennziffer mb-2">
        Kapitelregister — entspricht den Reitern des Werkstattordners.
        <template v-if="activeChapter">
          Aktuell: {{ activeChapter.no }} · {{ activeChapter.title }} —
          <NuxtLink :to="`/dokumente/${activeChapter.altDocId}`" class="underline underline-offset-2 hover:text-olive">
            Zweitscan dieses Kapitels ansehen
          </NuxtLink>
        </template>
      </p>
      <div class="flex snap-x gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        <button
          v-for="c in chapters"
          :key="c.no"
          class="tab-register shrink-0 cursor-pointer snap-start !top-0 !border-b"
          :class="page >= c.page && page <= c.endPage ? '!bg-olive !text-card !border-olive-deep' : ''"
          :title="`Blatt ${c.page}–${c.endPage}`"
          @click="openChapter(c.page)"
        >
          {{ c.no }} · {{ c.title }}
        </button>
      </div>
    </nav>

    <!-- Telefon: iOS zeigt PDFs im Rahmen nur unzuverlässig → im Systemviewer öffnen -->
    <a
      :href="viewerUrl"
      target="_blank"
      rel="noopener"
      class="plate flex items-center gap-4 p-5 transition-transform active:translate-y-px md:hidden"
    >
      <svg viewBox="0 0 24 30" class="h-12 w-9 shrink-0 text-olive" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <path d="M2 1h14l6 6v22H2z" /><path d="M16 1v6h6" /><path d="M6 14h12M6 18h12M6 22h8" />
      </svg>
      <span class="min-w-0">
        <span class="h-display block text-xl">PDF öffnen</span>
        <span class="kennziffer mt-1 block">
          Blatt {{ page }} von {{ doc.pages }} · öffnet im PDF-Betrachter, dort blättern und zoomen
        </span>
      </span>
      <span class="h-display ml-auto shrink-0 text-2xl text-olive" aria-hidden="true">↗</span>
    </a>

    <!-- Ab Tablet: eingebetteter Betrachter -->
    <div class="plate hidden overflow-hidden md:block">
      <iframe
        :key="viewerKey"
        :src="viewerUrl"
        class="h-[78dvh] w-full"
        :title="doc.title"
      />
    </div>

    <ForumHinweis
      v-if="doc"
      :q="doc.title.replace(/\s*\([^)]*\)/g, '')"
      :tag="CATEGORY_TAGS[doc.category]"
      titel="Dazu im Forum"
    />

    <section v-if="related.length" class="mt-6">
      <h2 class="h-display border-b-2 border-ink pb-1 text-xl">Verwandte Unterlagen</h2>
      <ul class="mt-2 flex flex-wrap gap-2">
        <li v-for="r in related" :key="r.id">
          <NuxtLink :to="`/dokumente/${r.id}`" class="inline-block border border-line bg-card px-3 py-1.5 text-xs hover:border-ink hover:shadow-plate transition-all">
            {{ r.title }}
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>
