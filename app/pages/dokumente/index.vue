<script setup lang="ts">
import { LIBRARY_DOCS, CATEGORIES, docById, type DocCategory } from '~/data/docs'
import { VEHICLES, vehicleById } from '~/data/vehicles'

useHead({ title: 'Dokumente — Steyr 680 Nachschlagewerk' })

const vehicle = useVehicle()
const route = useRoute()
const router = useRouter()

const catFilter = ref<DocCategory | ''>((route.query.cat as DocCategory) || '')
const modelFilter = ref<string>((route.query.model as string) || vehicle.value || '')
const text = ref('')

watch([catFilter, modelFilter], () => {
  router.replace({ query: {
    ...(catFilter.value ? { cat: catFilter.value } : {}),
    ...(modelFilter.value ? { model: modelFilter.value } : {}),
  } })
})

const filtered = computed(() => LIBRARY_DOCS.filter(d =>
  (!catFilter.value || d.category === catFilter.value)
  && (!modelFilter.value || d.models.includes(modelFilter.value))
  && (!text.value || d.title.toLowerCase().includes(text.value.toLowerCase())),
))

// Nur Kategorien anbieten, in denen die Bibliothek tatsächlich Dokumente hat
const usedCategories = computed(() => {
  const used = new Set(LIBRARY_DOCS.map(d => d.category))
  return (Object.entries(CATEGORIES) as [DocCategory, string][]).filter(([k]) => used.has(k))
})

const grouped = computed(() => {
  const map = new Map<DocCategory, typeof LIBRARY_DOCS>()
  for (const d of filtered.value) {
    if (!map.has(d.category)) map.set(d.category, [])
    map.get(d.category)!.push(d)
  }
  return map
})
</script>

<template>
  <div>
    <header class="sheet-in mb-6">
      <p class="kennziffer">Register 01</p>
      <h1 class="h-display text-4xl sm:text-5xl">Dokumente</h1>
      <p class="mt-2 max-w-2xl text-ink-soft text-sm">
        Sämtliche Werksunterlagen als durchsuchbare Scans. Der Viewer öffnet das Original —
        Textsuche innerhalb eines Dokuments über die PDF-Suche des Browsers (⌘F).
      </p>
    </header>

    <!-- Filterleiste -->
    <div class="sheet-in sheet-in-1 plate mb-8 grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto]">
      <input v-model="text" type="search" class="field" placeholder="Titel filtern …">
      <select v-model="modelFilter" class="field !w-auto cursor-pointer">
        <option value="">Alle Modelle</option>
        <option v-for="v in VEHICLES" :key="v.id" :value="v.id">{{ v.name }}</option>
        <option value="A680gl">Steyr A 680 gl</option>
      </select>
      <select v-model="catFilter" class="field !w-auto cursor-pointer">
        <option value="">Alle Kategorien</option>
        <option v-for="[key, label] in usedCategories" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>

    <p v-if="modelFilter && vehicleById(modelFilter)" class="kennziffer mb-4">
      Gefiltert auf {{ vehicleById(modelFilter)!.name }} — {{ filtered.length }} Dokumente
    </p>

    <div v-if="filtered.length === 0" class="plate p-8 text-center text-ink-soft">
      Keine Dokumente für diese Filterkombination.
    </div>

    <section v-for="[cat, docs] in grouped" :key="cat" class="sheet-in sheet-in-2 mb-8">
      <h2 class="h-display text-2xl border-b-2 border-ink pb-1 mb-3">{{ CATEGORIES[cat] }}</h2>
      <ul class="grid gap-2 lg:grid-cols-2">
        <li v-for="d in docs" :key="d.id">
          <NuxtLink :to="`/dokumente/${d.id}`" class="group flex items-start gap-4 border border-line bg-card px-4 py-3 hover:border-ink hover:shadow-plate transition-all">
            <!-- Dokumentsymbol -->
            <svg viewBox="0 0 24 30" class="h-9 w-7 shrink-0 text-ink-faint group-hover:text-olive transition-colors" aria-hidden="true">
              <path d="M2 1h14l6 6v22H2z" fill="none" stroke="currentColor" stroke-width="1.6" />
              <path d="M16 1v6h6" fill="none" stroke="currentColor" stroke-width="1.6" />
              <path d="M6 13h12M6 17h12M6 21h8" stroke="currentColor" stroke-width="1.4" />
            </svg>
            <div class="min-w-0">
              <h3 class="text-sm font-semibold leading-snug group-hover:text-olive transition-colors">{{ d.title }}</h3>
              <p class="kennziffer mt-1">
                {{ d.models.join(' · ') }} — {{ d.pages }} Seiten<template v-if="d.note"> · {{ d.note }}</template>
              </p>
              <p v-if="d.excerptOf && docById(d.excerptOf)" class="kennziffer mt-0.5 text-blueprint">
                Auszug aus: {{ docById(d.excerptOf)!.title }}
              </p>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>
