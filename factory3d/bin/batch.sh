#!/bin/bash
# Build every project in a batch folder, one after another (each ~1-2 min for a 35 s Short).
#   bash batch.sh <batch-dir> <out-root>     batch-dir holds one sub-folder per Short, each with only script.json
# Result: <out-root>/<slug>/{<slug>.mp4,cover.jpg,sheet.jpg,make.log} and <out-root>/batch.log (one line per Short)
FAC=$(cd "$(dirname "$0")/.." && pwd); B=$(cd "$1" && pwd); OUTR=$2; mkdir -p "$OUTR"
for d in "$B"/*/; do
  [ -f "$d/script.json" ] || continue; s=$(basename "$d")
  bash "$FAC/bin/make.sh" "$d" "$OUTR/$s" | tail -1 | tee -a "$OUTR/batch.log"
done
