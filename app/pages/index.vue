<script setup lang="ts">
import { DOCS, CATEGORIES } from '~/data/docs'
import { vehicleById } from '~/data/vehicles'
import { FAULTS } from '~/data/faults'

const vehicle = useVehicle()
const current = computed(() => vehicleById(vehicle.value))

const q = ref('')
const router = useRouter()
function search() {
  if (q.value.trim()) router.push({ path: '/suche', query: { q: q.value.trim() } })
}

const stats = computed(() => {
  const relevant = current.value
    ? DOCS.filter(d => d.models.includes(current.value!.id))
    : DOCS
  return {
    docs: relevant.length,
    pages: relevant.reduce((s, d) => s + d.pages, 0),
    faults: FAULTS.length,
  }
})

const favDocs = computed(() => {
  const pool = current.value ? DOCS.filter(d => d.models.includes(current.value!.id)) : DOCS
  const order = ['reparatur', 'technik', 'teile', 'betrieb']
  const rank = (c: string) => { const i = order.indexOf(c); return i === -1 ? 99 : i }
  return [...pool].sort((a, b) => rank(a.category) - rank(b.category)).slice(0, 6)
})

const sections = [
  { to: '/dokumente', title: 'Dokumente', desc: 'Alle Handbücher, Kataloge und Register als durchsuchbare PDFs', num: '01' },
  { to: '/suche', title: 'Volltextsuche', desc: 'Über alle Seiten des Archivs — Begriffe, Bauteile, Einstellwerte', num: '02' },
  { to: '/teile', title: 'Teilenummern', desc: 'Bestandteillisten und Ersatzteilkataloge durchsuchen, Normteile-Tabelle', num: '03' },
  { to: '/modelle', title: 'Modellvergleich', desc: '680 M · 680 M3 · A 680 g im direkten Datenvergleich', num: '04' },
  { to: '/fehleranalyse', title: 'Fehleranalyse', desc: 'Symptom → Ursache → Abhilfe, mit Fundstellen im Archiv', num: '05' },
  { to: '/wartung', title: 'Wartung', desc: 'Parkdienste, Schmierplan, Füllmengen und Betriebsstoffe', num: '06' },
]
</script>

<template>
  <div>
    <!-- Titelblatt -->
    <section class="sheet-in relative plate p-6 sm:p-10 overflow-hidden">
      <div class="absolute top-4 right-4 stamp text-stamp -rotate-3">Techn. Archiv</div>
      <p class="kennziffer mb-2">Steyr-Daimler-Puch AG · Werke Steyr</p>
      <h1 class="h-display text-5xl sm:text-7xl max-w-3xl">
        Steyr Lastkraftwagen<br>
        <span class="text-olive">Typ 680</span>
      </h1>
      <p class="mt-4 max-w-xl text-ink-soft">
        Digitales Nachschlagewerk zum Schrauben und Restaurieren —
        {{ stats.docs }} Dokumente mit {{ stats.pages.toLocaleString('de-AT') }} Seiten
        <template v-if="current">für deinen <strong class="text-ink">{{ current.name }}</strong></template>
        <template v-else>für 680 M, 680 M3 und A 680 g</template>.
      </p>

      <form class="mt-6 flex max-w-xl gap-0" @submit.prevent="search">
        <input
          v-model="q"
          type="search"
          class="field !border-r-0"
          placeholder="Suchbegriff, z. B. »Ventilspiel«, »Radbremszylinder«, Teilenummer …"
          aria-label="Volltextsuche"
        >
        <button type="submit" class="h-display shrink-0 border border-ink bg-olive px-6 text-lg text-card hover:bg-olive-deep transition-colors cursor-pointer">
          Suchen
        </button>
      </form>

      <dl class="mt-8 grid grid-cols-3 max-w-xl border border-ink divide-x divide-ink bg-card">
        <div class="p-3 text-center">
          <dt class="kennziffer">Dokumente</dt>
          <dd class="h-display text-3xl">{{ stats.docs }}</dd>
        </div>
        <div class="p-3 text-center">
          <dt class="kennziffer">Seiten</dt>
          <dd class="h-display text-3xl">{{ stats.pages.toLocaleString('de-AT') }}</dd>
        </div>
        <div class="p-3 text-center">
          <dt class="kennziffer">Fehlerbilder</dt>
          <dd class="h-display text-3xl">{{ stats.faults }}</dd>
        </div>
      </dl>
    </section>

    <!-- Bereiche -->
    <section class="sheet-in sheet-in-1 mt-10">
      <h2 class="h-display text-2xl border-b-2 border-ink pb-1 mb-4">Bereiche</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="s in sections"
          :key="s.to"
          :to="s.to"
          class="plate group relative p-5 hover:-translate-y-0.5 hover:shadow-plate-lg transition-all"
        >
          <span class="kennziffer absolute top-3 right-4">Reg. {{ s.num }}</span>
          <h3 class="h-display text-2xl group-hover:text-olive transition-colors">{{ s.title }}</h3>
          <p class="mt-2 text-sm text-ink-soft leading-snug">{{ s.desc }}</p>
        </NuxtLink>
      </div>
    </section>

    <!-- Schnellzugriff Dokumente -->
    <section class="sheet-in sheet-in-2 mt-10">
      <div class="flex items-baseline justify-between border-b-2 border-ink pb-1 mb-4">
        <h2 class="h-display text-2xl">Wichtige Unterlagen<template v-if="current"> — {{ current.name }}</template></h2>
        <NuxtLink to="/dokumente" class="kennziffer hover:text-olive">Alle anzeigen →</NuxtLink>
      </div>
      <ul class="grid gap-2 sm:grid-cols-2">
        <li v-for="d in favDocs" :key="d.id">
          <NuxtLink :to="`/dokumente/${d.id}`" class="flex items-baseline gap-3 border border-line bg-card px-4 py-2.5 hover:border-ink hover:shadow-plate transition-all">
            <span class="stamp shrink-0" :class="d.category === 'teile' ? 'text-stamp' : d.category === 'reparatur' ? 'text-blueprint' : 'text-olive'">
              {{ CATEGORIES[d.category] }}
            </span>
            <span class="truncate text-sm">{{ d.title }}</span>
            <span class="kennziffer ml-auto shrink-0">{{ d.pages }} S.</span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>
