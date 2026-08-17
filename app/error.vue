<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number, statusMessage?: string } }>()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-paper p-6">
    <div class="plate max-w-md p-8 text-center">
      <p class="stamp mx-auto text-stamp -rotate-3">Blatt fehlt</p>
      <h1 class="h-display mt-4 text-6xl">{{ props.error.statusCode ?? 500 }}</h1>
      <p class="mt-2 text-sm text-ink-soft">
        {{ props.error.statusCode === 404 ? 'Dieses Blatt ist im Archiv nicht abgelegt.' : (props.error.statusMessage || 'Unerwarteter Fehler.') }}
      </p>
      <button class="h-display mt-6 cursor-pointer border border-ink bg-olive px-6 py-2 text-lg text-card hover:bg-olive-deep transition-colors" @click="clearError({ redirect: '/' })">
        Zur Übersicht
      </button>
    </div>
  </div>
</template>
