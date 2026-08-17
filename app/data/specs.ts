// Quellen:
// [1] Werksdatenblatt „Steyr Lastkraftwagen Typ 680M und 680M3“ (Techn. Archiv) → Dok-ID m-techdaten
// [2] Betriebsanleitung A 680 g, 2. Auflage, Technische Daten S. 127–134 → Dok-ID g-betrieb-2aufl

export interface SpecRow {
  label: string
  m680: string // 680M
  m680m3: string // 680M3
  a680g: string // A680g
}

export interface SpecSection {
  title: string
  rows: SpecRow[]
}

export const SPEC_SECTIONS: SpecSection[] = [
  {
    title: 'Motor',
    rows: [
      { label: 'Motor-Baumuster', m680: 'WD 609r (Vorkammer, bis Fgst. 1764) / WD 610.23 (Direkteinspritzer, ab Fgst. 1765)', m680m3: 'WD 609er (Vorkammer, bis Fgst. 1764/232) / WD 610.71 (Direkteinspritzer, ab Fgst. 1765/233)', a680g: 'WD 610r (Direkteinspritzer)' },
      { label: 'Arbeitsverfahren', m680: 'Viertakt-Diesel, Saugmotor', m680m3: 'Viertakt-Diesel, Ladermotor', a680g: 'Viertakt-Diesel, Saugmotor' },
      { label: 'Zylinder', m680: '6 in Reihe', m680m3: '6 in Reihe', a680g: '6 in Reihe, stehend' },
      { label: 'Bohrung × Hub', m680: '105 × 115 mm', m680m3: '105 × 115 mm', a680g: '105 × 115 mm' },
      { label: 'Hubraum', m680: '5975 cm³', m680m3: '5975 cm³', a680g: '5976 cm³' },
      { label: 'Verdichtung', m680: 'WD 609r: 19,5 : 1 · WD 610.23: 17,0 : 1', m680m3: 'WD 609er: 19,5 : 1 · WD 610.71: 17,0 : 1', a680g: '17,5 : 1' },
      { label: 'Höchstleistung (DIN)', m680: '120 PS bei 2800 U/min', m680m3: '150 PS bei 2800 U/min', a680g: '120 PS bei 2800 U/min' },
      { label: 'Max. Drehmoment', m680: 'WD 609r: 36 mkp/1400 · WD 610.23: 37 mkp/1800', m680m3: 'WD 609er: 43,6 mkp/1900 · WD 610.71: 44 mkp/1700', a680g: '36 mkp bei 1600 U/min' },
      { label: 'Zündfolge', m680: '1-5-3-6-2-4', m680m3: '1-5-3-6-2-4', a680g: '1-5-3-6-2-4' },
      { label: 'Ventilspiel (kalt)', m680: 'Einlaß 0,2 mm · Auslaß 0,35 mm', m680m3: 'Einlaß 0,2 mm · Auslaß 0,35 mm', a680g: 'Einlaß 0,2 mm · Auslaß 0,3 mm' },
      { label: 'Öldruck', m680: 'mind. 1 atü im Leerlauf (warm)', m680m3: 'mind. 1 atü im Leerlauf (warm)', a680g: 'mind. 1 atü im Leerlauf (warm)' },
      { label: 'Betriebstemperatur', m680: '80–90 °C', m680m3: '80–90 °C', a680g: '80 °C' },
      { label: 'Luftfilter', m680: 'Ölbadluftfilter', m680m3: 'Ölbadluftfilter', a680g: 'Ölbadluftfilter IFE 810 B – 1000 R' },
      { label: 'Einspritzpumpe', m680: 'F&M P26 T8-4a 68 BA RVO (WD 609r) / P26 T8-4s 71 BII RVO (WD 610.23)', m680m3: 'F&M P26 T8-4a BA RVO (WD 609er) / P26 T8-4s 71 BII RVO (WD 610.71)', a680g: 'Bosch PE 6A 85 C 412 RS 2182' },
      { label: 'Abspritzdruck Düsen', m680: '120⁺¹⁰ atü (609r) / 220⁺⁵ atü (610.23)', m680m3: '160⁺¹⁰ atü (609er) / 220⁺⁵ atü (610.71)', a680g: '190⁻⁵ atü (bis Mot.-Nr. 1150) · 220⁺⁵ atü (ab 1151)' },
      { label: 'Starthilfe', m680: 'Glühstiftkerze Bosch 0 250 200 031 (6 St.), GSA 221/11 (22,5 V)', m680m3: 'Glühspirale (2 Stück)', a680g: '—' },
      { label: 'Kraftstofffilter', m680: 'Doppelfilter FRAM C-11860 / Fein: FRAM C-11860 PB', m680m3: 'wie 680M', a680g: 'siehe Betriebsanleitung' },
      { label: 'Ölfilter', m680: 'Hauptstrom-Feinfilter, Einsatz FRAM 11E-01875 CH-956 PL', m680m3: 'wie 680M', a680g: 'Feinfilter im Hauptstrom' },
    ],
  },
  {
    title: 'Kraftübertragung',
    rows: [
      { label: 'Kupplung', m680: 'Einscheiben trocken, Fichtel & Sachs G 310K, hydraulisch betätigt', m680m3: 'wie 680M', a680g: 'Einscheiben-Trockenkupplung, hydraulisch betätigt' },
      { label: 'Wechselgetriebe', m680: 'Steyr-Allklauengetriebe, 5 Vorwärtsgänge + R', m680m3: 'wie 680M', a680g: 'Steyr-Allklauen-5-Gang-Getriebe' },
      { label: 'Übersetzungen Getriebe', m680: '9,00 / 4,74 / 2,73 / 1,58 / 1,00 · R 8,29', m680m3: 'wie 680M', a680g: '9,00 / 4,74 / 2,73 / 1,58 / 1,00 · R 8,29' },
      { label: 'Verteilergetriebe', m680: 'zweistufig · Straße 1,00 / Gelände 1,43', m680m3: 'wie 680M', a680g: 'zweistufig · Straße 1,12 / Gelände 1,75' },
      { label: 'Achsübersetzungen', m680: 'Vorderachse 6,5 · Hinterachse(n) 6,5', m680m3: 'wie 680M', a680g: 'Hinterachse 6,14 (43/7) · Vorderachse 6,17 (37/6), Hypoid' },
      { label: 'Ausgleichssperre', m680: 'Hinterachsen, druckluftbetätigt, Kontrollleuchte', m680m3: 'wie 680M', a680g: 'vorhanden (Kontrollleuchte grün)' },
    ],
  },
  {
    title: 'Fahrwerk & Lenkung',
    rows: [
      { label: 'Lenkung', m680: 'ZF-Spindelhydrolenkung Typ 7419, 20:1', m680m3: 'wie 680M', a680g: 'Schneckenrollenlenkung ZF-Gemmer GD 68' },
      { label: 'Federung', m680: 'Halbelliptik-Blattfedern mit Gummihohlfedern', m680m3: 'hinten: 2 längsliegende Halbelliptikfedern, umgekehrt eingebaut', a680g: 'je Achse 2 längsliegende Halbelliptikfedern' },
      { label: 'Stoßdämpfer', m680: 'Vorderachse: 2 Teleskop', m680m3: 'wie 680M', a680g: 'vorne 2 Teleskop' },
      { label: 'Felgen / Reifen', m680: 'Scheibenräder 7,0-20 · 9,00-20 Semperit 14 pr', m680m3: '12 pr (14 pr möglich)', a680g: 'Trilex-Stahlfelgen 7,50-20 · SAT 10.00-20 14 ply' },
      { label: 'Reifendruck', m680: 'vorne 5,5 atü · hinten 4,0 atü', m680m3: 'vorne 5,5 atü · hinten 3,0 atü', a680g: '6 atü' },
    ],
  },
  {
    title: 'Bremsanlage',
    rows: [
      { label: 'Betriebsbremse', m680: 'Zweikreis, hydraulisch mit Druckluftunterstützung, Betriebsdruck 7,3 atü', m680m3: 'wie 680M', a680g: 'Zweikreis-Öldruckbremse mit Druckluftunterstützung' },
      { label: 'Feststellbremse', m680: 'Seilzug-Innenbackenbremse auf Hinterräder + Hydraulikteil', m680m3: 'wie 680M', a680g: 'mechanische Handbremse' },
      { label: 'Motorbremse', m680: 'Auspuffdrosselklappe, druckluftbetätigt', m680m3: 'wie 680M', a680g: 'Staudruckbremse' },
      { label: 'Anhängerbremse', m680: 'Einleitung, Betriebsdruck 5,3 atü', m680m3: 'wie 680M', a680g: 'Druckluft, Zweileitersystem (direkt und indirekt)' },
    ],
  },
  {
    title: 'Elektrische Anlage',
    rows: [
      { label: 'Spannung', m680: '24 V', m680m3: '24 V', a680g: '24 V' },
      { label: 'Lichtmaschine', m680: 'Gleichstrom bis Fgst. 1764, Drehstrom ab 1765 (Regler Bosch 0 192 033 002 ED 28 V3)', m680m3: 'wie 680M', a680g: 'Bosch 0 101 500 011 Q(R) 28 V 38 A 14' },
      { label: 'Anlasser', m680: 'Bosch BN G4/24 CR 307 Br, 24 V 4 PS (Nr. 0 001 402 047)', m680m3: 'wie 680M', a680g: 'Bosch KG(R) 24 V 4 PS (BNG 4/24 Cr…BR)' },
      { label: 'Batterien', m680: '2 × 12 V, je 110 Ah', m680m3: 'wie 680M', a680g: '2 × Oerlikon 12 V, 125 Ah' },
    ],
  },
  {
    title: 'Maße & Gewichte',
    rows: [
      { label: 'Radstand', m680: '3700 mm (bis Mitte Hinterachsen)', m680m3: '3360 mm', a680g: '3200 mm' },
      { label: 'Länge × Breite', m680: '6570 × 2400 mm', m680m3: '6730 × 2400 mm', a680g: '6050 × 2300 mm' },
      { label: 'Höhe (mit Plane)', m680: '2970 mm', m680m3: '2850 mm', a680g: '—' },
      { label: 'Wattiefe', m680: '800 mm', m680m3: '800 mm', a680g: '800 mm' },
      { label: 'Bodenfreiheit (belastet)', m680: 'VA 280 / HA 305 mm', m680m3: 'VA 300 / HA 305 mm', a680g: 'VA ca. 315 / HA ca. 290 mm' },
      { label: 'Wendekreis', m680: '16 800 mm', m680m3: '16 050 mm', a680g: '14 000 mm' },
      { label: 'Eigengewicht', m680: '5600 kg (oSW) / 6000 kg (mSW)', m680m3: '6330 kg (oSW) / 6760 kg (mSW)', a680g: '5560 kg / 7720 kg (je nach Ausführung mit/ohne Seilwinde lt. Datenblatt)' },
      { label: 'Zul. Gesamtgewicht', m680: '10 100–10 500 kg (Straße) · 8100–8500 kg (Gelände)', m680m3: '12 000 kg (Straße) · 10 000 kg (Gelände)', a680g: '8400–8600 kg' },
      { label: 'Nutzlast', m680: '4500 kg Straße / 2500 kg Gelände', m680m3: '5500 kg Straße / 3500 kg Gelände', a680g: '3 t (Typbezeichnung)' },
      { label: 'Anhängelast', m680: '5000 kg Straße / 2000 kg Gelände', m680m3: '8000 kg Straße / 4000 kg Gelände', a680g: 'max. 8000 kg' },
      { label: 'Höchstgeschwindigkeit', m680: '79,7 km/h (5. Gang, Straßengang)', m680m3: 'wie 680M (gleiche Übersetzungen)', a680g: '77,8 km/h (5. Gang, Straßengang)' },
      { label: 'Steigvermögen', m680: '62 % ohne / 36 % mit Anhänger', m680m3: '59 % ohne / 32 % mit Anhänger', a680g: '53 % Straßengang / 102,7 % Geländegang (8400 kg)' },
    ],
  },
  {
    title: 'Füllmengen (A 680 g lt. Betriebsanleitung S. 134)',
    rows: [
      { label: 'Motoröl', m680: 'siehe Wartungs-/Schmierplan', m680m3: 'siehe Wartungs-/Schmierplan', a680g: '15,5 l' },
      { label: 'Ölbadluftfilter', m680: '—', m680m3: '—', a680g: '2,5 l Motoröl' },
      { label: 'Wechselgetriebe', m680: '—', m680m3: '—', a680g: '5,3 l Hypoid-Getriebeöl' },
      { label: 'Verteilergetriebe', m680: '—', m680m3: '—', a680g: '2,5 l Hypoid-Getriebeöl' },
      { label: 'Hinterachse / Vorderachse', m680: '—', m680m3: '—', a680g: '7,0 l / 2,5 l Hypoid-Getriebeöl' },
      { label: 'Lenkung', m680: '—', m680m3: '—', a680g: '0,8 l Hypoid-Getriebeöl' },
      { label: 'Bremshydraulik / Kupplungshydraulik', m680: '—', m680m3: '—', a680g: '0,7 l / 0,25 l Bremsflüssigkeit' },
      { label: 'Kraftstofftank', m680: '—', m680m3: '—', a680g: '120 l Diesel' },
      { label: 'Kühlanlage', m680: '—', m680m3: '—', a680g: '25 l Wasser' },
      { label: 'Seilwinde', m680: 'Martin, 4500 kp Zugkraft (Antrieb vom Verteilergetriebe)', m680m3: 'wie 680M', a680g: '1,8 l Hochdrucköl' },
    ],
  },
]

export const SPEC_SOURCES = [
  { docId: 'm-techdaten', label: 'Werksdatenblatt Typ 680M / 680M3 (Techn. Archiv)' },
  { docId: 'g-betrieb-2aufl', label: 'Betriebsanleitung A 680 g, 2. Aufl., Technische Daten S. 126–134', page: 127 },
]
