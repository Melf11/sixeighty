/**
 * Versionsangabe für den Footer.
 *
 * Die Werte setzt der CI-Build ins Docker-Image (APP_VERSION = Git-Tag,
 * GIT_SHA, BUILD_TIME). Lokal sind sie leer — dann wird „Entwicklung“ gezeigt,
 * damit man nie im Zweifel ist, ob man gerade einen Release oder den Dev-Server
 * vor sich hat.
 */
export function useAppVersion() {
  const { appVersion, gitSha, buildTime } = useRuntimeConfig().public

  const version = computed(() => (appVersion as string) || '')
  const sha = computed(() => (gitSha as string) || '')

  const isRelease = computed(() => !!version.value && version.value !== 'dev')

  /** z. B. „v1.1.0" oder „Entwicklung" */
  const label = computed(() => isRelease.value ? version.value : 'Entwicklung')

  /** Kurz-SHA in Klammern, sofern vorhanden */
  const shaShort = computed(() => sha.value ? sha.value.slice(0, 7) : '')

  /** Baudatum lesbar auf Deutsch, leer wenn unbekannt/ungültig */
  const built = computed(() => {
    const raw = buildTime as string
    if (!raw) return ''
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  })

  /** Alles in einer Zeile, z. B. „v1.1.0 · 3f2a9c1 · 18.08.2026" */
  const full = computed(() =>
    [label.value, shaShort.value, built.value].filter(Boolean).join(' · '),
  )

  return { label, shaShort, built, full, isRelease }
}
