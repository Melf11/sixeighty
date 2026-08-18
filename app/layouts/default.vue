<script setup lang="ts">
import { VEHICLES, vehicleById } from '~/data/vehicles'

const vehicle = useVehicle()
const current = computed(() => vehicleById(vehicle.value))
const route = useRoute()
// Destrukturiert, damit die Refs im Template ausgepackt werden
const { label: versionLabel, shaShort, built, isRelease } = useAppVersion()
const forumUrl = useRuntimeConfig().public.forumUrl as string

const nav = [
  { to: '/', label: 'Übersicht' },
  { to: '/dokumente', label: 'Dokumente' },
  { to: '/suche', label: 'Suche' },
  { to: '/teile', label: 'Teile' },
  { to: '/modelle', label: 'Modellvergleich' },
  { to: '/fehleranalyse', label: 'Fehleranalyse' },
  { to: '/wartung', label: 'Wartung' },
]

// Am Telefon vier feste Reiter + „Mehr"; der Rest wandert ins Blatt
const tabs = [
  { to: '/', label: 'Start', icon: 'home' },
  { to: '/dokumente', label: 'Doku', icon: 'doc' },
  { to: '/suche', label: 'Suche', icon: 'search' },
  { to: '/teile', label: 'Teile', icon: 'part' },
]
const moreLinks = [
  { to: '/fehleranalyse', label: 'Fehleranalyse', hint: 'Symptom → Ursache → Abhilfe' },
  { to: '/modelle', label: 'Modellvergleich', hint: '680 M · 680 M3 · A 680 g' },
  { to: '/wartung', label: 'Wartung', hint: 'Parkdienste & Schmierplan' },
]

const moreOpen = ref(false)
const moreActive = computed(() =>
  moreLinks.some(l => route.path.startsWith(l.to))
  || ['/offline', '/fahrzeug'].includes(route.path),
)

