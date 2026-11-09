#!/bin/bash
# Processes the library props listed in tools/library/props.json into assets/models/{mid,low}/<slug>.glb
# (no high tier: props are small on screen). Needs assets/library (python3 tools/library/fetch.py, fetch_sketchfab.py, then
# node library/fix.mjs from tools/). Usage (from the repo root): tools/library/build_props.sh [slug ...]
set -u
cd "$(dirname "$0")/.."
OUT=$(cd .. && pwd)/assets/models
LIB=$(cd .. && pwd)/assets/library
SLUGS=("$@")
[ ${#SLUGS[@]} -eq 0 ] && mapfile -t SLUGS < <(node -e "console.log(Object.keys(require('./library/props.json')).join('\n'))")
: > library/props-results.jsonl
for s in "${SLUGS[@]}"; do
  read -r SRC MT LT MX LX < <(node -e "const p=require('./library/props.json')['$s'];console.log(p.src,p.midTris,p.lowTris,p.midTex,p.lowTex)")
  HIGH=0 MIDTRIS=$MT LOWTRIS=$LT MIDTEX=$MX LOWTEX=$LX node --max-old-space-size=8192 process.mjs "$LIB/$SRC" "$s" "$OUT" >> library/props-results.jsonl 2>library/props-$s.err && rm -f library/props-$s.err || echo "FAILED $s (see tools/library/props-$s.err)"
done
