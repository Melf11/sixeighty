export default defineNuxtPlugin(() => {
  if (!import.meta.client || !('serviceWorker' in navigator)) return
  // Erst nach dem Laden registrieren, damit der SW den ersten Seitenaufbau nicht bremst
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registrierung fehlgeschlagen (z. B. unsicherer Kontext) — App läuft normal weiter
    })
  })
})
