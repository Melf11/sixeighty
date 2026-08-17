<script setup lang="ts">
import { VEHICLES, vehicleById } from '~/data/vehicles'

const vehicle = useVehicle()
const current = computed(() => vehicleById(vehicle.value))

const nav = [
  { to: '/', label: 'Übersicht' },
  { to: '/dokumente', label: 'Dokumente' },
  { to: '/suche', label: 'Suche' },
  { to: '/teile', label: 'Teile' },
  { to: '/modelle', label: 'Modellvergleich' },
  { to: '/fehleranalyse', label: 'Fehleranalyse' },
  { to: '/wartung', label: 'Wartung' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Kopfband im Stil des Werksdatenblatts -->
    <header class="band-bottom bg-paper">
      <div class="mx-auto max-w-7xl px-4 sm:px-6">
        <div class="flex items-stretch gap-4 border-x border-ink">
          <NuxtLink to="/" class="flex items-center gap-3 border-r border-ink py-3 pl-4 pr-5 shrink-0 group">
            <!-- Steyr-Zielscheiben-Motiv -->
            <svg viewBox="0 0 40 40" class="h-9 w-9 text-ink group-hover:rotate-90 transition-transform duration-500" aria-hidden="true">
              <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="2.6" />
              <circle cx="20" cy="20" r="12.5" fill="none" stroke="currentColor" stroke-width="2.6" />
              <circle cx="20" cy="20" r="7" fill="none" stroke="currentColor" stroke-width="2.6" />
              <circle cx="20" cy="20" r="2.2" fill="currentColor" />
            </svg>
            <div class="leading-none">
              <div class="h-display text-2xl">Steyr 680</div>
              <div class="kennziffer mt-1">Nachschlagewerk · Techn. Archiv</div>
            </div>
          </NuxtLink>
          <div class="hidden md:flex flex-1 items-center">
            <p class="h-display text-lg text-ink-soft tracking-widest">Lastkraftwagen · Schrauber- und Restaurierungshilfe</p>
          </div>
          <div class="flex items-center border-l border-ink pl-4 pr-4 py-2">
            <label class="kennziffer mr-2 hidden sm:block" for="vehicle-select">Mein Fahrzeug</label>
            <select
              id="vehicle-select"
              v-model="vehicle"
              class="field !w-auto !py-1.5 text-xs cursor-pointer"
            >
              <option :value="null">— keines gewählt —</option>
              <option v-for="v in VEHICLES" :key="v.id" :value="v.id">{{ v.name }}</option>
            </select>
          </div>
        </div>
      </div>
      <!-- Registerkarten -->
      <nav class="mx-auto max-w-7xl px-4 sm:px-6 mt-3 overflow-x-auto">
        <div class="flex gap-1 min-w-max">
          <NuxtLink v-for="n in nav" :key="n.to" :to="n.to" class="tab-register whitespace-nowrap">
            {{ n.label }}
          </NuxtLink>
        </div>
      </nav>
    </header>

    <main class="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
      <slot />
    </main>

    <footer class="border-t border-ink mt-8">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <p class="kennziffer">
          Privates Nachschlagewerk auf Basis eigener Werksunterlagen · Steyr-Daimler-Puch AG, Werk Steyr
        </p>
        <p v-if="current" class="stamp text-olive">{{ current.name }} · {{ current.engine }}</p>
      </div>
    </footer>
  </div>
</template>
