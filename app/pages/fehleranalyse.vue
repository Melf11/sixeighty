<script setup lang="ts">
import { FAULTS, FAULT_SYSTEMS } from '~/data/faults'

useHead({ title: 'Fehleranalyse — Steyr 680 Nachschlagewerk' })

// Auch das aufgeklappte Fehlerbild steht in der URL: Wer aus einem Handbuch
// zurückkommt, landet wieder im selben geöffneten Abschnitt.
const system = useQueryState('bg')
const q = useQueryState('q')
const open = useQueryState('f')

const filtered = computed(() => FAULTS.filter(f =>
  (!system.value || f.system === system.value)
  && (!q.value
    || f.symptom.toLowerCase().includes(q.value.toLowerCase())
    || f.causes.some(c => c.cause.toLowerCase().includes(q.value.toLowerCase()))),
))

function toggle(id: string) {
  open.value = open.value === id ? '' : id
}
</script>

<template>
  <div>
    <header class="sheet-in mb-6">
      <p class="kennziffer">Register 05</p>
      <h1 class="h-display text-4xl sm:text-5xl">Fehleranalyse</h1>
      <p class="mt-2 max-w-2xl text-sm text-ink-soft">
        Systematische Störungssuche: Symptom wählen, Ursachen in der angegebenen Reihenfolge prüfen.
        Die Fundstellen verweisen auf die Original-Handbücher — Einstellwerte immer dort gegenprüfen.
      </p>
    </header>

    <div class="sheet-in sheet-in-1 plate mb-6 grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
      <input v-model="q" type="search" class="field" placeholder="Symptom suchen, z. B. »raucht«, »Öldruck« …">
      <select v-model="system" class="field !w-auto cursor-pointer">
        <option value="">Alle Baugruppen</option>
        <option v-for="s in FAULT_SYSTEMS" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>

    <p v-if="filtered.length === 0" class="plate p-8 text-center text-ink-soft">Kein passendes Fehlerbild gefunden.</p>

    <div class="space-y-3">
      <article v-for="f in filtered" :key="f.id" class="sheet-in sheet-in-2 plate">
        <button
          class="flex w-full cursor-pointer flex-wrap items-baseline gap-x-3 gap-y-1.5 p-4 text-left"
          :aria-expanded="open === f.id"
          @click="toggle(f.id)"
        >
          <span class="stamp shrink-0 text-stamp">{{ f.system }}</span>
          <span class="kennziffer shrink-0 sm:order-3 sm:ml-auto">
            {{ open === f.id ? '▴' : '▾' }} {{ f.causes.length }} Ursachen
          </span>
          <h2 class="h-display w-full text-lg leading-tight sm:order-2 sm:w-auto sm:flex-1 sm:text-xl">
            {{ f.symptom }}
          </h2>
        </button>

        <div v-if="open === f.id" class="border-t border-ink px-4 pb-4">
          <p v-if="f.hints" class="mt-3 border-l-4 border-blueprint bg-blueprint-wash px-3 py-2 text-sm">
            {{ f.hints }}
          </p>

          <ol class="mt-3 space-y-3">
            <li v-for="(c, i) in f.causes" :key="i" class="grid gap-1 border border-line bg-paper p-3 sm:grid-cols-[2rem_1fr]">
              <span class="h-display text-2xl text-ink-faint">{{ i + 1 }}</span>
              <div>
                <h3 class="text-sm font-bold">{{ c.cause }}</h3>
                <p class="mt-1 text-sm"><span class="kennziffer">Prüfen:</span> {{ c.check }}</p>
                <p class="mt-0.5 text-sm"><span class="kennziffer">Abhilfe:</span> {{ c.remedy }}</p>
              </div>
            </li>
          </ol>

          <div class="mt-4 rule-dashed pt-3">
            <p class="kennziffer mb-1">Fundstellen im Archiv</p>
            <div class="flex flex-wrap gap-2">
              <NuxtLink
                v-for="d in f.docs"
                :key="d.docId + (d.page ?? '')"
                :to="{ path: `/dokumente/${d.docId}`, query: d.page ? { page: d.page } : {} }"
                class="inline-block border border-line bg-card px-3 py-1.5 text-xs hover:border-ink hover:shadow-plate transition-all"
              >
                {{ d.label }} →
              </NuxtLink>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
