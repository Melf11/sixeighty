/** Health-Check für Container-Healthcheck und Reverse-Proxy. */
export default defineEventHandler(() => {
  return { ok: true }
})
