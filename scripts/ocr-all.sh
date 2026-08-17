#!/bin/bash
# OCR-Pipeline: verarbeitet alle Scans aus 680/ nach public/docs/
# - erhält die Original-Scans unverändert
# - erzeugt durchsuchbare PDFs (Textebene unter dem Scanbild)
# - überspringt bereits verarbeitete Dateien (wiederaufnehmbar)
set -uo pipefail

SRC="680"
DST="public/docs"
LOG="scripts/ocr.log"
JOBS="${OCR_JOBS:-4}"

cd "$(dirname "$0")/.."
mkdir -p "$DST"
: > "$LOG"

total=0; done_count=0; failed=0

find "$SRC" -name "*.pdf" -print0 | sort -z | while IFS= read -r -d '' f; do
  rel="${f#"$SRC"/}"
  out="$DST/$rel"
  mkdir -p "$(dirname "$out")"
  if [ -s "$out" ]; then
    echo "SKIP  $rel" >> "$LOG"
    continue
  fi
  echo "OCR   $rel" >> "$LOG"
  if ocrmypdf -l deu --jobs "$JOBS" --output-type pdf \
      --skip-text --optimize 1 --tesseract-timeout 300 \
      "$f" "$out" >> "$LOG" 2>&1; then
    echo "OK    $rel" >> "$LOG"
  else
    rc=$?
    # Fallback: Datei trotzdem bereitstellen (Kopie ohne OCR), damit der Viewer funktioniert
    echo "FAIL($rc) $rel — kopiere Original" >> "$LOG"
    cp "$f" "$out"
  fi
done

echo "DONE" >> "$LOG"
