// Kuratierte Fehleranalyse für Steyr 680 (WD 609/610-Motorenfamilie).
// Verweise zeigen auf die passenden Dokumente im Archiv; Detailwerte immer
// im jeweiligen Handbuch gegenprüfen.

export interface FaultCause {
  cause: string
  check: string
  remedy: string
}

export interface Fault {
  id: string
  symptom: string
  system: string
  hints?: string
  causes: FaultCause[]
  docs: { docId: string, label: string }[]
}

export const FAULT_SYSTEMS = [
  'Motor & Startanlage',
  'Kraftstoffanlage',
  'Kühlung & Schmierung',
  'Kupplung & Getriebe',
  'Bremsanlage',
  'Lenkung & Fahrwerk',
  'Elektrik (24 V)',
] as const

export const FAULTS: Fault[] = [
  {
    id: 'start-dreht-nicht',
    symptom: 'Anlasser dreht nicht oder nur schwach',
    system: 'Motor & Startanlage',
    causes: [
      { cause: 'Batterien entladen oder Zellenschluss (2 × 12 V in Serie)', check: 'Ruhespannung messen: unter ca. 24,4 V am Gesamtverbund ist die Ladung schwach; jede Batterie einzeln prüfen', remedy: 'Laden bzw. defekte Batterie ersetzen; Serienschaltung auf gleiche Kapazität/Alter achten' },
      { cause: 'Übergangswiderstände an Masse- und Polklemmen', check: 'Klemmen und Masseband auf Korrosion prüfen, Spannungsabfall unter Last messen (> 0,5 V pro Übergang ist zu viel)', remedy: 'Kontakte blank machen, festziehen, Polfett auftragen' },
      { cause: 'Anlasser (Bosch 24 V 4 PS) — Kohlebürsten oder Magnetschalter verschlissen', check: 'Klackt der Magnetschalter? Direktprüfung mit Überbrückung (Vorsicht: Gang heraus!)', remedy: 'Anlasser überholen; Bürsten und Lager beim Instandsetzer erneuern lassen' },
      { cause: 'Hauptschalter / Schaltkasten defekt (A680g: Position 0–3)', check: 'Spannung hinter dem Schaltkasten prüfen', remedy: 'Kontakte reinigen oder Schalter ersetzen' },
    ],
    docs: [
      { docId: 'r10-elektrik', label: 'Register 10 — Elektrische Anlage' },
      { docId: 'g-betrieb-2aufl', label: 'Betriebsanleitung A680g: Elektrische Anlage / Batterien' },
    ],
  },
  {
    id: 'start-springt-nicht-an',
    symptom: 'Anlasser dreht, Motor springt aber nicht an',
    system: 'Motor & Startanlage',
    hints: 'Beim Vorkammermotor (WD 609r/609er) zuerst die Glühanlage prüfen — Direkteinspritzer (WD 610.x) brauchen bei mäßiger Kälte keine Vorglühung.',
    causes: [
      { cause: 'Kein Kraftstoff an der Einspritzpumpe (Tank, Filter, Förderpumpe)', check: 'Entlüftungsschraube am Filter/an der Pumpe öffnen: kommt blasenfreier Diesel?', remedy: 'Anlage entlüften, Filtereinsätze (z. B. FRAM C-11860) erneuern, Vorförderpumpe prüfen' },
      { cause: 'Luft im Kraftstoffsystem nach Filterwechsel oder leergefahrenem Tank', check: 'Schaumiger Diesel an der Entlüftung', remedy: 'Systematisch von Filter bis Pumpe entlüften, Leckstellen an Saugleitung suchen' },
      { cause: 'Glühanlage ohne Funktion (Vorkammermotoren)', check: 'Glühüberwachung/Glühwendel beobachten; Strom messen. 680M: Glühstiftkerzen Bosch 0 250 200 031, 680M3: Glühspirale', remedy: 'Defekte Kerzen/Spirale ersetzen, Zuleitung und Glühwiderstand prüfen' },
      { cause: 'Abstellzug/Stoppeinrichtung nicht in Fahrstellung', check: 'Stellung des Abstellzuges an der Einspritzpumpe kontrollieren', remedy: 'Zug gangbar machen und richtig einstellen' },
      { cause: 'Falscher Förderbeginn nach Arbeiten an der Einspritzpumpe', check: 'Förderbeginn prüfen (A680g WD 610r: 22 ± 1° vor OT)', remedy: 'Pumpe nach Reparaturhandbuch neu einstellen' },
    ],
    docs: [
      { docId: 'm-reparatur', label: 'Reparaturhandbuch 680M/M3: Kraftstoffanlage' },
      { docId: 'g-betrieb-2aufl', label: 'Betriebsanleitung A680g: Einspritzpumpe und Düsen (ab S. 42)' },
      { docId: 'r1-motor', label: 'Register 1 — Motor' },
    ],
  },
  {
    id: 'schwarzer-rauch',
    symptom: 'Motor raucht schwarz, Leistung normal oder träge',
    system: 'Kraftstoffanlage',
    causes: [
      { cause: 'Ölbadluftfilter verschmutzt oder Ölstand darin zu hoch', check: 'Filter öffnen: Ölbad verschlammt? Ölstand über Marke?', remedy: 'Filter reinigen, frisches Öl bis zur Marke (A680g: 2,5 l)' },
      { cause: 'Einspritzdüsen verkokt oder Abspritzdruck zu niedrig', check: 'Düsen abdrücken lassen (Sollwerte je Motor: 120–230 atü, siehe Datenblatt)', remedy: 'Düsen reinigen/einstellen, defekte Düsenelemente (Bosch DLL 50 S 226 beim A680g) erneuern' },
      { cause: 'Zu viel Fördermenge / Regler verstellt', check: 'Plombierung der Einspritzpumpe kontrollieren', remedy: 'Pumpe auf Prüfstand einstellen lassen' },
      { cause: 'Ventilspiel falsch', check: 'Ventilspiel kalt messen: Einlaß 0,2 mm, Auslaß 0,3 mm (A680g) bzw. 0,35 mm (680M/M3)', remedy: 'Ventile einstellen' },
    ],
    docs: [
      { docId: 'r1-motor', label: 'Register 1 — Motor' },
      { docId: 'm-techdaten', label: 'Werksdatenblatt: Einspritzausrüstung' },
    ],
  },
  {
    id: 'blauer-weisser-rauch',
    symptom: 'Motor raucht blau oder weiß',
    system: 'Kühlung & Schmierung',
    hints: 'Blau = Ölverbrennung, Weiß = unverbrannter Kraftstoff oder Wasser.',
    causes: [
      { cause: 'Ölverbrauch durch verschlissene Kolbenringe/Zylinderbüchsen (blau)', check: 'Öl-Verbrauchsmeßfahrt durchführen und Kompression prüfen', remedy: 'Motorüberholung: Büchsen (trockene Zylinderlaufbüchsen) und Ringe erneuern' },
      { cause: 'Ventilschaftabdichtung/Führungen verschlissen (blau, v. a. im Schiebebetrieb)', check: 'Rauchbild nach Bergabfahrt beobachten', remedy: 'Zylinderkopf überholen' },
      { cause: 'Motor zu kalt / Thermostat oder Jalousie offen hängend (weiß)', check: 'Betriebstemperatur erreicht 80–90 °C?', remedy: 'Thermostat erneuern, Jalousie/Winterabdeckung nutzen' },
      { cause: 'Zylinderkopfdichtung defekt, Wasser im Brennraum (weiß, süßlicher Geruch)', check: 'Kühlwasserstand fällt? Blasen im Kühler bei laufendem Motor?', remedy: 'Kopfdichtung erneuern, Kopf planen lassen' },
    ],
    docs: [
      { docId: 'r11-oelverbrauch', label: 'Register 11 — Öl-Verbrauchsmeßfahrt' },
      { docId: 'r1-motor', label: 'Register 1 — Motor' },
    ],
  },
  {
    id: 'oeldruck-zu-niedrig',
    symptom: 'Öldruck zu niedrig / Öldruck-Kontrollleuchte leuchtet',
    system: 'Kühlung & Schmierung',
    hints: 'Sollwert: mindestens 1 atü im Leerlauf bei warmem Motor. Die Kontrollleuchte spricht unter ca. 0,5 atü an.',
    causes: [
      { cause: 'Ölstand zu niedrig', check: 'Peilstab bei waagrecht stehendem Fahrzeug', remedy: 'Nachfüllen (A680g Füllmenge 15,5 l)' },
      { cause: 'Ölfilter verstopft (Hauptstrom-Feinfilter)', check: 'Wartungsintervall überschritten?', remedy: 'Filtereinsatz erneuern (680M: FRAM 11E-01875 CH-956 PL)' },
      { cause: 'Öldruckgeber/Manometer defekt', check: 'Mechanisches Prüfmanometer anschließen und vergleichen', remedy: 'Geber oder Instrument ersetzen' },
      { cause: 'Lagerverschleiß (Kurbelwelle: 7 Stahl-Alu-Zweistofflager)', check: 'Druck fällt mit steigender Öltemperatur stark ab, Lagergeräusche', remedy: 'Motor überholen, Lagerschalen erneuern' },
      { cause: 'Überdruckventil der Doppelzahnradpumpe hängt', check: 'Druck auch kalt zu niedrig', remedy: 'Ventil reinigen/einstellen nach Reparaturhandbuch' },
    ],
    docs: [
      { docId: 'r1-motor', label: 'Register 1 — Motor' },
      { docId: 'm-reparatur', label: 'Reparaturhandbuch 680M/M3: Schmierung' },
    ],
  },
  {
    id: 'motor-ueberhitzt',
    symptom: 'Motor wird zu heiß (über 90 °C)',
    system: 'Kühlung & Schmierung',
    causes: [
      { cause: 'Kühlwassermangel / Undichtigkeit', check: 'Stand im Kühler, Schläuche, Wasserpumpe (Tropfbohrung) kontrollieren', remedy: 'Nachfüllen, Undichtigkeit beheben; A680g Füllmenge 25 l' },
      { cause: 'Thermostat öffnet nicht', check: 'Oberer Kühlerschlauch bleibt kalt, während Motor heiß wird', remedy: 'Thermostat prüfen (in heißem Wasser) bzw. erneuern' },
      { cause: 'Kühlerjalousie geschlossen', check: 'Jalousiestellung', remedy: 'Öffnen — nur bei Kaltstart/Winter schließen' },
      { cause: 'Keilriemen der Wasserpumpe rutscht', check: 'Riemenspannung (A680g: Schmalkeilriemen 9,5×950 DIN 7753)', remedy: 'Nachspannen oder erneuern' },
      { cause: 'Kühler außen verlegt (Insekten, Staub) oder innen verkalkt', check: 'Sichtprüfung, Temperaturverteilung', remedy: 'Kühler ausblasen/spülen, ggf. entkalken' },
    ],
    docs: [
      { docId: 'g-betrieb-2aufl', label: 'Betriebsanleitung A680g: Kühlanlage (ab S. 57)' },
      { docId: 'r1-motor', label: 'Register 1 — Motor' },
    ],
  },
  {
    id: 'kupplung-rutscht',
    symptom: 'Kupplung rutscht oder trennt nicht',
    system: 'Kupplung & Getriebe',
    causes: [
      { cause: 'Kein Spiel am Ausrücksystem / Hydraulik betätigt dauernd', check: 'Pedalspiel und Geberzylinder-Ausgleichsbohrung prüfen', remedy: 'Spiel nach Handbuch einstellen, Hydraulik entlüften (Bremsflüssigkeit, A680g: 0,25 l)' },
      { cause: 'Belag verölt (Simmerring Kurbelwelle/Getriebeeingang undicht)', check: 'Ölspuren an der Kupplungsglocke', remedy: 'Wellendichtringe und Beläge erneuern' },
      { cause: 'Belag verschlissen (F&S G 310K Einscheiben-Trockenkupplung)', check: 'Rutscht zuerst im großen Gang bergauf', remedy: 'Kupplungsscheibe erneuern, Druckplatte prüfen' },
      { cause: 'Kupplung trennt nicht: Luft in der Hydraulik oder Scheibe auf Verzahnung fest', check: 'Pedalweg schwammig? Fahrzeug lange gestanden?', remedy: 'Entlüften; festgerostete Scheibe durch Anlassen im Gang mit getretener Kupplung lösen (Vorsicht, freie Fläche!)' },
    ],
    docs: [
      { docId: 'g-betrieb-2aufl', label: 'Betriebsanleitung A680g: Kupplung (ab S. 69)' },
      { docId: 'm-reparatur', label: 'Reparaturhandbuch 680M/M3: Kupplung' },
    ],
  },
  {
    id: 'getriebe-springt-raus',
    symptom: 'Gang springt heraus oder lässt sich schwer schalten',
    system: 'Kupplung & Getriebe',
    hints: 'Das Steyr-Allklauengetriebe verlangt sauberes Zwischengas (Hochschalten: zügig; Zurückschalten: Zwischengas mit Kupplung zweimal treten).',
    causes: [
      { cause: 'Schaltklauen/Schiebemuffen verschlissen (Klauengetriebe ohne Synchronisierung)', check: 'Springt unter Last in bestimmtem Gang heraus', remedy: 'Getriebe öffnen, Klauen und Muffen erneuern — siehe Register 2' },
      { cause: 'Arretierung (Rastenfedern/Kugeln) der Schaltstangen ermüdet', check: 'Schalthebel wandert unter Vibration', remedy: 'Federn und Rastkugeln erneuern' },
      { cause: 'Falsches oder zu wenig Getriebeöl', check: 'Ölstand/Sorte (Hypoid-Getriebeöl, A680g: 5,3 l)', remedy: 'Öl nach Betriebsstoffblatt wechseln' },
      { cause: 'Schaltgestänge ausgeschlagen', check: 'Spiel am Gestänge bei festgehaltenem Hebel', remedy: 'Buchsen/Gelenke erneuern, einstellen' },
    ],
    docs: [
      { docId: 'r2-getriebe', label: 'Register 2 — Getriebe' },
      { docId: 'r3-verteilergetriebe', label: 'Register 3 — Verteilergetriebe' },
    ],
  },
  {
    id: 'bremse-schwach',
    symptom: 'Bremswirkung schwach oder Pedal geht durch',
    system: 'Bremsanlage',
    hints: 'Zweikreis-Hydraulikbremse mit Druckluftunterstützung — beide Medien prüfen! Betriebsdruck Druckluft: 7,3 atü (680M/M3).',
    causes: [
      { cause: 'Luft im Hydrauliksystem', check: 'Pedal federt/geht durch, Bremsflüssigkeitsstand', remedy: 'Anlage entlüften, auf Undichtigkeiten prüfen; alte Bremsflüssigkeit generell erneuern' },
      { cause: 'Radbremszylinder oder Hauptzylinder undicht (Standschäden!)', check: 'Feuchte Stellen an Radinnenseiten, Flüssigkeitsverlust', remedy: 'Zylinder überholen (Manschetten) oder erneuern, Beläge entfetten/ersetzen' },
      { cause: 'Zu wenig Druckluftunterstützung', check: 'Bremsluft-Manometer: baut der Kompressor auf Solldruck auf? Anlage auf Dichtheit abhorchen', remedy: 'Leckstellen beheben, Kompressor/Druckregler prüfen — Register 7' },
      { cause: 'Beläge verglast, verölt oder Trommeln riefig', check: 'Trommeln ziehen und Sichtprüfung', remedy: 'Beläge erneuern, Trommeln ausdrehen lassen' },
      { cause: 'Einseitiges Ziehen: ungleich eingestellte Bremsen oder defekter Zylinder', check: 'Bremsprobe auf ebener, freier Fläche', remedy: 'Nachstellen nach Handbuch, defekte Teile ersetzen' },
    ],
    docs: [
      { docId: 'r7-bremsen', label: 'Register 7 — Bremsen' },
      { docId: 'g-betrieb-2aufl', label: 'Betriebsanleitung A680g: Bremsanlage / Druckluftanlage (ab S. 101)' },
    ],
  },
  {
    id: 'druckluft-faellt',
    symptom: 'Druckluftvorrat baut sich nicht auf oder fällt über Nacht ab',
    system: 'Bremsanlage',
    causes: [
      { cause: 'Undichte Leitungen/Anschlüsse', check: 'Anlage auf Betriebsdruck bringen, Motor abstellen, Manometer beobachten; Lecksuche mit Seifenwasser', remedy: 'Verschraubungen nachziehen, Leitungen erneuern' },
      { cause: 'Entwässerungsventile der Kessel undicht oder Kessel korrodiert', check: 'Kessel entwässern (gehört zum Tagesdienst!) — kommt viel Wasser/Öl?', remedy: 'Ventile erneuern; stark korrodierte Kessel ersetzen (Sicherheit!)' },
      { cause: 'Kompressor fördert nicht (Ventilplatten verschlissen)', check: 'Aufbauzeit bis Solldruck stoppen', remedy: 'Kompressor überholen' },
      { cause: 'Druckregler falsch eingestellt oder defekt', check: 'Abschaltdruck kontrollieren', remedy: 'Einstellen/ersetzen nach Register 7' },
      { cause: 'Anhängerbremsventil bläst ab', check: 'Abhorchen am Kupplungskopf', remedy: 'Ventil überholen' },
    ],
    docs: [
      { docId: 'r7-bremsen', label: 'Register 7 — Bremsen' },
    ],
  },
  {
    id: 'lenkung-schwer',
    symptom: 'Lenkung schwergängig oder mit viel Spiel',
    system: 'Lenkung & Fahrwerk',
    hints: '680M/M3: ZF-Spindelhydrolenkung 7419 (20:1) · A680g: mechanische ZF-Gemmer GD 68.',
    causes: [
      { cause: 'Ölstand im Lenkgetriebe zu niedrig', check: 'Füllstand prüfen (A680g: 0,8 l Hypoidöl)', remedy: 'Nachfüllen, Undichtigkeit an Wellendichtringen beheben' },
      { cause: 'Hydrolenkung (680M): Pumpe/Filter oder Ölstand', check: 'Vorratsbehälter, Riemen der Lenkpumpe, Geräusch beim Einschlagen', remedy: 'System nach Register 8 prüfen und entlüften' },
      { cause: 'Spurstangenköpfe/Lenkzwischenhebel ausgeschlagen', check: 'Helfer lenken lassen, Gelenke auf Spiel beobachten', remedy: 'Köpfe erneuern, danach Vorspur einstellen (680M: 0–4 mm)' },
      { cause: 'Achsschenkelbolzen fest (mangelnde Abschmierung)', check: 'Schwergängig auch aufgebockt ohne Last', remedy: 'Bolzen und Buchsen erneuern, Schmierplan einhalten' },
      { cause: 'Reifendruck zu niedrig', check: 'Solldruck: 680M vorne 5,5 atü / A680g 6 atü', remedy: 'Korrigieren' },
    ],
    docs: [
      { docId: 'r8-hydrolenkung', label: 'Register 8 — Hydrolenkung' },
      { docId: 'r9-vorderachse', label: 'Register 9 — Vorderachse' },
      { docId: 'g-betrieb-2aufl', label: 'Betriebsanleitung A680g: Lenkung (ab S. 94)' },
    ],
  },
  {
    id: 'allrad-sperre',
    symptom: 'Allrad oder Differentialsperre schaltet nicht',
    system: 'Lenkung & Fahrwerk',
    hints: 'Sperre nur im Stand bzw. bei Schrittgeschwindigkeit ohne Radschlupf schalten; Kontrollleuchten: Allrad grün, Sperre grün.',
    causes: [
      { cause: 'Druckluftbetätigung der Sperre ohne Druck (680M/M3)', check: 'Vorratsdruck, Leitungen zum Schaltzylinder, Ventil', remedy: 'Leckstellen beheben, Schaltzylinder gangbar machen' },
      { cause: 'Schaltmuffe steht Zahn auf Zahn', check: 'Leuchte kommt erst nach kurzem Rollen', remedy: 'Normal — langsam rollen lassen, bis die Muffe einspurt' },
      { cause: 'Schaltgestänge/Seilzug zum Verteilergetriebe verstellt', check: 'Wege am Getriebe von Hand kontrollieren', remedy: 'Nach Register 3 einstellen' },
      { cause: 'Kontrollleuchte defekt (Schalter am Getriebe)', check: 'Funktion mechanisch prüfen, Schalter überbrücken', remedy: 'Schalter/Leuchtmittel (2 W) ersetzen' },
    ],
    docs: [
      { docId: 'r3-verteilergetriebe', label: 'Register 3 — Verteilergetriebe' },
      { docId: 'm-allrad', label: '680M Allrad — Beschreibung und Bedienung' },
    ],
  },
  {
    id: 'lima-laedt-nicht',
    symptom: 'Ladekontrollleuchte bleibt an / Batterie wird nicht geladen',
    system: 'Elektrik (24 V)',
    hints: 'Frühe Fahrzeuge: Gleichstrom-Lichtmaschine mit Regler, spätere: Drehstromgenerator (680M ab Fgst. 1765).',
    causes: [
      { cause: 'Keilriemen rutscht oder gerissen', check: 'Riemen (A680g Lichtmaschine: 12,5×1100 DIN 7753) prüfen', remedy: 'Spannen/erneuern' },
      { cause: 'Kohlebürsten der Lichtmaschine verschlissen', check: 'Bürstenlänge, Kollektor/Schleifringe verschmort?', remedy: 'Bürsten erneuern, Kollektor abdrehen lassen' },
      { cause: 'Regler defekt (Bosch bzw. RS/WCM 600 24 B beim A680g)', check: 'Ladespannung messen: Soll ca. 27,5–28,5 V bei mittlerer Drehzahl', remedy: 'Regler einstellen (Fachbetrieb) oder ersetzen' },
      { cause: 'Übergangswiderstand an Ladeleitung/Masse', check: 'Spannungsabfall zwischen Lichtmaschine B+ und Batterie messen', remedy: 'Anschlüsse reinigen und festziehen' },
    ],
    docs: [
      { docId: 'r10-elektrik', label: 'Register 10 — Elektrische Anlage' },
      { docId: 'g-betrieb-2aufl', label: 'Betriebsanleitung A680g: Elektrische Anlage / Schaltplan (ab S. 62)' },
    ],
  },
  {
    id: 'motor-klopft',
    symptom: 'Motor klopft, nagelt hart oder läuft unrund',
    system: 'Motor & Startanlage',
    causes: [
      { cause: 'Einzelner Zylinder setzt aus (Düse defekt)', check: 'Bei Leerlauf nacheinander die Druckleitungen an der Pumpe lockern — ändert sich das Laufgeräusch nicht, ist der Zylinder tot', remedy: 'Düse des betroffenen Zylinders abdrücken/erneuern' },
      { cause: 'Förderbeginn zu früh (hartes Nageln)', check: 'Einstellung prüfen (A680g: 22 ± 1° vor OT)', remedy: 'Einspritzpumpe korrekt einstellen' },
      { cause: 'Luft im Kraftstoffsystem (unregelmäßiges Sägen)', check: 'Entlüften und beobachten', remedy: 'Undichte Saugleitung/Vorfilter abdichten' },
      { cause: 'Lagerschaden (dumpfes Klopfen, drehzahlabhängig)', check: 'Öldruck kontrollieren, Metallabrieb im Öl?', remedy: 'Sofort stilllegen, Motor öffnen — Register 1 / Reparaturhandbuch' },
      { cause: 'Ventilspiel zu groß (helles Klappern)', check: 'Ventilspiel messen', remedy: 'Einstellen (0,2 / 0,3–0,35 mm kalt)' },
    ],
    docs: [
      { docId: 'r1-motor', label: 'Register 1 — Motor' },
      { docId: 'm-reparatur', label: 'Reparaturhandbuch 680M/M3: Motor' },
    ],
  },
  {
    id: 'achsen-heulen',
    symptom: 'Heulen oder Mahlen von Achsen / Verteilergetriebe',
    system: 'Lenkung & Fahrwerk',
    causes: [
      { cause: 'Ölmangel in Achse oder Verteilergetriebe', check: 'Füllstände (Hypoidöl!) an allen Gehäusen prüfen', remedy: 'Auffüllen; bei Metallspänen am Ablassmagnet: öffnen und befunden' },
      { cause: 'Kegelrad-Tragbild verstellt (Heulen unter Zug oder im Schub)', check: 'Geräusch lastabhängig? Tragbild mit Tuschierfarbe prüfen', remedy: 'Triebling/Tellerrad nach Register 5/6 einstellen' },
      { cause: 'Radlager verschlissen (drehzahlabhängiges Brummen, kurvenabhängig)', check: 'Aufgebockt Spiel und Lauf prüfen', remedy: 'Lager erneuern und mit korrektem Spiel einstellen' },
      { cause: 'Gelenkwellen: Kreuzgelenke/Schiebestück ausgeschlagen (Klacken bei Lastwechsel)', check: 'Von Hand auf Spiel prüfen', remedy: 'Gelenke erneuern, Schmierplan einhalten — Register 4' },
    ],
    docs: [
      { docId: 'r5-hinterachse', label: 'Register 5 — Hinterachse' },
      { docId: 'r6-hinterachse', label: 'Register 6 — Hinterachse' },
      { docId: 'r4-gelenkwellen', label: 'Register 4 — Gelenkwellen' },
      { docId: 'r9-vorderachse', label: 'Register 9 — Vorderachse' },
    ],
  },
]
