<script setup lang="ts">
import { LIBRARY_DOCS, DOCS, CATEGORIES, docUrl, type DocEntry } from '~/data/docs'
import { VEHICLES, vehicleById } from '~/data/vehicles'
import {
  cachedDocUrls, cacheDoc, uncacheDoc, clearDocCache,
  storageInfo, requestPersistence, type StorageInfo,
  isShellReady, warmAppShell, APP_ROUTES,
} from '~/composables/useOfflineStore'
import {
  initLocalIndex, installLocalIndex, removeLocalIndex, isIndexLoaded, storedIndexVersion,
} from '~/composables/useLocalSearch'

useHead({ title: 'Offline verfügbar machen — Steyr 680' })

const vehicle = useVehicle()
const current = computed(() => vehicleById(vehicle.value))
const { label: appVersion } = useAppVersion()

// ————— App-Hülle —————
// Ohne diesen Schritt lassen sich offline nur Seiten öffnen, die man vorher
// schon einmal besucht hat — die Bausteine der übrigen fehlen schlicht.
const shellReady = ref(false)
const shellBusy = ref(false)
const shellDone = ref(0)

async function refreshShell() {
  shellReady.value = await isShellReady(appVersion.value === 'Entwicklung' ? 'dev' : appVersion.value)
}

async function setupShell() {
  shellBusy.value = true
  shellDone.value = 0
  try {
    const v = appVersion.value === 'Entwicklung' ? 'dev' : appVersion.value
    // JS-Bausteine jeder Seite anfordern; der Service Worker legt sie ab
    await Promise.all(APP_ROUTES.map(r => preloadRouteComponents(r).catch(() => {})))
    await warmAppShell(v, (d) => { shellDone.value = d })
    await refreshShell()
    await refreshStorage()
  } finally {
    shellBusy.value = false
  }
}

// ————— Suchindex —————
const indexReady = ref(false)
const indexVersion = ref<string | null>(null)
const indexBusy = ref(false)
const indexProgress = ref(0)
const indexLabel = ref('')
const indexError = ref('')

const indexStale = computed(() =>
  indexReady.value && indexVersion.value !== null && indexVersion.value !== appVersion.value
  && appVersion.value !== 'Entwicklung',
)

async function refreshIndexState() {
  indexReady.value = await initLocalIndex() || isIndexLoaded()
  indexVersion.value = storedIndexVersion()
}

async function setupIndex() {
  indexBusy.value = true
  indexError.value = ''
  indexProgress.value = 0
  try {
    await installLocalIndex((p, label) => { indexProgress.value = p; indexLabel.value = label })
    await refreshIndexState()
    await refreshStorage()
  } catch (e: unknown) {
    indexError.value = e instanceof Error ? e.message : 'Laden fehlgeschlagen'
  } finally {
    indexBusy.value = false
  }
}

async function dropIndex() {
  await removeLocalIndex()
  await refreshIndexState()
  await refreshStorage()
}

// ————— PDFs —————
const cached = ref<Set<string>>(new Set())
const working = ref<Set<string>>(new Set())
const bundleBusy = ref(false)
const bundleDone = ref(0)
const bundleTotal = ref(0)

function sizeOf(): number { return 0 } // Platzhalter: Größe kennt erst der Cache

const isCached = (d: DocEntry) => cached.value.has(docUrl(d))

async function refreshCached() {
  cached.value = await cachedDocUrls()
}

async function toggleDoc(d: DocEntry) {
  const url = docUrl(d)
  working.value = new Set(working.value).add(d.id)
  try {
    if (isCached(d)) await uncacheDoc(url)
    else await cacheDoc(url)
    await refreshCached()
    await refreshStorage()
  } finally {
    const w = new Set(working.value); w.delete(d.id); working.value = w
  }
}

