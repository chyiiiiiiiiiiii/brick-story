# Troubleshooting

## Pronunciation

edge-tts reads mixed Chinese/English and acronyms unpredictably. Fix it in the scene's `say` field, which leaves the subtitle (`show`) untouched. These respellings fixed real misreads:

| Problem (heard as) | `say` that works |
|---|---|
| a name like `Yii` read as letters ("易子") | a character with the right sound: `逸`; in English, `Yee` and a softer greeting ("Hey there, I'm Yee." — "Hi, I'm Yee." was misheard) |
| `App` swallowed ("做啊") | `做 APP` with a comma before it: `一起接案，做 APP。` |
| `和 AI` heard as 戀愛 | `跟 A.I.`, or `我跟 A.I. 夥伴` |
| `GDE` read as 基地 | say the full phrase: `Google Developer Expert` |
| `SBIR` read as "SBI" | `S.B.I.R.` |
| a coined name like `yiibu` | say its meaning or a phonetic spelling: `「一步」`, `Yeeboo` |
| a product name like `Moniit` | the intended sound: `Monit` |
| a person's English name read oddly in Chinese | a phonetic Chinese spelling: `Dorara` → `朵拉拉` |
| numbers and units (`92°C`, `1:15`) | words: `九十二度`, `一比十五` |

Other levers:

- A comma before and after an English word inside Chinese gives the voice a clean switch.
- `"rate": "+0%"` on a scene slows a dense line.
- `和` can be read hàn in Taiwanese voices; `跟` avoids it.

Run `check_voice.py` again after each change. Whisper answers Chinese partly in Simplified characters, so judge by sound.

## Setup

- **`npm install` crawls or looks hung**: on some networks IPv6 to the npm registry is very slow. Retry with `NODE_OPTIONS=--dns-result-order=ipv4first zsh scripts/setup.sh`.
- **A copied template writes into another project**: copy with `rsync --exclude={node_modules,.venv,out,build,audio}`. `setup.sh` also replaces a symlinked `node_modules` or `.venv` with real ones.

## Render

- **`npx tsx` exits 1 with no output**: the latest tsx pulls an esbuild whose binary fails to spawn on some Macs (`spawn Unknown system error -88`). The scripts pin `tsx@4.19.2`; keep that pin.
- **"No glyph bitmap for …"**: run `.venv/bin/python scripts/glyphs.py` after editing any `textWall`.
- **"story.json scene … has no scene file" / "missing from story.json"**: the ids in `story.json` and `src/scenes/index.ts` must match one to one.
- **Black frames or a GL error**: the scripts pass `--gl=angle`, which is what works headless on macOS. On Linux try `--gl=swangle`.
- **Slow render**: `CONCURRENCY=4 zsh scripts/make.sh` if memory is tight; about 5–10 s of wall time per second of video on an M-series Mac.
- **Disk**: a render peaks at about 1 GB in `out/`; `make.sh` deletes its 120 fps intermediate when done. Check free space before long renders.
- **zsh variables**: in shell one-liners, write `${var}`. zsh treats `$var:l`, `$var:a` and `$var:h` as modifiers, which silently mangles strings like `$M:linear` in an ffmpeg filter.

## Layout

- **A sign sits inside a build**: signs sit on the plane you give them. For a build whose front face is at `gz + d`, use `z = (gz + d) × 0.8 + 0.02`.
- **A figure is hidden**: move tall builds back (`gz ≤ −2`) or the figure forward. For a stage, lift the speaker with `y` and turn the audience with `rotY: Math.PI`.
- **A subtitle wraps onto two lines**: add a `\n` to the line, and in bilingual mode to `show_en` as well.
- **A title collides with a tall build**: lower or shrink the build (`scale`), or let the climax scene hide its title at the climax, which it does automatically.

- **Another island pokes into the frame**: with 6 or more scenes the spiral wraps past a full turn, so an earlier island can show at a corner of a later shot. Keep the tallest builds on the first islands low or near the island centre, or move the scene that clashes.

## Audio

- **Narration buried**: music ducks automatically. If one moment is still muddy, it is usually a dense brick cascade under the first words; start that build a little later with `t.voice(0.15)`.
- **True peak above −1 dBTP after AAC**: keep the mastering chain in `make.sh` (limiter 0.66 + 16.5 kHz low-pass + AAC 320k).
