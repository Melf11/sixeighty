<script setup lang="ts">
import { VEHICLES } from '~/data/vehicles'
import { DOCS } from '~/data/docs'

useHead({ title: 'Mein Fahrzeug — Steyr 680' })

const vehicle = useVehicle()
const router = useRouter()

function choose(id: string | null) {
  vehicle.value = id
  // Kurz stehen lassen, damit die Auswahl sichtbar quittiert wird
  setTimeout(() => router.back(), 220)
}

function docCount(id: string) {
  return DOCS.filter(d => d.models.includes(id)).length
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <header class="sheet-in mb-5">
      <p class="kennziffer">Einstellung</p>
      <h1 class="h-display text-3xl sm:text-4xl">Mein Fahrzeug</h1>
      <p class="mt-2 text-sm text-ink-soft">
        Das gewählte Modell wird überall bevorzugt — Dokumente, Suche und Teileliste
        filtern zuerst darauf. Alle anderen Unterlagen bleiben trotzdem zugänglich.
      </p>
    </header>

    <ul class="sheet-in sheet-in-1 space-y-3">
      <li v-for="v in VEHICLES" :key="v.id">
        <button
          class="plate flex w-full cursor-pointer items-start gap-3 p-4 text-left transition-all active:translate-y-px"
          :class="vehicle === v.id ? '!border-olive-deep ring-2 ring-olive' : ''"
          @click="choose(v.id)"
        >
          <span
            class="mt-1 flex h-5 w-5 shrink-0 items-center justify-center border border-ink"
            :class="vehicle === v.id ? 'bg-olive' : 'bg-paper'"
            aria-hidden="true"
          >
            <svg v-if="vehicle === v.id" viewBox="0 0 16 16" class="h-3.5 w-3.5 text-card" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 8 3.5 3.5L13 5" />
            </svg>
          </span>
          <span class="min-w-0 flex-1">
            <span class="h-display block text-xl">{{ v.name }}</span>
            <span class="kennziffer mt-0.5 block">{{ v.sub }}</span>
            <span class="mt-1.5 block text-xs text-ink-soft">{{ v.engine }}<br>{{ v.drive }}</span>
            <span class="kennziffer mt-1.5 block text-olive">{{ docCount(v.id) }} passende Dokumente</span>
          </span>
        </button>
      </li>
    </ul>

    <button
      class="sheet-in sheet-in-2 mt-4 w-full cursor-pointer border border-ink bg-paper py-3 h-display text-base"
      :class="vehicle === null ? 'ring-2 ring-olive' : ''"
      @click="choose(null)"
    >
      Keine Vorauswahl — alle Modelle gleich behandeln
    </button>
  </div>
</template>
