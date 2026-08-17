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
    <section class="sheet-in plate relative overflow-hidden p-5 sm:p-10">
      <div class="stamp absolute top-3 right-3 hidden -rotate-3 text-stamp sm:block">Techn. Archiv</div>
      <!-- Werksmarke als Wasserzeichen -->
      <img
        src="/img/steyr-logo.png"
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute -right-16 -bottom-20 hidden w-80 opacity-[0.07] sm:block"
      >
      <p class="kennziffer mb-2">Steyr-Daimler-Puch AG · Werke Steyr</p>
      <h1 class="h-display max-w-3xl text-[2.1rem] leading-[1.02] xs:text-5xl sm:text-7xl">
        Steyr Lastkraftwagen<br>
        <span class="text-olive">Typ 680</span>
      </h1>
      <p class="mt-4 max-w-xl text-ink-soft">
        Digitales Nachschlagewerk zum Schrauben und Restaurieren —
        {{ stats.docs }} Dokumente mit {{ stats.pages.toLocaleString('de-AT') }} Seiten
        <template v-if="current">für deinen <strong class="text-ink">{{ current.name }}</strong></template>
        <template v-else>für 680 M, 680 M3 und A 680 g</template>.
      </p>

      <form class="mt-5 flex max-w-xl" @submit.prevent="search">
        <input
          v-model="q"
          type="search"
          class="field min-w-0 flex-1 !border-r-0"
          placeholder="Suchen, z. B. »Ventilspiel« …"
          aria-label="Volltextsuche"
        >
        <button type="submit" class="h-display shrink-0 cursor-pointer border border-ink bg-olive px-5 text-lg text-card transition-colors hover:bg-olive-deep">
          Suchen
        </button>
      </form>

      <dl class="mt-6 grid max-w-xl grid-cols-3 divide-x divide-ink border border-ink bg-card">
        <div class="p-2.5 text-center sm:p-3">
          <dt class="kennziffer">Dokumente</dt>
          <dd class="h-display text-2xl sm:text-3xl">{{ stats.docs }}</dd>
        </div>
        <div class="p-2.5 text-center sm:p-3">
          <dt class="kennziffer">Seiten</dt>
          <dd class="h-display text-2xl sm:text-3xl">{{ stats.pages.toLocaleString('de-AT') }}</dd>
        </div>
        <div class="p-2.5 text-center sm:p-3">
          <dt class="kennziffer">Fehlerbilder</dt>
          <dd class="h-display text-2xl sm:text-3xl">{{ stats.faults }}</dd>
        </div>
      </dl>
    </section>

    <!-- Bereiche -->
    <section class="sheet-in sheet-in-1 mt-8">
      <h2 class="h-display text-2xl border-b-2 border-ink pb-1 mb-4">Bereiche</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="s in sections"
          :key="s.to"
          :to="s.to"
          class="plate group relative block p-4 transition-all hover:-translate-y-0.5 hover:shadow-plate-lg sm:p-5"
        >
          <span class="kennziffer absolute top-3 right-4">Reg. {{ s.num }}</span>
          <h3 class="h-display text-2xl group-hover:text-olive transition-colors">{{ s.title }}</h3>
          <p class="mt-2 text-sm text-ink-soft leading-snug">{{ s.desc }}</p>
        </NuxtLink>
      </div>
    </section>

    <!-- Schnellzugriff Dokumente -->
    <section class="sheet-in sheet-in-2 mt-8">
      <div class="flex items-baseline justify-between border-b-2 border-ink pb-1 mb-4">
        <h2 class="h-display text-2xl">Wichtige Unterlagen<template v-if="current"> — {{ current.name }}</template></h2>
        <NuxtLink to="/dokumente" class="kennziffer hover:text-olive">Alle anzeigen →</NuxtLink>
      </div>
      <ul class="grid gap-2 sm:grid-cols-2">
        <li v-for="d in favDocs" :key="d.id">
          <NuxtLink :to="`/dokumente/${d.id}`" class="flex flex-wrap items-baseline gap-x-3 gap-y-1 border border-line bg-card px-4 py-2.5 transition-all hover:border-ink hover:shadow-plate">
            <span class="stamp shrink-0" :class="d.category === 'teile' ? 'text-stamp' : d.category === 'reparatur' ? 'text-blueprint' : 'text-olive'">
              {{ CATEGORIES[d.category] }}
            </span>
            <span class="min-w-0 flex-1 truncate text-sm">{{ d.title }}</span>
            <span class="kennziffer ml-auto shrink-0">{{ d.pages }} S.</span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>