/** Dokumente eines Fahrzeugs, nach Wichtigkeit gestaffelt */
function docsFor(vehicleId: string, scope: 'kern' | 'teile' | 'alle'): DocEntry[] {
  const lib = LIBRARY_DOCS.filter(d => d.models.includes(vehicleId))
  if (scope === 'alle') return lib
  if (scope === 'teile') return lib.filter(d => d.category === 'teile')
  return lib.filter(d => ['reparatur', 'technik', 'wartung', 'betrieb'].includes(d.category))
}

async function cacheBundle(list: DocEntry[]) {
  bundleBusy.value = true
  bundleTotal.value = list.length
  bundleDone.value = 0
  try {
    for (const d of list) {
      if (!isCached(d)) {
        try { await cacheDoc(docUrl(d)) } catch { /* einzelnes PDF überspringen */ }
      }
      bundleDone.value++
      await refreshCached()
    }
    await refreshStorage()
  } finally {
    bundleBusy.value = false
  }
}

async function dropAllDocs() {
  await clearDocCache()
  await refreshCached()
  await refreshStorage()
}

// ————— Speicher —————
const storage = ref<StorageInfo | null>(null)
const persistBusy = ref(false)

async function refreshStorage() { storage.value = await storageInfo() }

async function askPersistence() {
  persistBusy.value = true
  try {
    await requestPersistence()
    await refreshStorage()
  } finally { persistBusy.value = false }
}

const cachedCount = computed(() => LIBRARY_DOCS.filter(d => isCached(d)).length)

onMounted(async () => {
  await refreshShell()
  await refreshIndexState()
  await refreshCached()
  await refreshStorage()
})

