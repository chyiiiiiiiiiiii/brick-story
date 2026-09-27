# The brick-story look

What makes these videos read as "premium toy bricks" and not as a tech demo. Each rule lists where it lives in `src/engine/`, so you can tune it deliberately instead of by accident. Keep the defaults unless the story asks for something else.

## Bricks

- **Real proportions**: 0.8 stud pitch, 0.96 brick height, 0.32 plate height, studs 0.24 radius × 0.17 high (`parts.tsx`). Off-proportion bricks read as "fake" instantly.
- **Soft edges**: every body is a rounded box with a 0.035 bevel and a 0.02 gap between neighbours (`build.tsx`). The gap is what the edge shader picks up as a seam.
- **Glossy ABS plastic**: `MeshPhysicalMaterial`, roughness 0.32, clearcoat 0.55 (`parts.tsx`, `plastic()`).
- **Instancing**: bodies are grouped by size and all studs share one instanced mesh, so thousands of bricks stay cheap (`build.tsx`).
- **Sculpt with plates**: thin layers give smooth silhouettes and dense, satisfying assembly (`stack`, `heroBighead`). Staggered joints (alternate 2×N / N×2 per layer, split runs 2-4-4…) are what make a wall look built rather than drawn (`bricks.ts`).

## Assembly motion

- **The drop**: each brick falls from 3–5.6 units up with a slight sideways drift and tilt, eases out over 9 frames (0.3 s), then settles with a tiny bounce (`brickPose` in `build.tsx`).
- **Pacing**: builds go bottom-up with jitter, so they read as "being built". Big pieces finish just before the words that name them (`t.voice`).
- **The snap is the rhythm**: every landing is a click in the soundtrack, normalised by how many land in the same frame, so dense builds cascade rather than clip (`resolve.ts`, `audio.py`).

## Figures

- **The minifig**: a classic minifig with yellow skin, a canvas-drawn face (five expressions plus glasses) and torso prints (`Minifig.tsx`).
- **The hero**: a bowl-cut or spiky cap of hair. The hero appears on every island in that era's outfit; continuity of the face is what makes it one person's story.
- **Entrances**: figures drop in with a bounce and never slide in.

## Light and lens (`Stage.tsx`, `World.tsx`)

- **Lighting**:
  - Environment: a room environment map at 0.42.
  - Key: one warm key light from front-right-above at 3.4, with **VSM soft shadows** (radius 9, 20 blur samples) whose frustum follows the camera target.
  - Fill: a hemisphere light at 0.5.
- **Camera**: a 30° vertical field of view at about 40 units away, which gives a miniature, almost isometric feel.
- **Post chain, in order**:
  - **N8AO** ambient occlusion (radius 1.4, intensity 2.6): contact shadows between bricks and under studs, the single biggest "real" cue.
  - **Edges**: a custom depth-Laplacian shader (`Edges.tsx`, strength 0.5) that draws thin dark seams at silhouettes and brick joints, like an instruction manual.
  - **SMAA**, then a light bloom on emissives only.
  - **Neutral tone mapping**, done in the composer. The renderer itself stays linear, which is on purpose.
  - Saturation +0.1.
  - **Tilt-shift** blur 0.1 (0.045 in the final wide shot): the diorama cue.
  - Vignette 0.28.
- **Sky**: a vertical gradient dome with a different pastel per scene, cross-faded while the camera travels.

## Camera (`World.tsx`)

- **The spiral**: islands sit on a spiral with radius 14, 66° apart and 3.2 units higher each time. The camera orbits outside it, each scene framed from the front at about 20° elevation.
- **Travel**: the move between islands takes 54 frames on an ease-in-out, with a small pull-out arc and a slow global drift so it never freezes.
- **Smoothing**: the raw path is **Gaussian-smoothed over ±24 frames**. Without it every scene seam jerks; with it the whole video is one continuous move. Any camera term you add must be continuous in time.
- **Special moves**: the opening dollies from a close-up of `focus` out to the island. The climax pushes in by 11 units. The finale pulls back to frame every island, aiming at their centroid.

## Motion blur and frame rate

Scenes are authored in 30 fps frames and rendered at **120 fps**. Each pair of frames is blended (`tmix`) into **60 fps**, so falling bricks and camera moves smear the way a real shutter would (`make.sh`). This, plus the smoothing, is most of the silkiness.

## Sound (`scripts/audio.py`)

- **Music**: an original piece at 100 BPM, made of marimba arpeggios, a pad, bass, light drums, and a pluck-and-glockenspiel lead that enters at the climax. The bar grid is shifted so a downbeat lands exactly on the climax and another on the end card, with a riser and snare roll into the drop.
- **Ducking**: music ducks 78% under the narration with a 150 ms look-ahead; brick SFX duck 50%.
- **Mastering**: about −14 LUFS, a limiter at −3.6 dBFS and a 16.5 kHz low-pass. Dense clicks overshoot in AAC otherwise.

## Text on screen (`Overlays.tsx`)

- **Chapter header**: a pill tag (Futura caps, or a counter) over a big title (PingFang TC or Futura), with dark text under a white glow so it reads on any pastel.
- **Subtitles**: at 370 px from the bottom, clear of the Reels and Shorts UI. Chinese is 48 px with English 32 px beneath in bilingual mode, or English alone at 44 px.
- **End card**: a mosaic of 1×1 round plates on a dark base that resolves into the photo on the final chord.
