<script setup lang="ts">
import { DOCS, CATEGORIES, docById, docUrl } from '~/data/docs'

const route = useRoute()
const doc = computed(() => docById(route.params.id as string))

if (!doc.value) {
  throw createError({ statusCode: 404, statusMessage: 'Dokument nicht gefunden' })
}

useHead({ title: () => `${doc.value?.title ?? 'Dokument'} — Steyr 680` })

const page = ref<number>(Number(route.query.page) || 1)
const viewerUrl = computed(() => doc.value ? docUrl(doc.value, page.value) : '')
// Key erzwingt Reload des iframes bei Seitensprung
const viewerKey = ref(0)
function goToPage() {
  page.value = Math.min(Math.max(1, page.value || 1), doc.value!.pages)
  viewerKey.value++
}

const related = computed(() => {
  if (!doc.value) return []
  return DOCS.filter(d =>
    d.id !== doc.value!.id
    && d.category === doc.value!.category
    && d.models.some(m => doc.value!.models.includes(m)),
  ).slice(0, 5)
})
</script>

<template>
  <div v-if="doc">
    <header class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <NuxtLink to="/dokumente" class="kennziffer hover:text-olive">← Zurück zur Übersicht</NuxtLink>
        <h1 class="h-display mt-1 text-3xl sm:text-4xl">{{ doc.title }}</h1>
        <p class="kennziffer mt-1">
          <span class="stamp mr-2 text-olive">{{ CATEGORIES[doc.category] }}</span>
          {{ doc.models.join(' · ') }} — {{ doc.pages }} Seiten
        </p>
      </div>
      <form class="flex items-center gap-2" @submit.prevent="goToPage">
        <label class="kennziffer" for="page-input">Blatt-Nr.</label>
        <input id="page-input" v-model.number="page" type="number" min="1" :max="doc.pages" class="field !w-24 text-center">
        <button type="submit" class="h-display cursor-pointer border border-ink bg-olive px-4 py-2 text-card hover:bg-olive-deep transition-colors">Gehe zu</button>
        <a :href="viewerUrl" target="_blank" class="h-display border border-ink bg-card px-4 py-2 hover:shadow-plate transition-all">Neuer Tab ↗</a>
      </form>
    </header>

    <div class="plate overflow-hidden">
      <iframe
        :key="viewerKey"
        :src="viewerUrl"
        class="h-[78vh] w-full"
        :title="doc.title"
      />
    </div>

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
