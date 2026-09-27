# Scene API

A scene file describes one island. Everything comes from one import:

```tsx
import { C, box, brick, stack, textWall, bitmap, heroBighead, build, defineScene, wave, typing, cheer, after, tr,
         Pop, TextSign, CanvasPanel, Tree, Round, Cone, Brick, Laptop, Plane, Rings, Minifig, plastic } from "../engine/kit";

export default defineScene({
  id: "beans",                       // same id as in story.json
  plate: "#e4cd9e",                  // baseplate colour (optional)
  focus: [-1.4, -1.2],               // first scene only: the opening close-up starts on this island-local (x, z)
  confettiAt: [0, 7, -1.4],          // climax scene only: where the confetti bursts from (island-local x, y, z)
  builds:  (t) => [ /* bricks that assemble, see Builds */ ],
  figures: (t) => [ /* minifigs that drop in */ ],
  signs:   (t) => [ /* printed signs that pop in */ ],
  sfx:     (t) => [ /* extra story sounds */ ],
  View:    ({ f, t }) => <>{/* anything custom, animated from f */}</>,
});
```

Register it in `src/scenes/index.ts`. Complete examples: `template/src/scenes/*.tsx` (5 islands) and `examples/yii-journey/scenes/*.tsx` (11 islands: desk, phone, bus stop, stage and audience, conference arches, talk map with a plane, standing book, award podium, product towers, mountain with letters, self-building tower).

## The island

- **Size**: the island is **14 × 12 studs**. One stud is 0.8 units; a brick is 0.96 tall (`h: 3` plates); a plate is 0.32 (`h: 1`). A minifig stands about 4.4 tall.
- **Brick grid**: `gx` runs −7…6 left→right and `gz` runs −6…5 back→front. `gy` is the plate level of a brick's bottom, so the island top is `gy: 1`.
- **Unit coordinates**: figures, signs and `View` use island-local units, with x −5.6…5.6 and z −4.8…4.8. For figures and signs, y is measured from the island top.
- **Camera**: it looks from the front (+z), slightly from above. Put tall builds at the back (`gz ≤ −2`) and figures at the front (`z ≥ 1`), so nothing hides the hero.
- **Safe width**: keep the important things inside about ±5 units of x. The frame is 9:16, so the island's corners can crop.
- **Safe height**: keep builds at the back under about 6 units (roughly 6 bricks). Taller builds reach the chapter title at the top of the frame.
- **Titles**: at most about 10 CJK characters or 22 Latin characters. Longer ones overflow at 84 px; titles over 14 characters drop to 62 px automatically.

## Timing (`t`)

All times are frame numbers at 30 fps.

- **`t.voice(0…1)`**: a point in this scene's narration. This is the one you want most, because it syncs bricks to words.
- **`t.at(n)`**: `n` frames after the scene starts. The camera arrives around `t.at(40)`.
- **`t.vStart` / `t.vEnd`**: when the narration starts and ends.
- **`t.start` / `t.end`**: when the scene starts and ends.
- **`t.climax`**: the climax frame. It is set only in the climax scene, at the end of its narration, and is where the music drops.
- **`t.aside`**: `{ start, dur }` of the sidekick line, if any.
- **`t.pullBack`**: when the final pull-back starts.

## Builds

`build(id, bricks, start, span, { order?, pos?, rotY?, scale? })`

- **Timing**: each brick starts falling somewhere in `[start, start + span]`, bottom-up by default (`order: "left"` sweeps left→right, `"random"` scatters), lands 9 frames later with a snap, and makes a click.
- **Pace**: aim for 1–4 bricks per frame, 10–40 frames for props and 60–90 for a centrepiece.
- **`pos`/`rotY`/`scale`**: these place the whole build. Use `scale` for letters and sculptures that are wider than the island. At 0.3–0.55 they become micro-bricks, which reads fine.

Brick builders (all return arrays; spread them into one list):

| Builder | Makes |
|---|---|
| `brick(gx, gy, gz, w, d, h, color, studs = true)` | one brick or plate |
| `box(gx, gy, gz, w, d, layers, color \| (layer) => color, h = 3)` | a solid block with an alternating bond: walls, counters, towers |
| `stack(gx, gy, gz, w, d, count, color \| (i) => color)` | a pile of plates: phones, screens, books, paper, glass |
| `textWall(text, color \| (row, col) => color, { rows = 9, font = "futura" \| "helvetica" \| "heiti", gy, gz })` | upright brick lettering centred on x = 0; `textWidth()` returns its width in studs |
| `bitmap(rows, color, { gy, gz })` | upright pixel art from strings (`"#"` = brick): hearts, stars, arrows, logos |
| `heroBighead()` | the hero as a ~460-plate big-head sculpture; use `scale ≈ 0.5` |

After adding or changing any `textWall(...)`, run `.venv/bin/python scripts/glyphs.py`, which rasterises every string it finds in `src/scenes`.

## Figures

```ts
{ at: [x, z], drop: t.voice(0.1), rotY: 0, y: 0, pose: (f) => ({ face: "grin", armR: wave(f), hold: "mic" }) }
```