// Beim Navigieren schließen; solange offen, Hintergrund nicht scrollen
watch(() => route.fullPath, () => { moreOpen.value = false })
watch(moreOpen, (open) => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
})
onUnmounted(() => {
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <div class="flex min-h-[100dvh] flex-col">
    <!-- ————— Kopf ————— -->
    <header class="band-bottom safe-top sticky top-0 z-30 bg-paper/95 backdrop-blur-sm">
      <div class="safe-x mx-auto max-w-7xl px-3 sm:px-6">
        <!-- Mobil: kompakte Titelzeile -->
        <div class="flex items-center gap-2.5 py-2 md:hidden">
          <NuxtLink to="/" class="flex items-center gap-2.5 min-w-0">
            <img src="/img/steyr-logo.png" alt="Steyr" width="32" height="32" class="h-8 w-8 shrink-0">
            <span class="h-display truncate text-xl">Steyr 680</span>
          </NuxtLink>
          <NuxtLink
            to="/fahrzeug"
            class="stamp ml-auto shrink-0"
            :class="current ? 'text-olive' : 'text-ink-faint'"
          >
            {{ current ? current.name.replace('Steyr ', '') : 'Fahrzeug wählen' }}
          </NuxtLink>
          <NuxtLink
            to="/offline"
            class="shrink-0 border border-ink bg-card p-1.5 transition-colors"
            :class="$route.path === '/offline' ? 'bg-olive text-card' : 'text-ink'"
            aria-label="Offline verfügbar machen"
            title="Offline verfügbar machen"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M7 17.5A4.5 4.5 0 0 1 6.3 8.6a6 6 0 0 1 11.5.9A3.8 3.8 0 0 1 17.5 17" />
              <path d="M12 11v7m0 0-3-3m3 3 3-3" />
            </svg>
          </NuxtLink>
        </div>

        <!-- Ab Tablet: Kopfband wie im Werksdatenblatt -->
        <div class="hidden items-stretch gap-4 border-x border-ink md:flex">
          <NuxtLink to="/" class="group flex shrink-0 items-center gap-3 border-r border-ink py-3 pl-4 pr-5">
            <img
              src="/img/steyr-logo.png"
              alt="Steyr"
              width="40"
              height="40"
              class="h-10 w-10 shrink-0 transition-transform duration-500 group-hover:rotate-90"
            >
            <div class="leading-none">
              <div class="h-display text-2xl">Steyr 680</div>
              <div class="kennziffer mt-1">Nachschlagewerk · Techn. Archiv</div>
            </div>
          </NuxtLink>
          <!-- Füllt den Raum zwischen Titel und Fahrzeugwahl. Der Untertitel
               erscheint erst, wenn er vollständig hineinpasst — ein mitten im
               Wort abgeschnittener Text sähe nach Versehen aus. -->
          <div class="hidden min-w-0 flex-1 items-center md:flex">
            <p class="h-display hidden whitespace-nowrap text-lg tracking-widest text-ink-soft xl:block">
              Lastkraftwagen · Schrauber- und Restaurierungshilfe
            </p>
          </div>
          <div class="flex items-center border-l border-ink py-2 pl-4 pr-4">
            <label class="kennziffer mr-2" for="vehicle-select">Mein Fahrzeug</label>
            <select id="vehicle-select" v-model="vehicle" class="field !w-auto cursor-pointer !py-1.5 text-xs">
              <option :value="null">— keines gewählt —</option>
              <option v-for="v in VEHICLES" :key="v.id" :value="v.id">{{ v.name }}</option>
            </select>
          </div>

        </div>
      </div>

      <!-- Registerkarten nur ab Tablet: Bereiche links, Offline rechts -->
      <nav class="mx-auto hidden max-w-7xl px-4 pt-3 md:block sm:px-6">
        <div class="flex items-end justify-between gap-3">
          <div class="flex gap-1 overflow-x-auto">
            <NuxtLink v-for="n in nav" :key="n.to" :to="n.to" class="tab-register whitespace-nowrap">
              {{ n.label }}
            </NuxtLink>
          </div>
          <div class="flex shrink-0 items-end gap-1">
            <a
              :href="forumUrl"
              target="_blank"
              rel="noopener"
              class="tab-register flex items-center gap-1.5 whitespace-nowrap"
              title="Begleitforum — Fragen, Erfahrungen, Restaurierungsberichte"
            >
              <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />
              </svg>
              Forum
            </a>
          <NuxtLink to="/offline" class="tab-register flex shrink-0 items-center gap-1.5 whitespace-nowrap">
            <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M7 17.5A4.5 4.5 0 0 1 6.3 8.6a6 6 0 0 1 11.5.9A3.8 3.8 0 0 1 17.5 17" />
              <path d="M12 11v7m0 0-3-3m3 3 3-3" />
            </svg>
            Offline
          </NuxtLink>
          </div>
        </div>
      </nav>
    </header>

    <!-- ————— Inhalt ————— -->
    <main class="safe-x mx-auto w-full max-w-7xl flex-1 px-3 py-6 sm:px-6 sm:py-8">
      <slot />
    </main>

    <footer class="safe-x mt-8 border-t border-ink">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 sm:px-6">
        <p class="kennziffer hidden md:block">
          Privates Nachschlagewerk auf Basis eigener Werksunterlagen · Steyr-Daimler-Puch AG, Werk Steyr
          · <NuxtLink to="/offline" class="underline underline-offset-2 hover:text-olive">Offline verfügbar machen</NuxtLink>
        </p>
        <p v-if="current" class="stamp hidden text-olive md:block">{{ current.name }} · {{ current.engine }}</p>

        <!-- Ausgabestand: im Docker-Image vom CI gesetzt, lokal „Entwicklung“ -->
        <p
          class="kennziffer mx-auto w-full text-center md:mx-0 md:w-auto md:text-right"
          :title="`Ausgabe ${versionLabel}${shaShort ? ' · Commit ' + shaShort : ''}${built ? ' · gebaut am ' + built : ''}`"
        >
          <span class="hidden md:inline">Ausgabe </span>
          <span :class="isRelease ? 'text-olive' : 'text-stamp'">{{ versionLabel }}</span>
          <template v-if="shaShort"> · {{ shaShort }}</template>
          <template v-if="built"> · {{ built }}</template>
        </p>
      </div>
    </footer>

    <!-- Platzhalter, damit die Tab-Leiste nichts überdeckt -->
    <div class="h-[calc(50px+env(safe-area-inset-bottom))] md:hidden" aria-hidden="true" />

    <!-- ————— Blatt „Mehr" ————— -->
    <Teleport to="body">
      <div v-if="moreOpen" class="fixed inset-0 z-40 md:hidden">
        <div class="fade-anim absolute inset-0 bg-ink/40" @click="moreOpen = false" />
        <div class="sheet sheet-anim absolute inset-x-0 bottom-0 px-4 pt-3">
          <div class="mx-auto mb-2 h-1 w-10 rounded-full bg-line" aria-hidden="true" />
          <p class="kennziffer mb-1">Weitere Bereiche</p>
          <NuxtLink v-for="l in moreLinks" :key="l.to" :to="l.to" class="sheet-row">
            <span class="h-2.5 w-2.5 shrink-0 border border-ink" aria-hidden="true" />
            <span class="min-w-0">
              {{ l.label }}
              <span class="kennziffer block normal-case tracking-normal">{{ l.hint }}</span>
            </span>
          </NuxtLink>
          <a :href="forumUrl" target="_blank" rel="noopener" class="sheet-row">
            <span class="h-2.5 w-2.5 shrink-0 border border-ink" aria-hidden="true" />
            <span class="min-w-0">
              Forum ↗
              <span class="kennziffer block normal-case tracking-normal">Fragen und Erfahrungen austauschen</span>
            </span>
          </a>
          <NuxtLink to="/offline" class="sheet-row">
            <span class="h-2.5 w-2.5 shrink-0 border border-ink" aria-hidden="true" />
            <span class="min-w-0">
              Offline verfügbar
              <span class="kennziffer block normal-case tracking-normal">Unterlagen aufs Gerät holen</span>
            </span>
          </NuxtLink>
          <NuxtLink to="/fahrzeug" class="sheet-row">
            <span class="h-2.5 w-2.5 shrink-0 border border-ink" aria-hidden="true" />
            <span class="min-w-0">
              Mein Fahrzeug
              <span class="kennziffer block normal-case tracking-normal">
                {{ current ? current.name : 'noch nicht gewählt' }}
              </span>
            </span>
          </NuxtLink>
          <button class="mt-3 mb-1 w-full cursor-pointer border border-ink bg-paper py-2.5 h-display text-base" @click="moreOpen = false">
            Schließen
          </button>
        </div>
      </div>
    </Teleport>

    <!-- ————— Tab-Leiste (nur Telefon) ————— -->
    <nav class="tabbar fixed inset-x-0 bottom-0 z-30 md:hidden" aria-label="Hauptnavigation">
      <div class="grid grid-cols-5">
        <NuxtLink v-for="t in tabs" :key="t.to" :to="t.to" class="tabbar-item" :aria-label="t.label">
          <svg viewBox="0 0 24 24" class="h-[22px] w-[22px]" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <template v-if="t.icon === 'home'">
              <path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v10h13V10" />
            </template>
            <template v-else-if="t.icon === 'doc'">
              <path d="M6 2h8l4 4v16H6z" /><path d="M14 2v4h4" /><path d="M9 12h6M9 16h6" />
            </template>
            <template v-else-if="t.icon === 'search'">
              <circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" />
            </template>
            <template v-else>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.2 2.2M16.9 16.9l2.2 2.2M19.1 4.9l-2.2 2.2M7.1 16.9l-2.2 2.2" />
            </template>
          </svg>
          {{ t.label }}
        </NuxtLink>

        <button
          class="tabbar-item"
          :class="moreActive || moreOpen ? '!text-olive' : ''"
          :aria-expanded="moreOpen"
          aria-label="Weitere Bereiche"
          @click="moreOpen = !moreOpen"
        >
          <svg viewBox="0 0 24 24" class="h-[22px] w-[22px]" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h10" />
          </svg>
          Mehr
          <span v-if="moreActive" class="absolute -top-[2px] left-[18%] right-[18%] h-[3px] bg-olive" aria-hidden="true" />
        </button>
      </div>
    </nav>
  </div>
</template>
