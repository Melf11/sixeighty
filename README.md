# Steyr 680 — Digitales Nachschlagewerk

Nuxt-4-Webapp als Schrauber- und Restaurierungshilfe für Steyr 680 M / 680 M3 / A 680 g,
auf Basis der eigenen Werksunterlagen im Ordner `680/`.

## Starten

```bash
npm install
npm run dev        # → http://localhost:3000
```

## Bereiche

| Route | Inhalt |
|---|---|
| `/dokumente` | Alle 43 Werksunterlagen (OCR-PDFs) mit Filter nach Modell/Kategorie, Viewer mit Blatt-Sprung |
| `/suche` | Seitengenaue Volltextsuche über den OCR-Text aller Dokumente |
| `/teile` | Teilenummern-Suche in Bestandteillisten/Ersatzteilkatalogen + Normteile-Tabelle (Bosch/FRAM/ZF) |
| `/modelle` | Modellvergleich mit Werksdaten (Quellen: Werksdatenblatt 680M/M3, Betriebsanleitung A680g) |
| `/fehleranalyse` | Symptom → Ursache → Abhilfe mit Fundstellen im Archiv |
| `/wartung` | Parkdienst-Systematik, Schmierplan, Füllmengen |

Das eigene Fahrzeug lässt sich oben rechts wählen (Cookie) und wird überall bevorzugt.

## Daten-Pipeline

```
680/  (Original-Scans, unangetastet)
  │  scripts/ocr-all.sh          ← ocrmypdf -l deu, wiederaufnehmbar, Log: scripts/ocr.log
  ▼
public/docs/  (durchsuchbare PDFs, gleiche Ordnerstruktur)
  │  npm run index               ← pdftotext je Seite → MiniSearch-Rohdaten
  ▼
server/assets/search/pages.json  → /api/search (MiniSearch, lazy geladen)
```

- **Neue Scans hinzufügen:** PDF unter `680/` ablegen, Eintrag in `app/data/docs.ts` ergänzen,
  dann `npm run ocr && npm run index` und Dev-Server neu starten.
- Beide Skripte überspringen bereits Verarbeitetes und können jederzeit erneut laufen.

Voraussetzungen für die Pipeline: `ocrmypdf`, `tesseract` (+ `tesseract-lang` für Deutsch),
`pdftotext` (poppler) — alles via Homebrew.

## Deployment (Production, Debian vServer)

