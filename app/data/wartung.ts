// Wartungsübersicht, angelehnt an die Parkdienst-Systematik der
// Betriebsanleitung A 680 g (S. 28 ff.) und den Wartungs-/Schmierplan 680M.

export interface MaintTask {
  task: string
  detail?: string
}

export interface MaintPlan {
  id: string
  title: string
  interval: string
  tasks: MaintTask[]
  docs: { docId: string, label: string, page?: number }[]
}

export const MAINT_PLANS: MaintPlan[] = [
  {
    id: 'marsch',
    title: 'Marschparkdienst',
    interval: 'Vor jeder Fahrt',
    tasks: [
      { task: 'Motoröl-, Kühlwasser- und Kraftstoffstand prüfen' },
      { task: 'Reifen: Druck und Zustand', detail: '680M: v 5,5 / h 4,0 atü · 680M3: v 5,5 / h 3,0 atü · A680g: 6 atü' },
      { task: 'Beleuchtung, Blinker, Horn prüfen (24 V)' },
      { task: 'Druckluftvorrat aufbauen, Manometer beobachten', detail: 'Bremsprobe vor Fahrtantritt' },
      { task: 'Lenkung auf Spiel, Bremsflüssigkeitsstand kontrollieren' },
    ],
    docs: [
      { docId: 'g-betrieb-2aufl', label: 'Betriebsanleitung A680g: Marschparkdienst', page: 28 },
    ],
  },
  {
    id: 'tages',
    title: 'Tagesparkdienst',
    interval: 'Nach jedem Betriebstag',
    tasks: [
      { task: 'Druckluftkessel entwässern', detail: 'Kondenswasser ablassen — wichtigste Einzelmaßnahme gegen Korrosion und Bremsausfall' },
      { task: 'Fahrzeug auf Undichtigkeiten absuchen (Öl, Wasser, Diesel, Bremsflüssigkeit)' },
      { task: 'Radmuttern auf festen Sitz (besonders nach Radwechsel, Trilex!)' },
      { task: 'Kraftstoff auffüllen (gegen Kondenswasser im Tank)' },
      { task: 'Grobe Reinigung, Kontrolle auf Beschädigungen' },
    ],
    docs: [
      { docId: 'g-betrieb-2aufl', label: 'Betriebsanleitung A680g: Tagesparkdienst', page: 31 },
      { docId: 'g-parkdienst', label: 'Parkdienstvorschrift für Motorfahrzeuge' },
    ],
  },
  {
    id: 'wochen',
    title: 'Wochenparkdienst',
    interval: 'Wöchentlich',
    tasks: [
      { task: 'Abschmierdienst nach Schmierplan', detail: 'Alle Schmiernippel (Achsschenkel, Gelenkwellen, Federbolzen, Gestänge) — Positionen siehe Schmierplan 1–56' },
      { task: 'Batterien: Säurestand und Polklemmen', detail: 'Destilliertes Wasser nachfüllen, Polfett' },
      { task: 'Keilriemenspannung (Wasserpumpe, Lichtmaschine)' },
      { task: 'Ölbadluftfilter kontrollieren, bei Staubbetrieb öfter', detail: 'A680g: 2,5 l Motoröl bis zur Marke' },
      { task: 'Bremsanlage: Dichtheitsprüfung, Gestänge und Beläge' },
    ],
    docs: [
      { docId: 'plan-schmier', label: 'Wartungs- und Schmierplan (680M)' },
      { docId: 'plan-pos1', label: 'Schmierplan Positionen 1–27' },
      { docId: 'plan-pos2', label: 'Schmierplan Positionen 28–56' },
      { docId: 'g-betrieb-2aufl', label: 'Betriebsanleitung A680g: Wochenparkdienst', page: 31 },
    ],
  },
  {
    id: 'gross',
    title: 'Großparkdienst',
    interval: 'Nach Laufleistung / jährlich',
    tasks: [
      { task: 'Motorölwechsel mit Filter', detail: 'A680g: 15,5 l · Filtereinsatz erneuern' },
      { task: 'Ölwechsel Getriebe, Verteilergetriebe, Achsen, Lenkung', detail: 'Hypoid-Getriebeöl: 5,3 / 2,5 / 7,0 + 2,5 / 0,8 l (A680g) — Sorten laut Betriebsstoffblatt' },
      { task: 'Ventilspiel prüfen und einstellen', detail: 'kalt: Einlaß 0,2 mm, Auslaß 0,3 mm (A680g) bzw. 0,35 mm (680M/M3)' },
      { task: 'Kraftstofffilter erneuern, Anlage entlüften' },
      { task: 'Bremsen: Trommeln ziehen, Beläge und Radbremszylinder befunden, Bremsflüssigkeit wechseln' },
      { task: 'Vorspur und Lenkanschläge prüfen', detail: '680M: Vorspur 0–4 mm, Sturz 1°30′, Spreizung 6°30′, Nachlauf 2°' },
      { task: 'Konservierung/Hohlraumschutz, Plane und Aufbau prüfen' },
    ],
    docs: [
      { docId: 'g-betrieb-2aufl', label: 'Betriebsanleitung A680g: Großparkdienst', page: 32 },
      { docId: 'g-betriebsstoffe', label: 'Betriebsstoffblatt A680g' },
      { docId: 'g-pflicht', label: 'Pflichtüberprüfung A680g' },
    ],
  },
]