- **`look`**: omit it (or write `"hero"`) for the story's hero. Otherwise pass an object: `{ torso, legs, hair (null = bald), hairStyle, print, glasses, antenna, skin }`. `outfit` tweaks the hero for one era, e.g. `{ torso: C.red, print: "hoodie" }`.
- **`rotY`**: `0` faces the camera and `Math.PI` faces away, for an audience watching a stage at the back. `y` lifts the figure onto a stage or summit.
- **`pose(f)`** returns any of these:
  - `face`: `smile`, `grin`, `focus`, `wow` or `tired`.
  - `armL` / `armR`: `0` is down, `1` is forward (typing, holding) and `2.6` is raised.
  - `walk`: a phase such as `f * 0.5`, which walks in place.
  - `headYaw`, `headPitch`, `bob`.
  - `hold`: `laptop`, `mic`, `flag`, `trophy` or `cup`.
- **Pose helpers**: `wave(f)`, `typing(f)` and `cheer(f)`, plus `after(f, t, then, before)` for "switch pose at frame t".
- **Final wave**: hero figures wave on their own during the final pull-back.
- **Moving and turning**: `move: (f) => [x, z]` moves a figure along a path, overriding `at` frame by frame; pair it with `walk: f * 0.5` in the pose. `turn: (f) => angle` overrides `rotY` frame by frame. A figure that runs through a finish arch is just `move` plus `turn`.
- **Custom figures**: to draw the hero yourself in `View`, for example lying in bed, use `<Minifig {...heroLook()} … />`.

## Signs

```ts
{ text: "HerFIT", sub: "10K+ 訂閱", at: [x, y, z], show: t.voice(0.4), w: 2.4, h: 1.2, bg: "#e7609a", fg: "#fff" }
```

A flat printed tile facing the camera that pops in at `show`. It is the best way to label builds.

- **On a face**: to stick it on a build's front face, use `z = (gz + d) × 0.8 + 0.02`.
- **Text size**: text shrinks to fit the tile, so keep it to 1–3 words.
- **Language**: wrap text in `tr("中文", "English")` so the same scene works for both narration languages.

## Sounds

These come for free: a click per landing brick, a pop per figure and sign, a whoosh per scene change, a step per stair, a confetti burst with a cheer at the climax, and a bleep before the sidekick speaks.

Add story sounds with `sfx: (t) => [{ t: frame, type, gain? }]`. The types are `ding`, `ping`, `bus`, `elevator`, `flag`, `thud`, `sparkle`, `plane`, `applause`, `typing` (about 2.4 s of keys), `bleep`, `cheer` and `confetti`. The automatic ones can be added by hand too: `click`, `pop`, `step`, `whoosh`.

`progress(f, t)` goes 0 → 1 across the narration with the same easing as the tag counter. Use it for anything that should keep pace with the counter, such as calendar days crossed off or a progress bar.

## View: custom 3D

Anything else goes in `View`, in island-local units, where `y = 0.32` is the island top.

**Animate only from `f`.** Every frame must be a pure function of the frame number; never use timers, `useFrame` or `Math.random()`, and use `noise(i)` for stable randomness.

| Component | Use |
|---|---|
| `<Pop f t position>` | wraps anything in a pop-in scale |
| `<TextSign text sub w h bg fg position rotation>` | a sign under your own control |
| `<CanvasPanel id w h draw position>` | a panel you draw with Canvas 2D: book covers, posters, app screens (`draw(g, W, H)`) |
| `<Brick w d h color position studs>` | one static brick; `position` is its bottom centre |
| `<Tree s color>`, `<Round r h color>`, `<Cone r h color>` | trees, poles, round tiles, cones |
| `<Laptop position rotationY glow>` | an open laptop; `rotationY = Math.PI` turns the screen away from the camera |
| `<Plane position heading>` | a small plane; move it along a path of your own |
| `<Rings frame t0 t1 position color>` | expanding signal or steam rings |
| `<Minifig ...>` | a raw minifig, for crowds or robots walking around |
| `plastic(color, { emissive, emissiveIntensity })` | the shared glossy plastic material for your own meshes |

## Recipes

- **Desk**: 1×1 legs `h: 6` at the four corners, then a plate on top at `gy: 7`. Put figures behind it at z ≈ −1.9 and a `<Laptop>` on the top at y = 8 × 0.32.
- **Phone or screen**: `stack(2, 1, -3, 4, 1, 21, C.black)`. Add a glowing `<mesh>` plane on its front face in `View`, and pop small coloured boxes in as app icons.
- **Stage and audience**: a `box` two layers high at the back, a `stack` screen behind it, and a sign on the screen. The speaker has `y: 1.92`. Seat the audience in rows of figures with `rotY: Math.PI`, dropping one by one across the narration.
- **Tower that grows**: `box(gx, 1, -5, 3, 3, layers, (l) => l % 2 ? a : b)` with a `span` of about 45 frames and a sign on its front face (`z = -1.58`).
- **Mountain or podium**: stepped `box` layers, each 2 studs narrower. The hero stands on top with `y` equal to the top plate level × 0.32 − 0.32.
- **Big letters**: `textWall("GDE", …)` at the back, `pos: [0, 4.6, -4.4]`, timed to finish right at `t.climax`.
  - **Scale**: pick `scale ≈ 11 / (textWidth(text) × 0.8)` so the word spans about 11 units: 0.42 for "GDE" (31 studs), 0.28 for "4:12".
  - **Seen from behind**: letters face the camera's side of their own island, so from other islands and in the final pull-back they read mirrored. Short words and numbers suffer least.
- **Vehicle driving in**: in `View`, lerp its x from off-island to its stop between two frames, using `easeOut`.
- **Map and trip**: a few pins made of a pole `Round` plus a sphere and a `TextSign`, with a `Plane` interpolated pin to pin.
