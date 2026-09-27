#!/bin/zsh
# One command, story.json -> out/video.mp4 (1080x1920, 60 fps with motion blur, -14 LUFS) + out/*.srt.
set -e
cd "$(dirname $0)/.."
PY=.venv/bin/python
$PY scripts/tts.py
$PY scripts/glyphs.py >/dev/null
$PY scripts/mosaic.py >/dev/null
$PY scripts/timeline.py
npx -y tsx@4.19.2 scripts/export-sfx.ts
npx -y tsx@4.19.2 scripts/export-srt.ts
$PY scripts/audio.py
npx remotion bundle src/index.ts --out-dir=build --log=error >/dev/null
mkdir -p out
npx remotion render build Video120 out/raw120.mp4 --gl=angle --concurrency=${CONCURRENCY:-6} --muted --crf=12 --log=error
# 120 fps -> blend frame pairs -> 60 fps: real motion blur on every moving brick
ffmpeg -y -loglevel error -i out/raw120.mp4 -vf "tmix=frames=2,framestep=2,format=yuv420p" -r 60 -c:v libx264 -preset slow -crf 16 out/video60.mp4
rm -f out/raw120.mp4
# master: linear gain to about -14 LUFS; dense brick clicks overshoot in AAC, so lowpass the edge and cap peaks at -3.6 dBFS
I=$(ffmpeg -hide_banner -nostats -i audio/mix.wav -af ebur128 -f null - 2>&1 | awk '/Summary/{s=1} s&&/I:/{print $2; exit}')
G=$(python3 -c "print(round(-13.5 - (${I}), 2))")
ffmpeg -y -loglevel error -i audio/mix.wav -af "volume=${G}dB,alimiter=limit=0.66:attack=0.5:release=60:level=false,lowpass=f=16500" -ar 48000 out/master.wav
ffmpeg -y -loglevel error -i out/video60.mp4 -i out/master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k \
  -t $(ffprobe -v error -show_entries format=duration -of csv=p=0 out/video60.mp4) -movflags +faststart out/video.mp4
rm -f out/video60.mp4
ffmpeg -hide_banner -nostats -i out/video.mp4 -af ebur128=peak=true -f null - 2>&1 | awk '/Summary/{s=1} s&&/I:/{print "loudness", $2, "LUFS"} s&&/Peak:/{print "true peak", $2, "dBTP"}'
echo "done: out/video.mp4"
