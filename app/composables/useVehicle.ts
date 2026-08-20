export function useVehicle() {
  // Cookie statt localStorage: funktioniert auch bei SSR ohne Flackern.
  //
  // Die Domain wird bewusst auf die Hauptdomain gesetzt, damit auch das
  // Begleitforum unter forum.680.… die Auswahl lesen und im Kopf anzeigen kann.
  // Auf localhost muss die Angabe fehlen — der Browser lehnt Cookies mit
  // Domain-Angabe für localhost sonst ab.
  const host = useRequestURL().hostname
  const domain = host.endsWith('680.melfstoecken.de') ? '680.melfstoecken.de' : undefined

  const vehicle = useCookie<string | null>('sixeighty-vehicle', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 365 * 5,
    path: '/',
    sameSite: 'lax',
    domain,
  })
  return vehicle
}
