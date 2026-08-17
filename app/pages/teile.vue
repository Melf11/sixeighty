<script setup lang="ts">
import { CATEGORIES, DOCS, type DocCategory } from '~/data/docs'
import { VEHICLES } from '~/data/vehicles'
import { KNOWN_PARTS } from '~/data/wartung'

useHead({ title: 'Teilenummern — Steyr 680 Nachschlagewerk' })

const vehicle = useVehicle()
const q = ref('')
const model = ref<string>(vehicle.value || '')

const searchQuery = computed(() => ({
  q: q.value.trim(),
  cat: 'teile',
  model: model.value,
  limit: '60',
}))

const { data, status } = await useFetch('/api/search', {
  query: searchQuery,
  watch: [searchQuery],
  immediate: false,
})

const partDocs = computed(() => DOCS.filter(d =>
  d.category === 'teile' && (!model.value || d.models.includes(model.value)),
))

const partFilter = ref('')
const filteredKnown = computed(() => {
  const f = partFilter.value.toLowerCase()
  if (!f) return KNOWN_PARTS
  return KNOWN_PARTS.filter(p =>
    p.name.toLowerCase().includes(f) || p.number.toLowerCase().includes(f) || p.vehicle.toLowerCase().includes(f),
  )
})

function highlight(text: string): string {
  const terms = q.value.trim().split(/\s+/).filter(t => t.length > 1)
  let safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  for (const t of terms) {
    const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    safe = safe.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>')
  }
  return safe
}
</script>

<template>
  <div>
    <header class="sheet-in mb-6">
      <p class="kennziffer">Register 03</p>
      <h1 class="h-display text-4xl sm:text-5xl">Teilenummern</h1>
      <p class="mt-2 max-w-2xl text-sm text-ink-soft">
        Suche in Bestandteillisten und Ersatzteilkatalogen ({{ partDocs.reduce((s, d) => s + d.pages, 0).toLocaleString('de-AT') }} Seiten) —
        nach Benennung (»Kolbenring«) oder Nummer. Darunter: Zuliefer- und Normteile aus den Werksdatenblättern.
      </p>
    </header>

    <!-- Katalogsuche -->
    <section class="sheet-in sheet-in-1 plate p-4">
      <form class="grid gap-3 sm:grid-cols-[1fr_auto]" @submit.prevent>
        <input v-model="q" type="search" class="field text-base" placeholder="Benennung oder Teilenummer, z. B. »Kolbenring«, »Radbremszylinder« …">
        <select v-model="model" class="field !w-auto cursor-pointer">
          <option value="">Alle Modelle</option>
          <option v-for="v in VEHICLES" :key="v.id" :value="v.id">{{ v.name }}</option>
        </select>
      </form>

      <div v-if="q.trim().length >= 2" class="mt-4">
        <p v-if="status === 'pending'" class="kennziffer animate-pulse">Suche läuft …</p>
        <template v-else-if="data">
          <div v-if="!data.indexed" class="border border-stamp bg-stamp-wash p-4 text-sm text-ink-soft">
            Volltextindex noch nicht erzeugt — nach Abschluss der OCR <code class="font-mono">npm run index</code> ausführen.
          </div>
          <template v-else>
            <p class="kennziffer mb-3">{{ data.total }} Fundstellen in den Teilekatalogen</p>
            <ol class="space-y-2">
              <li v-for="r in data.results" :key="`${r.docId}-${r.page}`">
                <NuxtLink
                  :to="{ path: `/dokumente/${r.docId}`, query: { page: r.page } }"
                  class="block border border-line bg-paper px-4 py-3 hover:border-ink hover:shadow-plate transition-all"
                >
                  <div class="flex flex-wrap items-baseline gap-x-3">
                    <h3 class="text-sm font-semibold">{{ r.title }}</h3>
                    <span class="stamp text-stamp">Blatt {{ r.page }}</span>
                  </div>
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <p class="mt-1.5 font-mono text-xs leading-relaxed text-ink-soft" v-html="highlight(r.snippet)" />
                </NuxtLink>
              </li>
            </ol>
            <p v-if="data.total === 0" class="text-sm text-ink-soft">
              Nichts gefunden — OCR alter Tabellen ist lückenhaft. Alternativ die Kataloge direkt durchblättern (unten).
            </p>
          </template>
        </template>
      </div>
    </section>

    <!-- Kataloge -->
    <section class="sheet-in sheet-in-2 mt-8">
      <h2 class="h-display border-b-2 border-ink pb-1 text-2xl">Kataloge im Archiv</h2>
      <ul class="mt-3 grid gap-2 lg:grid-cols-2">
        <li v-for="d in partDocs" :key="d.id">
          <NuxtLink :to="`/dokumente/${d.id}`" class="flex items-baseline gap-3 border border-line bg-card px-4 py-2.5 hover:border-ink hover:shadow-plate transition-all">
            <span class="stamp shrink-0 text-stamp">{{ CATEGORIES[d.category as DocCategory] }}</span>
            <span class="truncate text-sm">{{ d.title }}</span>
            <span class="kennziffer ml-auto shrink-0">{{ d.pages }} S. · {{ d.models.join('/') }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <!-- Normteile -->
    <section class="sheet-in sheet-in-3 mt-8">
      <div class="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-ink pb-1">
        <h2 class="h-display text-2xl">Zuliefer- &amp; Normteile</h2>
        <input v-model="partFilter" type="search" class="field !w-64 !py-1.5 text-xs" placeholder="Tabelle filtern …">
      </div>
      <p class="kennziffer mt-2 mb-3">Aus den Werksunterlagen übernommene Fremdnummern (Bosch, FRAM, ZF, F&amp;S) — oft der schnellste Weg zur Ersatzbeschaffung.</p>
      <div class="plate overflow-x-auto">
        <table class="sheet-table">
          <thead>
            <tr>
              <th>Benennung</th>
              <th>Nummer / Typ</th>
              <th>Fahrzeug</th>
              <th>Quelle</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredKnown" :key="p.name + p.number">
              <td>{{ p.name }}</td>
              <td class="font-mono text-xs font-medium whitespace-nowrap">{{ p.number }}</td>
              <td class="whitespace-nowrap">{{ p.vehicle }}</td>
              <td class="text-ink-faint">{{ p.source }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
