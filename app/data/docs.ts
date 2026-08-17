export type DocCategory = 'betrieb' | 'reparatur' | 'teile' | 'technik' | 'wartung' | 'register'

export const CATEGORIES: Record<DocCategory, string> = {
  betrieb: 'Bedienung & Betrieb',
  reparatur: 'Reparatur',
  teile: 'Ersatzteile',
  technik: 'Technische Daten',
  wartung: 'Wartung & Pflege',
  register: 'Werkstatt-Register',
}

export interface DocEntry {
  id: string
  title: string
  file: string // Pfad unter /docs/
  models: string[] // 680M, 680M3, A680g, A680gl
  category: DocCategory
  pages: number
  note?: string
}

export const DOCS: DocEntry[] = [
  // ————— 680 M / 680 M3 —————
  { id: 'm-techdaten', title: 'Technische Daten Typ 680 M / 680 M3', file: '680M/Typ 680 M Technische Daten.pdf', models: ['680M', '680M3'], category: 'technik', pages: 5, note: 'Werksdatenblatt: Motor, Fahrgestell, Bremsen, Elektrik, Gewichte' },
  { id: 'm-reparatur', title: 'Reparaturhandbuch 680 M / 680 M3 (2. Aufl. 1980)', file: '680M/Reparaturhandbuch Steyr LKW Typ 680 M - 680 M3  2.Aufl.1980.pdf', models: ['680M', '680M3'], category: 'reparatur', pages: 290 },
  { id: 'm-bedienung3', title: 'Bedienungsanweisung Typ 680 M (3. Aufl.)', file: '680M/Typ 680 M Bedienungsanweisung 3.Aufl.pdf', models: ['680M'], category: 'betrieb', pages: 74 },
  { id: 'm3-bedienung1', title: 'Bedienungsanweisung Typ 680 M3 (1. Aufl.)', file: '680M/Typ 680 M3 Bedienungsanweisung 1.Aufl.pdf', models: ['680M3'], category: 'betrieb', pages: 29 },
  { id: 'm-geraetebeschreibung', title: 'Techn. Gerätebeschreibung und Bedienungsanweisung (4. Aufl.)', file: '680M/Steyr 680 M und 680 M3 Techn Gerätebeschreibung und Bedienungsanweisung 4.Aufl.pdf', models: ['680M', '680M3'], category: 'betrieb', pages: 70 },
  { id: 'm-allrad', title: 'Typ 680 M Allrad — Beschreibung und Bedienungsanleitung', file: '680M/Typ 680 M Allrad Beschreibung und Bedienungsanleitung.pdf', models: ['680M'], category: 'betrieb', pages: 71 },
  { id: 'm-zusatz', title: 'Zusatzbetriebsanleitung 680 M / 680 M3', file: '680M/Zusatzbetriebsanleitung Steyr LKW Typ 680M - 680M3.pdf', models: ['680M', '680M3'], category: 'betrieb', pages: 56 },
  { id: 'm-bestandteil-1994', title: 'Bestandteilliste 680 M / 680 M3 (1994, S. 1–668)', file: '680M/Steyr 680 M und 680 M3 Bestandteilliste 1994 Seite 1 bis 668.pdf', models: ['680M', '680M3'], category: 'teile', pages: 668 },
  { id: 'm-bestandteil-index', title: 'Bestandteilliste 680 M / 680 M3 — Index (S. 1–419)', file: '680M/Bestandteilliste Steyr LKW Typ 680 M - 680 M3 Index Seite 1 bis 419 .pdf', models: ['680M', '680M3'], category: 'teile', pages: 419 },

  // ————— A 680 g / A 680 gl —————
  { id: 'g-reparatur', title: 'Reparaturhandbuch A 680 g — 3 t 4×4', file: 'A680G - A680GL/Reparaturhandbuch-Steyr A680g-3t-4x4.pdf', models: ['A680g'], category: 'reparatur', pages: 510 },
  { id: 'g-betrieb-2aufl', title: 'Betriebsanleitung A 680 g (2. Auflage, DE/FR)', file: 'A680G - A680GL/Betriebsanl. Steyr A680g-3t-4x4-2.Auflage.pdf', models: ['A680g'], category: 'betrieb', pages: 135, note: 'Technische Daten ab S. 127' },
  { id: 'g-betrieb-3aufl', title: 'Betriebsanleitung A 680 g / SA 680 gl (3. Aufl.)', file: 'A680G - A680GL/Steyr A 680 g und SA 680 gl Betriebsanleitung 3.Aufl.pdf', models: ['A680g', 'A680gl'], category: 'betrieb', pages: 70 },
  { id: 'g-betrieb-alt', title: 'Betriebsanleitung A 680 g (ältere Ausgabe)', file: 'A680G - A680GL/Betirebsanleitung Steyr A680g-3t-4x4.alt.pdf', models: ['A680g'], category: 'betrieb', pages: 136 },
  { id: 'g-betrieb-alt2', title: 'Betriebsanleitung A 680 g (ältere Ausgabe, 2)', file: 'A680G - A680GL/Betriebsanl. Steyr A680g-3t-4x4alt-2.pdf', models: ['A680g'], category: 'betrieb', pages: 120 },
  { id: 'g-betrieb-farbig', title: 'Betriebsanleitung A 680 g (farbig, Scanqualität mäßig)', file: 'A680G - A680GL/Steyr A 680 g Betriebsanleitung farbig Qualität schlecht.pdf', models: ['A680g'], category: 'betrieb', pages: 72 },
  { id: 'g-etk', title: 'Ersatzteilkatalog A 680 g / A 680 gl (2. Aufl.)', file: 'A680G - A680GL/Steyr A 680 g und A 680 gl Erstazteilkatolog 2. Aufl und Nachbearbeitung.pdf', models: ['A680g', 'A680gl'], category: 'teile', pages: 490 },
  { id: 'g-etk-ch', title: 'Ersatzteilkatalog Schweizer Armee (7610-773-2005)', file: 'A680G - A680GL/Ersatzteilkatalog-Schweizerische Armee-7610-773-2005.pdf', models: ['A680g', 'A680gl'], category: 'teile', pages: 490 },
  { id: 'g-ausruestung', title: 'Ausrüstungsverzeichnis LKW Typ A 680 g', file: 'A680G - A680GL/Ausrüstungsverzeichnis LKW Typ A-680g.pdf', models: ['A680g'], category: 'technik', pages: 2 },
  { id: 'g-betriebsstoffe', title: 'Betriebsstoffe LKW A 680 g — 3 t 4×4', file: 'A680G - A680GL/Betriebsstoffe LKW A680g-3t-4x4.pdf', models: ['A680g'], category: 'wartung', pages: 2 },
  { id: 'g-betriebsstoffe2', title: 'Betriebsstoffe LKW A 680 g (2. Blatt)', file: 'A680G - A680GL/Betriebsstoffe-LKW A 680g.pdf', models: ['A680g'], category: 'wartung', pages: 2 },
  { id: 'g-pflicht', title: 'Pflichtüberprüfung Steyr A 680 g — 3 t 4×4', file: 'A680G - A680GL/Pflichtüberprüfung für Steyr A680g-3t 4x4.pdf', models: ['A680g'], category: 'wartung', pages: 7 },
  { id: 'g-parkdienst', title: 'Parkdienstvorschrift für Motorfahrzeuge', file: 'A680G - A680GL/Parkdienstvorschr.f.Motorfzg..pdf', models: ['A680g', 'A680gl'], category: 'wartung', pages: 13 },

  // ————— Werkstatt-Register 680 M —————
  { id: 'r1-motor', title: 'Register 1 — Motor', file: '680m-doku_2025-10-15_1820/Register 1 Motor/STCN-BizHub19120409010.pdf', models: ['680M'], category: 'register', pages: 86 },
  { id: 'r2-getriebe', title: 'Register 2 — Getriebe', file: '680m-doku_2025-10-15_1820/Register 2 Getriebe/STCN-BizHub19120311330.pdf', models: ['680M'], category: 'register', pages: 12 },
  { id: 'r3-verteilergetriebe', title: 'Register 3 — Verteilergetriebe', file: '680m-doku_2025-10-15_1820/Register 3 Verteilergetriebe/STCN-BizHub19120311321.pdf', models: ['680M'], category: 'register', pages: 10 },
  { id: 'r4-gelenkwellen', title: 'Register 4 — Gelenkwellen', file: '680m-doku_2025-10-15_1820/Rergister 4 Gelenkwellen/STCN-BizHub19120311320.pdf', models: ['680M'], category: 'register', pages: 2 },
  { id: 'r5-hinterachse', title: 'Register 5 — Hinterachse', file: '680m-doku_2025-10-15_1820/Register 5 Hinterachse/STCN-BizHub19120311310.pdf', models: ['680M'], category: 'register', pages: 26 },
  { id: 'r6-hinterachse', title: 'Register 6 — Hinterachse', file: '680m-doku_2025-10-15_1820/Register 6 Hinterachse/STCN-BizHub19120311300.pdf', models: ['680M'], category: 'register', pages: 24 },
  { id: 'r7-bremsen', title: 'Register 7 — Bremsen', file: '680m-doku_2025-10-15_1820/Register 7 Bremsen/STCN-BizHub19120311290.pdf', models: ['680M'], category: 'register', pages: 34 },
  { id: 'r8-hydrolenkung', title: 'Register 8 — Hydrolenkung', file: '680m-doku_2025-10-15_1820/Register 8 Hydrolenkung/STCN-BizHub19120311280.pdf', models: ['680M'], category: 'register', pages: 22 },
  { id: 'r9-vorderachse', title: 'Register 9 — Vorderachse', file: '680m-doku_2025-10-15_1820/Register 9 Vorderachse/STCN-BizHub19120311271.pdf', models: ['680M'], category: 'register', pages: 24 },
  { id: 'r10-elektrik', title: 'Register 10 — Elektrische Anlage', file: '680m-doku_2025-10-15_1820/Register 10 elektrische Anlage/Register 10 elektrische Anlage.pdf', models: ['680M'], category: 'register', pages: 16 },
  { id: 'r11-oelverbrauch', title: 'Register 11 — Öl-Verbrauchsmeßfahrt', file: '680m-doku_2025-10-15_1820/Register 11 Öl-Verbrauchmeßfahrt/Öl-Verbrauchmeßfahrt.pdf', models: ['680M'], category: 'register', pages: 8 },
  { id: 'r12-bestandteil-1', title: 'Register 12 — Bestandteilliste 1', file: '680m-doku_2025-10-15_1820/Register 12 Bestandteilliste/Bestandteilliste 1.pdf', models: ['680M'], category: 'teile', pages: 118 },
  { id: 'r12-bestandteil-2', title: 'Register 12 — Bestandteilliste 2', file: '680m-doku_2025-10-15_1820/Register 12 Bestandteilliste/Bestandteilliste 2.pdf', models: ['680M'], category: 'teile', pages: 194 },
  { id: 'r12-bestandteil-3', title: 'Register 12 — Bestandteilliste 3', file: '680m-doku_2025-10-15_1820/Register 12 Bestandteilliste/Bestandteilliste 3.pdf', models: ['680M'], category: 'teile', pages: 200 },
  { id: 'r12-bestandteil-4', title: 'Register 12 — Bestandteilliste 4', file: '680m-doku_2025-10-15_1820/Register 12 Bestandteilliste/Bestandteilliste 4.pdf', models: ['680M'], category: 'teile', pages: 156 },
  { id: 'r12-bildkatalog', title: 'Register 12 — Bestandteilliste Bildkatalog', file: '680m-doku_2025-10-15_1820/Register 12 Bestandteilliste/Bestandteilliste Bildkatalog.pdf', models: ['680M'], category: 'teile', pages: 23 },
  { id: 'plan-schmier', title: 'Wartungs- und Schmierplan', file: '680m-doku_2025-10-15_1820/Pläne/Wartungs-und Schmierplan.pdf', models: ['680M'], category: 'wartung', pages: 1 },
  { id: 'plan-pos1', title: 'Schmierplan — Positionen 1–27', file: '680m-doku_2025-10-15_1820/Pläne/Pos. 1-27.pdf', models: ['680M'], category: 'wartung', pages: 1 },
  { id: 'plan-pos2', title: 'Schmierplan — Positionen 28–56', file: '680m-doku_2025-10-15_1820/Pläne/Pos. 28-56.pdf', models: ['680M'], category: 'wartung', pages: 1 },
  { id: 'plan-flowsheet', title: 'Flowsheet', file: '680m-doku_2025-10-15_1820/Pläne/Flowsheet.pdf', models: ['680M'], category: 'wartung', pages: 1 },
  { id: 'plan-bilder', title: 'Pläne — Bilder', file: '680m-doku_2025-10-15_1820/Pläne/Bilder.pdf', models: ['680M'], category: 'wartung', pages: 1 },
]

export function docById(id: string | undefined): DocEntry | undefined {
  return DOCS.find(d => d.id === id)
}

export function docUrl(doc: DocEntry, page?: number): string {
  const base = '/docs/' + doc.file.split('/').map(encodeURIComponent).join('/')
  return page ? `${base}#page=${page}` : base
}
