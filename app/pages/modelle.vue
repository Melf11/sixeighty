<script setup lang="ts">
import { SPEC_SECTIONS, SPEC_SOURCES } from '~/data/specs'
import { VEHICLES, vehicleById } from '~/data/vehicles'
import { docById } from '~/data/docs'

useHead({ title: 'Modellvergleich — Steyr 680 Nachschlagewerk' })

const vehicle = useVehicle()
const cols = [
  { key: 'm680' as const, id: '680M', label: 'Steyr 680 M' },
  { key: 'm680m3' as const, id: '680M3', label: 'Steyr 680 M3' },
  { key: 'a680g' as const, id: 'A680g', label: 'Steyr A 680 g' },
]
</script>

<template>
  <div>
    <header class="sheet-in mb-6">
      <p class="kennziffer">Register 04</p>
      <h1 class="h-display text-4xl sm:text-5xl">Modellvergleich</h1>
      <p class="mt-2 max-w-2xl text-sm text-ink-soft">
        Werksdaten im direkten Vergleich. Das gewählte Fahrzeug ist hervorgehoben.
        Zum SA/A 680 gl (Langvariante) siehe die gemeinsame
        <NuxtLink to="/dokumente/g-betrieb-3aufl" class="underline hover:text-olive">Betriebsanleitung 3. Aufl.</NuxtLink>
      </p>
    </header>

    <!-- Modellkarten -->
    <div class="sheet-in sheet-in-1 mb-8 grid gap-4 sm:grid-cols-3">
      <button
        v-for="v in VEHICLES"
        :key="v.id"
        class="plate cursor-pointer p-4 text-left transition-all hover:-translate-y-0.5"
        :class="vehicle === v.id ? '!border-olive-deep ring-2 ring-olive' : ''"
        @click="vehicle = vehicle === v.id ? null : v.id"
      >
        <div class="flex items-start justify-between">
          <h2 class="h-display text-2xl">{{ v.name }}</h2>
          <span v-if="vehicle === v.id" class="stamp text-olive">Meins</span>
        </div>
        <p class="kennziffer mt-1">{{ v.sub }}</p>
        <p class="mt-2 text-xs text-ink-soft">{{ v.engine }}<br>{{ v.drive }}</p>
      </button>
    </div>

    <section v-for="section in SPEC_SECTIONS" :key="section.title" class="sheet-in sheet-in-2 mb-8">
      <h2 class="h-display border-b-2 border-ink pb-1 text-2xl">{{ section.title }}</h2>
      <div class="plate mt-3 overflow-x-auto">
        <table class="sheet-table table-fixed min-w-[720px]">
          <thead>
            <tr>
              <th class="w-48"></th>
              <th
                v-for="c in cols"
                :key="c.key"
                :class="vehicle === c.id ? 'bg-olive text-card' : ''"
              >
                {{ c.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in section.rows" :key="row.label">
              <td class="font-semibold">{{ row.label }}</td>
              <td
                v-for="c in cols"
                :key="c.key"
                class="text-xs leading-relaxed"
                :class="vehicle === c.id ? 'bg-olive-wash font-medium' : 'text-ink-soft'"
              >
                {{ row[c.key] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <footer class="sheet-in sheet-in-3 plate p-4">
      <p class="stamp mb-2 text-blueprint">Quellen</p>
      <ul class="space-y-1 text-sm">
        <li v-for="s in SPEC_SOURCES" :key="s.docId">
          <NuxtLink
            :to="{ path: `/dokumente/${s.docId}`, query: s.page ? { page: s.page } : {} }"
            class="underline decoration-line underline-offset-2 hover:text-olive"
          >
            {{ s.label }}
          </NuxtLink>
          <span v-if="docById(s.docId)" class="kennziffer"> — {{ docById(s.docId)!.pages }} Seiten</span>
        </li>
      </ul>
    </footer>
  </div>
</template>