// Dokumentenliste, gefiltert aufs eigene Fahrzeug (sonst alle)
const listDocs = computed(() =>
  current.value
    ? LIBRARY_DOCS.filter(d => d.models.includes(current.value!.id))
    : LIBRARY_DOCS,
)
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <header class="sheet-in mb-6">
      <p class="kennziffer">Einstellung</p>
      <h1 class="h-display text-3xl sm:text-4xl">Offline verfügbar machen</h1>
      <p class="mt-2 text-sm text-ink-soft">
        Für die Werkstatt ohne Empfang. Du entscheidest, was mitkommt —
        nichts wird ungefragt geladen.
      </p>
    </header>

    <!-- Speicherübersicht -->
    <section v-if="storage" class="sheet-in sheet-in-1 plate mb-5 p-4">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <p class="kennziffer">Belegter Speicher</p>
        <p class="h-display text-xl">
          {{ storage.usedMb.toFixed(0) }} MB
          <span v-if="storage.quotaMb" class="kennziffer">von rund {{ (storage.quotaMb / 1024).toFixed(1) }} GB verfügbar</span>
        </p>
      </div>
      <div class="mt-2 h-2 w-full border border-ink bg-paper">
        <div
          class="h-full bg-olive transition-all"
          :style="{ width: Math.min(100, storage.quotaMb ? storage.usedMb / storage.quotaMb * 100 : 0) + '%' }"
        />
      </div>
      <p class="kennziffer mt-2">
        <template v-if="storage.persistent">
          <span class="text-olive">Dauerhaft gesichert</span> — der Browser räumt diese Daten nicht bei Platzmangel weg.
        </template>
        <template v-else>
          Nicht dauerhaft gesichert: Der Browser darf die Daten bei Platzmangel verwerfen.
          <button class="ml-1 underline underline-offset-2 hover:text-olive" :disabled="persistBusy" @click="askPersistence">
            Dauerhaft anfordern
          </button>
        </template>
      </p>
    </section>

    <!-- App-Hülle -->
    <section class="sheet-in sheet-in-2 plate mb-5 p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="h-display text-2xl">Die App selbst</h2>
          <p class="kennziffer mt-1">Alle Seiten · rund 1,5 MB</p>
        </div>
        <span class="stamp shrink-0" :class="shellReady ? 'text-olive' : 'text-ink-faint'">
          {{ shellReady ? 'bereit' : 'nicht bereit' }}
        </span>
      </div>
      <p class="mt-2 text-sm text-ink-soft">
        Fehleranalyse, Modellvergleich, Wartungspläne und die Normteile-Tabelle
        funktionieren danach ohne Netz — auch Seiten, die du vorher nie geöffnet hast.
      </p>

      <div v-if="shellBusy" class="mt-4">
        <div class="h-2 w-full border border-ink bg-paper">
          <div class="h-full bg-olive transition-all" :style="{ width: (shellDone / APP_ROUTES.length * 100) + '%' }" />
        </div>
        <p class="kennziffer mt-1.5 animate-pulse">{{ shellDone }} von {{ APP_ROUTES.length }} Seiten …</p>
      </div>

      <button
        v-if="!shellReady"
        class="h-display mt-4 cursor-pointer border border-ink bg-olive px-5 py-2.5 text-card transition-colors hover:bg-olive-deep disabled:opacity-50"
        :disabled="shellBusy"
        @click="setupShell"
      >
        App offline bereitstellen
      </button>
      <button
        v-else
        class="h-display mt-4 cursor-pointer border border-ink bg-paper px-5 py-2.5 transition-all hover:shadow-plate disabled:opacity-50"
        :disabled="shellBusy"
        @click="setupShell"
      >
        Erneut laden
      </button>
    </section>

    <!-- Suche -->
    <section class="sheet-in sheet-in-3 plate mb-5 p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="h-display text-2xl">Volltextsuche</h2>
          <p class="kennziffer mt-1">4 491 Seiten · rund 2 MB Download</p>
        </div>
        <span class="stamp shrink-0" :class="indexReady ? 'text-olive' : 'text-ink-faint'">
          {{ indexReady ? 'eingerichtet' : 'nicht eingerichtet' }}
        </span>
      </div>

      <p class="mt-2 text-sm text-ink-soft">
        Einmalig geladen, sucht die App danach vollständig im Gerät — auch ohne Netz,
        und spürbar schneller als über den Server.
      </p>

      <div v-if="indexBusy" class="mt-4">
        <div class="h-2 w-full border border-ink bg-paper">
          <div class="h-full bg-olive transition-all" :style="{ width: (indexProgress * 100) + '%' }" />
        </div>
        <p class="kennziffer mt-1.5 animate-pulse">{{ indexLabel }}</p>
      </div>

      <p v-if="indexError" class="mt-3 border border-stamp bg-stamp-wash p-3 text-sm">{{ indexError }}</p>

      <p v-if="indexStale" class="mt-3 border-l-4 border-blueprint bg-blueprint-wash px-3 py-2 text-sm">
        Der gespeicherte Index stammt aus Ausgabe <strong>{{ indexVersion }}</strong>,
        die App läuft als <strong>{{ appVersion }}</strong>. Neu einrichten, damit die
        Suche dem aktuellen Stand entspricht.
      </p>

      <div class="mt-4 flex flex-wrap gap-2">
        <button
          v-if="!indexReady || indexStale"
          class="h-display cursor-pointer border border-ink bg-olive px-5 py-2.5 text-card transition-colors hover:bg-olive-deep disabled:opacity-50"
          :disabled="indexBusy"
          @click="setupIndex"
        >
          {{ indexStale ? 'Index erneuern' : 'Offline-Suche einrichten' }}
        </button>
        <button
          v-if="indexReady"
          class="h-display cursor-pointer border border-ink bg-paper px-5 py-2.5 transition-all hover:shadow-plate disabled:opacity-50"
          :disabled="indexBusy"
          @click="dropIndex"
        >
          Entfernen
        </button>
      </div>
    </section>

    <!-- Werkstatt-Pakete -->
    <section v-if="current" class="sheet-in plate mb-5 p-5">
      <h2 class="h-display text-2xl">Werkstatt-Paket — {{ current.name }}</h2>
      <p class="mt-1 text-sm text-ink-soft">
        Die Unterlagen, die man beim Schrauben wirklich braucht, in einem Rutsch.
      </p>

      <div v-if="bundleBusy" class="mt-4">
        <div class="h-2 w-full border border-ink bg-paper">
          <div class="h-full bg-olive transition-all" :style="{ width: (bundleDone / Math.max(1, bundleTotal) * 100) + '%' }" />
        </div>
        <p class="kennziffer mt-1.5">{{ bundleDone }} von {{ bundleTotal }} Unterlagen …</p>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <button
          class="h-display cursor-pointer border border-ink bg-olive px-4 py-2.5 text-card transition-colors hover:bg-olive-deep disabled:opacity-50"
          :disabled="bundleBusy"
          @click="cacheBundle(docsFor(current.id, 'kern'))"
        >
          Handbücher &amp; Wartung
          <span class="kennziffer !text-card/70">{{ docsFor(current.id, 'kern').length }} Stück</span>
        </button>
        <button
          class="h-display cursor-pointer border border-ink bg-paper px-4 py-2.5 transition-all hover:shadow-plate disabled:opacity-50"
          :disabled="bundleBusy"
          @click="cacheBundle(docsFor(current.id, 'teile'))"
        >
          Teilekataloge
          <span class="kennziffer">{{ docsFor(current.id, 'teile').length }} Stück, groß</span>
        </button>
        <button
          class="h-display cursor-pointer border border-ink bg-paper px-4 py-2.5 transition-all hover:shadow-plate disabled:opacity-50"
          :disabled="bundleBusy"
          @click="cacheBundle(docsFor(current.id, 'alle'))"
        >
          Alles zu {{ current.name }}
        </button>
      </div>
    </section>

    <p v-else class="sheet-in plate mb-5 p-4 text-sm text-ink-soft">
      Für vorgefertigte Pakete zuerst
      <NuxtLink to="/fahrzeug" class="underline underline-offset-2 hover:text-olive">dein Fahrzeug wählen</NuxtLink>.
      Einzelne Unterlagen kannst du auch so speichern.
    </p>

    <!-- Einzelne Dokumente -->
    <section class="sheet-in mb-5">
      <div class="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink pb-1">
        <h2 class="h-display text-2xl">Einzelne Unterlagen</h2>
        <p class="kennziffer">{{ cachedCount }} von {{ LIBRARY_DOCS.length }} gespeichert</p>
      </div>

      <ul class="mt-3 space-y-2">
        <li v-for="d in listDocs" :key="d.id">
          <button
            class="flex w-full items-center gap-3 border bg-card px-4 py-3 text-left transition-all"
            :class="isCached(d) ? 'border-olive-deep' : 'border-line hover:border-ink'"
            :disabled="working.has(d.id)"
            @click="toggleDoc(d)"
          >
            <span
              class="flex h-5 w-5 shrink-0 items-center justify-center border border-ink"
              :class="isCached(d) ? 'bg-olive' : 'bg-paper'"
              aria-hidden="true"
            >
              <svg v-if="isCached(d)" viewBox="0 0 16 16" class="h-3.5 w-3.5 text-card" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 8 3.5 3.5L13 5" />
              </svg>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-semibold">{{ d.title }}</span>
              <span class="kennziffer">{{ CATEGORIES[d.category] }} · {{ d.pages }} Seiten · {{ d.models.join(' · ') }}</span>
            </span>
            <span v-if="working.has(d.id)" class="kennziffer shrink-0 animate-pulse">…</span>
          </button>
        </li>
      </ul>
    </section>

    <button
      v-if="cachedCount > 0"
      class="sheet-in w-full cursor-pointer border border-stamp bg-paper py-3 h-display text-base text-stamp transition-all hover:shadow-plate"
      @click="dropAllDocs"
    >
      Alle gespeicherten Unterlagen löschen
    </button>
  </div>
</template>
