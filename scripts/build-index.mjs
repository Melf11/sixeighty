// Baut den Volltextindex aus den OCR-PDFs in public/docs/.
// Ergebnis: server/assets/search/pages.json  →  [{ d: docId, p: seite, t: text }]
// Aufruf: npm run index   (nach abgeschlossener OCR, jederzeit wiederholbar)
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DOCS } from '../app/data/docs.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = []
let missing = 0

for (const doc of DOCS) {
  const pdf = join(root, 'public/docs', doc.file)
  if (!existsSync(pdf)) {
    console.warn(`FEHLT  ${doc.file}`)
    missing++
    continue
  }
  let text
  try {
    text = execFileSync('pdftotext', ['-layout', pdf, '-'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    })
  } catch (e) {
    console.warn(`FEHLER ${doc.file}: ${e.message}`)
    continue
  }
  const pages = text.split('\f')
  let kept = 0
  pages.forEach((pageText, i) => {
    const clean = pageText.replace(/\s+/g, ' ').trim()
    if (clean.length < 20) return // Leer-/Bildseiten überspringen
    out.push({ d: doc.id, p: i + 1, t: clean })
    kept++
  })
  console.log(`OK     ${doc.id}: ${kept}/${pages.length} Seiten mit Text`)
}

// ————— Dublettenerkennung —————
// Viele Unterlagen überschneiden sich: die Werkstatt-Register sind großteils
// Fotokopien aus den Reparaturhandbüchern, die Ersatzteilkataloge teilweise
// dieselbe Ausgabe. Damit dieselbe Seite in der Suche nicht mehrfach erscheint,
// werden inhaltsgleiche Seiten hier zu Clustern zusammengefasst. Die Seite aus
// dem umfangreichsten Dokument (= vollständigste Quelle) wird zum Cluster-Kopf,
// die übrigen bekommen dieselbe `c`-Nummer und werden zur Suchzeit eingeklappt.

function shingles(text) {
  const words = text.toLowerCase().replace(/[^a-zäöüß0-9 ]/g, ' ').split(/\s+/).filter(Boolean)
  const set = new Set()
  for (let i = 0; i + 5 <= words.length; i++) set.add(words.slice(i, i + 5).join(' '))
  return set
}

// Kandidaten über gemeinsame seltene Shingles finden (statt O(n²) Vergleich)
const buckets = new Map()
const sigs = out.map((e) => {
  const sh = shingles(e.t)
  return sh.size >= 20 ? sh : null
})

out.forEach((e, i) => {
  const sh = sigs[i]
  if (!sh) return
  // 8 verteilte Shingles als Suchschlüssel
  const keys = [...sh]
  const step = Math.max(1, Math.floor(keys.length / 8))
  for (let k = 0; k < keys.length; k += step) {
    const key = keys[k]
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key).push(i)
  }
})

// Docs nach Umfang: das größere Dokument gewinnt als Primärquelle
const docPages = new Map()
for (const e of out) docPages.set(e.d, (docPages.get(e.d) ?? 0) + 1)

const parent = out.map((_, i) => i)
function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] } return x }
function union(a, b) {
  const ra = find(a); const rb = find(b)
  if (ra === rb) return
  // Wurzel = Seite aus dem umfangreicheren Dokument
  const better = docPages.get(out[ra].d) >= docPages.get(out[rb].d) ? ra : rb
  const other = better === ra ? rb : ra
  parent[other] = better
}

let compared = 0
for (const idxs of buckets.values()) {
  if (idxs.length < 2 || idxs.length > 40) continue // zu häufige Phrasen überspringen
  for (let a = 0; a < idxs.length; a++) {
    for (let b = a + 1; b < idxs.length; b++) {
      const i = idxs[a]; const j = idxs[b]
      if (out[i].d === out[j].d) continue // Dubletten innerhalb eines Dokuments belassen
      if (find(i) === find(j)) continue
      const si = sigs[i]; const sj = sigs[j]
      if (!si || !sj) continue
      compared++
      let inter = 0
      const [small, large] = si.size <= sj.size ? [si, sj] : [sj, si]
      for (const s of small) if (large.has(s)) inter++
      if (inter / small.size > 0.55) union(i, j)
    }
  }
}

// Cluster-IDs vergeben (nur für tatsächliche Dubletten)
const clusterOf = new Map()
let clusterCount = 0
out.forEach((e, i) => {
  const r = find(i)
  if (r === i) return
  if (!clusterOf.has(r)) { clusterOf.set(r, ++clusterCount) }
})
let dupePages = 0
out.forEach((e, i) => {
  const r = find(i)
  if (!clusterOf.has(r)) return
  e.c = clusterOf.get(r) // Cluster-Nummer
  if (r !== i) { e.dup = 1; dupePages++ } // Sekundärkopie
})

const target = join(root, 'server/assets/search/pages.json')
mkdirSync(dirname(target), { recursive: true })
writeFileSync(target, JSON.stringify(out))
console.log(`\nIndex: ${out.length} Seiten aus ${DOCS.length - missing} Dokumenten → server/assets/search/pages.json`)
console.log(`Dubletten: ${clusterCount} Seitencluster, ${dupePages} Sekundärkopien (werden in der Suche eingeklappt)`)
if (missing) console.log(`${missing} Dokumente noch nicht OCRt — Skript später erneut ausführen.`)
