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
git tag v1.0.0 && git push origin main --tags
```

## Kuratierte Daten

- `app/data/specs.ts` — Modellvergleich (aus den Original-Datenblättern übertragen)
- `app/data/faults.ts` — Fehleranalyse-Datenbank
- `app/data/wartung.ts` — Wartungspläne und bekannte Zulieferteile-Nummern
- `app/data/docs.ts` — Dokumenten-Manifest (Titel, Modell, Kategorie, Seitenzahl)
