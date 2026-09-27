---
name: brick-story
description: Turn any story into a 9:16 3D brick-diorama video — one floating brick island per chapter, bricks snapping together while a narrator tells it, climbing a spiral to a finale. Use when someone wants a brick / toy-brick / diorama-style story video, a "life journey" or learning-journey reel, or says 積木風格影片, 用積木做影片, 做一支像 Yii 那樣的影片, brick story, brick video.
---

# brick-story

Every chapter of the story becomes a floating brick **island**; its bricks **drop** in and snap while the narrator speaks; stairs build between islands as the camera climbs a spiral; one **climax** gets confetti and a music drop; the last shot pulls back over the whole spiral and resolves into an end card. The engine in `template/` already solves the look, the motion, the soundtrack and the mastering. Your job is the story and the islands.

Paths below are relative to this skill's folder unless they start with the project folder.

## 1. Set up the project

Copy the template into a new folder named after the story, leaving out generated folders:

```bash
rsync -a --exclude={node_modules,.venv,out,build,audio} <this skill>/template/ ~/Movies/coffee-year/
```

Then run `zsh scripts/setup.sh` in it; add `--whisper` to enable the voice check in step 5. It needs Node 18+, Python 3.9+ and ffmpeg, and macOS is the tested path. `npm install` takes 1–3 minutes; if it crawls, see the IPv6 note in `reference/troubleshooting.md`.

Done when setup prints `ready`.

## 2. Gather the story

The template ships with a demo story (`story.json` + `src/scenes/*.tsx`, a year of learning pour-over coffee). Read one scene file to see the shape, then replace all of it.

Ask only for what you cannot infer, in one round of at most five questions:

- **Arc**: what happens, in order; which moment is the climax.
- **Language**: narration `zh` or `en`; subtitles `zh`, `en`, `zh+en` or `none`.
- **Hero look**: hair colour, top colour, glasses; or a photo to derive it from.
- **Ending**: name, handle, and an optional square-ish photo for the mosaic reveal.
- **Sidekick** (optional): a robot or pet that gets one line near the end.

Done when you can write every scene's narration without guessing a fact.

## 3. Write `story.json`

Schema, field by field: [`reference/story-format.md`](reference/story-format.md).

- 5–12 scenes. The first scene says hello and has `lead` time for the hero's big-head sculpture to assemble; the last looks forward.
- Narration is 1–3 short sentences, 5–8 s spoken. Put `\n` where subtitle cues should break, keeping each cue to one line: at most about 16 CJK characters or 42 Latin characters.
- Exactly one `climax` scene, the payoff moment; give it a `badge` if there is an award or title to show.
- A `counter` turns the tag into a number that counts up during the narration (members, cups, days).

Done when `.venv/bin/python scripts/tts.py && .venv/bin/python scripts/timeline.py` prints the scene count and length.

## 4. Build one island per scene

One file per scene in `src/scenes/<id>.tsx`, registered in `src/scenes/index.ts`. The API, coordinates and recipes are in [`reference/scene-api.md`](reference/scene-api.md); the visual rules are in [`reference/style.md`](reference/style.md).

Design each island as a **diorama of its sentence**. A viewer with the sound off should get the gist from the bricks alone: the phone that loses its apps, the stage that fills with people, the book with its cover.

- **Timing**: bricks assemble *while the narration says them*. Time builds and figure drops with `t.voice(0.0–1.0)`, not fixed frames.
- **Big numbers and names**: use `textWall()` or a sign.
- **The hero**: stands on every island in that era's outfit.

Done when:

- every scene id in `story.json` has a registered file;
- `.venv/bin/python scripts/glyphs.py` has run after your last `textWall` edit;
- `npx tsc --noEmit -p .` is clean.

## 5. Listen back to the narration

`.venv/bin/python scripts/check_voice.py` transcribes every line with Whisper and marks lines below 0.75 similarity.

- **Respell flagged lines** in the scene's `say` field (the subtitle `show` stays correct). Typical fixes are in [`reference/troubleshooting.md`](reference/troubleshooting.md#pronunciation): spell out acronyms, write names phonetically, and add commas around English words inside Chinese.
- **Chinese transcripts**: Whisper often answers in Simplified characters. Judge by sound, not by glyph.

Done when every line reads ≥ 0.75 or you have listed the remaining ones for the user to hear.

## 6. Preview and fix

Run `zsh scripts/preview.sh` and look at `out/preview.png`. It holds one frame per scene plus the climax and the end card, all at 30 fps frame numbers; pass frame numbers to look anywhere else. Inspect every tile for:

- a figure or sign hidden behind a build, or text cut off at the frame edge;
- an island that is empty during its own narration;
- a subtitle that wraps onto two lines;
- a title colliding with a tall build.

Fix, re-run, look again. Done when every tile reads at a glance.

## 7. Render and deliver

`zsh scripts/make.sh` renders `out/video.mp4` (1080×1920, 60 fps with motion blur, about −14 LUFS) plus `out/*.srt`. It takes about 5–10 s of wall time per second of video on Apple silicon. Then:

- make a contact sheet (one tile every 3 s) and look at it: `D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/video.mp4); ffmpeg -y -i out/video.mp4 -vf "fps=1/3,scale=180:-1,tile=8x$(( (${D%.*} / 3 + 7) / 8 ))" -frames:v 1 out/sheet.png`;
- confirm the loudness line printed by `make.sh` (true peak ≤ −1 dBTP);
- produce text-free covers: `zsh scripts/cover.sh <frame> ...`.

Deliver the video, the SRT files and the covers, and say which voice lines (if any) the user should listen to.
