#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Gerando .gz (nível 9)…"
FILES=(
  "index.html"
  "offline.html"
  "manifest.webmanifest"
  "service-worker.js"
)

for f in "${FILES[@]}"; do
  if [[ -f "$f" ]]; then
    gzip -c -9 "$f" > "$f.gz"
    printf " - %-22s -> %s.gz\n" "$f" "$f"
  fi
done

echo "==> Feito."
