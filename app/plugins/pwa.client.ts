export default defineNuxtPlugin(() => {
  if (!import.meta.client || !('serviceWorker' in navigator)) return

  const { appVersion } = useRuntimeConfig().public
  const version = (appVersion as string) || 'dev'

  // Die Version steckt in der URL, damit ein Release den Worker sicher
  // erneuert (siehe public/sw.js).
  const register = () => {
    navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(version)}`).catch(() => {
      // Registrierung fehlgeschlagen (z. B. unsicherer Kontext) — App läuft normal weiter
    })
  }

  // Nicht blind auf „load" warten: Bei der Hydration ist das Ereignis oft
  // schon durch und träte nie wieder ein — der Worker würde sich dann nie
  // registrieren. Deshalb den Zustand prüfen.
  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register, { once: true })
})
