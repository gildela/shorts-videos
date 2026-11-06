#!/bin/bash
# FÁBRICA 3D: one Short, end to end, no Claude in the loop: voice → words → static QA → check → cues → mix → sheet → video → cover.
#   bash make.sh <project-dir> <out-dir>
# Writes <out-dir>/<slug>.mp4, cover.jpg, sheet.jpg and appends a status line to <out-dir>/../batch.log
set -uo pipefail
mkdir -p "$2"; PROJ=$(cd "$1" && pwd); OUT=$(cd "$2" && pwd); FAC=$(cd "$(dirname "$0")/.." && pwd); SLUG=$(basename "$PROJ")
PY=${PY:-$HOME/.faceless-shorts/venv/bin/python}
export CHROME=${CHROME:-$(ls /opt/pw-browsers/chromium-*/chrome-linux64/chrome 2>/dev/null | head -1)}
mkdir -p "$OUT"; LOG="$OUT/make.log"; : > "$LOG"
step() { echo "== $1" >> "$LOG"; shift; "$@" >> "$LOG" 2>&1 || { echo "FAIL $SLUG at: $*" | tee -a "$LOG"; exit 1; }; }
# refresh the engine from the template so fixes reach every project (script.json is never touched)
cp -r "$FAC/template/src" "$FAC/template/tools" "$FAC/template/index.html" "$FAC/template/fonts" "$PROJ/"
cd "$PROJ"
step qa0 python3 "$FAC/bin/qa.py" . --pre
step voice "$PY" "$FAC/bin/voice.py" .
step words "$PY" "$FAC/bin/words.py" .
step qa python3 "$FAC/bin/qa.py" .
step check bash -c "node tools/capture.mjs check | tee /dev/stderr | grep -q 'CHECK OK'"
step cues node tools/capture.mjs cues
step mix "$PY" tools/mix.py .
step sheet node tools/capture.mjs sheet "$OUT/sheet.jpg" 2 7
step video node tools/capture.mjs video "$OUT/$SLUG.mp4"
SZ=$(stat -c %s "$OUT/$SLUG.mp4")
if [ "$SZ" -gt 40000000 ]; then step shrink ffmpeg -v error -y -i "$OUT/$SLUG.mp4" -c:v libx264 -crf 24 -preset slow -c:a aac -b:a 160k -movflags +faststart "$OUT/s.mp4"; mv "$OUT/s.mp4" "$OUT/$SLUG.mp4"; fi
step cover node tools/capture.mjs frames review/cover 1.5
cp review/cover/t1.50.jpg "$OUT/cover.jpg"
DUR=$(python3 -c "import json;print(json.load(open('data/lines.json'))['duration'])")
echo "OK $SLUG ${DUR}s $(( $(stat -c %s "$OUT/$SLUG.mp4") / 1000000 ))MB" | tee -a "$LOG"