Automatisiert über **GitHub Actions**: ein Git-Tag `vX.Y.Z` baut das Docker-Image,
pusht es nach **GHCR** (`ghcr.io/melf11/sixeighty`) und deployt per SSH auf den Server
(`docker-compose.prod.yml`, nur App — keine Datenbank, der Suchindex ist ins Image
eingebacken). TLS und Routing übernimmt der zentrale Caddy-Proxy
([web-caddy](https://github.com/Melf11/web-caddy)) über das externe Docker-Netz
`proxy` (Upstream-Alias: `sixeighty-app`, Domain: **680.melfstoecken.de**).

Damit die CI ohne OCR-Lauf bauen kann, sind `public/docs/` (OCR-PDFs, ~214 MB) und
`server/assets/search/` (Index) **eingecheckt** — nur die Original-Scans (`680/`)
bleiben lokal.

### Einmalige Server-Vorbereitung
```bash
sudo mkdir -p /opt/sixeighty && sudo chown "$USER" /opt/sixeighty
# Proxy-Netz + zentraler Caddy existieren bereits (web-caddy-Repo)
```

- **DNS:** A-Record `680.melfstoecken.de` auf die Server-IP zeigen lassen
  (der Wildcard `*.melfstoecken.de` zeigt woanders hin und greift sonst!).
- **Caddy:** Site-Block im web-caddy-Repo (`reverse_proxy sixeighty-app:3000`).

### GitHub Secrets (Repo → Settings → Secrets → Actions)
| Secret | Wert |
|---|---|
| `DEPLOY_HOST` | Server-IP/Hostname |
| `DEPLOY_USER` | SSH-Benutzer |
| `DEPLOY_SSH_KEY` | privater Deploy-Key |
| `DEPLOY_PATH` | `/opt/sixeighty` |
| `DEPLOY_PORT` | optional, Default `22` |

### Release
```bash
git tag v1.1.0 && git push origin main --tags
```

Der Tag landet über die Build-Args `APP_VERSION`/`GIT_SHA`/`BUILD_TIME` im Image
und erscheint im **Footer** als „Ausgabe v1.1.0 · 703b6bb · 18.08.2026".
Ohne gesetzte Variablen (lokaler Dev-Server) steht dort rot „Entwicklung" —
so ist auf einen Blick klar, ob man einen Release oder den Dev-Stand vor sich hat.

## Mobil & PWA

Am Telefon läuft die App mit eigener Navigation statt der Desktop-Registerkarten:

- **Tab-Leiste unten** (Start · Doku · Suche · Teile · Mehr) — „Mehr" öffnet ein
  aufsteigendes Blatt mit Fehleranalyse, Modellvergleich, Wartung und Fahrzeugwahl.
- **Fahrzeugwahl** als eigene Seite (`/fahrzeug`) statt Dropdown im Kopf.
- **PDFs** werden am Telefon im System-Viewer geöffnet statt in einem `<iframe>` —
  iOS Safari rendert eingebettete PDFs unzuverlässig. Ab Tablet bleibt der eingebettete
  Betrachter.
- Safe-Area-Abstände (Notch/Home-Indicator), 16-px-Eingabefelder gegen das iOS-Auto-Zoom,
  Touchziele ≥ 44 px.

**Installation auf dem iPhone:** Seite in Safari öffnen → Teilen → „Zum Home-Bildschirm".
Die App startet dann ohne Browserleiste (`display: standalone`).

### Offline-Betrieb

Unter **`/offline`** entscheidet der Nutzer, was mitkommt — nichts wird ungefragt
geladen. Drei Stufen:

| Stufe | Größe | Inhalt |
|---|---|---|
| Die App selbst | ~1,5 MB | Alle Seiten inkl. Fehleranalyse, Modellvergleich, Wartung, Normteile |
| Volltextsuche | ~2 MB | 4.491 Seiten; Index wandert in IndexedDB, Suche läuft dann im Gerät |
| PDFs | 17–20 MB je Werkstatt-Paket | Einzeln wählbar oder als Paket je Fahrzeug |

Drei Ablagen mit unterschiedlicher Lebensdauer:

- `shell-<version>` (Cache API) — **an die Ausgabe gekoppelt**: nach einem Deploy
  wird der alte Stand verworfen, es läuft nie eine Mischung aus altem und neuem Code.
- `sixeighty-docs` (Cache API) — die gewählten PDFs, **überleben Updates**; die Scans
  ändern sich nie und 200 MB erneut zu laden wäre unsinnig.
- IndexedDB — der Suchindex, mit Versionsstempel. Weicht er von der App-Version ab,
  weist `/offline` darauf hin und bietet „Index erneuern" an.

`/api/*` geht immer ans Netz, damit weder Server-Suche noch Index-Download je aus
einem veralteten Cache beantwortet werden.

**Wichtig beim Bereitstellen der App-Hülle:** Es genügt nicht, das HTML zu cachen —
ohne die JS-Bausteine der einzelnen Seiten lassen sich offline nur Seiten öffnen, die
man vorher schon besucht hat. `warmAppShell()` holt deshalb beides
(`preloadRouteComponents` + HTML je Route).

Die Suche nutzt den lokalen Index, sobald er da ist (auch online — schneller), und
fällt bei Serverausfall darauf zurück. Ergebnisse aus dem Gerät sind mit „vom Gerät"
gekennzeichnet. Die Logik in `useLocalSearch.ts` spiegelt `server/api/search.get.ts`
bewusst 1:1, damit online und offline dieselben Treffer erscheinen.

> CSS-Hinweis: Eigene Komponentenklassen (`.plate`, `.field`, `.stamp` …) liegen in
> `@layer components`, damit Tailwind-Utilities wie `hidden` oder `w-16` sie überschreiben
> können — ohne Layer bräuchte jede Ausnahme ein `!`.

## Begleitforum

Unter **forum.680.melfstoecken.de** läuft ein Flarum-Forum
([Repo: forum-680](../forum-680)). Es ist absichtlich eng an das Nachschlagewerk
gekoppelt statt danebengestellt:

- Die **Forumsbereiche entsprechen den Baugruppen** der Fehleranalyse. Die
  Zuordnung steht in `app/data/forum.ts` — ändert sich drüben ein Tag-Kürzel,
  wird es nur dort nachgezogen.
- Jedes Fehlerbild und jedes Dokument zeigt über `<ForumHinweis>` passende
  Themen aus dem Forum und führt mit einem Klick dorthin.
- Gibt es zum Symptom nichts, erscheint stattdessen das Neueste aus dem
  passenden Bereich (`fallback: true`) — besser als eine leere Fläche.

Abgefragt wird über `server/api/forum/threads.get.ts`: serverseitig, fünf
Minuten zwischengespeichert, 2,5 s Zeitlimit. **Das Forum darf die App nie
ausbremsen** — bei Ausfall kommt eine leere Liste zurück und der Abschnitt
entfällt einfach.

Zwei Eigenheiten von Flarums Suche, die den Aufbau erklären:

- `filter[tag]` wird ignoriert, sobald `filter[q]` gesetzt ist. Der Bereich muss
  deshalb als `tag:kuerzel` **in die Suchzeichenkette** hinein.
- Die Suche ist großzügig (findet auch bei teilweiser Übereinstimmung). Ganze
  Symptomsätze liefern daher beliebige Treffer — die Route zieht stattdessen die
  tragenden Begriffe heraus (Wörter ab fünf Zeichen, ohne Füllwörter).

Die Adresse steht in `runtimeConfig.public.forumUrl`, überschreibbar per
`NUXT_PUBLIC_FORUM_URL` — ein Umzug kostet eine Zeile.

## Umgang mit Dubletten

Die Sammlung enthält denselben Inhalt teilweise mehrfach — die Werkstatt-Register 1–11
sind Zweitscans der Kapitel aus dem Reparaturhandbuch 680 M (Textabgleich: 82–100 %
Deckung). Statt sie zu löschen:

- **Bibliothek** (`LIBRARY_DOCS`) blendet Dokumente mit `excerptOf` aus → 32 statt 43 Einträge.
- **Reparaturhandbuch** bekommt stattdessen ein **Kapitelregister** (`REPAIR_CHAPTERS`),
  das direkt auf die Blattnummern springt und den jeweiligen Zweitscan verlinkt.
- **Suche** fasst inhaltsgleiche Seiten zu einem Treffer zusammen (Cluster werden beim
  Index-Build über Shingle-Ähnlichkeit erkannt) und zeigt die weiteren Fundorte als
  „Gleiche Seite auch in: …".
- Alle PDFs bleiben auf der Platte und über `/dokumente/<id>` erreichbar — bei schlecht
  lesbaren Stellen ist der Zweitscan oft die bessere Vorlage.

Nicht entfernt wurden Dokumente mit eigenständigem Inhalt, u. a. die Bestandteillisten
aus Register 12 (bis 100 % einzigartig) und der Ersatzteilkatalog der Schweizer Armee
(60 % einzigartig gegenüber dem A680g-Katalog).

## Kuratierte Daten

- `app/data/specs.ts` — Modellvergleich (aus den Original-Datenblättern übertragen)
- `app/data/faults.ts` — Fehleranalyse-Datenbank
- `app/data/wartung.ts` — Wartungspläne und bekannte Zulieferteile-Nummern
- `app/data/docs.ts` — Dokumenten-Manifest (Titel, Modell, Kategorie, Seitenzahl)

## Zustand & Browser-Navigation

Filter, Suchbegriffe und die Blattnummer im Betrachter leben **in der URL**, nicht
nur in einem `ref`. Sonst wäre der Stand nach „Zurück" verloren, weil die
Seitenkomponente neu aufgebaut wird.

Dafür gibt es `useQueryState(key)` bzw. `useQueryNumber(key)`
(`app/composables/useQueryState.ts`):

- schreibt Änderungen mit `router.replace` (kein History-Eintrag pro Tastendruck)
- liest bei Vor/Zurück aus der URL zurück
- bündelt gleichzeitige Änderungen in einem Microtask, damit sich zwei Filter
  nicht gegenseitig aus der URL werfen

Verwendet auf `/suche`, `/teile`, `/dokumente`, `/fehleranalyse` und im
Dokumentbetrachter. Nebeneffekt: Jeder Stand ist als Link teilbar.
