<script setup lang="ts">
import { CATEGORIES, type DocCategory } from '~/data/docs'
import { VEHICLES } from '~/data/vehicles'

useHead({ title: 'Volltextsuche — Steyr 680 Nachschlagewerk' })

const vehicle = useVehicle()

// Zustand lebt in der URL (siehe useQueryState) — überlebt Zurück und Reload
const q = useQueryState('q')
const cat = useQueryState('cat') as Ref<DocCategory | ''>
const model = useQueryState('model')

const { data, pending, error } = useDocSearch(() => ({
  q: q.value.trim(),
  cat: cat.value,
  model: model.value,
}))


function highlight(text: string): string {
  const terms = q.value.trim().split(/\s+/).filter(t => t.length > 1)
  let safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  for (const t of terms) {
    const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    safe = safe.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>')
  }
  return safe
}

const examples = ['Ventilspiel', 'Einspritzpumpe', 'Radbremszylinder', 'Verteilergetriebe', 'Kolbenring', 'Seilwinde']
</script>

<template>
  <div>
    <header class="sheet-in mb-6">
      <p class="kennziffer">Register 02</p>
      <h1 class="h-display text-4xl sm:text-5xl">Volltextsuche</h1>
      <p class="mt-2 max-w-2xl text-sm text-ink-soft">
        Durchsucht den OCR-Text aller Werksunterlagen seitengenau. Treffer öffnen das Original-PDF
        direkt auf der Fundstelle.
      </p>
    </header>

    <div class="sheet-in sheet-in-1 plate grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto]">
      <input
        v-model="q"
        type="search"
        class="field text-base"
        placeholder="Begriff oder Teilenummer …"
        autofocus
      >
      <select v-model="model" class="field !w-auto cursor-pointer">
        <option value="">Alle Modelle</option>
        <option v-for="v in VEHICLES" :key="v.id" :value="v.id">{{ v.name }}</option>
      </select>
      <select v-model="cat" class="field !w-auto cursor-pointer">
        <option value="">Alle Kategorien</option>
        <option v-for="(label, key) in CATEGORIES" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>

    <div v-if="!q.trim()" class="mt-6 text-sm text-ink-soft">
      <p class="mb-2">Beispiele:</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="e in examples"
          :key="e"
          class="cursor-pointer border border-line bg-card px-3 py-1 font-mono text-xs hover:border-ink hover:shadow-plate transition-all"
          @click="q = e; model = vehicle || ''"
        >
          {{ e }}
        </button>
      </div>
    </div>

    <div v-else class="mt-6">
      <p v-if="pending" class="kennziffer animate-pulse">Suche läuft …</p>

      <div v-else-if="error" class="plate border-stamp p-5 text-sm">
        <p class="stamp mb-2 text-stamp">Suche fehlgeschlagen</p>
        <p class="text-ink-soft">{{ error }}</p>
      </div>

      <template v-else-if="data">
        <div v-if="!data.indexed" class="plate border-stamp p-5 text-sm">
          <p class="stamp mb-2 text-stamp">Index fehlt</p>
          <p class="text-ink-soft">
            Der Volltextindex wurde noch nicht erzeugt. Sobald die OCR-Verarbeitung abgeschlossen ist:
            <code class="font-mono bg-paper-deep px-1">npm run index</code> ausführen und den Dev-Server neu starten.
          </p>
        </div>

        <template v-else>
          <p class="kennziffer mb-4">
            {{ data.total }} Fundstellen<template v-if="data.total > data.results.length"> — die {{ data.results.length }} relevantesten werden angezeigt</template>
            <template v-if="data.rawTotal && data.rawTotal > data.total">
              · {{ data.rawTotal - data.total }} inhaltsgleiche Seiten zusammengefasst
            </template>
          </p>

          <ol class="space-y-3">
            <li v-for="(r, i) in data.results" :key="`${r.docId}-${r.page}`">
              <NuxtLink
                :to="{ path: `/dokumente/${r.docId}`, query: { page: r.page } }"
                class="block border border-line bg-card px-5 py-4 hover:border-ink hover:shadow-plate transition-all"
              >
                <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span class="kennziffer">{{ String(i + 1).padStart(2, '0') }}</span>
                  <h2 class="text-sm font-semibold">{{ r.title }}</h2>
                  <span class="stamp text-olive">Blatt {{ r.page }}</span>
                  <span class="kennziffer ml-auto">{{ CATEGORIES[r.category as DocCategory] }} · {{ r.models.join(' · ') }}</span>
                </div>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <p class="mt-2 font-mono text-xs leading-relaxed text-ink-soft" v-html="highlight(r.snippet)" />
              </NuxtLink>
              <p v-if="r.alsoIn?.length" class="kennziffer mt-1 pl-5">
                Gleiche Seite auch in:
                <NuxtLink
                  v-for="(a, ai) in r.alsoIn"
                  :key="a.docId + a.page"
                  :to="{ path: `/dokumente/${a.docId}`, query: { page: a.page } }"
                  class="underline decoration-line underline-offset-2 hover:text-olive"
                >{{ a.title }} (Bl. {{ a.page }}){{ ai < r.alsoIn.length - 1 ? ',' : '' }}&nbsp;</NuxtLink>
              </p>
            </li>
          </ol>

          <p v-if="data.total === 0" class="plate p-8 text-center text-ink-soft">
            Keine Fundstellen für <strong class="font-mono">{{ q }}</strong>.
            OCR alter Scans ist nicht fehlerfrei — probiere Wortteile oder alternative Schreibweisen.
          </p>
        </template>
      </template>
    </div>
  </div>
</template>
