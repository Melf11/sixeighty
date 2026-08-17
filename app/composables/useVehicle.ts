export function useVehicle() {
  // Cookie statt localStorage: funktioniert auch bei SSR ohne Flackern
  const vehicle = useCookie<string | null>('sixeighty-vehicle', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 365 * 5,
  })
  return vehicle
}
