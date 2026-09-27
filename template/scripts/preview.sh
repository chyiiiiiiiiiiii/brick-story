#!/bin/zsh
# Quick look without a full render. Frames are 30 fps frame numbers; with no args, one frame per scene
# (mid-narration) plus the climax and the end card. Output: out/preview.png (contact sheet) + out/preview/*.png.
set -e
cd "$(dirname $0)/.."
PY=.venv/bin/python
$PY scripts/tts.py >/dev/null
$PY scripts/glyphs.py >/dev/null
$PY scripts/mosaic.py >/dev/null
$PY scripts/timeline.py >/dev/null
frames=("$@")
if (( ${#frames} == 0 )); then
  frames=($(python3 -c "
import json; t=json.load(open('src/data/timeline.json')); m=t['moments']
fs=[c['voice']['start']+c['voice']['dur']//2 for c in t['chapters']]
fs+=[x for x in (m['climax'] and m['climax']+20, m['endCard']+30) if x]
print(' '.join(str(min(f, t['total']-1)) for f in fs))"))
fi
npx remotion bundle src/index.ts --out-dir=build --log=error >/dev/null
mkdir -p out/preview
i=0
for f in $frames; do
  npx remotion still build Video30 out/preview/f${f}.png --frame=${f} --gl=angle --log=error &
  (( ++i % 4 == 0 )) && wait
done
wait
n=${#frames}; cols=$(( n < 5 ? n : 5 ))
args=(); for f in $frames; do args+=(-i out/preview/f${f}.png); done
if (( n == 1 )); then cp out/preview/f${frames[1]}.png out/preview.png; else
  ffmpeg -y -loglevel error "${args[@]}" -filter_complex "$(for i in $(seq 0 $((n-1))); do printf "[${i}]scale=360:-1[v${i}];"; done)$(for i in $(seq 0 $((n-1))); do printf "[v${i}]"; done)xstack=inputs=${n}:layout=$(python3 -c "print('|'.join(f'{(i%${cols})*360}_{(i//${cols})*640}' for i in range(${n})))")" out/preview.png
fi
echo "out/preview.png (${n} frames: ${frames})"
