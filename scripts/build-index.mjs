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

const target = join(root, 'server/assets/search/pages.json')
mkdirSync(dirname(target), { recursive: true })
writeFileSync(target, JSON.stringify(out))
console.log(`\nIndex: ${out.length} Seiten aus ${DOCS.length - missing} Dokumenten → server/assets/search/pages.json`)
if (missing) console.log(`${missing} Dokumente noch nicht OCRt — Skript später erneut ausführen.`)
