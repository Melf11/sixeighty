<script setup lang="ts">
import { MAINT_PLANS } from '~/data/wartung'
import { DOCS, CATEGORIES } from '~/data/docs'

useHead({ title: 'Wartung — Steyr 680 Nachschlagewerk' })

const wartungDocs = computed(() => DOCS.filter(d => d.category === 'wartung'))
</script>

<template>
  <div>
    <header class="sheet-in mb-6">
      <p class="kennziffer">Register 06</p>
      <h1 class="h-display text-4xl sm:text-5xl">Wartung &amp; Pflege</h1>
      <p class="mt-2 max-w-2xl text-sm text-ink-soft">
        Nach der Parkdienst-Systematik der Werksunterlagen. Die genannten Füllmengen gelten für den
        A 680 g — für 680 M/M3 den Wartungs- und Schmierplan heranziehen.
      </p>
    </header>

    <div class="grid gap-5 lg:grid-cols-2">
      <section
        v-for="(plan, idx) in MAINT_PLANS"
        :key="plan.id"
        class="sheet-in plate p-5"
        :class="`sheet-in-${Math.min(idx, 3)}`"
      >
        <div class="flex items-baseline justify-between border-b-2 border-ink pb-1">
          <h2 class="h-display text-2xl">{{ plan.title }}</h2>
          <span class="stamp text-olive">{{ plan.interval }}</span>
        </div>
        <ul class="mt-3 space-y-2.5">
          <li v-for="t in plan.tasks" :key="t.task" class="flex gap-2.5 text-sm">
            <span class="mt-1 h-3 w-3 shrink-0 border border-ink" aria-hidden="true" />
            <div>
              <p>{{ t.task }}</p>
              <p v-if="t.detail" class="kennziffer mt-0.5">{{ t.detail }}</p>
            </div>
          </li>
        </ul>
        <div class="mt-4 rule-dashed pt-3">
          <div class="flex flex-wrap gap-2">
            <NuxtLink
              v-for="d in plan.docs"
              :key="d.docId"
              :to="{ path: `/dokumente/${d.docId}`, query: d.page ? { page: d.page } : {} }"
              class="inline-block border border-line bg-paper px-3 py-1 text-xs hover:border-ink hover:shadow-plate transition-all"
            >
              {{ d.label }} →
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>

    <section class="sheet-in sheet-in-3 mt-10">
      <h2 class="h-display border-b-2 border-ink pb-1 text-2xl">Wartungsunterlagen im Archiv</h2>
      <ul class="mt-3 grid gap-2 lg:grid-cols-2">
        <li v-for="d in wartungDocs" :key="d.id">
          <NuxtLink :to="`/dokumente/${d.id}`" class="flex flex-wrap items-baseline gap-x-3 gap-y-1 border border-line bg-card px-4 py-2.5 transition-all hover:border-ink hover:shadow-plate">
            <span class="stamp shrink-0 text-olive">{{ CATEGORIES[d.category] }}</span>
            <span class="min-w-0 flex-1 truncate text-sm">{{ d.title }}</span>
            <span class="kennziffer ml-auto shrink-0">{{ d.pages }} S.</span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>