// Bekannte Zuliefer-/Normteile aus den Werksunterlagen — nützlich für die
// Beschaffung, da viele davon über Bosch/FRAM-Nummern noch auffindbar sind.
export interface KnownPart {
  name: string
  number: string
  vehicle: string
  source: string
}

export const KNOWN_PARTS: KnownPart[] = [
  { name: 'Kraftstoff-Doppelfilter, Einsatz', number: 'FRAM C-11860', vehicle: '680M / 680M3', source: 'Werksdatenblatt' },
  { name: 'Kraftstoff-Feinfiltereinsatz', number: 'FRAM C-11860 PB', vehicle: '680M / 680M3', source: 'Werksdatenblatt' },
  { name: 'Ölfilter-Papiereinsatz (Hauptstrom)', number: 'FRAM 11E-01875 CH-956 PL', vehicle: '680M / 680M3', source: 'Werksdatenblatt' },
  { name: 'Glühstiftkerze (6 Stück)', number: 'Bosch 0 250 200 031', vehicle: '680M (WD 609r)', source: 'Werksdatenblatt' },
  { name: 'Glühüberwachung', number: 'GSA 221/11 (22,5 V)', vehicle: '680M', source: 'Werksdatenblatt' },
  { name: 'Anlasser 24 V 4 PS', number: 'Bosch 0 001 402 047 (BN G4/24 CR 307 Br)', vehicle: '680M / 680M3', source: 'Werksdatenblatt' },
  { name: 'Regler Drehstromgenerator', number: 'Bosch 0 192 033 002 ED 28 V3', vehicle: '680M / 680M3 (ab Fgst. 1765)', source: 'Werksdatenblatt' },
  { name: 'Kupplung Einscheiben-Trocken', number: 'Fichtel & Sachs G 310K', vehicle: '680M / 680M3', source: 'Werksdatenblatt' },
  { name: 'Lenkgetriebe', number: 'ZF-Spindelhydrolenkung 7419', vehicle: '680M / 680M3', source: 'Werksdatenblatt' },
  { name: 'Lenkgetriebe', number: 'ZF-Gemmer GD 68', vehicle: 'A680g', source: 'Betriebsanleitung 2. Aufl.' },
  { name: 'Einspritzpumpe', number: 'Bosch PE 6A 85 C 412 RS 2182', vehicle: 'A680g (WD 610r)', source: 'Betriebsanleitung 2. Aufl.' },
  { name: 'Regler Einspritzpumpe', number: 'Bosch RQ 250/1400 AB 671 DL', vehicle: 'A680g', source: 'Betriebsanleitung 2. Aufl.' },
  { name: 'Förderpumpe', number: 'Bosch FP/KE 22 AD 254/2', vehicle: 'A680g', source: 'Betriebsanleitung 2. Aufl.' },
  { name: 'Spritzversteller', number: 'Bosch EP/SA 450…1400 A 5 D R101', vehicle: 'A680g', source: 'Betriebsanleitung 2. Aufl.' },
  { name: 'Einspritzdüse', number: 'Bosch DLL 50 S 226', vehicle: 'A680g', source: 'Betriebsanleitung 2. Aufl.' },
  { name: 'Düsenhalter', number: 'Bosch KDAL 80 S 9/4', vehicle: 'A680g', source: 'Betriebsanleitung 2. Aufl.' },
  { name: 'Lichtmaschine 28 V 38 A', number: 'Bosch 0 101 500 011 Q(R)', vehicle: 'A680g', source: 'Betriebsanleitung 2. Aufl.' },
  { name: 'Reglerschalter', number: 'Bosch 0 190 112 007 (RS/WCM 600 24 B 1/4)', vehicle: 'A680g', source: 'Betriebsanleitung 2. Aufl.' },
  { name: 'Ölbadluftfilter', number: 'IFE 810 B – 1000 R', vehicle: 'A680g', source: 'Betriebsanleitung 2. Aufl.' },
  { name: 'Keilriemen Wasserpumpe', number: 'Schmalkeilriemen 9,5×950 DIN 7753', vehicle: 'A680g', source: 'Betriebsanleitung 2. Aufl.' },
  { name: 'Keilriemen Lichtmaschine', number: 'Schmalkeilriemen 12,5×1100 DIN 7753', vehicle: 'A680g', source: 'Betriebsanleitung 2. Aufl.' },
  { name: 'Kraftstoff-Einspritzpumpe (Verstellreglerp., TankKW/FTLF)', number: 'Bosch PE 6A 80 C412 RS 2282', vehicle: '680M Sonderaufbauten', source: 'Werksdatenblatt' },
]
