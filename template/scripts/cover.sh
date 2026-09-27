#!/bin/zsh
# Text-free cover stills (2160x3840 + 1080x1920) of the 3D world at the given 30 fps frames.
set -e
cd "$(dirname $0)/.."
npx remotion bundle src/index.ts --out-dir=build --log=error >/dev/null
mkdir -p out/covers
for f in "$@"; do
  npx remotion still build Clean2x out/covers/cover_${f}@2x.png --frame=${f} --gl=angle --log=error
  ffmpeg -y -loglevel error -i out/covers/cover_${f}@2x.png -vf scale=1080:1920:flags=lanczos out/covers/cover_${f}.png
done
ls out/covers
