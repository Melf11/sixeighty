export interface Vehicle {
  id: string
  name: string
  sub: string
  engine: string
  drive: string
}

export const VEHICLES: Vehicle[] = [
  {
    id: '680M',
    name: 'Steyr 680 M',
    sub: 'gl LKW 2 1/2 t · 4×4',
    engine: 'WD 609r / WD 610.23',
    drive: 'Allrad, Verteilergetriebe zweistufig',
  },
  {
    id: '680M3',
    name: 'Steyr 680 M3',
    sub: 'gl LKW 3 t · 6×6',
    engine: 'WD 609er / WD 610.71 (Lader)',
    drive: 'Allrad, Verteilergetriebe zweistufig',
  },
  {
    id: 'A680g',
    name: 'Steyr A 680 g',
    sub: '3 t · 4×4 (u. a. Schweizer Armee)',
    engine: 'WD 610r',
    drive: 'Allrad 4×4, Verteilergetriebe zweistufig',
  },
]

export function vehicleById(id: string | null | undefined): Vehicle | undefined {
  return VEHICLES.find(v => v.id === id)
}
